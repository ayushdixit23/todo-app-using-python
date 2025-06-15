from pydantic import BaseModel

class Todo(BaseModel):
    title: str
    description: str
    is_completed: bool
    user_id: int

class TodoUpdate(BaseModel):
    title: str
    description: str
    is_completed: bool
