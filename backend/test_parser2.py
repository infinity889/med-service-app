from lxml import html

with open("test_page.html", "r", encoding="utf-8") as f:
    html_content = f.read()
    
tree = html.fromstring(html_content)

# Let's find elements containing ₸ and traverse up to 3 ancestors to see where the service name appears
items = tree.xpath('//*[contains(text(), "₸")]')
for item in items[:2]:
    print("Element:", item.text)
    for i in range(1, 5):
        ancestor = item.xpath(f'ancestor::div[{i}]')
        if ancestor:
            text = " ".join(ancestor[0].itertext()).strip()
            print(f"  Ancestor {i} (class: {ancestor[0].get('class')}): {text[:100]}...")
            
