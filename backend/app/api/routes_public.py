from fastapi import APIRouter, Header, HTTPException, Query

from app.services.form_service import (
    create_submission,
    get_form,
    get_published_form,
    get_submission_token,
    validate_public_form_access,
)

router = APIRouter(prefix="/api/public/forms", tags=["public"])


@router.get("/published")
def fetch_published_form():
    form = get_published_form()
    if not form:
        raise HTTPException(status_code=404, detail="No published form found")
    return form


@router.get("/{form_id}")
def fetch_form(form_id: str, token: str | None = Query(default=None)):
    access = validate_public_form_access(form_id, token)
    if not access:
        raise HTTPException(status_code=404, detail="Form not found")
    return access["form"]


@router.get("/{form_id}/submission-token")
def fetch_submission_token(form_id: str):
    token_payload = get_submission_token(form_id)
    if not token_payload:
        raise HTTPException(status_code=404, detail="Form not found")
    return token_payload


@router.post("/{form_id}/submissions")
def post_submission(
    form_id: str,
    payload: dict[str, str | list[str]],
    x_submission_token: str | None = Header(default=None),
    token: str | None = Query(default=None),
):
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

    submission = create_submission(form_id, payload, x_submission_token, token)
    if not submission:
        raise HTTPException(status_code=404, detail="Form not found")
    return submission
