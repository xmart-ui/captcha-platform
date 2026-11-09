import random
import string
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont


def generate_captcha():

    answer = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=5
        )
    )

    image = Image.new("RGB", (220, 80), "white")
    draw = ImageDraw.Draw(image)

    # Load a larger font
    try:
        font = ImageFont.truetype(
            r"C:\Windows\Fonts\arialbd.ttf",
            38
        )
    except OSError:
        font = ImageFont.load_default()

    # Center the CAPTCHA text
    bbox = draw.textbbox((0, 0), answer, font=font)

    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (220 - text_width) // 2
    y = (80 - text_height) // 2 - bbox[1]

    draw.text(
        (x, y),
        answer,
        fill="black",
        font=font
    )

    buffer = BytesIO()
    image.save(buffer, format="PNG")

    return answer, buffer.getvalue()