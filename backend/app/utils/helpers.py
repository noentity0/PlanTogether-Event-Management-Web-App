from datetime import datetime

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.utcnow()


def parse_event_datetime(date_value: str, time_value: str) -> datetime:
    return datetime.strptime(f"{date_value} {time_value}", "%Y-%m-%d %H:%M")


def derive_display_name(email: str | None) -> str:
    if not email:
        return "Guest User"

    local_part = email.split("@", 1)[0]
    normalized = local_part.replace(".", " ").replace("_", " ").replace("-", " ").strip()
    return normalized.title() or email


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name") or derive_display_name(user.get("email")),
        "email": user["email"],
        "created_at": user["created_at"],
    }


def serialize_user_summary(user: dict) -> dict:
    return {
        "id": str(user.get("_id") or user.get("id")),
        "name": user.get("name") or derive_display_name(user.get("email")),
        "email": user.get("email", ""),
    }


def serialize_participant(participant: dict) -> dict:
    return {
        "user_id": str(participant.get("user_id", "")),
        "name": participant.get("name") or derive_display_name(participant.get("email")),
        "email": participant.get("email", ""),
        "joined_at": participant.get("joined_at") or now_utc(),
    }


def serialize_comment(comment: dict) -> dict:
    author = comment.get("author", {})
    return {
        "id": str(comment.get("id", "")),
        "author": {
            "id": str(author.get("id") or author.get("_id") or author.get("user_id", "")),
            "name": author.get("name") or derive_display_name(author.get("email")),
            "email": author.get("email", ""),
        },
        "message": comment.get("message", ""),
        "created_at": comment.get("created_at") or now_utc(),
    }


def serialize_event(
    event: dict,
    current_user: dict | None = None,
    include_private: bool = False,
    include_comments: bool = False,
) -> dict:
    registrations = [serialize_participant(entry) for entry in event.get("registrations", [])]
    bookmarked_by = [serialize_user_summary(entry) for entry in event.get("bookmarked_by", [])]
    comments = [serialize_comment(entry) for entry in event.get("comments", [])]
    current_user_id = str(current_user["_id"]) if current_user else None
    created_by = str(event["created_by"])
    capacity = event.get("capacity")
    attendee_count = len(registrations)

    payload = {
        "id": str(event["_id"]),
        "title": event["title"],
        "description": event["description"],
        "date": event["date"],
        "time": event["time"],
        "location": event["location"],
        "category": event["category"],
        "capacity": capacity,
        "starts_at": event["starts_at"],
        "created_by": created_by,
        "created_by_name": event.get("created_by_name") or derive_display_name(event.get("created_by_email")),
        "created_by_email": event.get("created_by_email", ""),
        "attendee_count": attendee_count,
        "saved_count": len(bookmarked_by),
        "available_spots": None if capacity is None else max(capacity - attendee_count, 0),
        "is_owner": current_user_id == created_by,
        "is_registered": any(entry["user_id"] == current_user_id for entry in registrations),
        "is_bookmarked": any(entry["id"] == current_user_id for entry in bookmarked_by),
        "created_at": event["created_at"],
        "updated_at": event["updated_at"],
    }

    if include_private:
        payload["registrations"] = registrations
        payload["bookmarked_by"] = bookmarked_by

    if include_comments or include_private:
        payload["comments"] = comments

    return payload


def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)
