# discrepancy_llm.py
import sqlite3
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
# Use env var for base_url and key; change as per Shivaay docs if needed.
client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url=os.getenv("SHIVAAY_BASE_URL", "https://api.futurixai.com/api/shivaay/v1")
)

def _clean_sql_from_model(text: str) -> str:
    # Remove markdown fences and stray backticks
    sql = text.replace("```sql", "").replace("```", "").strip(" \n`")
    return sql

def run_discrepancy_query(request: str):
    """
    Use Shivaay AI to generate a valid SQLite query to find mismatches
    in invoice_data and po_data tables. Use json_extract for SQLite.
    """

    try:
        prompt = f"""
You are a SQLite SQL generator. The DB is SQLite and JSON fields must be accessed using json_extract(column, '$.key').
There are two tables:

1) invoice_data:
   - id
   - filename
   - parsed_data (JSON with keys: invoice_number, vendor, purchase_order_reference, total_amount, invoice_date)

2) po_data:
   - id
   - filename
   - parsed_data (JSON with keys: purchase_order_id, vendor, total_value, order_date)

Write a SINGLE valid SQLite SQL query (no explanation, no markdown fences) to satisfy this request:
\"{request}\"

Important:
- Use json_extract(parsed_data, '$.<key>') to extract values.
- Cast numeric fields where needed: CAST(json_extract(... ) AS REAL)
- Join invoice_data and po_data by purchase_order_reference == purchase_order_id (where appropriate).
Return only the SQL query text.
"""

        completion = client.chat.completions.create(
            model=os.getenv("SHIVAAY_MODEL", "shivaay"),
            messages=[
                {"role": "system", "content": "You are an expert SQLite query generator. Output only the SQL query."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=512
        )

        raw_sql = completion.choices[0].message.content
        sql_query = _clean_sql_from_model(raw_sql)

        # Safety: very small whitelist check (ensure it starts with SELECT)
        if not sql_query.lower().strip().startswith("select"):
            return {"error": "Model did not return a SELECT query.", "sql": sql_query}

        conn = sqlite3.connect("verifin.db")
        cursor = conn.cursor()

        try:
            cursor.execute(sql_query)
            rows = cursor.fetchall()
        except Exception as e:
            rows = [("SQL error", str(e))]

        conn.close()

        return {"sql": sql_query, "rows": rows}

    except Exception as e:
        return {"error": str(e)}
