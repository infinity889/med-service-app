import re
from typing import Tuple

class DataCleaner:
    @staticmethod
    def clean_service_name(name: str) -> str:
        if not name:
            return ""
        # Remove HTML tags
        name = re.sub(r'<[^>]*>', '', name)
        # Remove control characters
        name = re.sub(r'[\x00-\x1F\x7F]', '', name)
        # Remove line breaks
        name = name.replace('\n', ' ').replace('\r', '')
        # Remove double spaces
        name = re.sub(r'\s+', ' ', name)
        return name.strip()

    @staticmethod
    def clean_price(price_str: str) -> Tuple[float, str]:
        if not price_str:
            return 0.0, "KZT"
            
        # Extract currency before removing it
        currency = "KZT"
        if "usd" in price_str.lower() or "$" in price_str:
            currency = "USD"
        elif "eur" in price_str.lower() or "€" in price_str:
            currency = "EUR"
            
        # Remove currency symbols and formatting (keeping only digits and decimal point)
        # 12 500,00 -> 12500.00
        clean_str = re.sub(r'[^\d.,]', '', price_str)
        # Replace comma with dot for decimals
        clean_str = clean_str.replace(',', '.')
        
        # Handle multiple dots, e.g. 1.500.00 -> keep last as decimal if appropriate, or just strip
        # Simple heuristic: remove all dots except the last one if it's a decimal
        if clean_str.count('.') > 1:
            parts = clean_str.rsplit('.', 1)
            clean_str = parts[0].replace('.', '') + '.' + parts[1]
            
        try:
            return float(clean_str), currency
        except ValueError:
            return 0.0, currency
