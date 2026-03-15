"""BroadLink Manager — button platform.

Każda nauczona komenda IR/RF staje się encją button w HA.
Hierarchia urządzeń:
  - Pilot BroadLink (MAC) → urządzenie nadrzędne
    - TV, Klimatyzacja, ... → urządzenia podrzędne (via_device)
      - power, volume_up, ... → encje button
"""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH
from . import store

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Utwórz encje button dla każdej nauczonej komendy."""
    config_path = entry.data.get(CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH)

    remotes = await hass.async_add_executor_job(store.list_devices, config_path)

    # Rejestrujemy urządzenie nadrzędne dla każdego pilota BroadLink
    dev_reg = dr.async_get(hass)

    entities: list[BroadlinkCommandButton] = []

    for remote in remotes:
        mac = remote["mac"]
        mac_plain = mac.replace(":", "").lower()

        # Urządzenie nadrzędne — fizyczny pilot BroadLink
        dev_reg.async_get_or_create(
            config_entry_id=entry.entry_id,
            identifiers={(DOMAIN, mac_plain)},
            name=f"BroadLink Remote {mac}",
            manufacturer="BroadLink",
            model="IR/RF Remote",
        )

        for device in remote["devices"]:
            device_name = device["name"]
            device_id = f"{mac_plain}_{_slugify(device_name)}"

            # Urządzenie podrzędne — logiczne urządzenie (TV, Klimatyzacja, ...)
            dev_reg.async_get_or_create(
                config_entry_id=entry.entry_id,
                identifiers={(DOMAIN, device_id)},
                name=device_name,
                manufacturer="BroadLink",
                model="Learned Device",
                via_device=(DOMAIN, mac_plain),
            )

            for command in device["commands"]:
                entities.append(
                    BroadlinkCommandButton(
                        entry=entry,
                        mac=mac,
                        mac_plain=mac_plain,
                        device_name=device_name,
                        device_id=device_id,
                        command=command,
                        config_path=config_path,
                    )
                )

    async_add_entities(entities)
    _LOGGER.info(
        "BroadLink Manager: załadowano %d encji button z %d pilotów",
        len(entities),
        len(remotes),
    )


def _slugify(text: str) -> str:
    """Zamień nazwę na bezpieczny identyfikator."""
    return text.lower().replace(" ", "_").replace("-", "_")


class BroadlinkCommandButton(ButtonEntity):
    """Encja reprezentująca jedną nauczoną komendę IR/RF."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        entry: ConfigEntry,
        mac: str,
        mac_plain: str,
        device_name: str,
        device_id: str,
        command: str,
        config_path: str,
    ) -> None:
        self._entry = entry
        self._mac = mac
        self._mac_plain = mac_plain
        self._device_name = device_name
        self._device_id = device_id
        self._command = command
        self._config_path = config_path

        # Unikalny ID encji
        self._attr_unique_id = f"{DOMAIN}_{device_id}_{_slugify(command)}"
        # Nazwa wyświetlana (w kontekście urządzenia)
        self._attr_name = command

    @property
    def device_info(self) -> DeviceInfo:
        """Przypisz encję do urządzenia podrzędnego (TV, Klima, ...)."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._device_id)},
        )

    @property
    def icon(self) -> str:
        """Ikona zależna od nazwy komendy."""
        cmd = self._command.lower()
        if any(w in cmd for w in ["power", "on", "off"]):
            return "mdi:power"
        if any(w in cmd for w in ["vol", "volume"]):
            return "mdi:volume-high"
        if any(w in cmd for w in ["mute"]):
            return "mdi:volume-mute"
        if any(w in cmd for w in ["ch", "channel", "prev", "next"]):
            return "mdi:skip-next"
        if any(w in cmd for w in ["up", "góra"]):
            return "mdi:arrow-up"
        if any(w in cmd for w in ["down", "dół"]):
            return "mdi:arrow-down"
        if any(w in cmd for w in ["left", "lewo"]):
            return "mdi:arrow-left"
        if any(w in cmd for w in ["right", "prawo"]):
            return "mdi:arrow-right"
        if any(w in cmd for w in ["ok", "enter", "select"]):
            return "mdi:check-circle"
        if any(w in cmd for w in ["menu", "home"]):
            return "mdi:home"
        if any(w in cmd for w in ["back", "return", "exit"]):
            return "mdi:arrow-u-left-top"
        if any(w in cmd for w in ["cool", "heat", "fan", "ac", "klima"]):
            return "mdi:air-conditioner"
        if any(w in cmd for w in ["temp", "temperatura"]):
            return "mdi:thermometer"
        return "mdi:remote"

    async def async_press(self) -> None:
        """Wyślij komendę przez remote.send_command — HA sam obsługuje kod."""
        _LOGGER.debug(
            "Sending command '%s' for device '%s' via remote entity (MAC: %s)",
            self._command,
            self._device_name,
            self._mac,
        )

        # Znajdź encję remote.* skojarzoną z tym pilotem BroadLink
        remote_entity_id = self._find_remote_entity()
        if not remote_entity_id:
            _LOGGER.error(
                "Nie znaleziono encji remote.* dla MAC %s — "
                "upewnij się że integracja BroadLink jest skonfigurowana",
                self._mac,
            )
            return

        try:
            # remote.send_command przyjmuje device (nazwa urządzenia z BroadLink)
            # i command (nazwa komendy nauczonej przez remote.learn_command)
            await self.hass.services.async_call(
                "remote",
                "send_command",
                {
                    "entity_id": remote_entity_id,
                    "device": self._device_name,
                    "command": self._command,
                },
                blocking=True,
            )
        except Exception as err:
            _LOGGER.error(
                "Błąd wysyłania komendy '%s/%s': %s",
                self._device_name, self._command, err,
            )

    def _find_remote_entity(self) -> str | None:
        """Znajdź entity_id encji remote.* pasującej do MAC adresu pilota."""
        mac_plain = self._mac.replace(":", "").lower()
        mac_colons = self._mac.lower()

        from homeassistant.helpers import entity_registry as er
        ent_reg = er.async_get(self.hass)

        for entity in ent_reg.entities.values():
            if entity.domain != "remote":
                continue
            # HA tworzy encję remote z unique_id zawierającym MAC
            uid = (entity.unique_id or "").lower()
            if mac_plain in uid or mac_colons in uid:
                return entity.entity_id

        # Fallback: szukaj po nazwie encji (np. remote.broadlink_rm4_e87072...)
        states = self.hass.states.async_all("remote")
        for state in states:
            if mac_plain in state.entity_id or mac_colons in state.entity_id:
                return state.entity_id

        return None
