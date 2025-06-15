from fastapi import APIRouter, Depends, HTTPException, status
from src.db import get_connection
from asyncpg import Connection
from src.schemas.todo import Todo, TodoUpdate
from src.utils import is_user_authenticated
from datetime import datetime, timezone

todo_router = APIRouter()


@todo_router.get(
    "/",
    summary="Get user todos route",
    description="This route lets user to get their todos",
)
async def get_user_todos(
    user=Depends(is_user_authenticated),
    connection: Connection = Depends(get_connection),
):
    try:
        userId = user["id"]
        todos = await connection.fetch(
            "SELECT * FROM todos WHERE user_id=$1 ORDER BY created_at DESC", userId
        )
        if todos:
            return [dict(todo) for todo in todos]
        else:
            return []
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@todo_router.post(
    "/create-todo",
    summary="Create todo route",
    description="This route lets user to create todo",
    status_code=status.HTTP_201_CREATED,
)
async def create_todo(
    todo: Todo,
    data=Depends(is_user_authenticated),
    connection: Connection = Depends(get_connection),
):
    try:
        created_at = datetime.now(timezone.utc)

        new_todo = await connection.fetchrow(
            """
        INSERT INTO todos (title,description,is_completed,created_at,user_id)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id
        """,
            todo.title,
            todo.description,
            todo.is_completed,
            created_at,
            todo.user_id,
        )
        return {
            "message": "Todo created successfully",
            "id": new_todo["id"],
            "created_at": created_at,
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something Went Wrong!")


@todo_router.delete(
    "/delete-todo/{todoId}",
    summary="Delete todo route",
    description="This route lets user to delete todo",
    status_code=status.HTTP_201_CREATED,
)
async def delete_todo(
    todoId: int,
    data=Depends(is_user_authenticated),
    connection: Connection = Depends(get_connection),
):
    try:
        userId = data["id"]

        result = await connection.execute(
            "DELETE FROM todos WHERE id=$1 AND user_id=$2", todoId, userId
        )

        if result == "DELETE 0":
            raise HTTPException(
                status_code=404, detail="Todo not found or not authorized to delete it"
            )

        return {"message": "Todo deleted successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="Something Went Wrong!")


@todo_router.put(
    "/update-todo/{todoId}",
    summary="Update todo route",
    description="This route lets user to update todo",
)
async def update_todo(
    todoId: int,
    todo: TodoUpdate,
    user=Depends(is_user_authenticated),
    connection: Connection = Depends(get_connection),
):
    try:
        user_id = user["id"]
        result = await connection.execute(
            """
            UPDATE todos 
            SET title = $1, description = $2, is_completed = $3 
            WHERE id = $4 AND user_id = $5
            """,
            todo.title,
            todo.description,
            todo.is_completed,
            todoId,
            user_id,
        )

        if result == "UPDATE 0":
            raise HTTPException(
                status_code=404, detail="Todo not found or not authorized to update it"
            )

        return {"message": "Todo updated successfully"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
