"""BroadLink Manager integration."""
import logging
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN,
    CONF_CONFIG_PATH,
    DEFAULT_CONFIG_PATH,
    SERVICE_DELETE_COMMAND,
    SERVICE_RENAME_COMMAND,
    ATTR_DEVICE,
    ATTR_COMMAND,
    ATTR_NEW_NAME,
    ATTR_MAC,
)
from . import store

_LOGGER = logging.getLogger(__name__)

PLATFORMS = []


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up BroadLink Manager from a config entry."""
    config_path = entry.data.get(CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {"config_path": config_path}

    # --- Service: list_devices ---
    async def handle_list_devices(call: ServiceCall):
        devices = await hass.async_add_executor_job(store.list_devices, config_path)
        hass.bus.async_fire(f"{DOMAIN}_devices_listed", {"devices": devices})
        _LOGGER.info("BroadLink devices listed: %s remotes found", len(devices))

    hass.services.async_register(DOMAIN, "list_devices", handle_list_devices)

    # --- Service: delete_command ---
    delete_command_schema = vol.Schema(
        {
            vol.Required(ATTR_MAC): cv.string,
            vol.Required(ATTR_DEVICE): cv.string,
            vol.Required(ATTR_COMMAND): cv.string,
        }
    )

    async def handle_delete_command(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        command = call.data[ATTR_COMMAND]
        result = await hass.async_add_executor_job(
            store.delete_command, config_path, mac, device, command
        )
        if result:
            _LOGGER.info("Deleted command '%s' from device '%s' (MAC: %s)", command, device, mac)
            hass.bus.async_fire(
                f"{DOMAIN}_command_deleted",
                {"mac": mac, "device": device, "command": command},
            )
        else:
            _LOGGER.error("Failed to delete command '%s' from '%s'", command, device)

    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_COMMAND, handle_delete_command, schema=delete_command_schema
    )

    # --- Service: rename_command ---
    rename_command_schema = vol.Schema(
        {
            vol.Required(ATTR_MAC): cv.string,
            vol.Required(ATTR_DEVICE): cv.string,
            vol.Required(ATTR_COMMAND): cv.string,
            vol.Required(ATTR_NEW_NAME): cv.string,
        }
    )

    async def handle_rename_command(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        old_name = call.data[ATTR_COMMAND]
        new_name = call.data[ATTR_NEW_NAME]
        result = await hass.async_add_executor_job(
            store.rename_command, config_path, mac, device, old_name, new_name
        )
        if result:
            _LOGGER.info("Renamed command '%s' -> '%s' in '%s'", old_name, new_name, device)
            hass.bus.async_fire(
                f"{DOMAIN}_command_renamed",
                {"mac": mac, "device": device, "old_name": old_name, "new_name": new_name},
            )
        else:
            _LOGGER.error("Failed to rename command '%s' in '%s'", old_name, device)

    hass.services.async_register(
        DOMAIN, SERVICE_RENAME_COMMAND, handle_rename_command, schema=rename_command_schema
    )

    # --- Service: rename_device ---
    rename_device_schema = vol.Schema(
        {
            vol.Required(ATTR_MAC): cv.string,
            vol.Required(ATTR_DEVICE): cv.string,
            vol.Required(ATTR_NEW_NAME): cv.string,
        }
    )

    async def handle_rename_device(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        old_name = call.data[ATTR_DEVICE]
        new_name = call.data[ATTR_NEW_NAME]
        result = await hass.async_add_executor_job(
            store.rename_device, config_path, mac, old_name, new_name
        )
        if result:
            _LOGGER.info("Renamed device '%s' -> '%s'", old_name, new_name)
            hass.bus.async_fire(
                f"{DOMAIN}_device_renamed",
                {"mac": mac, "old_name": old_name, "new_name": new_name},
            )
        else:
            _LOGGER.error("Failed to rename device '%s'", old_name)

    hass.services.async_register(
        DOMAIN, "rename_device", handle_rename_device, schema=rename_device_schema
    )

    # --- Service: delete_device ---
    delete_device_schema = vol.Schema(
        {
            vol.Required(ATTR_MAC): cv.string,
            vol.Required(ATTR_DEVICE): cv.string,
        }
    )

    async def handle_delete_device(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        result = await hass.async_add_executor_job(
            store.delete_device, config_path, mac, device
        )
        if result:
            _LOGGER.info("Deleted device '%s' (MAC: %s)", device, mac)
            hass.bus.async_fire(
                f"{DOMAIN}_device_deleted", {"mac": mac, "device": device}
            )
        else:
            _LOGGER.error("Failed to delete device '%s'", device)

    hass.services.async_register(
        DOMAIN, "delete_device", handle_delete_device, schema=delete_device_schema
    )

    _LOGGER.info("BroadLink Manager integration loaded (config path: %s)", config_path)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    for service in [
        "list_devices",
        SERVICE_DELETE_COMMAND,
        SERVICE_RENAME_COMMAND,
        "rename_device",
        "delete_device",
    ]:
        hass.services.async_remove(DOMAIN, service)

    hass.data[DOMAIN].pop(entry.entry_id)
    return True
