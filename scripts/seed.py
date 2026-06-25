#!/usr/bin/env python3
"""Seed demo feedback items for local development."""

from app.db import SessionLocal, init_db
from app.schemas import FeedbackItemCreate
from app.services import create_item

SEED_ITEMS = [
    FeedbackItemCreate(
        title="Export hangs on large CSVs",
        body="When exporting more than 10k rows, the spinner never completes.",
        category="bug",
    ),
    FeedbackItemCreate(
        title="Keyboard shortcuts for review",
        body="J/K to move between items and R to mark reviewed would speed triage.",
        category="idea",
    ),
    FeedbackItemCreate(
        title="Weekly review ritual",
        body="Team agreed to review new items every Friday standup.",
        category="process",
    ),
    FeedbackItemCreate(
        title="Unclear empty state",
        body="New users are not sure what to submit first.",
        category="other",
    ),
]


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        for payload in SEED_ITEMS:
            create_item(db, payload)
        print(f"Seeded {len(SEED_ITEMS)} feedback items.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
