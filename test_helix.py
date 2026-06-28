import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from uuid import uuid4
from app.parsers.html_parser import HTMLParser

if __name__ == "__main__":
    url = "https://helix.ru/almaty/catalog/190-vse-analizy?page=1"
    parser = HTMLParser()
    try:
        records = parser.parse(url, uuid4())
        print(f"Parsed {len(records)} records")
        for idx, r in enumerate(records[:10]):
            print(f"{idx+1}. {r.raw_service_name} - {r.raw_price}")
    except Exception as e:
        print(f"Error: {e}")
