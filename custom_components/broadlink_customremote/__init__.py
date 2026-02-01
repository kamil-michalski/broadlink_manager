from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

DOMAIN = "broadlink_customremote"
PLATFORMS = ["media_player", "fan", "switch", "light"]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Ładowanie urządzenia skonfigurowanego w GUI."""
    hass.data.setdefault(DOMAIN, {})
    
    # Przekazujemy dane z Config Entry do platform
    await hass.config_entries.async_forward_entry_setups(entry, [entry.data[CONF_TYPE]])
    
    return True