/**
 * BroadLink Manager Card
 * Lovelace custom card for managing BroadLink learned commands
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
    --bl-text: #e8eaf6;
    --bl-text-muted: #6b7280;
    --bl-border: rgba(0, 212, 255, 0.15);
    --bl-radius: 12px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .card {
    background: var(--bl-bg);
    border: 1px solid var(--bl-border);
    border-radius: var(--bl-radius);
    overflow: hidden;
    color: var(--bl-text);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #0d1520 0%, #1a1d27 100%);
    border-bottom: 1px solid var(--bl-border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--bl-accent), var(--bl-accent2));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .header-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--bl-accent);
  }

  .header-subtitle {
    font-size: 10px;
    color: var(--bl-text-muted);
    letter-spacing: 1px;
  }

  .refresh-btn {
    background: transparent;
    border: 1px solid var(--bl-border);
    color: var(--bl-text-muted);
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }
  .refresh-btn:hover {
    border-color: var(--bl-accent);
    color: var(--bl-accent);
  }

  .body { padding: 16px; }

  /* Remote blocks */
  .remote-block {
    background: var(--bl-surface);
    border: 1px solid var(--bl-border);
    border-radius: var(--bl-radius);
    margin-bottom: 12px;
    overflow: hidden;
  }

  .remote-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--bl-surface2);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  .remote-header:hover { border-bottom-color: var(--bl-border); }
  .remote-header.open { border-bottom: 1px solid var(--bl-border); }

  .remote-mac {
    font-size: 11px;
    color: var(--bl-accent);
    letter-spacing: 1.5px;
  }
  .remote-stats {
    font-size: 10px;
    color: var(--bl-text-muted);
    margin-top: 2px;
  }

  .remote-chevron {
    color: var(--bl-text-muted);
    transition: transform 0.25s;
    font-size: 12px;
  }
  .remote-chevron.open { transform: rotate(90deg); }

  /* Device blocks */
  .devices-container { padding: 12px; display: flex; flex-direction: column; gap: 8px; }

  .device-block {
    background: var(--bl-bg);
    border: 1px solid var(--bl-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .device-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    cursor: pointer;
  }
  .device-header:hover { background: rgba(0,212,255,0.03); }

  .device-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--bl-text);
    display: flex; align-items: center; gap: 8px;
  }
  .device-name-text { cursor: pointer; }
  .device-name-text:hover { color: var(--bl-accent); text-decoration: underline dotted; }

  .device-badge {
    font-size: 9px;
    background: rgba(0,212,255,0.1);
    color: var(--bl-accent);
    padding: 2px 6px;
    border-radius: 10px;
    letter-spacing: 1px;
  }

  .device-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--bl-text-muted);
    width: 26px; height: 26px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .icon-btn:hover { border-color: var(--bl-border); color: var(--bl-text); }
  .icon-btn.danger:hover { border-color: var(--bl-danger); color: var(--bl-danger); }

  /* Commands grid */
  .commands-grid {
    padding: 0 12px 12px 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 6px;
  }

  .command-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bl-surface);
    border: 1px solid var(--bl-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 11px;
    color: var(--bl-text);
    gap: 6px;
    min-width: 0;
  }

  .command-name {
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .command-name:hover { color: var(--bl-accent); }

  .command-del {
    background: transparent;
    border: none;
    color: var(--bl-text-muted);
    cursor: pointer;
    font-size: 11px;
    flex-shrink: 0;
    padding: 0 2px;
    transition: color 0.2s;
  }
  .command-del:hover { color: var(--bl-danger); }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .modal-overlay.open { opacity: 1; pointer-events: all; }

  .modal {
    background: var(--bl-surface);
    border: 1px solid var(--bl-border);
    border-radius: var(--bl-radius);
    padding: 24px;
    width: 320px;
    max-width: 90vw;
    transform: translateY(10px);
    transition: transform 0.2s;
  }
  .modal-overlay.open .modal { transform: translateY(0); }

  .modal-title {
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--bl-accent);
    margin-bottom: 16px;
  }

  .modal-input {
    width: 100%;
    background: var(--bl-bg);
    border: 1px solid var(--bl-border);
    border-radius: 6px;
    padding: 10px 12px;
    color: var(--bl-text);
    font-family: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: var(--bl-accent); }

  .modal-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    justify-content: flex-end;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.2s;
  }
  .btn-cancel {
    background: transparent;
    border: 1px solid var(--bl-border);
    color: var(--bl-text-muted);
  }
  .btn-cancel:hover { border-color: var(--bl-text-muted); color: var(--bl-text); }
  .btn-confirm {
    background: linear-gradient(135deg, var(--bl-accent), var(--bl-accent2));
    border: none;
    color: white;
  }
  .btn-confirm:hover { opacity: 0.85; }
  .btn-danger {
    background: var(--bl-danger);
    border: none;
    color: white;
  }
  .btn-danger:hover { opacity: 0.85; }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: var(--bl-surface2);
    border: 1px solid var(--bl-border);
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 12px;
    color: var(--bl-text);
    z-index: 10000;
    transition: transform 0.3s;
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.success { border-color: var(--bl-success); color: var(--bl-success); }
  .toast.error { border-color: var(--bl-danger); color: var(--bl-danger); }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--bl-text-muted);
    font-size: 12px;
    letter-spacing: 1px;
  }
  .empty-state .icon { font-size: 32px; margin-bottom: 12px; }

  .loading {
    text-align: center;
    padding: 24px;
    color: var(--bl-text-muted);
    font-size: 11px;
    letter-spacing: 2px;
  }
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
    this._modal = null; // { type, mac, device, command }
    this._loading = false;
  }

  setConfig(config) {
    this._config = config;
  }

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

    try {
      await this._hass.callService('broadlink_manager', 'list_devices', {});
      // Listen for response event
      const unsub = this._hass.connection.subscribeEvents((event) => {
        if (event.event_type === 'broadlink_manager_devices_listed') {
          this._data = event.data.devices || [];
          this._loading = false;
          this._render();
          unsub();
        }
      });
      // Fallback timeout
      setTimeout(() => {
        this._loading = false;
        this._render();
      }, 3000);
    } catch (e) {
      console.error('BroadLink Manager: failed to load', e);
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
      setTimeout(() => { this._modal = null; this._render(); }, 200);
    }
  }

  _renderModal() {
    if (!this._modal) return '';
    const m = this._modal;

    if (m.type === 'delete_command') {
      return `
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
    }

    if (m.type === 'delete_device') {
      return `
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-title">🗑 Usuń urządzenie</div>
            <p style="font-size:12px;color:var(--bl-text-muted);line-height:1.6">
              Usunąć całe urządzenie <span style="color:var(--bl-accent)">${m.device}</span>
              wraz ze wszystkimi komendami?
            </p>
            <div class="modal-actions">
              <button class="btn btn-cancel" id="modal-cancel">ANULUJ</button>
              <button class="btn btn-danger" id="modal-confirm">USUŃ</button>
            </div>
          </div>
        </div>`;
    }

    const label = m.type === 'rename_command' ? 'Zmień nazwę komendy' : 'Zmień nazwę urządzenia';
    const current = m.type === 'rename_command' ? m.command : m.device;
    return `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-title">✏️ ${label}</div>
          <input class="modal-input" type="text" value="${current}" placeholder="Nowa nazwa..." />
          <div class="modal-actions">
            <button class="btn btn-cancel" id="modal-cancel">ANULUJ</button>
            <button class="btn btn-confirm" id="modal-confirm">ZAPISZ</button>
          </div>
        </div>
      </div>`;
  }

  _renderRemotes() {
    if (this._loading) {
      return `<div class="loading"><span>Ładowanie danych...</span></div>`;
    }
    if (!this._data.length) {
      return `<div class="empty-state"><div class="icon">📡</div>Brak plików BroadLink w katalogu konfiguracji</div>`;
    }

    return this._data.map(remote => {
      const isOpen = this._openRemotes.has(remote.mac);
      const totalCmds = remote.devices.reduce((s, d) => s + d.command_count, 0);
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
                          data-command="${cmd}"
                          title="Usuń komendę">✕</button>
                      </div>`).join('')}
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
                      <div class="device-actions">
                        <button class="icon-btn danger"
                          data-action="delete_device"
                          data-mac="${remote.mac}"
                          data-device="${dev.name}"
                          title="Usuń urządzenie">🗑</button>
                        <span style="color:var(--bl-text-muted);font-size:11px">${devOpen ? '▲' : '▼'}</span>
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
              <div class="remote-mac">📡 ${remote.mac}</div>
              <div class="remote-stats">${remote.device_count} urządzeń · ${totalCmds} komend</div>
            </div>
            <span class="remote-chevron ${isOpen ? 'open' : ''}">▶</span>
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
        <div class="body">
          ${this._renderRemotes()}
        </div>
      </div>
      ${this._renderModal()}
      <div class="toast"></div>
    `;
    this._bindEvents();
  }

  _bindEvents() {
    // Refresh
    const refreshBtn = this.shadowRoot.querySelector('#refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => this._loadData());

    // Toggle remote
    this.shadowRoot.querySelectorAll('[data-toggle-remote]').forEach(el => {
      el.addEventListener('click', (e) => {
        const mac = el.dataset.toggleRemote;
        if (this._openRemotes.has(mac)) this._openRemotes.delete(mac);
        else this._openRemotes.add(mac);
        this._render();
      });
    });

    // Toggle device
    this.shadowRoot.querySelectorAll('[data-toggle-device]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        const key = el.dataset.toggleDevice;
        if (this._openDevices.has(key)) this._openDevices.delete(key);
        else this._openDevices.add(key);
        this._render();
      });
    });

    // Action buttons
    this.shadowRoot.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const { action, mac, device, command } = el.dataset;

        if (action === 'delete_command') {
          this._showModal({ type: 'delete_command', mac, device, command });
        } else if (action === 'delete_device') {
          this._showModal({ type: 'delete_device', mac, device });
        } else if (action === 'rename_command') {
          this._showModal({ type: 'rename_command', mac, device, command });
        } else if (action === 'rename_device') {
          this._showModal({ type: 'rename_device', mac, device });
        }
      });
    });

    // Modal buttons
    const cancelBtn = this.shadowRoot.querySelector('#modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeModal());

    const confirmBtn = this.shadowRoot.querySelector('#modal-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', () => this._handleModalConfirm());

    // Enter key in modal input
    const input = this.shadowRoot.querySelector('.modal-input');
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleModalConfirm();
      if (e.key === 'Escape') this._closeModal();
    });
  }

  async _handleModalConfirm() {
    const m = this._modal;
    if (!m) return;
    const input = this.shadowRoot.querySelector('.modal-input');
    const newName = input ? input.value.trim() : '';

    this._closeModal();

    if (m.type === 'delete_command') {
      await this._callService('delete_command', { mac: m.mac, device: m.device, command: m.command });
    } else if (m.type === 'delete_device') {
      await this._callService('delete_device', { mac: m.mac, device: m.device });
    } else if (m.type === 'rename_command') {
      if (!newName || newName === m.command) return;
      await this._callService('rename_command', { mac: m.mac, device: m.device, command: m.command, new_name: newName });
    } else if (m.type === 'rename_device') {
      if (!newName || newName === m.device) return;
      await this._callService('rename_device', { mac: m.mac, device: m.device, new_name: newName });
    }
  }

  static getConfigElement() {
    return document.createElement('broadlink-manager-card-editor');
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() { return 4; }
}

customElements.define('broadlink-manager-card', BroadlinkManagerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'broadlink-manager-card',
  name: 'BroadLink Manager',
  description: 'Zarządzaj nauczanymi komendami IR/RF BroadLink',
});
