import httpx
from lxml import html

with httpx.Client(follow_redirects=True) as client:
    res = client.get("https://invitro.kz/analizes/for-doctors/aktobe/?PAGEN_1=2")
    tree = html.fromstring(res.text)
    print("Fetched PAGEN_1=2")
    
    # Check if page 2 has different results
    cards = tree.xpath("//*[contains(@class, 'price')]")
    print(f"Found {len(cards)} price elements on page 2")
