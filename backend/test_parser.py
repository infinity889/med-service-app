import asyncio
from playwright.async_api import async_playwright
from lxml import html
import re

async def main():
    print("Fetching...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        await page.goto("https://www.kdlolymp.kz/pricelist/astana", timeout=30000)
        await page.wait_for_load_state("networkidle", timeout=15000)
        html_content = await page.content()
        await browser.close()
        
    print("Fetched HTML length:", len(html_content))
    with open("test_page.html", "w", encoding="utf-8") as f:
        f.write(html_content)
        
    tree = html.fromstring(html_content)
    
    # Try different xpaths to find the elements
    print("\n--- Strategy A: contains ₸ ---")
    items = tree.xpath('//*[contains(text(), "₸")]')
    print(f"Found {len(items)} elements containing '₸'")
    for i, item in enumerate(items[:3]):
        print(f"  Element {i} tag: {item.tag}, text: {item.text}")
        parent = item.xpath('..')[0]
        print(f"  Parent tag: {parent.tag}, class: {parent.get('class', '')}, all_text: {' '.join(parent.itertext()).strip()}")
        
    print("\n--- Strategy B: general items ---")
    items = tree.xpath('//*[contains(@class, "price")]')
    print(f"Found {len(items)} elements with class containing 'price'")
    if items:
        parent = items[0].xpath('ancestor::div[1]')[0]
        print(f"  First item parent all_text: {' '.join(parent.itertext()).strip()}")

asyncio.run(main())
