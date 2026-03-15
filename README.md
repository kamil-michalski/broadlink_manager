# BroadLink Manager — Custom Component dla Home Assistant

Integracja do zarządzania nauczanymi komendami IR/RF z plików BroadLink (`broadlink_remote_*_codes.json`).

## Funkcje

- 📋 Listowanie wszystkich pilotów BroadLink i ich urządzeń
- ✏️ Zmiana nazw komend i urządzeń (kliknij na nazwę)
- 🗑️ Usuwanie komend i całych urządzeń
- 🃏 Panel Lovelace z podglądem wszystkich danych
- 🔌 Serwisy HA do integracji z automatyzacjami

---

## Instalacja

### 1. Skopiuj pliki

```
/config/
├── custom_components/
│   └── broadlink_manager/
│       ├── __init__.py
│       ├── config_flow.py
│       ├── const.py
│       ├── manifest.json
│       ├── store.py
│       └── strings.json
└── www/
    └── broadlink-manager-card.js
```

### 2. Dodaj kartę Lovelace

W `configuration.yaml` lub przez UI (Ustawienia → Pulpity → Zasoby):

```yaml
lovelace:
  resources:
    - url: /local/broadlink-manager-card.js
      type: module
```

### 3. Dodaj integrację

**Ustawienia → Urządzenia i usługi → Dodaj integrację → BroadLink Manager**

Podaj ścieżkę do katalogu konfiguracji (domyślnie `/config`).

### 4. Dodaj kartę do dashboardu

```yaml
type: custom:broadlink-manager-card
```

---

## Dostępne serwisy HA

### `broadlink_manager.list_devices`
Wylistuje wszystkie urządzenia. Wynik emitowany jako zdarzenie `broadlink_manager_devices_listed`.

### `broadlink_manager.delete_command`
```yaml
service: broadlink_manager.delete_command
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "TV"
  command: "power"
```

### `broadlink_manager.rename_command`
```yaml
service: broadlink_manager.rename_command
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "TV"
  command: "vol_up"
  new_name: "volume_up"
```

### `broadlink_manager.rename_device`
```yaml
service: broadlink_manager.rename_device
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "Samsung"
  new_name: "TV Samsung"
```

### `broadlink_manager.delete_device`
```yaml
service: broadlink_manager.delete_device
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "Stary pilot"
```

---

## Zdarzenia HA (Events)

| Zdarzenie | Dane |
|-----------|------|
| `broadlink_manager_devices_listed` | `{devices: [...]}` |
| `broadlink_manager_command_deleted` | `{mac, device, command}` |
| `broadlink_manager_command_renamed` | `{mac, device, old_name, new_name}` |
| `broadlink_manager_device_renamed` | `{mac, old_name, new_name}` |
| `broadlink_manager_device_deleted` | `{mac, device}` |

---

## Struktura danych

Integracja odczytuje pliki w formacie:
```json
{
  "TV": {
    "power": "JgBGAAABKZMU...",
    "volume_up": "JgBGAAABKZMU..."
  },
  "Klimatyzacja": {
    "on_cool_22": "JgBGAAABKZMU..."
  }
}
```

Plik: `/config/broadlink_remote_aabbccddeeff_codes.json`
