import re
from typing import List, Optional, Tuple
from uuid import UUID
import pandas as pd
from app.parsers.base import BaseParser
from app.schemas.schemas import RawRecordCreate
from app.core.logger import logger


class ExcelParser(BaseParser):
    """
    Умный парсер Excel-файлов медицинских прайс-листов.
    Автоматически находит строку с заголовками и определяет колонки
    с названием услуги и ценой, даже если файл имеет сложную структуру
    (объединённые ячейки, шапки, разделы и т.д.).
    """

    # Ключевые слова для поиска колонки с названием услуги
    SERVICE_KEYWORDS = ['наименование', 'услуг', 'название', 'описание', 'процедур', 'вид услуги']
    # Ключевые слова для поиска колонки с ценой
    PRICE_KEYWORDS = ['цена', 'стоимость', 'тариф', 'сумма', 'ндс']
    # Ключевые слова для строк-разделов, которые нужно пропускать
    SECTION_KEYWORDS = ['стационар', 'амбулатор', 'раздел', 'итого', 'всего', 'примечан']

    def _find_header_row(self, df: pd.DataFrame) -> Tuple[int, Optional[str], Optional[str]]:
        """
        Ищет строку заголовков, сканируя каждую строку на наличие
        ключевых слов ('наименование', 'цена' и т.д.).
        Возвращает: (номер_строки, колонка_услуги, колонка_цены)
        """
        for row_idx in range(min(30, len(df))):  # Ищем в первых 30 строках
            row_values = [str(val).lower().strip() for val in df.iloc[row_idx]]
            
            service_col = None
            price_col = None
            
            for col_idx, val in enumerate(row_values):
                if not val or val == 'nan':
                    continue
                # Ищем колонку услуги
                if service_col is None:
                    for kw in self.SERVICE_KEYWORDS:
                        if kw in val:
                            service_col = df.columns[col_idx]
                            break
                # Ищем колонку цены (берём первую подходящую)
                if price_col is None:
                    for kw in self.PRICE_KEYWORDS:
                        if kw in val:
                            price_col = df.columns[col_idx]
                            break

            if service_col is not None and price_col is not None:
                logger.info(f"Found headers at row {row_idx}: service='{service_col}', price='{price_col}'")
                return row_idx, service_col, price_col

        return -1, None, None

    def _is_section_header(self, value: str) -> bool:
        """Проверяет, является ли строка заголовком раздела (а не реальной услугой)."""
        lower = value.lower().strip()
        # Если текст слишком короткий или начинается с римской цифры — это раздел
        if re.match(r'^[IVXLC]+\.', lower):
            return True
        for kw in self.SECTION_KEYWORDS:
            if lower.startswith(kw):
                return True
        return False

    def _clean_price(self, raw_price: str) -> str:
        """Извлекает числовое значение цены из строки."""
        price_str = str(raw_price).strip()
        # Убираем всё кроме цифр, точек и запятых
        cleaned = re.sub(r'[^\d.,]', '', price_str)
        # Заменяем запятую на точку (для десятичных)
        cleaned = cleaned.replace(',', '.')
        # Если осталось пусто — возвращаем оригинал
        return cleaned if cleaned else price_str

    def _clean_service_name(self, raw_name: str) -> str:
        """Очищает название услуги от лишних пробелов и спецсимволов."""
        name = str(raw_name).strip()
        name = re.sub(r'\s+', ' ', name)  # Множественные пробелы -> один
        return name

    def parse(self, file_path: str, source_file_id: UUID) -> List[RawRecordCreate]:
        logger.info(f"Parsing Excel file: {file_path}")
        records = []

        try:
            # Читаем без заголовков — чтобы самим найти строку с заголовками
            df = pd.read_excel(file_path, header=None)
            logger.info(f"Read {len(df)} rows x {len(df.columns)} columns")

            header_row, service_col, price_col = self._find_header_row(df)

            if header_row == -1 or service_col is None or price_col is None:
                # Фоллбэк: если не нашли заголовки, пробуем стандартный способ
                logger.warning("Could not find header row, falling back to default parsing")
                df = pd.read_excel(file_path)
                cols = [str(c).lower() for c in df.columns]
                service_col = next(
                    (c for c in df.columns if 'услуг' in str(c).lower() or 'наименование' in str(c).lower()),
                    df.columns[0]
                )
                price_col = next(
                    (c for c in df.columns if 'цен' in str(c).lower() or 'стоимость' in str(c).lower()),
                    df.columns[1]
                )
                data_start = 0
            else:
                # Данные начинаются после строки заголовков
                data_start = header_row + 1

            logger.info(f"Data starts at row {data_start}, service_col={service_col}, price_col={price_col}")

            for row_idx in range(data_start, len(df)):
                row = df.iloc[row_idx]
                raw_service = row[service_col]
                raw_price = row[price_col]

                # Пропускаем пустые строки
                if pd.isna(raw_service) or pd.isna(raw_price):
                    continue

                service_name = self._clean_service_name(str(raw_service))
                
                # Пропускаем "мусорные" строки
                if not service_name or service_name.lower() == 'nan' or len(service_name) < 3:
                    continue

                # Пропускаем заголовки разделов
                if self._is_section_header(service_name):
                    logger.debug(f"Skipping section header: {service_name}")
                    continue

                price_val = self._clean_price(str(raw_price))

                records.append(RawRecordCreate(
                    source_file_id=source_file_id,
                    raw_service_name=service_name,
                    raw_price=price_val
                ))

            logger.info(f"Successfully parsed {len(records)} records")

        except Exception as e:
            logger.error(f"Failed to parse Excel file {file_path}: {str(e)}")
            raise e

        return records
