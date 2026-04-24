import argparse
import hashlib
import json
import struct
from pathlib import Path


def scope_to_int(scope: str) -> int:
    scope = (scope or "N").upper()
    if scope == "A":
        return 7
    if scope == "N":
        return 0
    return (1 if "G" in scope else 0) | (2 if "D" in scope else 0) | (4 if "C" in scope else 0)


def compact_json(value) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compute_last_mod_signature(resource_dir: Path) -> str:
    resource = json.loads((resource_dir / "resource.json").read_text(encoding="utf-8"))
    h = hashlib.sha256()

    h.update(struct.pack(">i", scope_to_int(resource.get("scope", "N"))))

    documentation = resource.get("documentation")
    if documentation is not None:
        h.update(documentation.encode("utf-8"))

    h.update(struct.pack(">i", int(resource.get("version", 1))))
    h.update(b"\x01" if resource.get("unary", False) else b"\x00")
    h.update(b"\x01" if resource.get("restricted", False) else b"\x00")
    h.update(b"\x01" if resource.get("overridable", True) else b"\x00")

    for filename in sorted(resource.get("files", [])):
        h.update(filename.encode("utf-8"))
        h.update(sha256_hex((resource_dir / filename).read_bytes()).encode("utf-8"))

    attributes = resource.get("attributes", {})
    for key in sorted(k for k in attributes if k != "lastModificationSignature"):
        h.update(key.encode("utf-8"))
        h.update(compact_json(attributes[key]).encode("utf-8"))

    return h.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute Ignition lastModificationSignature for a filesystem project resource")
    parser.add_argument("resource_dir", help="Directory containing resource.json")
    parser.add_argument("--write", action="store_true", help="Write the computed signature back into resource.json")
    args = parser.parse_args()

    resource_dir = Path(args.resource_dir)
    sig = compute_last_mod_signature(resource_dir)
    print(sig)

    if args.write:
        resource_path = resource_dir / "resource.json"
        resource = json.loads(resource_path.read_text(encoding="utf-8"))
        resource.setdefault("attributes", {})["lastModificationSignature"] = sig
        resource_path.write_text(json.dumps(resource, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
