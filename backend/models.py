from sqlalchemy import Column, Integer, String, Text, DateTime, func
from db import Base

class InvoiceData(Base):
    __tablename__ = "invoice_data"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    raw_text = Column(Text)
    parsed_data = Column(Text)

class POData(Base):
    __tablename__ = "po_data"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    raw_text = Column(Text)
    parsed_data = Column(Text)

class Discrepancy(Base):
    __tablename__ = "discrepancies"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255))  # ✅ Add this line
    details = Column(Text)             # stores JSON or text summary
    timestamp = Column(DateTime, server_default=func.now())
