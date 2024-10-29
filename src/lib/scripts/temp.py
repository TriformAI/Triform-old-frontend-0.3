import json
import requests
import io
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

def handler(event, context):
    # Retrieve the URL from the event object
    pdf_url = event.get("input_0")

    # Check if the URL is provided; if not, return an error message
    if not pdf_url:
        return {"error": "No pdf url provided"}

    # Attempt to download the PDF file from the provided URL
    try:
        response = requests.get(pdf_url)
        response.raise_for_status()  # Raises an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        return json.dumps({"error": f"Failed to fetch PDF from URL: {str(e)}"})

    # Create an in-memory byte-stream object to hold the PDF data
    pdf_file = io.BytesIO(response.content)

    # Set up an output stream to collect the extracted text
    output_string = io.StringIO()
    try:
        # Set up layout parameters which affect how PDF text is extracted
        laparams = LAParams()

        # Extract text from the PDF file to the output string
        extract_text_to_fp(pdf_file, output_string, laparams=laparams, output_type='text', codec='utf-8')
    except Exception as e:
        return json.dumps({"error": "Failed to extract text from PDF"})

    # Retrieve the extracted text from the output string
    extracted_text = output_string.getvalue()

    # Return the extracted text in JSON format
    return json.dumps({"input_0": extracted_text})