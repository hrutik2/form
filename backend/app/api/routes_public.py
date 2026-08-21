from fastapi import APIRouter, HTTPException

from app.services.form_service import create_submission, get_form, get_published_form

router = APIRouter(prefix="/api/public/forms", tags=["public"])


@router.get("/published")
def fetch_published_form():
    form = get_published_form()
    if not form:
        raise HTTPException(status_code=404, detail="No published form found")
    return form


@router.get("/{form_id}")
def fetch_form(form_id: str):
    form = get_form(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.post("/{form_id}/submissions")
def post_submission(form_id: str, payload: dict[str, str | list[str]]):
    form = get_form(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    required_fields = [
        field.get("name") or field["id"]
        for section in form["sections"]
        for row in section["rows"]
        for field in row["fields"]
        if field.get("required")
    ]
    missing = [name for name in required_fields if not payload.get(name)]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required fields: {missing}")

    submission = create_submission(form_id, payload, form["version"])
    if not submission:
        raise HTTPException(status_code=404, detail="Form not found")
    return submission
