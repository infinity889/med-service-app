from lxml import html
import re

with open("test_page.html", "r", encoding="utf-8") as f:
    html_content = f.read()
tree = html.fromstring(html_content)

# The individual items appear to be direct children of the list container
list_divs = tree.xpath('//div[contains(@class, "list")]')
for list_div in list_divs[:1]:
    for child in list_div:
        text = " ".join(child.itertext()).strip()
        text = re.sub(r'\s+', ' ', text)
        print("Child class:", child.get('class'))
        print("Child text:", text)
        
        match = re.search(r'(.+?)\s+([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', text, re.IGNORECASE)
        if match:
            print("  MATCHED:", match.groups())
        print("-" * 40)
