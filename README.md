# BroadLink Manager — Custom Component dla Home Assistant

Integracja do zarządzania komendami IR/RF BroadLink bezpośrednio z poziomu Home Assistant.

## Funkcje

- 📋 Listowanie wszystkich pilotów BroadLink, urządzeń i komend jako encje HA
- 📡 **Uczenie nowych komend** IR/RF bezpośrednio z karty Lovelace
- ✏️ Zmiana nazw komend i urządzeń
- 🗑️ Usuwanie komend i całych urządzeń
- 🔄 Automatyczna aktualizacja rejestru encji po każdej zmianie
- 🃏 Dedykowana karta Lovelace z pełnym panelem zarządzania
- 🔌 Serwisy HA do użycia w automatyzacjach

---

## Instalacja

### 1. Skopiuj pliki integracji

```
/config/
├── .storage/                          ← tutaj HA przechowuje komendy BroadLink
├── custom_components/
│   └── broadlink_manager/
│       ├── __init__.py
│       ├── button.py
│       ├── config_flow.py
│       ├── const.py
│       ├── manifest.json
│       ├── store.py
│       ├── strings.json
│       └── brand/
│           ├── icon.png
│           └── logo.png
└── www/
    └── community/
        └── broadlink-manager-card/
            └── broadlink-manager-card.js
```

### 2. Dodaj zasób Lovelace

Przez UI: **Ustawienia → Pulpity nawigacyjne → ⋮ → Zasoby → Dodaj zasób**

```
URL:  /hacsfiles/broadlink-manager-card/broadlink-manager-card.js
Typ:  Moduł JavaScript
```

> **Uwaga:** Ścieżka `/hacsfiles/` działa gdy plik jest w `www/community/`.
> Jeśli umieścisz plik bezpośrednio w `www/`, użyj `/local/broadlink-manager-card.js`.

### 3. Dodaj integrację

**Ustawienia → Urządzenia i usługi → Dodaj integrację → BroadLink Manager**

Podaj ścieżkę do katalogu `.storage` (domyślnie `/config/.storage`).

### 4. Dodaj kartę do dashboardu

Edytuj dashboard → Dodaj kartę → ręcznie przez YAML:

```yaml
type: custom:broadlink-manager-card
```

---

## Karta Lovelace

Karta oferuje pełny panel zarządzania komendami. Zamiast surowych adresów MAC wyświetlane są przyjazne nazwy pilotów pobrane automatycznie z encji `remote.*` (np. "BroadLink Remote 1"). Adres MAC widoczny jest jako podtytuł.

### Dostępne akcje

- **＋ urządzenie** — dodaj nowe urządzenie do pilota (z uczeniem pierwszej komendy)
- **＋** przy urządzeniu — dodaj nową komendę do istniejącego urządzenia
- **＋ nowa komenda** — kafelek na końcu listy komend (po rozwinięciu urządzenia)
- Kliknięcie w nazwę urządzenia lub komendy — zmiana nazwy
- 🗑 — usunięcie urządzenia lub komendy (z potwierdzeniem)

### Uczenie nowych komend

1. Kliknij **＋ urządzenie** lub **＋** przy urządzeniu
2. Wybierz pilota BroadLink z listy (`remote.*`)
3. Wpisz nazwę urządzenia (przy nowym) i nazwę komendy
4. Kliknij **📡 UCZE**
5. Naciśnij przycisk na fizycznym pilocie IR
6. Po zapisaniu pole komendy się czyści — możesz od razu uczyć kolejną

### Aktualizacja pliku JS

Plik karty nie aktualizuje się automatycznie z repozytorium. Po każdej aktualizacji należy ręcznie nadpisać plik w:
```
/config/www/community/broadlink-manager-card/broadlink-manager-card.js
```
i wykonać twardy odśwież przeglądarki (Ctrl+Shift+R).

---

## Encje HA

Każda nauczona komenda staje się encją `button` w HA, pogrupowaną w urządzenia:

```
BroadLink Remote 1                    ← przyjazna nazwa pilota
└── Telewizor                         ← urządzenie podrzędne
    ├── button.power
    ├── button.volume_up
    └── button.mute
└── Klimatyzacja
    └── button.on_cool_22
```

Naciśnięcie przycisku wysyła komendę przez serwis `remote.send_command`.

Po zmianie nazwy urządzenia lub komendy rejestr HA jest automatycznie aktualizowany — stare encje są usuwane i tworzone na nowo pod nową nazwą.

---

## Dostępne serwisy HA

### `broadlink_manager.list_devices`
Zwraca listę wszystkich pilotów, urządzeń i komend. Obsługuje `return_response`.

### `broadlink_manager.delete_command`
```yaml
service: broadlink_manager.delete_command
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "Telewizor"
  command: "power"
```

### `broadlink_manager.rename_command`
```yaml
service: broadlink_manager.rename_command
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "Telewizor"
  command: "vol_up"
  new_name: "volume_up"
```

### `broadlink_manager.rename_device`
```yaml
service: broadlink_manager.rename_device
data:
  mac: "AA:BB:CC:DD:EE:FF"
  device: "TV"
  new_name: "Telewizor"
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

## Format plików

Integracja odczytuje pliki z `/config/.storage/` o wzorcu `broadlink_remote_*_codes`:

```json
{
  "version": 1,
  "minor_version": 1,
  "key": "broadlink_remote_e87072dec244_codes",
  "data": {
    "Telewizor": {
      "power": "JgBYAAAB...",
      "volume_up": "JgBYAAAB..."
    },
    "Klimatyzacja": {
      "on_cool_22": "JgBYAAAB..."
    }
  }
}
```

Pliki `*_flags` są pomijane — integracja czyta wyłącznie pliki `*_codes`.

---

## Znane ograniczenia

- Karta Lovelace wymaga ręcznej aktualizacji pliku JS po każdej nowej wersji
- Nazwy urządzeń i komend mogą zawierać tylko litery, cyfry, spacje, myślniki i podkreślenia
- Po zmianie nazwy urządzenia integracja wykonuje automatyczny reload — przez chwilę encje mogą być niedostępne
