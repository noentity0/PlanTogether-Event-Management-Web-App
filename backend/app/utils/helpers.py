from datetime import datetime

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.utcnow()


def parse_event_datetime(date_value: str, time_value: str) -> datetime:
    return datetime.strptime(f"{date_value} {time_value}", "%Y-%m-%d %H:%M")


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "created_at": user["created_at"],
    }


def serialize_event(event: dict) -> dict:
    return {
        "id": str(event["_id"]),
        "title": event["title"],
        "description": event["description"],
        "date": event["date"],
        "time": event["time"],
        "location": event["location"],
        "category": event["category"],
        "starts_at": event["starts_at"],
        "created_by": str(event["created_by"]),
        "created_by_email": event["created_by_email"],
        "created_at": event["created_at"],
        "updated_at": event["updated_at"],
    }


def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)

