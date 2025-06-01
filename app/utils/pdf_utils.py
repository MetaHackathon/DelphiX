from io import BytesIO
import PyPDF2

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF bytes using PyPDF2"""
    try:
        pdf_file = BytesIO(pdf_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return "" 