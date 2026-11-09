import time
import secrets
import hashlib

CAPTCHA_STORE = {}


def save_captcha(answer, image_bytes):
    captcha_id = secrets.token_urlsafe(16)

    normalized_answer = answer.strip().upper()

    CAPTCHA_STORE[captcha_id] = {
        "answer": hashlib.sha256(
            normalized_answer.encode()
        ).hexdigest(),

        "image": image_bytes,
        "created_at": time.time(),
        "used": False
    }

    return captcha_id