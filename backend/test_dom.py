import re
from lxml import html

html_content = """
<div class="service-card">
   <div class="title">Клинический анализ крови с лейкоцитарной формулой* и измерением скорости оседания эритроцитов (ОАК + СОЭ)</div>
   <div class="category">Гематология</div>
   <div class="duration">1 день</div>
   <div class="price-btn">
      <span class="price">3 980 ₸</span>
      <button>В корзину</button>
   </div>
</div>
"""
tree = html.fromstring(html_content)
items = tree.xpath('//*[contains(text(), "₸") or contains(text(), "KZT")]')

for item in items:
    ancestors = item.xpath('ancestor-or-self::*')
    for ancestor in reversed(ancestors):
        nodes = [t.strip() for t in ancestor.itertext() if t.strip() and len(t.strip()) > 1]
        
        # Is price in this ancestor?
        # Let's find the price node index
        price_idx = -1
        for i, n in enumerate(nodes):
            if re.search(r'([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', n, re.IGNORECASE):
                price_idx = i
                break
                
        if price_idx != -1:
            price_str = nodes[price_idx]
            match = re.search(r'([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', price_str, re.IGNORECASE)
            price_val = match.group(1).strip() if match else price_str
            
            # The service name is likely the first node, or the longest node before the price
            if price_idx > 0:
                candidates = nodes[:price_idx]
                # Filter out short metadata like "1 день" or "Гематология"
                # Usually service name is the longest string
                service_name = max(candidates, key=len)
                print(f"Service: {service_name}")
                print(f"Price: {price_val}")
                break

