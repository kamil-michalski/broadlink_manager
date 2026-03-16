/**
 * BroadLink Manager Card v2.1
 * Lovelace custom card — zarządzanie i uczenie komend IR/RF
 * Build: 2026-03-16
 */

const styles = `
  :host {
    --bl-bg: #0f1117;
    --bl-surface: #1a1d27;
    --bl-surface2: #22263a;
    --bl-accent: #00d4ff;
    --bl-accent2: #7c3aed;
    --bl-danger: #ff4757;
    --bl-success: #2ed573;
    --bl-warn: #ffa502;
    --bl-text: #e8eaf6;
    --bl-text-muted: #6b7280;
    --bl-border: rgba(0, 212, 255, 0.15);
    --bl-radius: 12px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .card { background: var(--bl-bg); border: 1px solid var(--bl-border); border-radius: var(--bl-radius); overflow: hidden; color: var(--bl-text); }
  .header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: linear-gradient(135deg, #0d1520 0%, #1a1d27 100%); border-bottom: 1px solid var(--bl-border); }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--bl-accent), var(--bl-accent2)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .header-title { font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--bl-accent); }
  .header-subtitle { font-size: 10px; color: var(--bl-text-muted); letter-spacing: 1px; }
  .refresh-btn { background: transparent; border: 1px solid var(--bl-border); color: var(--bl-text-muted); padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s; font-family: inherit; }
  .refresh-btn:hover { border-color: var(--bl-accent); color: var(--bl-accent); }
  .body { padding: 16px; }
  .remote-block { background: var(--bl-surface); border: 1px solid var(--bl-border); border-radius: var(--bl-radius); margin-bottom: 12px; overflow: hidden; }
  .remote-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; background: var(--bl-surface2); border-bottom: 1px solid transparent; transition: border-color 0.2s; }
  .remote-header:hover { border-bottom-color: var(--bl-border); }
  .remote-header.open { border-bottom: 1px solid var(--bl-border); }
  .remote-mac { font-size: 12px; font-weight: 600; color: var(--bl-accent); letter-spacing: 0.5px; }
  .remote-mac-sub { font-size: 10px; color: var(--bl-text-muted); letter-spacing: 1px; margin-top: 1px; }
  .remote-stats { font-size: 10px; color: var(--bl-text-muted); margin-top: 2px; }
  .remote-right { display: flex; align-items: center; gap: 8px; }
  .add-device-btn { background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.3); color: var(--bl-accent); padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 11px; font-family: inherit; transition: all 0.2s; white-space: nowrap; }
  .add-device-btn:hover { background: rgba(0,212,255,0.18); }
  .remote-chevron { color: var(--bl-text-muted); transition: transform 0.25s; font-size: 12px; }
  .remote-chevron.open { transform: rotate(90deg); }
  .devices-container { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .device-block { background: var(--bl-bg); border: 1px solid var(--bl-border); border-radius: 8px; overflow: hidden; }
  .device-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; }
  .device-header:hover { background: rgba(0,212,255,0.03); }
  .device-name { font-size: 13px; font-weight: 600; color: var(--bl-text); display: flex; align-items: center; gap: 8px; }
  .device-name-text { cursor: pointer; }
  .device-name-text:hover { color: var(--bl-accent); text-decoration: underline dotted; }
  .device-badge { font-size: 9px; background: rgba(0,212,255,0.1); color: var(--bl-accent); padding: 2px 6px; border-radius: 10px; letter-spacing: 1px; }
  .device-actions { display: flex; gap: 6px; align-items: center; padding-left: 8px; border-left: 1px solid var(--bl-border); margin-left: 4px; }
  .icon-btn { background: transparent; border: 1px solid transparent; color: var(--bl-text-muted); width: 26px; height: 26px; border-radius: 5px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-family: inherit; }
  .icon-btn:hover { border-color: var(--bl-border); color: var(--bl-text); }
  .icon-btn.danger:hover { border-color: var(--bl-danger); color: var(--bl-danger); }
  .icon-btn.add:hover { border-color: var(--bl-success); color: var(--bl-success); }
  .commands-grid { padding: 0 12px 12px 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px; }
  .command-chip { display: flex; align-items: center; justify-content: space-between; background: var(--bl-surface); border: 1px solid var(--bl-border); border-radius: 6px; padding: 6px 10px; font-size: 11px; color: var(--bl-text); gap: 6px; min-width: 0; }
  .command-chip.add-chip { border-style: dashed; cursor: pointer; justify-content: center; color: var(--bl-success); }
  .command-chip.add-chip:hover { background: rgba(46,213,115,0.06); border-color: var(--bl-success); }
  .command-name { cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .command-name:hover { color: var(--bl-accent); }
  .command-del { background: transparent; border: none; color: var(--bl-text-muted); cursor: pointer; font-size: 11px; flex-shrink: 0; padding: 0 2px; transition: color 0.2s; }
  .command-del:hover { color: var(--bl-danger); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
  .modal-overlay.open { opacity: 1; pointer-events: all; }
  .modal { background: var(--bl-surface); border: 1px solid var(--bl-border); border-radius: var(--bl-radius); padding: 24px; width: 340px; max-width: 92vw; transform: translateY(10px); transition: transform 0.2s; }
  .modal-overlay.open .modal { transform: translateY(0); }
  .modal-title { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--bl-accent); margin-bottom: 14px; }
  .modal-label { font-size: 10px; color: var(--bl-text-muted); letter-spacing: 1px; margin-bottom: 5px; margin-top: 12px; }
  .modal-input, .modal-select { width: 100%; background: var(--bl-bg); border: 1px solid var(--bl-border); border-radius: 6px; padding: 10px 12px; color: var(--bl-text); font-family: inherit; font-size: 13px; outline: none; transition: border-color 0.2s; }
  .modal-input:focus, .modal-select:focus { border-color: var(--bl-accent); }
  .modal-select option { background: var(--bl-surface); color: var(--bl-text); }
  .modal-actions { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
  .btn { padding: 8px 16px; border-radius: 6px; font-family: inherit; font-size: 12px; cursor: pointer; font-weight: 600; letter-spacing: 1px; transition: all 0.2s; }
  .btn-cancel { background: transparent; border: 1px solid var(--bl-border); color: var(--bl-text-muted); }
  .btn-cancel:hover { border-color: var(--bl-text-muted); color: var(--bl-text); }
  .btn-confirm { background: linear-gradient(135deg, var(--bl-accent), var(--bl-accent2)); border: none; color: white; }
  .btn-confirm:hover { opacity: 0.85; }
  .btn-danger { background: var(--bl-danger); border: none; color: white; }
  .btn-danger:hover { opacity: 0.85; }
  .learn-status { margin-top: 14px; padding: 12px 14px; border-radius: 8px; font-size: 11px; line-height: 1.6; display: none; }
  .learn-status.waiting { display: block; background: rgba(255,165,2,0.08); border: 1px solid rgba(255,165,2,0.3); color: var(--bl-warn); }
  .learn-status.success { display: block; background: rgba(46,213,115,0.08); border: 1px solid rgba(46,213,115,0.3); color: var(--bl-success); }
  .learn-status.error { display: block; background: rgba(255,71,87,0.08); border: 1px solid rgba(255,71,87,0.3); color: var(--bl-danger); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .learn-status.waiting { animation: pulse 1.5s infinite; }
  .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(60px); background: var(--bl-surface2); border: 1px solid var(--bl-border); border-radius: 8px; padding: 10px 20px; font-size: 12px; color: var(--bl-text); z-index: 10000; transition: transform 0.3s; white-space: nowrap; }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.success { border-color: var(--bl-success); color: var(--bl-success); }
  .toast.error { border-color: var(--bl-danger); color: var(--bl-danger); }
  .empty-state { text-align: center; padding: 32px; color: var(--bl-text-muted); font-size: 12px; letter-spacing: 1px; }
  .empty-state .icon { font-size: 32px; margin-bottom: 12px; }
  .loading { text-align: center; padding: 24px; color: var(--bl-text-muted); font-size: 11px; letter-spacing: 2px; }
  @keyframes blink { 0%,100%{opacity:.3} 50%{opacity:1} }
  .loading span { animation: blink 1.2s infinite; }
`;

class BroadlinkManagerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._data = [];
    this._openRemotes = new Set();
    this._openDevices = new Set();
    this._modal = null;
    this._loading = false;
    this._learning = false;
  }

  setConfig(config) { this._config = config; }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._loadData();
    }
  }

  async _loadData() {
    if (!this._hass) return;
    this._loading = true;
    this._render();

    // Próba 1: return_response (HA 2023.4+)
    // Struktura odpowiedzi WebSocket: { result: { response: { devices: [...] } } }
    try {
      const response = await this._hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "broadlink_manager",
        service: "list_devices",
        service_data: {},
        return_response: true,
      });
      // Sprawdzamy obie możliwe struktury odpowiedzi
      const devices =
        response?.response?.devices ||      // starsza struktura
        response?.result?.response?.devices; // nowsza struktura WebSocket
      if (Array.isArray(devices)) {
        this._data = devices;
        this._loading = false;
        this._render();
        return;
      }
      console.warn('BroadLink Manager: return_response OK but no devices array, raw:', JSON.stringify(response));
    } catch (e) {
      console.warn('BroadLink Manager: return_response failed, trying event fallback:', e.message);
    }

    // Próba 2: serwis + nasłuch na zdarzenie (stary HA)
    try {
      this._data = await new Promise((resolve) => {
        const timer = setTimeout(() => {
          unsub && unsub();
          resolve([]);
        }, 8000);

        let unsub = null;
        this._hass.connection.subscribeEvents((event) => {
          if (event.event_type === 'broadlink_manager_devices_listed') {
            clearTimeout(timer);
            unsub && unsub();
            resolve(event.data.devices || []);
          }
        }).then((fn) => {
          unsub = fn;
          this._hass.callService('broadlink_manager', 'list_devices', {})
            .catch(() => { clearTimeout(timer); unsub && unsub(); resolve([]); });
        }).catch(() => { clearTimeout(timer); resolve([]); });
      });
    } catch (e) {
      console.error('BroadLink Manager: both load methods failed', e);
      this._data = [];
    } finally {
      this._loading = false;
      this._render();
    }
  }

  async _callService(service, data) {
    try {
      await this._hass.callService('broadlink_manager', service, data);
      this._showToast('✓ Zapisano', 'success');
      setTimeout(() => this._loadData(), 500);
    } catch (e) {
      this._showToast('✗ Błąd: ' + e.message, 'error');
    }
  }

  _getRemoteEntitiesForMac(mac) {
    // Zwróć tylko encję remote.* skojarzoną z tym pilotem (z danych backendu)
    const remote = this._data.find(r => r.mac === mac);
    if (remote && remote.entity_id) {
      return [{ entity_id: remote.entity_id, name: remote.friendly_name || remote.entity_id }];
    }
    // Fallback: wszystkie remote.* z HA states
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => id.startsWith('remote.'))
      .map(id => ({ entity_id: id, name: this._hass.states[id].attributes.friendly_name || id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }



  _showToast(msg, type = '') {
    const toast = this.shadowRoot.querySelector('.toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  _showModal(config) {
    this._modal = config;
    this._learning = false;
    this._render();
    requestAnimationFrame(() => {
      const overlay = this.shadowRoot.querySelector('.modal-overlay');
      if (overlay) overlay.classList.add('open');
      const input = this.shadowRoot.querySelector('.modal-input');
      if (input) { input.focus(); input.select(); }
    });
  }

  _closeModal() {
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => { this._modal = null; this._learning = false; this._render(); }, 200);
    }
  }

  _renderModal() {
    if (!this._modal) return '';
    const m = this._modal;

    if (m.type === 'delete_command') return `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-title">🗑 Usuń komendę</div>
          <p style="font-size:12px;color:var(--bl-text-muted);line-height:1.6">
            Usunąć <span style="color:var(--bl-text)">${m.command}</span>
            z urządzenia <span style="color:var(--bl-accent)">${m.device}</span>?
          </p>
          <div class="modal-actions">
            <button class="btn btn-cancel" id="modal-cancel">ANULUJ</button>
            <button class="btn btn-danger" id="modal-confirm">USUŃ</button>
          </div>
        </div>
      </div>`;

    if (m.type === 'delete_device') return `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-title">🗑 Usuń urządzenie</div>
          <p style="font-size:12px;color:var(--bl-text-muted);line-height:1.6">
            Usunąć urządzenie <span style="color:var(--bl-accent)">${m.device}</span>
            wraz ze wszystkimi komendami?
          </p>
          <div class="modal-actions">
            <button class="btn btn-cancel" id="modal-cancel">ANULUJ</button>
            <button class="btn btn-danger" id="modal-confirm">USUŃ</button>
          </div>
        </div>
      </div>`;

    if (m.type === 'rename_command' || m.type === 'rename_device') {
      const label = m.type === 'rename_command' ? 'Zmień nazwę komendy' : 'Zmień nazwę urządzenia';
      const current = m.type === 'rename_command' ? m.command : m.device;
      return `
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-title">✏️ ${label}</div>
            <div class="modal-label">Nowa nazwa</div>
            <input class="modal-input" type="text" value="${current}" placeholder="Nowa nazwa..." />
            <div class="modal-actions">
              <button class="btn btn-cancel" id="modal-cancel">ANULUJ</button>
              <button class="btn btn-confirm" id="modal-confirm">ZAPISZ</button>
            </div>
          </div>
        </div>`;
    }

    if (m.type === 'add_device' || m.type === 'add_command') {
      const remotes = this._getRemoteEntitiesForMac(m.mac);
      const isNewDevice = m.type === 'add_device';
      const title = isNewDevice ? '+ Nowe urządzenie' : `+ Nowa komenda — ${m.device}`;
      const btnLabel = this._learning ? '⏳ CZEKAM...' : '📡 UCZE';
      // Jeśli jest dokładnie 1 pilot — auto-select
      const autoSelected = remotes.length === 1 ? remotes[0].entity_id : '';
      return `
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-title">${title}</div>
            <div class="modal-label">Pilot BroadLink (remote.*)</div>
            <select class="modal-select" id="learn-remote">
              ${remotes.length !== 1 ? '<option value="">— wybierz pilota —</option>' : ''}
              ${remotes.map(r => `<option value="${r.entity_id}" ${r.entity_id === autoSelected ? 'selected' : ''}>${r.name}</option>`).join('')}
            </select>
            ${isNewDevice ? `
              <div class="modal-label">Nazwa urządzenia</div>
              <input class="modal-input" id="learn-device" type="text" placeholder="np. Klimatyzacja" />
            ` : ''}
            <div class="modal-label">Nazwa komendy</div>
            <input class="modal-input" id="learn-command" type="text" placeholder="np. power" />
            <div class="learn-status" id="learn-status"></div>
            <div class="modal-actions">
              <button class="btn btn-cancel" id="modal-cancel">ZAMKNIJ</button>
              <button class="btn btn-confirm" id="modal-confirm" ${this._learning ? 'disabled' : ''}>${btnLabel}</button>
            </div>
          </div>
        </div>`;
    }

    return '';
  }

  _renderRemotes() {
    if (this._loading) return `<div class="loading"><span>Ładowanie danych...</span></div>`;
    if (!this._data.length) return `<div class="empty-state"><div class="icon">📡</div>Brak plików BroadLink w katalogu konfiguracji</div>`;

    return this._data.map(remote => {
      const isOpen = this._openRemotes.has(remote.mac);
      const totalCmds = remote.devices.reduce((s, d) => s + d.command_count, 0);
      // friendly_name i entity_id dostarcza backend
      const remoteName = remote.friendly_name || null;

      const devicesHtml = isOpen ? `
        <div class="devices-container">
          ${remote.devices.length === 0
            ? `<div style="font-size:11px;color:var(--bl-text-muted);padding:8px">Brak urządzeń</div>`
            : remote.devices.map(dev => {
                const devKey = `${remote.mac}::${dev.name}`;
                const devOpen = this._openDevices.has(devKey);
                const cmdsHtml = devOpen ? `
                  <div class="commands-grid">
                    ${dev.commands.map(cmd => `
                      <div class="command-chip">
                        <span class="command-name"
                          data-action="rename_command"
                          data-mac="${remote.mac}"
                          data-device="${dev.name}"
                          data-command="${cmd}"
                          title="Kliknij aby zmienić nazwę">${cmd}</span>
                        <button class="command-del"
                          data-action="delete_command"
                          data-mac="${remote.mac}"
                          data-device="${dev.name}"
                          data-command="${cmd}">✕</button>
                      </div>`).join('')}
                    <div class="command-chip add-chip"
                      data-action="add_command"
                      data-mac="${remote.mac}"
                      data-device="${dev.name}">+ nowa komenda</div>
                  </div>` : '';
                return `
                  <div class="device-block">
                    <div class="device-header" data-toggle-device="${devKey}">
                      <div class="device-name">
                        <span class="device-name-text"
                          data-action="rename_device"
                          data-mac="${remote.mac}"
                          data-device="${dev.name}"
                          title="Kliknij aby zmienić nazwę">${dev.name}</span>
                        <span class="device-badge">${dev.command_count} CMD</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="device-actions">
                          <button class="icon-btn add"
                            data-action="add_command"
                            data-mac="${remote.mac}"
                            data-device="${dev.name}"
                            title="Dodaj komendę">+</button>
                          <button class="icon-btn danger"
                            data-action="delete_device"
                            data-mac="${remote.mac}"
                            data-device="${dev.name}"
                            title="Usuń urządzenie">🗑</button>
                        </div>
                        <span style="color:var(--bl-text-muted);font-size:11px;min-width:12px;text-align:center">${devOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    ${cmdsHtml}
                  </div>`;
              }).join('')}
        </div>` : '';

      return `
        <div class="remote-block">
          <div class="remote-header ${isOpen ? 'open' : ''}" data-toggle-remote="${remote.mac}">
            <div>
              <div class="remote-mac">📡 ${remoteName || remote.mac}</div>
              ${remoteName ? `<div class="remote-mac-sub">${remote.mac}</div>` : ''}
              <div class="remote-stats">${remote.device_count} urządzeń · ${totalCmds} komend</div>
            </div>
            <div class="remote-right">
              <button class="add-device-btn"
                data-action="add_device"
                data-mac="${remote.mac}">+ urządzenie</button>
              <span class="remote-chevron ${isOpen ? 'open' : ''}">▶</span>
            </div>
          </div>
          ${devicesHtml}
        </div>`;
    }).join('');
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      <div class="card">
        <div class="header">
          <div class="header-left">
            <div class="header-icon">🔴</div>
            <div>
              <div class="header-title">BroadLink Manager</div>
              <div class="header-subtitle">IR / RF COMMAND STORE</div>
            </div>
          </div>
          <button class="refresh-btn" id="refresh-btn">⟳ ODŚWIEŻ</button>
        </div>
        <div class="body">${this._renderRemotes()}</div>
      </div>
      ${this._renderModal()}
      <div class="toast"></div>
    `;
    this._bindEvents();
  }

  _bindEvents() {
    this.shadowRoot.querySelector('#refresh-btn')
      ?.addEventListener('click', () => this._loadData());

    this.shadowRoot.querySelectorAll('[data-toggle-remote]').forEach(el => {
      el.addEventListener('click', () => {
        const mac = el.dataset.toggleRemote;
        if (this._openRemotes.has(mac)) this._openRemotes.delete(mac);
        else this._openRemotes.add(mac);
        this._render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-toggle-device]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        const key = el.dataset.toggleDevice;
        if (this._openDevices.has(key)) this._openDevices.delete(key);
        else this._openDevices.add(key);
        this._render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const { action, mac, device, command } = el.dataset;
        if (action === 'delete_command') this._showModal({ type: 'delete_command', mac, device, command });
        else if (action === 'delete_device') this._showModal({ type: 'delete_device', mac, device });
        else if (action === 'rename_command') this._showModal({ type: 'rename_command', mac, device, command });
        else if (action === 'rename_device') this._showModal({ type: 'rename_device', mac, device });
        else if (action === 'add_device') this._showModal({ type: 'add_device', mac });
        else if (action === 'add_command') this._showModal({ type: 'add_command', mac, device });
      });
    });

    this.shadowRoot.querySelector('#modal-cancel')
      ?.addEventListener('click', () => this._closeModal());

    this.shadowRoot.querySelector('#modal-confirm')
      ?.addEventListener('click', () => this._handleModalConfirm());

    this.shadowRoot.querySelectorAll('.modal-input').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this._closeModal();
      });
    });
  }

  async _handleModalConfirm() {
    const m = this._modal;
    if (!m) return;
    const input = this.shadowRoot.querySelector('.modal-input');
    const newName = input ? input.value.trim() : '';

    if (m.type === 'delete_command') {
      this._closeModal();
      await this._callService('delete_command', { mac: m.mac, device: m.device, command: m.command });
    } else if (m.type === 'delete_device') {
      this._closeModal();
      await this._callService('delete_device', { mac: m.mac, device: m.device });
    } else if (m.type === 'rename_command') {
      if (!newName || newName === m.command) return;
      this._closeModal();
      await this._callService('rename_command', { mac: m.mac, device: m.device, command: m.command, new_name: newName });
    } else if (m.type === 'rename_device') {
      if (!newName || newName === m.device) return;
      this._closeModal();
      await this._callService('rename_device', { mac: m.mac, device: m.device, new_name: newName });
    } else if (m.type === 'add_device' || m.type === 'add_command') {
      await this._handleLearn(m);
    }
  }

  async _handleLearn(m) {
    const remoteEl = this.shadowRoot.querySelector('#learn-remote');
    const deviceEl = this.shadowRoot.querySelector('#learn-device');
    const commandEl = this.shadowRoot.querySelector('#learn-command');
    const statusEl = this.shadowRoot.querySelector('#learn-status');
    const confirmBtn = this.shadowRoot.querySelector('#modal-confirm');

    const entityId = remoteEl?.value;
    const device = m.type === 'add_command' ? m.device : deviceEl?.value.trim();
    const command = commandEl?.value.trim();

    if (!entityId) { this._setLearnStatus(statusEl, 'error', '⚠ Wybierz pilota BroadLink'); return; }
    if (!device) { this._setLearnStatus(statusEl, 'error', '⚠ Podaj nazwę urządzenia'); return; }
    if (!command) { this._setLearnStatus(statusEl, 'error', '⚠ Podaj nazwę komendy'); return; }

    this._learning = true;
    if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = '⏳ CZEKAM...'; }
    this._setLearnStatus(statusEl, 'waiting', '📡 Gotowy — naciśnij przycisk na pilocie IR...');

    try {
      await this._hass.callService('remote', 'learn_command', {
        entity_id: entityId,
        device: device,
        command: command,
      });

      this._setLearnStatus(statusEl, 'success', `✓ Nauczono "${command}" dla "${device}"!`);
      this._showToast('✓ Komenda zapisana!', 'success');
      this._learning = false;

      if (commandEl) { commandEl.value = ''; commandEl.focus(); }
      if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = '📡 UCZE'; }

      setTimeout(() => this._loadData(), 800);

    } catch (e) {
      this._setLearnStatus(statusEl, 'error', `✗ ${e.message || 'Nie udało się nauczyć komendy'}`);
      this._learning = false;
      if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = '📡 UCZE'; }
    }
  }

  _setLearnStatus(el, type, msg) {
    if (!el) return;
    el.className = `learn-status ${type}`;
    el.textContent = msg;
  }

  static getStubConfig() { return {}; }
  getCardSize() { return 4; }
}

customElements.define('broadlink-manager-card', BroadlinkManagerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'broadlink-manager-card',
  name: 'BroadLink Manager',
  description: 'Zarządzaj i ucz komend IR/RF BroadLink',
  version: '2.1.0',
});

// Wymuszenie odświeżenia cache przez wersję w konsoli
console.info('%c BroadLink Manager Card v2.1.0 ', 'background:#00d4ff;color:#0f1117;font-weight:bold;border-radius:4px;padding:2px 6px');
