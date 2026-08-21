from datetime import datetime, timezone
from io import BytesIO

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.db.mongo import db


def serialize(document: dict | None):
    if not document:
        return None
    document["_id"] = str(document["_id"])
    return document


def parse_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid form id",
        ) from error


def raise_database_error(action: str, error: PyMongoError):
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Database unavailable while trying to {action}",
    ) from error


def list_forms():
    try:
        cursor = db.forms.find().sort("updated_at", -1).limit(200)
        return [serialize(item) for item in cursor]
    except PyMongoError as error:
        raise_database_error("list forms", error)


def get_form(form_id: str):
    try:
        return serialize(db.forms.find_one({"_id": parse_object_id(form_id)}))
    except PyMongoError as error:
        raise_database_error("fetch a form", error)


def create_form(payload: dict):
    now = datetime.now(timezone.utc)
    payload["created_at"] = now
    payload["updated_at"] = now
    try:
        result = db.forms.insert_one(payload)
        payload["_id"] = result.inserted_id
        return serialize(payload)
    except PyMongoError as error:
        raise_database_error("create a form", error)


def update_form(form_id: str, payload: dict):
    payload["updated_at"] = datetime.now(timezone.utc)
    try:
        updated = db.forms.find_one_and_update(
            {"_id": parse_object_id(form_id)},
            {"$set": payload},
            return_document=ReturnDocument.AFTER,
        )
        return serialize(updated)
    except PyMongoError as error:
        raise_database_error("update a form", error)


def delete_form(form_id: str):
    try:
        form = db.forms.find_one({"_id": parse_object_id(form_id)}, {"status": 1})
        if not form:
            return None
        if form.get("status") == "published":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Published forms cannot be deleted",
            )

        result = db.forms.delete_one({"_id": form["_id"]})
        return {"deleted": result.deleted_count == 1}
    except HTTPException:
        raise
    except PyMongoError as error:
        raise_database_error("delete a form", error)


def publish_form(form_id: str):
    now = datetime.now(timezone.utc)
    target_id = parse_object_id(form_id)
    try:
        db.forms.update_many(
            {"status": "published", "_id": {"$ne": target_id}},
            {"$set": {"status": "unpublished", "updated_at": now}},
        )
        published = db.forms.find_one_and_update(
            {"_id": target_id},
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
    except PyMongoError as error:
        raise_database_error("publish a form", error)


def get_published_form():
    try:
        return serialize(db.forms.find_one({"status": "published"}, sort=[("updated_at", -1)]))
    except PyMongoError as error:
        raise_database_error("fetch the published form", error)


def create_submission(form_id: str, payload: dict, form_version: int | None = None):
    try:
        if form_version is None:
            form = db.forms.find_one({"_id": parse_object_id(form_id)}, {"version": 1})
            if not form:
                return None
            form_version = form["version"]

        now = datetime.now(timezone.utc)
        submission = {
            "form_id": form_id,
            "form_version": form_version,
            "data": payload,
            "submitted_at": now,
        }
        result = db.submissions.insert_one(submission)
        submission["_id"] = str(result.inserted_id)
        return submission
    except PyMongoError as error:
        raise_database_error("create a submission", error)


def list_submissions(form_id: str):
    try:
        items = db.submissions.find({"form_id": form_id}).sort("submitted_at", -1).limit(1000)
        return [serialize(item) for item in items]
    except PyMongoError as error:
        raise_database_error("list submissions", error)


def export_submissions_xlsx(form_id: str):
    try:
        form = db.forms.find_one({"_id": parse_object_id(form_id)}, {"sections": 1})
        submissions = list(db.submissions.find({"form_id": form_id}).sort("submitted_at", -1).limit(5000))
    except PyMongoError as error:
        raise_database_error("export submissions", error)

    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

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
