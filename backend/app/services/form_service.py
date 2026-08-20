from datetime import datetime, timezone
from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter
from pymongo import ReturnDocument
from bson import ObjectId

from app.db.mongo import db


def serialize(document: dict | None):
    if not document:
        return None
    document["_id"] = str(document["_id"])
    return document


def list_forms():
    return [serialize(item) for item in db.forms.find().sort("updated_at", -1)]


def get_form(form_id: str):
    return serialize(db.forms.find_one({"_id": ObjectId(form_id)}))


def create_form(payload: dict):
    now = datetime.now(timezone.utc)
    payload["created_at"] = now
    payload["updated_at"] = now
    result = db.forms.insert_one(payload)
    return get_form(str(result.inserted_id))


def update_form(form_id: str, payload: dict):
    payload["updated_at"] = datetime.now(timezone.utc)
    updated = db.forms.find_one_and_update(
        {"_id": ObjectId(form_id)},
        {"$set": payload},
        return_document=ReturnDocument.AFTER,
    )
    return serialize(updated)


def publish_form(form_id: str):
    now = datetime.now(timezone.utc)
    db.forms.update_many({"status": "published"}, {"$set": {"status": "unpublished"}})
    published = db.forms.find_one_and_update(
        {"_id": ObjectId(form_id)},
        {
            "$set": {
                "status": "published",
                "published_at": now,
                "updated_at": now,
            },
            "$inc": {"version": 1},
        },
        return_document=ReturnDocument.AFTER,
    )
    return serialize(published)


def get_published_form():
    return serialize(db.forms.find_one({"status": "published"}))


def create_submission(form_id: str, payload: dict):
    form = db.forms.find_one({"_id": ObjectId(form_id)})
    now = datetime.now(timezone.utc)
    submission = {
        "form_id": form_id,
        "form_version": form["version"],
        "data": payload,
        "submitted_at": now,
    }
    result = db.submissions.insert_one(submission)
    submission["_id"] = str(result.inserted_id)
    return submission


def list_submissions(form_id: str):
    items = db.submissions.find({"form_id": form_id}).sort("submitted_at", -1)
    return [serialize(item) for item in items]


def export_submissions_xlsx(form_id: str):
    form = db.forms.find_one({"_id": ObjectId(form_id)})
    submissions = list(db.submissions.find({"form_id": form_id}))
    columns = [
        field["name"]
        for section in form["sections"]
        for row in section["rows"]
        for field in row["fields"]
    ]

    workbook = Workbook()
    sheet = workbook.active
    headers = ["Submission ID", "Submitted At", *columns]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True)

    for item in submissions:
        row = [str(item["_id"]), item["submitted_at"].isoformat()]
        row.extend(item.get("data", {}).get(column, "") for column in columns)
        sheet.append(row)

    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    for index, column_cells in enumerate(sheet.columns, start=1):
        width = max(len(str(cell.value or "")) for cell in column_cells) + 2
        sheet.column_dimensions[get_column_letter(index)].width = width

    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return output
