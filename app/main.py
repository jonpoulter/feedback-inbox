import os

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db import get_db, init_db
from app.schemas import (
    CategoryFilter,
    FeedbackItemCreate,
    FeedbackItemRead,
    StatusFilter,
)
from app.services import (
    InvalidCategoryError,
    InvalidCategoryFilterError,
    InvalidStatusFilterError,
    ItemNotFoundError,
    create_item,
    list_items,
    mark_reviewed,
)

app = FastAPI(title="Feedback Inbox API")

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/items", response_model=list[FeedbackItemRead])
def get_items(
    status: StatusFilter = Query(default="all"),
    category: CategoryFilter = Query(default="all"),
    db: Session = Depends(get_db),
) -> list[FeedbackItemRead]:
    try:
        return list_items(db, status=status, category=category)
    except (InvalidStatusFilterError, InvalidCategoryFilterError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/items", response_model=FeedbackItemRead, status_code=201)
def post_item(
    payload: FeedbackItemCreate,
    db: Session = Depends(get_db),
) -> FeedbackItemRead:
    try:
        return create_item(db, payload)
    except InvalidCategoryError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/items/{item_id}/review", response_model=FeedbackItemRead)
def review_item(
    item_id: int,
    db: Session = Depends(get_db),
) -> FeedbackItemRead:
    try:
        return mark_reviewed(db, item_id)
    except ItemNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
