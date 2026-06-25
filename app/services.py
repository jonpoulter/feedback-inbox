from sqlalchemy.orm import Session

from app.models import CATEGORIES, STATUSES, FeedbackItem
from app.schemas import FeedbackItemCreate, StatusFilter


class ItemNotFoundError(Exception):
    pass


class InvalidCategoryError(Exception):
    pass


class InvalidStatusFilterError(Exception):
    pass


def list_items(db: Session, status: StatusFilter = "all") -> list[FeedbackItem]:
    if status not in ("new", "reviewed", "all"):
        raise InvalidStatusFilterError(f"Invalid status filter: {status}")

    query = db.query(FeedbackItem).order_by(FeedbackItem.created_at.desc())
    if status != "all":
        query = query.filter(FeedbackItem.status == status)
    return query.all()


def create_item(db: Session, payload: FeedbackItemCreate) -> FeedbackItem:
    if payload.category not in CATEGORIES:
        raise InvalidCategoryError(f"Invalid category: {payload.category}")

    item = FeedbackItem(
        title=payload.title,
        body=payload.body,
        category=payload.category,
        status="new",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def mark_reviewed(db: Session, item_id: int) -> FeedbackItem:
    item = db.get(FeedbackItem, item_id)
    if item is None:
        raise ItemNotFoundError(f"Item {item_id} not found")

    if item.status not in STATUSES:
        raise ValueError(f"Item {item_id} has invalid status: {item.status}")

    item.status = "reviewed"
    db.commit()
    db.refresh(item)
    return item
