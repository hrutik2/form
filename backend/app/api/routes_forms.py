from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import get_current_user
from app.schemas.forms import FormSchema, PublishFormRequest
from app.services.form_service import (
    create_form,
    delete_form,
    export_submissions_xlsx,
    get_form,
    list_forms,
    list_submissions,
    publish_form,
    update_form,
)

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.get("")
def get_forms(_: str = Depends(get_current_user)):
    return list_forms()


@router.post("")
def post_form(payload: FormSchema, user_id: str = Depends(get_current_user)):
    return create_form(payload.model_dump(by_alias=True, exclude={"id"}), created_by=user_id)


@router.get("/{form_id}")
def get_form_by_id(form_id: str, _: str = Depends(get_current_user)):
    form = get_form(form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"detail": "Form fetched successfully", "form": form}


@router.put("/{form_id}")
def put_form(form_id: str, payload: FormSchema, _: str = Depends(get_current_user)):
    updated = update_form(form_id, payload.model_dump(by_alias=True, exclude={"id"}))
    if not updated:
        raise HTTPException(status_code=404, detail="Form not found")
    return updated


@router.delete("/{form_id}")
def delete_form_by_id(form_id: str, _: str = Depends(get_current_user)):
    deleted = delete_form(form_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Form not found")
    return deleted


@router.post("/{form_id}/publish")
def publish_form_route(
    form_id: str,
    payload: PublishFormRequest,
    user_id: str = Depends(get_current_user),
):
    published = publish_form(
        form_id,
        published_by=user_id,
        enable_expiry=payload.enable_expiry,
        expiry_value=payload.expiry_value,
        expiry_unit=payload.expiry_unit,
        recipient_emails=payload.recipient_emails,
        token_reuse_enabled=payload.token_reuse_enabled,
    )
    if not published:
        raise HTTPException(status_code=404, detail="Form not found")
    return published


@router.get("/{form_id}/submissions")
def get_form_submissions(form_id: str, _: str = Depends(get_current_user)):
    return list_submissions(form_id)


@router.get("/{form_id}/submissions/export")
def export_submissions(form_id: str, _: str = Depends(get_current_user)):
    workbook = export_submissions_xlsx(form_id)
    return StreamingResponse(
        workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="form_{form_id}_submissions.xlsx"'
        },
    )
