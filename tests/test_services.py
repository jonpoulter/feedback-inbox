import pytest
from pydantic import ValidationError

from app.schemas import FeedbackItemCreate
from app.services import (
    InvalidCategoryFilterError,
    create_item,
    get_stats,
    list_items,
    mark_reviewed,
)


def test_get_stats_empty_does_not_divide_by_zero(db_session):
    stats = get_stats(db_session, status="reviewed")

    assert stats == {"total": 0, "reviewed": 0, "percent_reviewed": 0}


def test_create_item(db_session):
    item = create_item(
        db_session,
        FeedbackItemCreate(
            title="Slow export",
            body="Export takes too long on large datasets.",
            category="bug",
        ),
    )

    assert item.id is not None
    assert item.title == "Slow export"
    assert item.status == "new"
    assert item.category == "bug"


def test_list_items_filters_by_status(db_session):
    create_item(
        db_session,
        FeedbackItemCreate(title="A", body="Body A", category="idea"),
    )
    reviewed = create_item(
        db_session,
        FeedbackItemCreate(title="B", body="Body B", category="process"),
    )
    mark_reviewed(db_session, reviewed.id)

    assert len(list_items(db_session, status="all")) == 2
    assert len(list_items(db_session, status="new")) == 1
    assert len(list_items(db_session, status="reviewed")) == 1


def test_list_items_filters_by_category(db_session):
    create_item(
        db_session,
        FeedbackItemCreate(title="Bug A", body="Body A", category="bug"),
    )
    create_item(
        db_session,
        FeedbackItemCreate(title="Idea B", body="Body B", category="idea"),
    )

    assert len(list_items(db_session, category="all")) == 2
    assert len(list_items(db_session, category="bug")) == 1
    assert len(list_items(db_session, category="process")) == 0


def test_list_items_composes_status_and_category(db_session):
    create_item(
        db_session,
        FeedbackItemCreate(title="New bug", body="Body", category="bug"),
    )
    reviewed_bug = create_item(
        db_session,
        FeedbackItemCreate(title="Reviewed bug", body="Body", category="bug"),
    )
    mark_reviewed(db_session, reviewed_bug.id)
    create_item(
        db_session,
        FeedbackItemCreate(title="New idea", body="Body", category="idea"),
    )

    result = list_items(db_session, status="new", category="bug")

    assert len(result) == 1
    assert result[0].title == "New bug"


def test_list_items_rejects_invalid_category(db_session):
    with pytest.raises(InvalidCategoryFilterError):
        list_items(db_session, category="nonsense")


def test_mark_reviewed(db_session):
    item = create_item(
        db_session,
        FeedbackItemCreate(title="C", body="Body C", category="other"),
    )

    updated = mark_reviewed(db_session, item.id)

    assert updated.status == "reviewed"


def test_create_item_rejects_whitespace_only_fields():
    with pytest.raises(ValidationError):
        FeedbackItemCreate(title="   ", body="Body", category="bug")

    with pytest.raises(ValidationError):
        FeedbackItemCreate(title="Title", body="   ", category="bug")
