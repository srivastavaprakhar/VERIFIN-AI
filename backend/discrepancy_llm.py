import sqlite3
import os
from openai import OpenAI

# Initialize Shivaay client
client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url="https://api.futurixai.com/api/shivaay/v1"
)


def run_discrepancy_query(request: str):
    """
    Ask Shivaay AI to generate an SQL query to find discrepancies
    between invoice_data and po_data tables in the local SQLite database.
    """

    try:
        # Step 1: Ask the LLM to write SQL
        prompt = f"""
        You are a data assistant for financial record verification.
        The database has two tables: invoice_data and po_data.
        Each has fields: id, filename, raw_text, parsed_data (JSON).

        Generate a valid SQLite SQL query that answers this request:
        "{request}"

        Example requests:
        - Find mismatched totals
        - Show invoices where vendor differs from PO
        - List all records with mismatched PO numbers

        ONLY return valid SQL syntax, no explanations.
        """

        completion = client.chat.completions.create(
            model="shivaay",
            messages=[
                {"role": "system", "content": "You are an SQL generator."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=400,
        )

        sql_query = completion.choices[0].message.content.strip()

        # Step 2: Run that SQL query
        conn = sqlite3.connect("verifin.db")
        cursor = conn.cursor()

        try:
            cursor.execute(sql_query)
            rows = cursor.fetchall()
        except Exception as e:
            rows = [("SQL error", str(e))]

        conn.close()

        # Step 3: Return result
        return {"sql": sql_query, "rows": rows}

    except Exception as e:
        return {"error": str(e)}
