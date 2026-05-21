import os
import re

directories = ["src/modules"]
keywords = ["not found", "successfully", "must be", "already exists", "is required", "success", "invalid", "sufficient", "only", "Cannot", "Failed", "is inactive"]
file_extensions = [".ts"]

for root, _, files in os.walk("src/modules"):
    for file in files:
        if any(file.endswith(ext) for ext in file_extensions) and not file.endswith("route.ts"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                # find strings inside quotes that have the keywords
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if any(kw.lower() in line.lower() for kw in keywords) and ('"' in line or "'" in line or "`" in line):
                         if "import" not in line and "from" not in line and "require(" not in line:
                             print(f"{path}:{i+1}: {line.strip()}")
