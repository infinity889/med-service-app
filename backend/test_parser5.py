from lxml import html
import re

with open("test_page.html", "r", encoding="utf-8") as f:
    html_content = f.read()
tree = html.fromstring(html_content)

records = []
items = tree.xpath('//*[contains(text(), "₸") or contains(text(), "KZT")]')

for item in items:
    # Go up ancestors one by one
    ancestors = item.xpath('ancestor::*')
    # Reverse to start from closest ancestor
    for ancestor in reversed(ancestors):
        text = " ".join(ancestor.itertext()).strip()
        text = re.sub(r'\s+', ' ', text)
        
        match = re.search(r'(.+?)\s+([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', text, re.IGNORECASE)
        if match:
            service_name = match.group(1).strip()
            price_str = match.group(2).strip()
            
            # Check if this service name is actually useful (not just numbers/symbols)
            if len(service_name) > 3 and any(c.isalpha() for c in service_name):
                # Don't add duplicates (prevent capturing parent of parent)
                if not any(r['name'] == service_name for r in records):
                    records.append({'name': service_name, 'price': price_str})
                break # We found the closest matching ancestor, stop going up!

print(f"Parsed {len(records)} records.")
for r in records[:5]:
    print(r)
