import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ✅ Initialize the Shivaay client (same as OpenAI)
client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url="https://api.futurixai.com/api/shivaay/v1"
)

def parse_with_shivaay_ai(extracted_text: str):
    try:
        completion = client.chat.completions.create(
            model="shivaay",
            messages=[
                {"role": "system", "content": "You are a financial document parser. Extract structured invoice or PO data as JSON."},
                {"role": "user", "content": f"Parse and extract key fields from this document:\n{extracted_text}"}
            ],
            temperature=0.3,
            max_tokens=1000
        )

        message = completion.choices[0].message
        # Return its text content safely
        return getattr(message, "content", "{}")

    except Exception as e:
        print("Error calling Shivaay API:", e)
        return "{}"
    
    except Exception as e:
        print("Error calling Shivaay API:", e)
        return "{}"
