import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from uuid import uuid4
from app.parsers.html_parser import HTMLParser

class DebugHTMLParser(HTMLParser):
    def parse(self, file_path, source_file_id):
        url = file_path
        import httpx
        from lxml import html
        import re

        with httpx.Client(timeout=30.0, follow_redirects=True) as client:
            headers = {"User-Agent": "Mozilla/5.0"}
            response = client.get(url, headers=headers)
            html_content = response.text
            
        tree = html.fromstring(html_content)
        for bad in tree.xpath('//script | //style'):
            bad.getparent().remove(bad)
            
        items = tree.xpath('//*[contains(text(), "₸")]')
        records = []
        for item in items:
            ancestors = item.xpath('ancestor-or-self::*')
            for ancestor in reversed(ancestors):
                nodes = [t.strip() for t in ancestor.itertext() if t.strip() and len(t.strip()) > 1]
                price_idx = -1
                for i, n in enumerate(nodes):
                    if re.search(r'([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', n, re.IGNORECASE):
                        price_idx = i
                        break
                if price_idx > 0:
                    price_str = nodes[price_idx]
                    candidates = nodes[:price_idx]
                    service_name = max(candidates, key=len)
                    print(f"DEBUG: Found price {price_str}")
                    print(f"DEBUG: Candidates {candidates}")
                    print(f"DEBUG: Selected name {service_name}")
                    if len(service_name) > 3 and any(c.isalpha() for c in service_name) and '{' not in service_name and '"' not in service_name:
                        if not any(r['raw_service_name'] == service_name[:490] for r in records):
                            records.append({'raw_service_name': service_name[:490], 'raw_price': price_str})
                        else:
                            print(f"DEBUG: Skipped duplicate {service_name}")
                        break
        return records

if __name__ == "__main__":
    url = "https://helix.ru/almaty/catalog/190-vse-analizy?page=1"
    parser = DebugHTMLParser()
    try:
        records = parser.parse(url, uuid4())
        print(f"Parsed {len(records)} records")
    except Exception as e:
        print(f"Error: {e}")
