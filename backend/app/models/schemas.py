from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


EventCategory = Literal["Music", "Tech", "Sports", "Art", "Food", "Business"]


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class UserSummary(BaseModel):
    id: str
    name: str
    email: str


class EventParticipantResponse(BaseModel):
    user_id: str
    name: str
    email: str
    joined_at: datetime


class EventCommentRequest(BaseModel):
    message: str = Field(min_length=2, max_length=600)


class EventCommentResponse(BaseModel):
    id: str
    author: UserSummary
    message: str
    created_at: datetime


class EventBase(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1500)
    date: str
    time: str
    location: str = Field(min_length=2, max_length=200)
    category: EventCategory
    capacity: int | None = Field(default=None, ge=1, le=10000)


class EventCreateRequest(EventBase):
    pass


class EventUpdateRequest(EventBase):
    pass


class EventSummaryResponse(EventBase):
    id: str
    starts_at: datetime
    created_by: str
    created_by_name: str
    created_by_email: str
    attendee_count: int
    saved_count: int
    available_spots: int | None = None
    is_owner: bool = False
    is_registered: bool = False
    is_bookmarked: bool = False
    created_at: datetime
    updated_at: datetime


class EventResponse(EventSummaryResponse):
    registrations: list[EventParticipantResponse] = Field(default_factory=list)
    bookmarked_by: list[UserSummary] = Field(default_factory=list)
    comments: list[EventCommentResponse] = Field(default_factory=list)
