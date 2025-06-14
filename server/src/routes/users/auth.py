from fastapi import APIRouter, HTTPException, Depends
from src.schemas.auth import UserEmailPassword, UserCreate
from src.db import get_connection
from ...utils import (
    create_hash_password,
    verify_password,
    create_jwt_token,
    is_user_authenticated,
)
from asyncpg import Connection

auth_router = APIRouter()


@auth_router.post(
    "/login",
    summary="Login User route",
    description="This route create tokens and helps user to login in application",
)
async def login_route(
    data: UserEmailPassword, connection: Connection = Depends(get_connection)
):
    try:

        check_user = await connection.fetchrow(
            "SELECT id, email, full_name, image_url, password FROM users WHERE email=$1",
            data.email,
        )

        if not check_user:
            raise HTTPException(status_code=400, detail="Wrong Credentials")

        is_password_correct = verify_password(
            password=data.password, hash_password=check_user["password"]
        )

        if is_password_correct:
            user_data = {
                "id": check_user["id"],
                "email": check_user["email"],
                "full_name": check_user["full_name"],
                "image_url": check_user["image_url"],
            }

            access_token = create_jwt_token(user_data)
            return {"access_token": access_token}

        raise HTTPException(status_code=401, detail="Wrong Password")

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@auth_router.post(
    "/register",
    summary="User registration Route",
    description="This route lets user to signup and put their details into database",
)
async def user_registration(
    user: UserCreate, connection: Connection = Depends(get_connection)
):
    try:
        check_user = await connection.fetchrow(
            "SELECT id FROM users WHERE email=$1", user.email
        )
        if check_user:
            raise HTTPException(
                status_code=400, detail="User with this email already exists"
            )

        hashed_password = create_hash_password(user.password)

        new_user = await connection.fetchrow(
            """
            INSERT INTO users (email, full_name, password, image_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            user.email,
            user.full_name,
            hashed_password,
            user.image_url,
        )

        user_data = {
            "id": new_user["id"],
            "email": user.email,
            "full_name": user.full_name,
            "image_url": user.image_url,
        }

        access_token = create_jwt_token(user_data)

        return {
            "access_token": access_token,
            "message": "✅ User registered successfully",
        }

    except Exception as e:
        print(e, "error")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@auth_router.get(
    "/me",
    summary="Get user data route",
    description="This route lets user to get its data",
)
async def user_data(data=Depends(is_user_authenticated)):
    try:
        return {"data": data}
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")
