"""BroadLink codes file store - read/write operations."""
import glob
import json
import logging
import os
import re

from .const import BROADLINK_FILE_PATTERN

_LOGGER = logging.getLogger(__name__)


def get_broadlink_files(config_path: str) -> list[str]:
    """Return list of BroadLink codes JSON files."""
    pattern = os.path.join(config_path, BROADLINK_FILE_PATTERN)
    return sorted(glob.glob(pattern))


def mac_from_filename(filepath: str) -> str:
    """Extract MAC address from filename."""
    basename = os.path.basename(filepath)
    match = re.search(r"broadlink_remote_([a-f0-9]+)_codes\.json", basename)
    if match:
        raw = match.group(1)
        return ":".join(raw[i:i+2] for i in range(0, len(raw), 2)).upper()
    return basename


def read_codes(filepath: str) -> dict:
    """Read BroadLink codes from file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as err:
        _LOGGER.error("Cannot read BroadLink codes from %s: %s", filepath, err)
        return {}


def write_codes(filepath: str, codes: dict) -> bool:
    """Write BroadLink codes to file."""
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(codes, f, indent=2, ensure_ascii=False)
        return True
    except OSError as err:
        _LOGGER.error("Cannot write BroadLink codes to %s: %s", filepath, err)
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
                # Remove device if empty
                if not codes[device]:
                    del codes[device]
                return write_codes(filepath, codes)
    _LOGGER.warning("Device with MAC %s not found", mac)
    return False


def rename_command(
    config_path: str, mac: str, device: str, old_name: str, new_name: str
) -> bool:
    """Rename a command."""
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if device in codes and old_name in codes[device]:
                codes[device][new_name] = codes[device].pop(old_name)
                return write_codes(filepath, codes)
    _LOGGER.warning("Command %s/%s not found for MAC %s", device, old_name, mac)
    return False


def rename_device(config_path: str, mac: str, old_name: str, new_name: str) -> bool:
    """Rename a device group."""
    for filepath in get_broadlink_files(config_path):
        if mac_from_filename(filepath) == mac.upper():
            codes = read_codes(filepath)
            if old_name in codes:
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
