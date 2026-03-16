"""BroadLink Manager integration."""
import logging
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import device_registry as dr, entity_registry as er
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

PLATFORMS = ["button"]


def _slugify(text: str) -> str:
    return text.lower().replace(" ", "_").replace("-", "_")


def _cleanup_stale_device(hass: HomeAssistant, entry: ConfigEntry, mac_plain: str, device_name: str) -> None:
    """Usuń stare urządzenie i jego encje z rejestru HA."""
    device_id = f"{mac_plain}_{_slugify(device_name)}"
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    # Znajdź urządzenie po identyfikatorze
    device = dev_reg.async_get_device(identifiers={(DOMAIN, device_id)})
    if device:
        # Najpierw usuń wszystkie encje przypisane do tego urządzenia
        entries = er.async_entries_for_device(ent_reg, device.id, include_disabled_entities=True)
        for entity_entry in entries:
            ent_reg.async_remove(entity_entry.entity_id)
            _LOGGER.debug("Usunięto encję: %s", entity_entry.entity_id)
        # Usuń urządzenie
        dev_reg.async_remove_device(device.id)
        _LOGGER.info("Usunięto urządzenie z rejestru: %s (%s)", device_name, device_id)


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Przeładuj platformę button żeby odświeżyć encje."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up BroadLink Manager from a config entry."""
    config_path = entry.data.get(CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {"config_path": config_path}

    # --- Service: list_devices ---
    async def handle_list_devices(call: ServiceCall) -> dict:
        devices = await hass.async_add_executor_job(store.list_devices, config_path)

        # Wzbogać dane o entity_id i friendly_name encji remote.* dla każdego MAC
        ent_reg = er.async_get(hass)
        for remote in devices:
            mac = remote["mac"]
            mac_plain = mac.replace(":", "").lower()
            remote["entity_id"] = None
            remote["friendly_name"] = None

            # Szukaj encji remote.* po unique_id zawierającym MAC
            for entity in ent_reg.entities.values():
                if entity.domain != "remote":
                    continue
                uid = (entity.unique_id or "").lower()
                if mac_plain in uid:
                    remote["entity_id"] = entity.entity_id
                    state = hass.states.get(entity.entity_id)
                    if state:
                        remote["friendly_name"] = state.attributes.get("friendly_name") or entity.entity_id
                    break

            # Fallback: szukaj MAC w entity_id
            if not remote["entity_id"]:
                for state in hass.states.async_all("remote"):
                    if mac_plain in state.entity_id:
                        remote["entity_id"] = state.entity_id
                        remote["friendly_name"] = state.attributes.get("friendly_name") or state.entity_id
                        break

        _LOGGER.info("BroadLink devices listed: %s remotes found", len(devices))
        hass.bus.async_fire(f"{DOMAIN}_devices_listed", {"devices": devices})
        return {"devices": devices}

    hass.services.async_register(
        DOMAIN,
        "list_devices",
        handle_list_devices,
        supports_response=SupportsResponse.OPTIONAL,
    )

    # --- Service: delete_command ---
    delete_command_schema = vol.Schema({
        vol.Required(ATTR_MAC): cv.string,
        vol.Required(ATTR_DEVICE): cv.string,
        vol.Required(ATTR_COMMAND): cv.string,
    })

    async def handle_delete_command(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        command = call.data[ATTR_COMMAND]
        mac_plain = mac.replace(":", "").lower()

        result = await hass.async_add_executor_job(
            store.delete_command, config_path, mac, device, command
        )
        if result:
            _LOGGER.info("Deleted command '%s' from device '%s' (MAC: %s)", command, device, mac)
            hass.bus.async_fire(f"{DOMAIN}_command_deleted", {"mac": mac, "device": device, "command": command})

            # Usuń encję komendy z rejestru
            ent_reg = er.async_get(hass)
            unique_id = f"{DOMAIN}_{mac_plain}_{_slugify(device)}_{_slugify(command)}"
            entity_entry = ent_reg.async_get_entity_id("button", DOMAIN, unique_id)
            if entity_entry:
                ent_reg.async_remove(entity_entry)
                _LOGGER.debug("Usunięto encję komendy: %s", unique_id)

            # Jeśli urządzenie nie ma już komend — usuń je też z rejestru
            remotes = await hass.async_add_executor_job(store.list_devices, config_path)
            for remote in remotes:
                if remote["mac"] == mac:
                    for dev in remote["devices"]:
                        if dev["name"] == device:
                            return  # urządzenie nadal ma komendy
            # Brak komend — usuń urządzenie
            await hass.async_add_executor_job(
                _cleanup_stale_device, hass, entry, mac_plain, device
            )
        else:
            _LOGGER.error("Failed to delete command '%s' from '%s'", command, device)

    hass.services.async_register(DOMAIN, SERVICE_DELETE_COMMAND, handle_delete_command, schema=delete_command_schema)

    # --- Service: rename_command ---
    rename_command_schema = vol.Schema({
        vol.Required(ATTR_MAC): cv.string,
        vol.Required(ATTR_DEVICE): cv.string,
        vol.Required(ATTR_COMMAND): cv.string,
        vol.Required(ATTR_NEW_NAME): cv.string,
    })

    async def handle_rename_command(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        old_name = call.data[ATTR_COMMAND]
        new_name = call.data[ATTR_NEW_NAME]
        mac_plain = mac.replace(":", "").lower()

        result = await hass.async_add_executor_job(
            store.rename_command, config_path, mac, device, old_name, new_name
        )
        if result:
            _LOGGER.info("Renamed command '%s' -> '%s' in '%s'", old_name, new_name, device)
            hass.bus.async_fire(f"{DOMAIN}_command_renamed", {"mac": mac, "device": device, "old_name": old_name, "new_name": new_name})

            # Usuń starą encję — zostanie odtworzona po reload
            ent_reg = er.async_get(hass)
            old_unique_id = f"{DOMAIN}_{mac_plain}_{_slugify(device)}_{_slugify(old_name)}"
            entity_entry = ent_reg.async_get_entity_id("button", DOMAIN, old_unique_id)
            if entity_entry:
                ent_reg.async_remove(entity_entry)

            # Przeładuj entry żeby dodać nową encję
            hass.async_create_task(_async_reload_entry(hass, entry))
        else:
            _LOGGER.error("Failed to rename command '%s' in '%s'", old_name, device)

    hass.services.async_register(DOMAIN, SERVICE_RENAME_COMMAND, handle_rename_command, schema=rename_command_schema)

    # --- Service: rename_device ---
    rename_device_schema = vol.Schema({
        vol.Required(ATTR_MAC): cv.string,
        vol.Required(ATTR_DEVICE): cv.string,
        vol.Required(ATTR_NEW_NAME): cv.string,
    })

    async def handle_rename_device(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        old_name = call.data[ATTR_DEVICE]
        new_name = call.data[ATTR_NEW_NAME]
        mac_plain = mac.replace(":", "").lower()

        result = await hass.async_add_executor_job(
            store.rename_device, config_path, mac, old_name, new_name
        )
        if result:
            _LOGGER.info("Renamed device '%s' -> '%s'", old_name, new_name)
            hass.bus.async_fire(f"{DOMAIN}_device_renamed", {"mac": mac, "old_name": old_name, "new_name": new_name})

            # Usuń stare urządzenie i jego encje z rejestru
            _cleanup_stale_device(hass, entry, mac_plain, old_name)

            # Przeładuj entry żeby odtworzyć urządzenie i encje pod nową nazwą
            hass.async_create_task(_async_reload_entry(hass, entry))
        else:
            _LOGGER.error("Failed to rename device '%s'", old_name)

    hass.services.async_register(DOMAIN, "rename_device", handle_rename_device, schema=rename_device_schema)

    # --- Service: delete_device ---
    delete_device_schema = vol.Schema({
        vol.Required(ATTR_MAC): cv.string,
        vol.Required(ATTR_DEVICE): cv.string,
    })

    async def handle_delete_device(call: ServiceCall):
        mac = call.data[ATTR_MAC]
        device = call.data[ATTR_DEVICE]
        mac_plain = mac.replace(":", "").lower()

        result = await hass.async_add_executor_job(
            store.delete_device, config_path, mac, device
        )
        if result:
            _LOGGER.info("Deleted device '%s' (MAC: %s)", device, mac)
            hass.bus.async_fire(f"{DOMAIN}_device_deleted", {"mac": mac, "device": device})

            # Usuń urządzenie i wszystkie jego encje z rejestru
            _cleanup_stale_device(hass, entry, mac_plain, device)
        else:
            _LOGGER.error("Failed to delete device '%s'", device)

    hass.services.async_register(DOMAIN, "delete_device", handle_delete_device, schema=delete_device_schema)

    _LOGGER.info("BroadLink Manager integration loaded (config path: %s)", config_path)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    for service in [
        "list_devices",
        SERVICE_DELETE_COMMAND,
        SERVICE_RENAME_COMMAND,
        "rename_device",
        "delete_device",
    ]:
        hass.services.async_remove(DOMAIN, service)

    hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
