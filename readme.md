# CAPTCHA Recognition & Verification Testing Platform

## Project Overview
This project is a synthetic CAPTCHA generation, recognition, and verification platform. It uses a React frontend and FastAPI backend with Tesseract OCR for automatic text recognition.

## Technologies Used
- Python
- FastAPI
- React.js
- JavaScript
- Pillow
- OpenCV
- Tesseract OCR
- NumPy
- Pytesseract

## Main Features
1. Generate synthetic text-based CAPTCHA images.
2. Manually verify CAPTCHA answers.
3. Automatically recognize CAPTCHA text using OCR.
4. Verify recognized text against the stored CAPTCHA answer.
5. Track total, successful, and failed verification attempts.
6. Prevent reuse of CAPTCHA challenges.
7. Expire CAPTCHA challenges after five minutes.

## How to Run the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend URL: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown in the terminal.

## OCR Method
The platform uses Tesseract OCR with OpenCV image preprocessing to recognize synthetic CAPTCHA text.

## Conclusion
The project demonstrates CAPTCHA generation, manual verification, automated OCR recognition, and verification performance testing.