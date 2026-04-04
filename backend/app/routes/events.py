from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db, get_optional_current_user
from app.models.schemas import (
    EventCommentRequest,
    EventCreateRequest,
    EventResponse,
    EventSummaryResponse,
    EventUpdateRequest,
)
from app.utils.helpers import (
    derive_display_name,
    is_valid_object_id,
    now_utc,
    parse_event_datetime,
    serialize_event,
)


router = APIRouter(prefix="/api/events", tags=["events"])


def validate_event_datetime(date_value: str, time_value: str):
    try:
        return parse_event_datetime(date_value, time_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use date format YYYY-MM-DD and time format HH:MM",
        ) from exc


def build_event_filters(search: str | None, category: str | None, include_past: bool = False) -> dict:
    filters: dict = {}

    if not include_past:
        filters["starts_at"] = {"$gte": now_utc()}

    if search:
        filters["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    if category and category != "All":
        filters["category"] = category

    return filters


def build_user_entry(user: dict) -> dict:
    return {
        "user_id": str(user["_id"]),
        "name": user.get("name") or derive_display_name(user.get("email")),
        "email": user["email"],
        "joined_at": now_utc(),
    }


def build_comment_entry(message: str, user: dict) -> dict:
    return {
        "id": str(ObjectId()),
        "author": {
            "id": str(user["_id"]),
            "name": user.get("name") or derive_display_name(user.get("email")),
            "email": user["email"],
        },
        "message": message.strip(),
        "created_at": now_utc(),
    }


def get_people_list(event: dict, field_name: str) -> list[dict]:
    return list(event.get(field_name, []))


def is_event_owner(event: dict, user: dict | None) -> bool:
    return bool(user and str(event["created_by"]) == str(user["_id"]))


def find_user_index(entries: list[dict], user_id: str) -> int:
    for index, entry in enumerate(entries):
        if str(entry.get("user_id")) == user_id:
            return index
    return -1


def find_bookmark_index(entries: list[dict], user_id: str) -> int:
    for index, entry in enumerate(entries):
        entry_id = entry.get("id") or entry.get("user_id") or entry.get("_id")
        if str(entry_id) == user_id:
            return index
    return -1


def include_private_lists(event: dict, user: dict | None) -> bool:
    return is_event_owner(event, user)


async def save_event_lists(
    db: AsyncIOMotorDatabase,
    event: dict,
    *,
    registrations: list[dict] | None = None,
    bookmarked_by: list[dict] | None = None,
    comments: list[dict] | None = None,
) -> dict:
    updates: dict = {}
    if registrations is not None:
        updates["registrations"] = registrations
    if bookmarked_by is not None:
        updates["bookmarked_by"] = bookmarked_by
    if comments is not None:
        updates["comments"] = comments

    if updates:
        updates["updated_at"] = now_utc()
        await db.events.update_one({"_id": event["_id"]}, {"$set": updates})

    return await db.events.find_one({"_id": event["_id"]})


def ensure_capacity_available(event: dict, registrations: list[dict]) -> bool:
    capacity = event.get("capacity")
    if capacity is None:
        return True
    return len(registrations) < capacity


async def get_event_or_404(db: AsyncIOMotorDatabase, event_id: str) -> dict:
    if not is_valid_object_id(event_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    event = await db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    return event


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    starts_at = validate_event_datetime(payload.date, payload.time)
    if starts_at <= now_utc():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date and time must be in the future",
        )

    timestamp = now_utc()
    event = {
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "date": payload.date,
        "time": payload.time,
        "location": payload.location.strip(),
        "category": payload.category,
        "capacity": payload.capacity,
        "starts_at": starts_at,
        "created_by": current_user["_id"],
        "created_by_name": current_user.get("name") or derive_display_name(current_user.get("email")),
        "created_by_email": current_user["email"],
        "registrations": [],
        "bookmarked_by": [],
        "comments": [],
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    result = await db.events.insert_one(event)
    created_event = await db.events.find_one({"_id": result.inserted_id})
    return serialize_event(created_event, current_user, include_private=True)


@router.get("", response_model=list[EventSummaryResponse])
async def get_events(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    include_past: bool = Query(default=False),
    current_user: dict | None = Depends(get_optional_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find(build_event_filters(search, category, include_past)).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event, current_user) for event in events]


@router.get("/my/created", response_model=list[EventSummaryResponse])
async def get_my_created_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find({"created_by": current_user["_id"]}).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event, current_user) for event in events]


@router.get("/my/registered", response_model=list[EventSummaryResponse])
async def get_my_registered_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find({"registrations.user_id": str(current_user["_id"])}).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event, current_user) for event in events]


