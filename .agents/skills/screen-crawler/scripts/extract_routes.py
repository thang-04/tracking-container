#!/usr/bin/env python3
"""
Screen Crawler - Helper script để extract routes từ React codebase
"""

import re
import os
import json
import sys
from pathlib import Path


def find_routes_in_file(filepath):
    """Tìm tất cả route definitions trong file"""
    routes = []

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern cho React Router v6: <Route path="..." element={...} />
    route_pattern = r'<Route\s+path=["\']([^"\']+)["\']\s+element=\{<(\w+)'

    for match in re.finditer(route_pattern, content):
        route_path = match.group(1)
        component_name = match.group(2)
        routes.append(
            {"path": route_path, "component": component_name, "file": filepath}
        )

    # Pattern cho React Router v6: <Route path="..." component={Component} />
    route_pattern2 = r'<Route\s+path=["\']([^"\']+)["\']\s+component=\{(\w+)'

    for match in re.finditer(route_pattern2, content):
        route_path = match.group(1)
        component_name = match.group(2)
        routes.append(
            {"path": route_path, "component": component_name, "file": filepath}
        )

    return routes


def find_all_routes(src_dir):
    """Tìm tất cả routes trong project"""
    all_routes = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".jsx", ".tsx", ".js", ".ts")):
                filepath = os.path.join(root, file)
                routes = find_routes_in_file(filepath)
                all_routes.extend(routes)

    return all_routes


def extract_params_from_path(path):
    """Extract parameters từ route path"""
    params = []
    param_pattern = r":(\w+)"

    for match in re.finditer(param_pattern, path):
        params.append(
            {
                "name": match.group(1),
                "type": "path",
                "description": f"Parameter {match.group(1)}",
            }
        )

    return params


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_routes.py <src_directory>")
        sys.exit(1)

    src_dir = sys.argv[1]
    routes = find_all_routes(src_dir)

    # Extract params cho mỗi route
    for route in routes:
        route["params"] = extract_params_from_path(route["path"])

    print(json.dumps(routes, indent=2))
