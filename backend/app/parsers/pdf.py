import pdfplumber
import re
from typing import List
from uuid import UUID
from app.parsers.base import BaseParser
from app.schemas.schemas import RawRecordCreate
from app.core.logger import logger

class PDFParser(BaseParser):
    def parse(self, file_path: str, source_file_id: UUID) -> List[RawRecordCreate]:
        logger.info(f"Parsing PDF file: {file_path}")
        records = []
        try:
            with pdfplumber.open(file_path) as pdf:
                # 1. Try to extract tables first
                for page in pdf.pages:
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            if not row or len(row) < 2:
                                continue
                            
                            # Flatten row and remove Nones
                            cells = [str(cell).strip() for cell in row if cell is not None]
                            if len(cells) < 2:
                                continue
                                
                            service_name = cells[0]
                            # Find the first cell that looks like a price (has digits)
                            price_str = None
                            for cell in reversed(cells[1:]):
                                if re.search(r'\d', cell):
                                    price_str = cell
                                    break
                                    
                            if service_name and price_str and len(service_name) > 3:
                                records.append(RawRecordCreate(
                                    source_file_id=source_file_id,
                                    raw_service_name=service_name,
                                    raw_price=price_str
                                ))

                # 2. If tables didn't yield much, fallback to text parsing
                if len(records) < 10:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if not text:
                            continue
                        
                        lines = text.split('\n')
                        for line in lines:
                            match = re.search(r'(.*?)\s+([\d\s\.,]+)\s*(?:KZT|тнг|тенге|₸|руб)?$', line, re.IGNORECASE)
                            if match:
                                service_name = match.group(1).strip()
                                price_str = match.group(2).strip()
                                
                                if len(service_name) > 3 and any(c.isalpha() for c in service_name):
                                    # Basic dedup
                                    if not any(r.raw_service_name == service_name for r in records):
                                        records.append(RawRecordCreate(
                                            source_file_id=source_file_id,
                                            raw_service_name=service_name,
                                            raw_price=price_str
                                        ))
                                        
            logger.info(f"Successfully parsed {len(records)} records from PDF")
        except Exception as e:
            logger.error(f"Failed to parse PDF file {file_path}: {str(e)}")
            raise e
        return records
