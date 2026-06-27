import re

text = "Клинический анализ крови с лейкоцитарной формулой* и измерением скорости оседания эритроцитов (ОАК + СОЭ) Гематология 1 день 3 980 ₸ В корзину"

match1 = re.search(r'([^\d]{5,})\s+([\d\s\.,]{2,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', text, re.IGNORECASE)
print("Match1 (old):", match1.groups() if match1 else None)

match2 = re.search(r'(.+?)\s+([\d\s\.,]{3,})\s*(?:KZT|тнг|тенге|₸|руб|USD|€|\$)', text, re.IGNORECASE)
print("Match2 (new):", match2.groups() if match2 else None)
