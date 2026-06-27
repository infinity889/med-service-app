import httpx
import re
from typing import List
from uuid import UUID
from app.parsers.base import BaseParser
from app.schemas.schemas import RawRecordCreate
from app.core.logger import logger
from lxml import html

class HTMLParser(BaseParser):
    def parse(self, file_path: str, source_file_id: UUID) -> List[RawRecordCreate]:
        # For HTMLParser, file_path is treated as the URL
        url = file_path
        logger.info(f"Parsing HTML from URL: {url}")
        
        records = []
        try:
            html_content = ""
            try:
                from playwright.sync_api import sync_playwright
                with sync_playwright() as p:
                    browser = p.chromium.launch(headless=True)
                    page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    page.goto(url, timeout=30000)
                    page.wait_for_load_state("networkidle", timeout=15000)
                    html_content = page.content()
                    browser.close()
                    logger.info("Successfully fetched HTML using Playwright (JS rendered)")
            except Exception as e:
                logger.warning(f"Playwright failed or not available, falling back to httpx: {e}")
                with httpx.Client(timeout=30.0, follow_redirects=True) as client:
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                    response = client.get(url, headers=headers)
                    response.raise_for_status()
                    html_content = response.text
                
            tree = html.fromstring(html_content)
            
            # Strategy 1: Find all tables
            tables = tree.xpath('//table')
            for table in tables:
                for row in table.xpath('.//tr'):
                    cells = row.xpath('.//td | .//th')
                    if len(cells) >= 2:
                        cell_texts = [" ".join(cell.itertext()).strip() for cell in cells]
                        # Filter out empty cells
                        cell_texts = [t for t in cell_texts if t]
                        if len(cell_texts) >= 2:
                            service_name = cell_texts[0]
                            price_str = cell_texts[-1]
                            
                            if len(service_name) > 3 and re.search(r'\d', price_str):
                                records.append(RawRecordCreate(
                                    source_file_id=source_file_id,
                                    raw_service_name=service_name[:490],
                                    raw_price=price_str[:95]
                                ))
                            
            # Strategy 2: If no tables found, use robust DOM traversal
            if not records:
                items = tree.xpath('//*[contains(text(), "₸") or contains(text(), "KZT") or contains(text(), "тнг") or contains(text(), "руб")]')
                
                for item in items:
                    # Traverse up the DOM tree from the price marker
                    ancestors = item.xpath('ancestor::*')
                    # Reverse to start from the closest ancestor
                    for ancestor in reversed(ancestors):
                        text = " ".join(ancestor.itertext()).strip()
                        text = re.sub(r'\s+', ' ', text)
                        
                        match = re.search(r'(.+?)\s+([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', text, re.IGNORECASE)
                        if match:
                            service_name = match.group(1).strip()
                            price_str = match.group(2).strip()
                            
                            if len(service_name) > 3 and any(c.isalpha() for c in service_name):
                                if not any(r.raw_service_name == service_name[:490] for r in records):
                                    records.append(RawRecordCreate(
                                        source_file_id=source_file_id,
                                        raw_service_name=service_name[:490],
                                        raw_price=price_str[:95]
                                    ))
                                # Stop going up the tree once we found the container for this price
                                break

            logger.info(f"Successfully parsed {len(records)} records from {url}")
        except Exception as e:
            logger.error(f"Failed to fetch or parse {url}: {str(e)}")
            raise e
        return records
