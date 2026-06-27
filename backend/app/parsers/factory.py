from app.parsers.base import BaseParser
from app.parsers.excel import ExcelParser
from app.parsers.pdf import PDFParser
from app.parsers.docx import DOCXParser
from app.parsers.html_parser import HTMLParser

class ParserFactory:
    @staticmethod
    def get_parser(file_type: str) -> BaseParser:
        if file_type in ['xlsx', 'xls']:
            return ExcelParser()
        elif file_type == 'pdf':
            return PDFParser()
        elif file_type == 'docx':
            return DOCXParser()
        elif file_type == 'html':
            return HTMLParser()
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
