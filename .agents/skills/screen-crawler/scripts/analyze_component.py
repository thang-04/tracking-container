#!/usr/bin/env python3
"""
Screen Crawler - Helper script để analyze component và trích xuất thông tin
"""

import re
import json
import sys


def extract_use_state(content):
    """Extract tất cả useState declarations"""
    pattern = r"const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState\((.*?)\)"
    matches = re.finditer(pattern, content)

    states = []
    for match in matches:
        var_name = match.group(1)
        setter_name = match.group(2)
        default_val = match.group(3).strip()
        states.append({"name": var_name, "setter": setter_name, "default": default_val})

    return states


def extract_use_effect(content):
    """Extract tất cả useEffect calls (thường là data fetching)"""
    pattern = r"useEffect\(\s*(?:async\s*)?\(\)\s*=>\s*\{(.*?)\}\s*,"
    matches = re.finditer(pattern, content, re.DOTALL)

    effects = []
    for match in matches:
        body = match.group(1)
        # Check nếu có fetch/axios call
        if "fetch" in body or "axios" in body:
            effects.append({"type": "data_fetching", "body": body[:200]})

    return effects


def extract_api_calls(content):
    """Extract tất cả API calls"""
    api_calls = []

    # fetch calls
    fetch_pattern = r'fetch\(["\']([^"\']+)["\']'
    for match in re.finditer(fetch_pattern, content):
        api_calls.append({"method": "GET", "endpoint": match.group(1)})

    # fetch with method
    fetch_method_pattern = (
        r'fetch\(["\']([^"\']+)["\'],\s*\{[^}]*method:\s*["\'](\w+)["\']'
    )
    for match in re.finditer(fetch_method_pattern, content):
        api_calls.append({"method": match.group(2).upper(), "endpoint": match.group(1)})

    # axios calls
    axios_pattern = r'axios\.(get|post|put|delete)\(["\']([^"\']+)["\']'
    for match in re.finditer(axios_pattern, content):
        api_calls.append({"method": match.group(1).upper(), "endpoint": match.group(2)})

    return api_calls


def extract_event_handlers(content):
    """Extract event handlers"""
    handlers = []

    # onClick handlers
    pattern = r"onClick=\{(\w+)\}"
    for match in re.finditer(pattern, content):
        handlers.append({"event": "click", "handler": match.group(1)})

    # onSubmit handlers
    pattern = r"onSubmit=\{(\w+)\}"
    for match in re.finditer(pattern, content):
        handlers.append({"event": "submit", "handler": match.group(1)})

    # onChange handlers
    pattern = r"onChange=\{(\w+)\}"
    for match in re.finditer(pattern, content):
        handlers.append({"event": "change", "handler": match.group(1)})

    return handlers


def extract_functions(content):
    """Extract function definitions"""
    functions = []

    # const handleX = ...
    pattern = r"const\s+(handle\w+)\s*="
    for match in re.finditer(pattern, content):
        functions.append({"name": match.group(1), "type": "handler"})

    # const fetchX = ...
    pattern = r"const\s+(fetch\w+)\s*="
    for match in re.finditer(pattern, content):
        functions.append({"name": match.group(1), "type": "fetch"})

    return functions


def extract_ui_elements(content):
    """Extract UI elements từ JSX"""
    elements = []

    # Common HTML/JSX elements
    element_patterns = {
        "header": r"<header",
        "nav": r"<nav",
        "h1": r"<h1",
        "h2": r"<h2",
        "h3": r"<h3",
        "form": r"<form",
        "input": r"<input",
        "button": r"<button",
        "table": r"<table",
        "thead": r"<thead",
        "tbody": r"<tbody",
        "tr": r"<tr",
        "th": r"<th",
        "td": r"<td",
        "ul": r"<ul",
        "li": r"<li",
        "div": r"<div",
        "span": r"<span",
        "p": r"<p>",
        "a": r"<a\s",
        "img": r"<img",
        "select": r"<select",
        "option": r"<option",
        "textarea": r"<textarea",
    }

    for element_name, pattern in element_patterns.items():
        if re.search(pattern, content):
            elements.append(element_name)

    # Links
    link_pattern = r'<Link\s+to=["\']([^"\']+)["\']'
    for match in re.finditer(link_pattern, content):
        elements.append(f"Link to {match.group(1)}")

    return elements


def extract_functionalities(content):
    """Trích xuất functionalities dựa trên handlers và functions"""
    functionalities = []

    handlers = extract_event_handlers(content)
    functions = extract_functions(content)

    # Map handler names to functionality descriptions
    handler_map = {
        "handleSearch": "Tìm kiếm",
        "handleCreate": "Tạo mới",
        "handleEdit": "Chỉnh sửa",
        "handleDelete": "Xóa",
        "handleSubmit": "Gửi form",
        "handleSave": "Lưu",
        "handleCancel": "Hủy",
        "handlePageChange": "Chuyển trang",
        "handleFilter": "Lọc",
        "handleSort": "Sắp xếp",
    }

    for handler in handlers:
        handler_name = handler["handler"]
        for key, desc in handler_map.items():
            if key in handler_name:
                functionalities.append(desc)
                break

    # Add fetch functionalities
    for func in functions:
        if "fetch" in func["name"].lower() or "load" in func["name"].lower():
            functionalities.append("Tải dữ liệu")
            break

    return list(set(functionalities))


def analyze_component(filepath):
    """Analyze một component file"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "use_state": extract_use_state(content),
        "api_calls": extract_api_calls(content),
        "event_handlers": extract_event_handlers(content),
        "functions": extract_functions(content),
        "ui_elements": extract_ui_elements(content),
        "functionalities": extract_functionalities(content),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_component.py <component_file>")
        sys.exit(1)

    filepath = sys.argv[1]
    result = analyze_component(filepath)
    print(json.dumps(result, indent=2))
