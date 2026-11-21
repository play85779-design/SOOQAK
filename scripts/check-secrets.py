#!/usr/bin/env python3
"""Lightweight no-dependency tracked-file guard; not a substitute for Gitleaks."""
import re
import subprocess
import sys
from pathlib import Path

paths = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
patterns = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
    "service role key": re.compile(r"(?i)(?:service_role|supabase_service_role_key)\s*[:=]\s*['\"][A-Za-z0-9_.-]{24,}"),
    "generic secret assignment": re.compile(r"(?i)(?:api_secret|client_secret|secret_key|access_token|private_token)\s*[:=]\s*['\"][A-Za-z0-9_./+=-]{24,}"),
}
exclude = {".github/workflows/quality-smoke.yml", "scripts/check-secrets.py"}
hits = []
for path in filter(None, paths):
    if path in exclude:
        continue
    p = Path(path)
    if not p.is_file() or p.stat().st_size > 2_000_000:
        continue
    try:
        content = p.read_text(encoding="utf-8")
    except (UnicodeError, OSError):
        continue
    for name, pattern in patterns.items():
        for match in pattern.finditer(content):
            line = content.count("\n", 0, match.start()) + 1
            hits.append(f"{path}:{line}: potential {name}")
if hits:
    print("\n".join(hits))
    sys.exit(1)
print("PASS: no tracked-file matches for the configured high-risk secret patterns")
