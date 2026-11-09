import base64
import hashlib
import time

from services.captcha_solver import solve_captcha
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.captcha_generator import generate_captcha
from captcha_store import CAPTCHA_STORE, save_captcha

router = APIRouter(prefix="/api/captcha", tags=["CAPTCHA"])

stats = {
    "total": 0,
    "success": 0,
    "failed": 0
}


class VerifyRequest(BaseModel):
    captcha_id: str
    answer: str


@router.get("/new")
def create_captcha():
    answer, image_bytes = generate_captcha()

    captcha_id = save_captcha(answer, image_bytes)

    image_base64 = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    return {
        "captcha_id": captcha_id,
        "image": f"data:image/png;base64,{image_base64}",
        "challenge_type": "synthetic_text",
        "message": "CAPTCHA generated successfully"
    }


@router.post("/verify")
def verify_captcha(data: VerifyRequest):
    stats["total"] += 1

    record = CAPTCHA_STORE.get(data.captcha_id)

    if not record:
        stats["failed"] += 1
        return {"success": False, "message": "Invalid CAPTCHA ID"}

    if record["used"]:
        stats["failed"] += 1
        return {"success": False, "message": "CAPTCHA already used"}

    if time.time() - record["created_at"] > 300:
        record["used"] = True
        stats["failed"] += 1
        return {"success": False, "message": "CAPTCHA expired"}

    record["used"] = True

    submitted = hashlib.sha256(
        data.answer.strip().upper().encode()
    ).hexdigest()

    if submitted == record["answer"]:
        stats["success"] += 1
        return {
            "success": True,
            "message": "CAPTCHA verified successfully"
        }

    stats["failed"] += 1

    return {
        "success": False,
        "message": "Incorrect CAPTCHA answer"
    }


@router.get("/stats")
def get_stats():
    return stats

@router.post("/solve")
def automatic_solve(data: dict):
    captcha_id = data.get("captcha_id")

    start_record = CAPTCHA_STORE.get(captcha_id)

    if not start_record:
        raise HTTPException(
            status_code=404,
            detail="CAPTCHA not found"
        )

    if start_record["used"]:
        raise HTTPException(
            status_code=400,
            detail="CAPTCHA already used"
        )

    if time.time() - start_record["created_at"] > 300:
        start_record["used"] = True

        raise HTTPException(
            status_code=400,
            detail="CAPTCHA expired"
        )

    try:
        result = solve_captcha(start_record["image"])

        recognized_text = (
            result.get("recognized_text", "")
            .strip()
            .upper()
        )

        if not recognized_text:
            raise ValueError("OCR returned empty text")

        submitted_hash = hashlib.sha256(
            recognized_text.encode()
        ).hexdigest()

        correct = submitted_hash == start_record["answer"]

        start_record["used"] = True

        stats["total"] += 1

        if correct:
            stats["success"] += 1
        else:
            stats["failed"] += 1

        return {
            "success": correct,
            "recognized_text": recognized_text,
            "confidence": result.get("confidence", 0),
            "processing_time": result.get("processing_time", 0),
            "challenge_type": "synthetic_text",
            "method": "Tesseract OCR",
            "message": (
                "OCR solved successfully"
                if correct
                else "OCR recognition failed"
            )
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing error: {str(error)}"
        )
