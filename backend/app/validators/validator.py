from typing import Tuple

class RecordValidator:
    @staticmethod
    def validate(service_name: str, price: float) -> Tuple[bool, str]:
        """
        Validates the cleaned record.
        Returns a tuple: (is_valid, error_message)
        """
        if not service_name or service_name.strip() == "":
            return False, "Service name is empty."
            
        if price is None:
            return False, "Price is not a number."
            
        if price <= 0:
            return False, "Price must be greater than zero."
            
        return True, ""
