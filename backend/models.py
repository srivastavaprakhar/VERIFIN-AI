from sqlalchemy import Column, Integer, String, Text
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
    __tablename__ = "discrepancy_data"
    id = Column(Integer, primary_key=True, index=True)
    field = Column(String(255))
    invoice_value = Column(Text)
    po_value = Column(Text)
