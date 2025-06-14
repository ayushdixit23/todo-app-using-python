from pydantic import BaseModel, EmailStr


class UserEmailPassword(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    image_url: str
