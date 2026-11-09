import cv2
import pytesseract
import numpy as np
import time
import re
import os

from pytesseract import Output


# Windows Tesseract OCR installation
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.isfile(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def solve_captcha(image_bytes):

    start_time = time.time()

    # Decode image
    image_array = np.frombuffer(image_bytes, np.uint8)

    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        raise ValueError("Invalid CAPTCHA image")

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Resize image
    enlarged = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    # Otsu thresholding
    processed = cv2.threshold(
        enlarged,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    # OCR configuration
    config = (
        "--oem 3 --psm 7 "
        "-c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    )

    # OCR recognition
    data = pytesseract.image_to_data(
        processed,
        config=config,
        output_type=Output.DICT
    )

    # Extract recognized characters
    raw_text = " ".join(data["text"])

    recognized_text = re.sub(
        r"[^A-Z0-9]",
        "",
        raw_text.upper()
    )

    # Calculate confidence
    confidence_values = []

    for value in data["conf"]:

        try:
            score = float(value)

            if score >= 0:
                confidence_values.append(score)

        except (ValueError, TypeError):
            continue

    confidence = (
        round(
            sum(confidence_values) / len(confidence_values),
            2
        )
        if confidence_values
        else 0
    )

    processing_time = round(
        time.time() - start_time,
        3
    )

    return {
        "recognized_text": recognized_text,
        "confidence": confidence,
        "processing_time": processing_time
    }