@router.get("/my/bookmarked", response_model=list[EventSummaryResponse])
async def get_my_bookmarked_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find({"bookmarked_by.id": str(current_user["_id"])}).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event, current_user) for event in events]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event_details(
    event_id: str,
    current_user: dict | None = Depends(get_optional_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    return serialize_event(
        event,
        current_user,
        include_private=include_private_lists(event, current_user),
        include_comments=True,
    )


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    payload: EventUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    if event["created_by"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own events",
        )

    starts_at = validate_event_datetime(payload.date, payload.time)
    if starts_at <= now_utc():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date and time must be in the future",
        )

    updates = {
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "date": payload.date,
        "time": payload.time,
        "location": payload.location.strip(),
        "category": payload.category,
        "capacity": payload.capacity,
        "starts_at": starts_at,
        "updated_at": now_utc(),
    }

    current_registrations = get_people_list(event, "registrations")
    if payload.capacity is not None and len(current_registrations) > payload.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity cannot be lower than the number of registered attendees",
        )

    await db.events.update_one({"_id": event["_id"]}, {"$set": updates})
    updated_event = await db.events.find_one({"_id": event["_id"]})
    return serialize_event(updated_event, current_user, include_private=True)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> None:
    event = await get_event_or_404(db, event_id)
    if event["created_by"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own events",
        )

    await db.events.delete_one({"_id": event["_id"]})


@router.post("/{event_id}/register", response_model=EventResponse)
async def register_for_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)

    user_id = str(current_user["_id"])
    registrations = get_people_list(event, "registrations")

    if find_user_index(registrations, user_id) >= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already registered for this event")

    if not ensure_capacity_available(event, registrations):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is already full")

    registrations.append(build_user_entry(current_user))

    updated_event = await save_event_lists(
        db,
        event,
        registrations=registrations,
    )
    return serialize_event(
        updated_event,
        current_user,
        include_private=include_private_lists(updated_event, current_user),
        include_comments=True,
    )


@router.delete("/{event_id}/register", response_model=EventResponse)
async def leave_registered_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    user_id = str(current_user["_id"])
    registrations = get_people_list(event, "registrations")

    registration_index = find_user_index(registrations, user_id)
    if registration_index >= 0:
        registrations.pop(registration_index)
        updated_event = await save_event_lists(db, event, registrations=registrations)
        return serialize_event(
            updated_event,
            current_user,
            include_private=include_private_lists(updated_event, current_user),
            include_comments=True,
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are not registered for this event")


@router.post("/{event_id}/bookmark", response_model=EventResponse)
async def bookmark_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    user_id = str(current_user["_id"])
    bookmarked_by = get_people_list(event, "bookmarked_by")
    if find_bookmark_index(bookmarked_by, user_id) >= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is already in your saved list")

    bookmarked_by.append(
        {
            "id": user_id,
            "name": current_user.get("name") or derive_display_name(current_user.get("email")),
            "email": current_user["email"],
        }
    )
    updated_event = await save_event_lists(db, event, bookmarked_by=bookmarked_by)
    return serialize_event(
        updated_event,
        current_user,
        include_private=include_private_lists(updated_event, current_user),
        include_comments=True,
    )


@router.delete("/{event_id}/bookmark", response_model=EventResponse)
async def remove_bookmark(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    user_id = str(current_user["_id"])
    bookmarked_by = get_people_list(event, "bookmarked_by")
    bookmark_index = find_bookmark_index(bookmarked_by, user_id)
    if bookmark_index < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is not in your saved list")

    bookmarked_by.pop(bookmark_index)
    updated_event = await save_event_lists(db, event, bookmarked_by=bookmarked_by)
    return serialize_event(
        updated_event,
        current_user,
        include_private=include_private_lists(updated_event, current_user),
        include_comments=True,
    )


@router.post("/{event_id}/comments", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def add_event_comment(
    event_id: str,
    payload: EventCommentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    comments = get_people_list(event, "comments")
    comments.append(build_comment_entry(payload.message, current_user))
    updated_event = await save_event_lists(db, event, comments=comments)
    return serialize_event(
        updated_event,
        current_user,
        include_private=include_private_lists(updated_event, current_user),
        include_comments=True,
    )


@router.delete("/{event_id}/comments/{comment_id}", response_model=EventResponse)
async def delete_event_comment(
    event_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    comments = get_people_list(event, "comments")

    comment_index = -1
    for index, comment in enumerate(comments):
        author = comment.get("author", {})
        author_id = str(author.get("id") or author.get("_id") or author.get("user_id", ""))
        if str(comment.get("id")) == comment_id:
            if author_id != str(current_user["_id"]) and not is_event_owner(event, current_user):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot delete this comment")
            comment_index = index
            break

    if comment_index < 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    comments.pop(comment_index)
    updated_event = await save_event_lists(db, event, comments=comments)
    return serialize_event(
        updated_event,
        current_user,
        include_private=include_private_lists(updated_event, current_user),
        include_comments=True,
    )
