from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


EventCategory = Literal["Music", "Tech", "Sports", "Art", "Food", "Business"]


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class EventBase(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1500)
    date: str
    time: str
    location: str = Field(min_length=2, max_length=200)
    category: EventCategory


class EventCreateRequest(EventBase):
    pass


class EventUpdateRequest(EventBase):
    pass


class EventResponse(EventBase):
    id: str
    starts_at: datetime
    created_by: str
    created_by_email: str
    created_at: datetime
    updated_at: datetime

