#!/usr/bin/env python3
"""Re-seed the demo divide-by-zero bug after a Cloud Agent fix has merged.

Applies intent-based transforms (not a git patch) so the script stays stable
when agent PRs differ slightly in test coverage. Does not add crash tests —
the bug is verified at runtime (curl / UI), not in pytest.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICES = ROOT / "app" / "services.py"
TEST_API = ROOT / "tests" / "test_api.py"
TEST_SERVICES = ROOT / "tests" / "test_services.py"

GUARDED = "percent_reviewed = round(reviewed / total * 100) if total else 0"
UNGUARDED = "percent_reviewed = round(reviewed / total * 100)"

AGENT_API_TESTS = (
    "test_stats_empty_filtered_set_returns_zero_percent",
    "test_list_and_stats_reviewed_filter_with_no_reviewed_items",
    "test_stats_empty_filtered_set_crashes",
    "test_stats_with_no_matching_items_returns_zero",
)

AGENT_SERVICE_TESTS = (
    "test_get_stats_counts_reviewed",
    "test_get_stats_empty_set_returns_zero_percent",
    "test_get_stats_reviewed_filter_with_no_matches",
    "test_get_stats_empty_does_not_divide_by_zero",
)


def is_already_reseeded() -> bool:
    services = SERVICES.read_text()
    api = TEST_API.read_text()
    test_services = TEST_SERVICES.read_text()
    return (
        UNGUARDED in services
        and GUARDED not in services
        and not any(f"def {name}" in api for name in AGENT_API_TESTS)
        and not any(f"def {name}" in test_services for name in AGENT_SERVICE_TESTS)
        and "ZeroDivisionError" not in api
    )


def remove_test_function(text: str, func_name: str) -> str:
    marker = f"def {func_name}"
    if marker not in text:
        return text
    start = text.index(marker)
    rest = text[start + 1 :]
    next_def = rest.find("\ndef ")
    end = start + 1 + next_def if next_def != -1 else len(text)
    return text[:start].rstrip() + "\n\n" + text[end:].lstrip()


def strip_unused_pytest_import(text: str) -> str:
    if "pytest" not in text:
        return text
    if "pytest." in text or "pytest.raises" in text:
        return text
    lines = text.splitlines(keepends=True)
    return "".join(line for line in lines if line.strip() != "import pytest")


def reseed_services() -> bool:
    text = SERVICES.read_text()
    if UNGUARDED in text and GUARDED not in text:
        return False
    if GUARDED not in text:
        raise SystemExit(
            "error: expected guarded get_stats line in app/services.py — "
            "is main already reseeded or was get_stats changed?"
        )
    SERVICES.write_text(text.replace(GUARDED, UNGUARDED, 1))
    return True


def reseed_test_api() -> bool:
    text = TEST_API.read_text()
    changed = False
    for name in AGENT_API_TESTS:
        new_text = remove_test_function(text, name)
        if new_text != text:
            text = new_text
            changed = True
    new_text = strip_unused_pytest_import(text)
    if new_text != text:
        text = new_text
        changed = True
    if changed:
        TEST_API.write_text(text)
    return changed


def reseed_test_services() -> bool:
    text = TEST_SERVICES.read_text()
    changed = False
    for name in AGENT_SERVICE_TESTS:
        new_text = remove_test_function(text, name)
        if new_text != text:
            text = new_text
            changed = True
    new_text = re.sub(r"    get_stats,\n", "", text)
    if new_text != text:
        text = new_text
        changed = True
    if changed:
        TEST_SERVICES.write_text(text)
    return changed


def main() -> None:
    if is_already_reseeded():
        print("Already reseeded — demo bug is present.")
        return

    any_change = reseed_services() | reseed_test_api() | reseed_test_services()
    if not is_already_reseeded():
        raise SystemExit("error: reseed transforms did not produce expected demo bug state")

    if any_change:
        print("Demo bug reseeded (services + tests).")
    else:
        print("Already reseeded — demo bug is present.")


if __name__ == "__main__":
    main()
