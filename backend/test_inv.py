import httpx
from lxml import html
from urllib.parse import urlparse, parse_qs

with httpx.Client(follow_redirects=True) as client:
    res = client.get("https://invitro.kz/analizes/for-doctors/aktobe/")
    tree = html.fromstring(res.text)
    
    # Let's find all links and print ones that might be pagination
    for a in tree.xpath('//a'):
        href = a.get('href', '')
        text = a.text_content().strip()
        if 'PAGEN' in href or 'page' in href.lower() or 'еще' in text.lower() or 'далее' in text.lower() or 'вперед' in text.lower():
            print(f"Match: TEXT='{text}' HREF='{href}'")
