"""
Utility functions and helpers for FloatChat application.
"""

import json
import re
from typing import Any, Dict, List, Optional


def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
    """
    Extract JSON object from text that may contain other content.

    Args:
        text: Text potentially containing JSON

    Returns:
        Parsed JSON dictionary or None if no valid JSON found
    """
    # Find the first opening brace
    start = text.find("{")
    if start == -1:
        return None

    # Find the matching closing brace
    brace_count = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            brace_count += 1
        elif text[i] == "}":
            brace_count -= 1
            if brace_count == 0:
                json_str = text[start:i + 1]
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    return None

    return None


def clean_column_name(column_name: str) -> str:
    """
    Clean and standardize column names.

    Args:
        column_name: Original column name

    Returns:
        Cleaned column name
    """
    # Convert to lowercase and replace spaces/special chars with underscores
    clean_name = re.sub(r'[^\w]', '_', column_name.lower())
    # Remove multiple consecutive underscores
    clean_name = re.sub(r'_+', '_', clean_name)
    # Remove leading/trailing underscores
    clean_name = clean_name.strip('_')
    return clean_name


def validate_filters(filters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Validate and clean database filters.

    Args:
        filters: List of filter dictionaries

    Returns:
        List of validated filters
    """
    valid_filters = []
    valid_operations = {
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
        'like', 'ilike', 'in', 'not_in', 'between'
    }

    for filter_dict in filters:
        if not isinstance(filter_dict, dict):
            continue

        column = filter_dict.get("column")
        operation = filter_dict.get("op")
        value = filter_dict.get("value")

        # Validate required fields
        if not column or not operation or value is None:
            continue

        # Validate operation
        if operation not in valid_operations:
            continue

        # Validate value types for specific operations
        if operation == "between":
            if not isinstance(value, list) or len(value) != 2:
                continue
        elif operation in ("in", "not_in"):
            if not isinstance(value, list):
                continue

        valid_filters.append({
            "column": clean_column_name(column),
            "op": operation,
            "value": value
        })

    return valid_filters


def format_scientific_notation(value: float, precision: int = 2) -> str:
    """
    Format number in scientific notation if needed.

    Args:
        value: Number to format
        precision: Decimal precision

    Returns:
        Formatted number string
    """
    if abs(value) >= 1000 or (abs(value) < 0.01 and value != 0):
        return f"{value:.{precision}e}"
    else:
        return f"{value:.{precision}f}"


def truncate_text(text: str, max_length: int = 1000, suffix: str = "...") -> str:
    """
    Truncate text to specified length with suffix.

    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def safe_float_conversion(value: Any) -> Optional[float]:
    """
    Safely convert value to float.

    Args:
        value: Value to convert

    Returns:
        Float value or None if conversion fails
    """
    if value is None:
        return None

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_int_conversion(value: Any) -> Optional[int]:
    """
    Safely convert value to integer.

    Args:
        value: Value to convert

    Returns:
        Integer value or None if conversion fails
    """
    if value is None:
        return None

    try:
        return int(float(value))  # Handle string floats like "123.0"
    except (ValueError, TypeError):
        return None


def group_data_by_column(
    data: List[Dict[str, Any]],
    group_column: str
) -> Dict[Any, List[Dict[str, Any]]]:
    """
    Group data rows by a specific column value.

    Args:
        data: List of data dictionaries
        group_column: Column to group by

    Returns:
        Dictionary mapping group values to lists of rows
    """
    groups = {}
    for row in data:
        group_value = row.get(group_column)
        if group_value is not None:
            if group_value not in groups:
                groups[group_value] = []
            groups[group_value].append(row)
    return groups


def calculate_statistics(values: List[float]) -> Dict[str, float]:
    """
    Calculate basic statistics for a list of values.

    Args:
        values: List of numeric values

    Returns:
        Dictionary with statistical measures
    """
    if not values:
        return {}

    values = [v for v in values if v is not None]
    if not values:
        return {}

    import statistics

    stats = {
        "count": len(values),
        "min": min(values),
        "max": max(values),
        "mean": statistics.mean(values),
    }

    if len(values) >= 2:
        stats["median"] = statistics.median(values)
        stats["std_dev"] = statistics.stdev(values)

    return stats


def merge_dictionaries(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple dictionaries with later values taking precedence.

    Args:
        dicts: Variable number of dictionaries to merge

    Returns:
        Merged dictionary
    """
    result = {}
    for d in dicts:
        if isinstance(d, dict):
            result.update(d)
    return result


def get_nested_value(data: Dict[str, Any], key_path: str, default: Any = None) -> Any:
    """
    Get value from nested dictionary using dot notation.

    Args:
        data: Dictionary to search
        key_path: Dot-separated key path (e.g., "user.profile.name")
        default: Default value if key not found

    Returns:
        Value at key path or default
    """
    keys = key_path.split(".")
    current = data

    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default

    return current