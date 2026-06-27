from abc import ABC, abstractmethod
from typing import List, Any
from app.schemas.schemas import RawRecordCreate
from uuid import UUID

class BaseParser(ABC):
    @abstractmethod
    def parse(self, file_path: str, source_file_id: UUID) -> List[RawRecordCreate]:
        """
        Parse the given file and return a list of RawRecordCreate schemas.
        """
        pass
