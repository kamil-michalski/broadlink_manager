"""Config flow for BroadLink Manager integration."""
import os
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DOMAIN, CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH


class BroadlinkManagerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for BroadLink Manager."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            config_path = user_input.get(CONF_CONFIG_PATH, DEFAULT_CONFIG_PATH)

            if not os.path.isdir(config_path):
                errors[CONF_CONFIG_PATH] = "invalid_path"
            else:
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title="BroadLink Manager",
                    data={CONF_CONFIG_PATH: config_path},
                )

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_CONFIG_PATH, default=DEFAULT_CONFIG_PATH
                ): str,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )
