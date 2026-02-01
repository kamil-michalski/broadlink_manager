import volupuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME, CONF_TYPE
from homeassistant.helpers.selector import SelectSelector, SelectSelectorConfig, SelectSelectorMode

DOMAIN = "broadlink_customremote"

class BroadlinkCustomRemoteConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Obsługa formularza konfiguracji w GUI."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Pierwszy krok: Podstawowe informacje o urządzeniu."""
        errors = {}
        if user_input is not None:
            # Tutaj moglibyśmy dodać walidację
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_NAME): str,
                vol.Required(CONF_TYPE): SelectSelector(
                    SelectSelectorConfig(
                        options=["media_player", "fan", "switch", "light"],
                        mode=SelectSelectorMode.DROPDOWN
                    )
                ),
                vol.Required("remote_entity"): str, # Encja pilota Broadlink
            }),
            errors=errors,
        )