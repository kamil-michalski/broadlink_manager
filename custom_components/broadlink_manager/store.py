"""BroadLink codes file store - read/write operations."""
import glob
import json
import logging
import os
import re

from .const import BROADLINK_FILE_PATTERN

_LOGGER = logging.getLogger(__name__)

# Dozwolone znaki w nazwach urządzeń i komend
_VALID_NAME_RE = re.compile(r'^[a-zA-Z0-9_\- ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$')
_MAX_NAME_LEN = 64


def validate_name(name: str, label: str = "Nazwa") -> str | None:
    """Sprawdź czy nazwa jest bezpieczna. Zwraca komunikat błędu lub None."""
    if not name or not name.strip():
        return f"{label} nie może być pusta"
    if len(name) > _MAX_NAME_LEN:
        return f"{label} nie może przekraczać {_MAX_NAME_LEN} znaków"
    if not _VALID_NAME_RE.match(name):
        return f"{label} zawiera niedozwolone znaki (dozwolone: litery, cyfry, _ - spacja)"
    return None


def get_broadlink_files(config_path: str) -> list[str]:
    """Return list of BroadLink codes files."""
    pattern = os.path.join(config_path, BROADLINK_FILE_PATTERN)
    return sorted(glob.glob(pattern))


def mac_from_filename(filepath: str) -> str:
    """Extract MAC address from filename.

    Pliki w .storage: broadlink_remote_e87072abde0a_codes (bez .json)
    """
    basename = os.path.basename(filepath)
    match = re.search(r"broadlink_remote_([a-f0-9]+)_codes$", basename)
    if match:
        raw = match.group(1)
        return ":".join(raw[i:i+2] for i in range(0, len(raw), 2)).upper()
    return basename


def read_codes(filepath: str) -> dict:
    """Read BroadLink codes from HA .storage file.

    Pliki .storage mają format:
      {
        "version": 1,
        "minor_version": 1,
        "key": "broadlink_remote_XXXX_codes",
        "data": {"TV": {"power": "JgB..."}}
      }
    Zwracamy tylko klucz "data".
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            raw = json.load(f)
        if isinstance(raw, dict) and "data" in raw:
            return raw["data"]
        return raw
    except (FileNotFoundError, json.JSONDecodeError) as err:
        _LOGGER.error("Cannot read BroadLink codes from %s: %s", filepath, err)
        return {}


def write_codes(filepath: str, codes: dict) -> bool:
    """Write BroadLink codes back to HA .storage file.

    Zachowujemy wszystkie metadane HA Storage (version, minor_version, key)
    i nadpisujemy tylko klucz "data".
    Zapis atomowy przez plik tymczasowy — zapobiega uszkodzeniu pliku
    przy równoczesnych zapisach.
    """
    try:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            raw = {}

        if isinstance(raw, dict) and "data" in raw:
            raw["data"] = codes
            payload = raw
        else:
            payload = codes

        # Atomowy zapis: najpierw plik tymczasowy, potem rename
        tmp_path = filepath + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, filepath)
        return True
    except OSError as err:
        _LOGGER.error("Cannot write BroadLink codes to %s: %s", filepath, err)
        # Posprzątaj plik tymczasowy jeśli pozostał
        tmp_path = filepath + ".tmp"
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        return False


def list_devices(config_path: str) -> list[dict]:
    """List all BroadLink remote files with their devices and command counts."""
    result = []
    for filepath in get_broadlink_files(config_path):
        codes = read_codes(filepath)
        mac = mac_from_filename(filepath)
        devices = []
        for device_name, commands in codes.items():
            if isinstance(commands, dict):
                devices.append({
                    "name": device_name,
                    "command_count": len(commands),
                    "commands": list(commands.keys()),
                })
        result.append({
            "mac": mac,
            "filepath": filepath,
            "device_count": len(devices),
            "devices": devices,
        })
    return result


def delete_command(config_path: str, mac: str, device: str, command: str) -> bool:
    """Delete a single command from a device."""
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if device in codes and command in codes[device]:
                del codes[device][command]
                if not codes[device]:
                    del codes[device]
                return write_codes(filepath, codes)
    _LOGGER.warning("Device with MAC %s not found", mac)
    return False


def rename_command(
    config_path: str, mac: str, device: str, old_name: str, new_name: str
) -> bool:
    """Rename a command."""
    err = validate_name(new_name, "Nazwa komendy")
    if err:
        _LOGGER.error("rename_command: %s", err)
        return False
    new_name = new_name.strip()
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if device in codes and old_name in codes[device]:
                if new_name in codes[device]:
                    _LOGGER.error("rename_command: komenda '%s' już istnieje w '%s'", new_name, device)
                    return False
                codes[device][new_name] = codes[device].pop(old_name)
                return write_codes(filepath, codes)
    _LOGGER.warning("Command %s/%s not found for MAC %s", device, old_name, mac)
    return False


def rename_device(config_path: str, mac: str, old_name: str, new_name: str) -> bool:
    """Rename a device group."""
    err = validate_name(new_name, "Nazwa urządzenia")
    if err:
        _LOGGER.error("rename_device: %s", err)
        return False
    new_name = new_name.strip()
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if old_name in codes:
                if new_name in codes:
                    _LOGGER.error("rename_device: urządzenie '%s' już istnieje", new_name)
                    return False
                codes[new_name] = codes.pop(old_name)
                return write_codes(filepath, codes)
    return False


def delete_device(config_path: str, mac: str, device: str) -> bool:
    """Delete entire device group."""
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if device in codes:
                del codes[device]
                return write_codes(filepath, codes)
    return False
