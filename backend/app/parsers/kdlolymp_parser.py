import httpx
import re
from typing import List
from uuid import UUID
from app.parsers.base import BaseParser
from app.schemas.schemas import RawRecordCreate
from app.core.logger import logger

class KDLOlympParser(BaseParser):
    def parse(self, file_path: str, source_file_id: UUID) -> List[RawRecordCreate]:
        # Extract city_slug from URL if present
        # Format: https://www.kdlolymp.kz/pricelist/astana or /kz/pricelist/astana
        city_slug = "astana"
        match = re.search(r'pricelist/([a-zA-Z0-9_-]+)', file_path)
        if match:
            city_slug = match.group(1)
            
        api_url = f"https://www.kdlolymp.kz/api/analysis-data?lang=ru-RU&city_slug={city_slug}&per-page=2000"
        logger.info(f"KDL Olymp Parser: Fetching from API: {api_url}")
        
        records = []
        try:
            with httpx.Client(timeout=30.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
                response = client.get(api_url, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                categories = data.get("data", [])
                
                for category in categories:
                    analyses = category.get("analysis", [])
                    for analysis in analyses:
                        # Sometimes name is in name_ru, sometimes translation is used
                        name = analysis.get("name_ru") or analysis.get("title")
                        
                        if not name and "translation" in analysis:
                            trans = analysis["translation"]
                            if isinstance(trans, list) and len(trans) > 0:
                                name = trans[0].get("title")
                            elif isinstance(trans, dict):
                                name = trans.get("title")
                                
                        price_obj = analysis.get("price")
                        price_val = None
                        
                        if isinstance(price_obj, dict):
                            price_val = price_obj.get("price")
                        elif isinstance(price_obj, list) and len(price_obj) > 0:
                            if isinstance(price_obj[0], dict):
                                price_val = price_obj[0].get("price")
                            else:
                                price_val = price_obj[0]
                        else:
                            price_val = price_obj
                            
                        if name and price_val is not None:
                            price_str = str(price_val)
                            # Only add if it has a price > 0 or at least is a digit string
                            if re.search(r'\d', price_str):
                                records.append(RawRecordCreate(
                                    source_file_id=source_file_id,
                                    raw_service_name=name[:490],
                                    raw_price=price_str[:95]
                                ))
                                
            logger.info(f"KDL Olymp Parser: Successfully extracted {len(records)} records via API")
            
        except Exception as e:
            logger.error(f"KDL Olymp Parser failed for {file_path}: {e}")
            raise e
            
        return records
