from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.models.schemas import EventCreateRequest, EventResponse, EventUpdateRequest
from app.utils.helpers import (
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


def build_event_filters(search: str | None, category: str | None) -> dict:
    filters: dict = {"starts_at": {"$gte": now_utc()}}

    if search:
        filters["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    if category and category != "All":
        filters["category"] = category

    return filters


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
        "starts_at": starts_at,
        "created_by": current_user["_id"],
        "created_by_email": current_user["email"],
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    result = await db.events.insert_one(event)
    created_event = await db.events.find_one({"_id": result.inserted_id})
    return serialize_event(created_event)


@router.get("", response_model=list[EventResponse])
async def get_events(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find(build_event_filters(search, category)).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event) for event in events]


@router.get("/my/created", response_model=list[EventResponse])
async def get_my_created_events(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[dict]:
    cursor = db.events.find({"created_by": current_user["_id"]}).sort("starts_at", 1)
    events = await cursor.to_list(length=200)
    return [serialize_event(event) for event in events]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event_details(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    event = await get_event_or_404(db, event_id)
    return serialize_event(event)


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
        "starts_at": starts_at,
        "updated_at": now_utc(),
    }

    await db.events.update_one({"_id": event["_id"]}, {"$set": updates})
    updated_event = await db.events.find_one({"_id": event["_id"]})
    return serialize_event(updated_event)


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
