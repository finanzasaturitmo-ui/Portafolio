// ══════════════════════════════════════════════════════════════════════
  // CONFIGURATION & FIREBASE INIT
  // ══════════════════════════════════════════════════════════════════════
  const FINNHUB_API_KEY  = 'd72igc9r01qlfd9ncqr0d72igc9r01qlfd9ncqrg';
  const PDF_FUNCTION_URL = 'https://us-central1-mi-portafolio-cristhian.cloudfunctions.net/probarReporte';

  const firebaseConfig = {
    apiKey:            'AIzaSyDAPrYB2pyJ7fQcMoC72DojH1ZKdzLgKwY',
    authDomain:        'mi-portafolio-cristhian.firebaseapp.com',
    databaseURL:       'https://mi-portafolio-cristhian-default-rtdb.firebaseio.com',
    projectId:         'mi-portafolio-cristhian',
    storageBucket:     'mi-portafolio-cristhian.firebasestorage.app',
    messagingSenderId: '857924881558',
    appId:             '1:857924881558:web:091fa5c2fb44b0a650c6b7'
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db   = firebase.database();

  // ══════════════════════════════════════════════════════════════════════
  // GLOBAL STATE
  // ══════════════════════════════════════════════════════════════════════
  let currentUser   = null;
  let currentView   = localStorage.getItem('lastTab') || 'stocks';
  let currentUiLang = 'es';

  let SW = [], XT = [], CR = [];
  let SUB_USERS        = [];
  let SELECTED_STABLES = [];
  let TRADES           = [];
  let nid              = 1;

  let skInvVal  = 14613200;
  let skCurVal  = 12627217;
  let oppStocks = 10;
  let oppCrypto = 20;

  let dChart = null, bChart = null, saveTimeout = null;
  let isPrivacyMode = false;
  let viewedHistoryMonth = new Date().getMonth();

  let sortState = { sw: { col: null, dir: 1 }, xt: { col: null, dir: 1 }, cr: { col: null, dir: 1 } };
  const CHART_COLORS = ['#58a6ff','#3fb950','#f78166','#d2a8ff','#ffa657','#79c0ff','#56d364','#ff7b72','#bc8cff','#ffb347','#63d3fb','#a8dadc','#f3ba2f','#8c52ff'];
  const STABLECOINS  = ['USDT', 'USDC', 'EUSD'];

  const TRANSLATIONS = {
    es: {
      app_title: '📊 Mi Portafolio Pro',       btn_logout: 'Cerrar Sesión',
      tab_stocks: '📈 Portfolio Acciones',       tab_crypto: '₿ Portfolio Cripto',
      undo: 'Deshacer',                          redo: 'Rehacer',
      add_asset: '+ Agregar activo',             add_crypto: '+ Agregar Cripto',
      sim_buy_title: '🛒 Registrar Compra',      sim_buy_cur_qty: 'Activos actuales:',
      sim_buy_cur_avg: 'Precio Prom. actual:',   sim_buy_px: 'Precio de compra ($):',
      sim_buy_inv: 'Inversión (USD):',           sim_buy_qty: 'Cantidad a sumar:',
      sim_buy_new_avg: 'Nuevo Promedio:',        sim_buy_new_inv: 'Nueva Inv. Total:',
      btn_conf_buy: 'Confirmar Compra',          btn_cancel: 'Cancelar',
      sim_sell_title: '💸 Registrar Venta',      sim_sell_cur_qty: 'Activos Disponibles:',
      sim_sell_cur_avg: 'Precio Prom. Original:',sim_sell_px: 'Precio de venta ($):',
      sim_sell_inv: 'Valor a retirar (USD):',    sim_sell_qty: 'Cantidad a restar:',
      sim_sell_pnl: 'Profit/Pérdida de la Venta:',sim_sell_rem: 'Activos restantes:',
      btn_conf_sell: 'Confirmar Venta',
      loading_title: 'Generando Reporte...',
      loading_desc: 'La Inteligencia Artificial está analizando tus activos y redactando tus insights.'
    },
    en: {
      app_title: '📊 My Portfolio Pro',          btn_logout: 'Logout',
      tab_stocks: '📈 Stocks Portfolio',          tab_crypto: '₿ Crypto Portfolio',
      undo: 'Undo',                               redo: 'Redo',
      add_asset: '+ Add asset',                   add_crypto: '+ Add Crypto',
      sim_buy_title: '🛒 Register Buy',           sim_buy_cur_qty: 'Current assets:',
      sim_buy_cur_avg: 'Current Avg Price:',      sim_buy_px: 'Buy Price ($):',
      sim_buy_inv: 'Investment (USD):',           sim_buy_qty: 'Quantity to add:',
      sim_buy_new_avg: 'New Avg Price:',          sim_buy_new_inv: 'New Total Inv.:',
      btn_conf_buy: 'Confirm Buy',                btn_cancel: 'Cancel',
      sim_sell_title: '💸 Register Sell',         sim_sell_cur_qty: 'Available assets:',
      sim_sell_cur_avg: 'Original Avg Price:',    sim_sell_px: 'Sell Price ($):',
      sim_sell_inv: 'Value to withdraw (USD):',   sim_sell_qty: 'Quantity to subtract:',
      sim_sell_pnl: 'Trade Profit/Loss:',         sim_sell_rem: 'Remaining assets:',
      btn_conf_sell: 'Confirm Sell',
      loading_title: 'Generating Report...',
      loading_desc: 'Artificial Intelligence is analyzing your assets and drafting your insights.'
    }
  };

  function translateUI() {
    const T = TRANSLATIONS[currentUiLang];
    const ids = {
      'app-title': T.app_title,          'btnLogout': T.btn_logout,
      'simTitleBuyText': T.sim_buy_title,'lbl_buy_cur_qty': T.sim_buy_cur_qty,
      'lbl_buy_cur_avg': T.sim_buy_cur_avg,'lbl_buy_px': T.sim_buy_px,
      'lbl_buy_inv': T.sim_buy_inv,      'lbl_buy_qty': T.sim_buy_qty,
      'lbl_buy_new_avg': T.sim_buy_new_avg,'lbl_buy_new_inv': T.sim_buy_new_inv,
      'btn_conf_buy': T.btn_conf_buy,    'btn_cancel_buy': T.btn_cancel,
      'simTitleSellText': T.sim_sell_title,'lbl_sell_cur_qty': T.sim_sell_cur_qty,
      'lbl_sell_cur_avg': T.sim_sell_cur_avg,'lbl_sell_px': T.sim_sell_px,
      'lbl_sell_inv': T.sim_sell_inv,    'lbl_sell_qty': T.sim_sell_qty,
      'lbl_sell_pnl': T.sim_sell_pnl,   'lbl_sell_rem': T.sim_sell_rem,
      'btn_conf_sell': T.btn_conf_sell,  'btn_cancel_sell': T.btn_cancel,
      'lbl_loading_title': T.loading_title,'lbl_loading_desc': T.loading_desc
    };
    Object.entries(ids).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    });

    document.getElementById('btn-tab-stocks').innerHTML = T.tab_stocks;
    document.getElementById('btn-tab-crypto').innerHTML = T.tab_crypto;
    document.querySelectorAll('.lbl-undo').forEach(e => e.innerText = T.undo);
    document.querySelectorAll('.lbl-redo').forEach(e => e.innerText = T.redo);
    document.querySelectorAll('.btn-add-stock').forEach(e  => e.innerText = T.add_asset);
    document.querySelectorAll('.btn-add-crypto').forEach(e => e.innerText = T.add_crypto);

    document.getElementById('lbl_btn_pdf_1').innerText  = currentUiLang === 'en' ? 'Download ' : 'Descargar ';
    document.getElementById('lbl_btn_pdf_2').innerText  = currentUiLang === 'en' ? 'Report ▼'  : 'Reporte ▼';
    document.getElementById('lbl_date_start').innerText = currentUiLang === 'en' ? 'From:' : 'Desde:';
    document.getElementById('lbl_date_end').innerText   = currentUiLang === 'en' ? 'To:'   : 'Hasta:';
    document.getElementById('btn_choose_assets').innerText = currentUiLang === 'en' ? 'Choose Assets ➔' : 'Elegir Activos ➔';
    document.getElementById('lblRepLang').innerText     = currentUiLang === 'en' ? 'PDF Lang:' : 'Idioma PDF:';
  }

  function toggleLanguage() {
    currentUiLang = currentUiLang === 'es' ? 'en' : 'es';
    document.getElementById('btn-toggle-lang').innerHTML = currentUiLang === 'es' ? '🇺🇸 EN' : '🇨🇴 ES';
    translateUI();
    recalc(false);
  }

  function togglePrivacy() {
    isPrivacyMode = !isPrivacyMode;
    document.getElementById('btn-privacy').innerText = isPrivacyMode ? '🙈' : '👁️';
    recalc(false);
  }

  const f     = (n, d = 2) => isNaN(n) ? '—' : new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const fCOP  = n          => new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' COP';
  const fU    = (n, d = 2) => (n < 0 ? '-' : '') + '$' + f(Math.abs(n), d);
  const fGain = (n, d = 2) => `<span class="${n >= 0 ? 'g' : 'r'}">${n >= 0 ? '+' : '-'}$${f(Math.abs(n), d)}</span>`;
  const fP    = n          => `<span class="${n >= 0 ? 'g' : 'r'}">${n >= 0 ? '+' : ''}${f(n, 2)}%</span>`;
  const rv    = s          => parseFloat(String(s).replace(/[^0-9.\-]/g, '')) || 0;
  const rate  = ()         => rv(document.getElementById('rateInput').value) || 4180;
  const fQty  = n          => parseFloat(Number(n).toFixed(6)); // 🔥 Helper fixado

  function evalMath(val) {
    try {
      const sanitized = String(val).replace(/,/g, '.').replace(/[^0-9+\-*/.\s]/g, '').trim();
      if (!sanitized) return 0;
      // Safe math parser — no eval/new Function
      const tokens = sanitized.match(/(\d+\.?\d*)|([+\-*/])/g);
      if (!tokens || tokens.length === 0) return 0;
      let result = parseFloat(tokens[0]) || 0;
      for (let i = 1; i < tokens.length - 1; i += 2) {
        const op = tokens[i];
        const next = parseFloat(tokens[i + 1]) || 0;
        if (op === '+') result += next;
        else if (op === '-') result -= next;
        else if (op === '*') result *= next;
        else if (op === '/' && next !== 0) result /= next;
      }
      return isNaN(result) ? 0 : parseFloat(result);
    } catch (e) { return rv(val); }
  }

  function showToast(message) {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      document.getElementById('login-screen').style.display  = 'none';
      document.getElementById('app-content').style.display   = 'block';

      const pdfDropdown = document.getElementById('pdf-dropdown');
      if (pdfDropdown) pdfDropdown.style.display = user.email === 'finanzasaturitmo@gmail.com' ? 'inline-block' : 'none';
      loadFromFirebase();
    } else {
      currentUser = null;
      document.getElementById('login-screen').style.display  = 'flex';
      document.getElementById('app-content').style.display   = 'none';
    }
  });

  function iniciarSesion() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => alert('Error: ' + err.message));
  }
  function cerrarSesion() { auth.signOut(); }

  function loadFromFirebase() {
    if (!currentUser) return;
    document.getElementById('lastSaved').textContent = currentUiLang === 'en' ? 'Syncing...' : 'Sincronizando...';

    db.ref('users/' + currentUser.uid).once('value').then(snap => {
      try {
        if (snap.exists()) {
          const d = snap.val();

          SW = (d.SW || []).filter(Boolean);
          XT = (d.XT || []).filter(Boolean);
          CR = (d.CR || []).filter(Boolean);
          
          let rawTrades = d.transactions || d.trades || [];
          TRADES = (Array.isArray(rawTrades) ? rawTrades : Object.values(rawTrades)).filter(t => t && t.date);
          
          SELECTED_STABLES = d.selected_stables || [];
          SUB_USERS = d.sub_users || [
            { id: 1, name: 'Cosi',   usd: 11317 }, { id: 2, name: 'Zura',   usd: 8235  },
            { id: 3, name: 'Zuro',   usd: 1357  }, { id: 4, name: 'Criski', usd: 238   },
            { id: 5, name: 'Mile',   usd: 527   }
          ];

          const cleanRow = row => {
            if (typeof row.qty === 'string') row.qty = rv(row.qty);
            if (typeof row.inv === 'string') row.inv = rv(row.inv);
            if (!row.qty) row.qty = 0;
            if (!row.inv) row.inv = 0;
          };
          SW.forEach(cleanRow); XT.forEach(cleanRow);
          CR.forEach(r => { cleanRow(r); if (r.wallet === undefined) r.wallet = ''; if (r.staking === undefined) r.staking = false; });

          const allRows = [...SW, ...XT, ...CR];
          if (allRows.length) nid = Math.max(...allRows.map(r => r.id)) + 1;
          if (d.rate)  document.getElementById('rateInput').value = d.rate;
          if (d.skInv) skInvVal = parseFloat(d.skInv);
          if (d.skCur) skCurVal = parseFloat(d.skCur);

          fetch('https://economia.awesomeapi.com.br/json/last/USD-COP')
            .then(r => r.json()).then(data => { if (data?.USDCOP) document.getElementById('rateInput').value = parseFloat(data.USDCOP.bid).toFixed(2); }).catch(() => {});

          oppStocks = d.oppStocks !== undefined ? parseFloat(d.oppStocks) : (d.opp ? parseFloat(d.opp) : 10);
          oppCrypto = d.oppCrypto !== undefined ? parseFloat(d.oppCrypto) : (d.opp ? parseFloat(d.opp) : 20);
          document.querySelectorAll('.opp-stocks').forEach(el => el.value = oppStocks);
          document.querySelectorAll('.opp-crypto').forEach(el => el.value = oppCrypto);

          if (d.ts) document.getElementById('lastSaved').textContent = (currentUiLang === 'en' ? 'Cloud OK: ' : 'Nube OK: ') + new Date(d.ts).toLocaleTimeString('es-CO');

        } else {
          SW = [ { id: 1, t: 'BABA', qty: 19, inv: 1460.91, px: 129.87, p: false, staking: false }, { id: 2, t: 'BRK-B', qty: 7.5562, inv: 2974.72, px: 476.19, p: false, staking: false } ];
          XT = [ { id: 11, t: 'EIMI.UK', qty: 28.2244, inv: 1125.02, px: 46.19, p: false, staking: false } ];
          CR = [ { id: 41, t: 'ETH', wallet: 'Binance', qty: 0, inv: 0, px: 0, p: true, staking: false }, { id: 42, t: 'BTC', wallet: 'Ledger', qty: 0, inv: 0, px: 0, p: true, staking: false }, { id: 43, t: 'USDT', wallet: 'Binance', qty: 0, inv: 0, px: 1, p: true, staking: false } ];
          TRADES = []; nid = 50;
        }

        fetchRealTimeData();
        translateUI();
        switchTab(currentView);
        saveStateToHistory();

      } catch (err) { console.error('Error loading data:', err); }
    }).catch(e => { console.error(e); showToast(currentUiLang === 'en' ? '❌ Cloud sync error' : '❌ Error al descargar de la nube'); });
  }

  function saveDataToFirebase() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.uid).set({
      SW, XT, CR, sub_users: SUB_USERS, selected_stables: SELECTED_STABLES, transactions: TRADES,
      rate: document.getElementById('rateInput').value, oppStocks, oppCrypto, skInv: skInvVal, skCur: skCurVal, ts: new Date().toISOString()
    }).then(() => {
      document.getElementById('lastSaved').textContent = (currentUiLang === 'en' ? 'Cloud synced: ' : 'Nube sincronizada: ') + new Date().toLocaleTimeString('es-CO');
    }).catch(err => {
      console.error('Firebase save error:', err);
      document.getElementById('lastSaved').textContent = (currentUiLang === 'en' ? '❌ Save error' : '❌ Error al guardar');
      showToast(currentUiLang === 'en' ? '❌ Cloud save failed' : '❌ Error al guardar en la nube');
    });
  }

  function toggleFab() { document.getElementById('view-tabs').classList.toggle('open'); }

  function switchTab(tabId) {
    currentView = tabId;
    localStorage.setItem('lastTab', tabId);
    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('btn-tab-' + tabId).classList.add('active');
    document.getElementById('content-'  + tabId).classList.add('active');
    document.getElementById('lbl-donut').textContent = tabId === 'stocks' ? (currentUiLang === 'en' ? 'Stocks Distribution' : 'Distribución de Acciones') : (currentUiLang === 'en' ? 'Crypto Distribution' : 'Distribución Cripto');
    document.getElementById('view-tabs').classList.remove('open');
    const fab = document.getElementById('fab-btn');
    if (fab) { fab.style.borderColor = tabId === 'stocks' ? 'var(--yellow)' : 'var(--green)'; fab.style.boxShadow = tabId === 'stocks' ? '0 8px 20px rgba(0,0,0,0.6), 0 0 12px rgba(243,186,47,0.5)' : '0 8px 20px rgba(0,0,0,0.6), 0 0 12px rgba(63,185,80,0.5)'; }
    recalc(false);
  }

  let historyArr = []; let historyIndex = -1;

  function saveStateToHistory() {
    const snapshot = JSON.stringify({ SW, XT, CR, TRADES, rate: document.getElementById('rateInput').value, oppStocks, oppCrypto, skInv: skInvVal, skCur: skCurVal });
    if (historyIndex >= 0 && historyArr[historyIndex] === snapshot) return;
    if (historyIndex < historyArr.length - 1) historyArr = historyArr.slice(0, historyIndex + 1);
    historyArr.push(snapshot);
    if (historyArr.length > 11) historyArr.shift();
    historyIndex = historyArr.length - 1;
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    const undoCnt = historyIndex > 0 ? historyIndex : 0;
    const redoCnt = historyArr.length - 1 - historyIndex > 0 ? historyArr.length - 1 - historyIndex : 0;
    document.querySelectorAll('.undo-cnt').forEach(el => el.textContent = undoCnt);
    document.querySelectorAll('.redo-cnt').forEach(el => el.textContent = redoCnt);
    document.querySelectorAll('.btn-undo-action').forEach(btn => btn.disabled = historyIndex <= 0);
    document.querySelectorAll('.btn-redo-action').forEach(btn => btn.disabled = historyIndex >= historyArr.length - 1);
  }

  function applyState(snapshot) {
    const p = JSON.parse(snapshot);
    SW = p.SW; XT = p.XT; CR = p.CR || []; TRADES = p.TRADES || [];
    document.getElementById('rateInput').value = p.rate;
    oppStocks = p.oppStocks || 10; oppCrypto = p.oppCrypto || 20;
    document.querySelectorAll('.opp-stocks').forEach(el => el.value = oppStocks);
    document.querySelectorAll('.opp-crypto').forEach(el => el.value = oppCrypto);
    skInvVal = p.skInv; skCurVal = p.skCur;
    recalc(false);
  }

  function undo() { if (historyIndex > 0) { historyIndex--; applyState(historyArr[historyIndex]); showToast(currentUiLang === 'en' ? '↩️ Undone' : '↩️ Deshecho'); updateUndoRedoButtons(); } }
  function redo() { if (historyIndex < historyArr.length - 1) { historyIndex++; applyState(historyArr[historyIndex]); showToast(currentUiLang === 'en' ? '↪️ Redone' : '↪️ Rehecho'); updateUndoRedoButtons(); } }

  let lastFocusedValue = '';
  document.addEventListener('focusin', e => { if (e.target.tagName === 'INPUT') setTimeout(() => lastFocusedValue = e.target.value, 10); });
  document.addEventListener('keydown', e => {
    if (document.activeElement?.tagName === 'INPUT') {
      if (e.key === 'Escape') { e.target.value = lastFocusedValue; e.target.blur(); showToast(currentUiLang === 'en' ? '🚫 Edit cancelled' : '🚫 Edición cancelada'); }
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    }
  });

  function skFocus(el) { saveStateToHistory(); el.value = el.id === 'skInv' ? skInvVal : skCurVal; }
  function skBlur(el, type) { const raw = parseFloat(String(el.value).replace(/\./g, '')) || 0; if (type === 'inv') skInvVal = raw; else skCurVal = raw; recalc(); }
  function updateOpp(tab, val) { saveStateToHistory(); const v = rv(val); if (tab === 'stocks') { oppStocks = v; document.querySelectorAll('.opp-stocks').forEach(el => el.value = v); } else { oppCrypto = v; document.querySelectorAll('.opp-crypto').forEach(el => el.value = v); } recalc(); }

  function calc(row) {
    if (!row.qty) row.qty = 0; if (!row.inv) row.inv = 0;
    if (STABLECOINS.includes(String(row.t).toUpperCase())) { row.px = 1.00; row.pxChange = null; }
    row.avg = row.qty > 0 ? row.inv / row.qty : 0;
    row.cur = row.qty * (row.px || 0);
    row.gl  = row.inv > 0 ? (row.cur - row.inv) / row.inv * 100 : 0;
    row.pnl = row.cur - row.inv;
    return row;
  }

  function sortTable(tid, field) {
    const arr = tid === 'sw' ? SW : tid === 'xt' ? XT : CR;
    arr.forEach(calc);
    if (sortState[tid].col === field) sortState[tid].dir *= -1; else { sortState[tid].col = field; sortState[tid].dir = -1; }
    const dir = sortState[tid].dir;
    arr.sort((a, b) => {
      const vA = a[field], vB = b[field];
      if (field === 't' || field === 'wallet') return String(vA || '').localeCompare(String(vB || '')) * dir;
      if (field === 'staking') return ((vA ? 1 : 0) - (vB ? 1 : 0)) * dir;
      return ((parseFloat(vA) || 0) - (parseFloat(vB) || 0)) * dir;
    });
    recalc();
  }

  function getTh(tid, label, field) {
    const sorted  = sortState[tid].col === field;
    const icon    = sorted ? (sortState[tid].dir === 1 ? '▲' : '▼') : '⇕';
    const tooltip = currentUiLang === 'en' ? 'Sort by' : 'Ordenar por';
    return `<th onclick="sortTable('${tid}','${field}')" title="${tooltip} ${label}">${label} <span class="sort-icon ${sorted ? 'active' : ''}">${icon}</span></th>`;
  }

  let activeSimRow = null; let activeSimTid = null;
  function openSim(tid, id) {
    activeSimTid = tid;
    activeSimRow = (tid === 'sw' ? SW : tid === 'xt' ? XT : CR).find(x => x.id === id);
    if (!activeSimRow?.t) { showToast(currentUiLang === 'en' ? 'Assign a name first.' : 'Primero asigna un nombre.'); return; }
    calc(activeSimRow);
    document.getElementById('simTitleBuyAsset').innerText = activeSimRow.t;
    document.getElementById('simCurQty').textContent      = activeSimRow.qty || 0;
    document.getElementById('simCurAvg').textContent      = '$' + f(activeSimRow.avg);
    const px = STABLECOINS.includes(String(activeSimRow.t).toUpperCase()) ? 1 : (activeSimRow.px || activeSimRow.avg);
    document.getElementById('simInpPx').value  = px; document.getElementById('simInpQty').value = 1; document.getElementById('simInpInv').value = px;
    document.getElementById('buyModal').style.display = 'flex'; calcSim('buy', 'px');
  }

  function openSell(tid, id) {
    activeSimTid = tid;
    activeSimRow = (tid === 'sw' ? SW : tid === 'xt' ? XT : CR).find(x => x.id === id);
    if (!activeSimRow?.qty || activeSimRow.qty <= 0) { alert(currentUiLang === 'en' ? 'No valid balance to sell.' : 'No tienes saldo válido para vender.'); return; }
    calc(activeSimRow);
    document.getElementById('simTitleSellAsset').innerText = activeSimRow.t;
    document.getElementById('sellCurQty').textContent      = activeSimRow.qty;
    document.getElementById('sellCurAvg').textContent      = '$' + f(activeSimRow.avg);
    const px = STABLECOINS.includes(String(activeSimRow.t).toUpperCase()) ? 1 : (activeSimRow.px || activeSimRow.avg);
    const dq = activeSimRow.qty > 1 ? 1 : activeSimRow.qty;
    document.getElementById('sellInpPx').value  = px; document.getElementById('sellInpQty').value = dq; document.getElementById('sellInpInv').value = dq * px;
    document.getElementById('sellModal').style.display = 'flex'; calcSim('sell', 'px');
  }

  function closeSim(type) { document.getElementById(type === 'buy' ? 'buyModal' : 'sellModal').style.display = 'none'; activeSimRow = null; activeSimTid = null; }

  function calcSim(type, source = 'px') {
    if (!activeSimRow) return;
    const pfx = type === 'buy' ? 'sim' : 'sell';
    let px  = parseFloat(document.getElementById(pfx + 'InpPx').value)  || 0;
    let inv = parseFloat(document.getElementById(pfx + 'InpInv').value) || 0;
    let qty = parseFloat(document.getElementById(pfx + 'InpQty').value) || 0;

    if (source === 'inv') { qty = px > 0 ? inv / px : 0; document.getElementById(pfx + 'InpQty').value = qty > 0 ? parseFloat(qty.toFixed(6)) : ''; } 
    else { inv = qty * px; document.getElementById(pfx + 'InpInv').value = inv > 0 ? parseFloat(inv.toFixed(2)) : ''; }

    if (type === 'buy') {
      const newQty = (activeSimRow.qty || 0) + qty; const newInv = (activeSimRow.inv || 0) + inv; const newAvg = newQty > 0 ? newInv / newQty : 0;
      const avgEl  = document.getElementById('simOutAvg'); avgEl.textContent = '$' + f(newAvg);
      avgEl.style.color = newAvg < activeSimRow.avg ? 'var(--green)' : newAvg > activeSimRow.avg ? 'var(--red)' : '#e6edf3';
      document.getElementById('simOutInv').textContent = '$' + f(newInv);
    } else {
      const pnl = (px - activeSimRow.avg) * qty; const rem = activeSimRow.qty - qty;
      const pnlEl = document.getElementById('sellOutPnl'); pnlEl.textContent = (pnl >= 0 ? '+' : '-') + '$' + f(Math.abs(pnl)); pnlEl.style.color = pnl >= 0 ? 'var(--green)' : 'var(--red)';
      const qtyEl = document.getElementById('sellOutQty'); qtyEl.textContent = rem < 0 ? (currentUiLang === 'en' ? '⚠️ Invalid' : '⚠️ Inválido') : f(rem, 6); qtyEl.style.color = rem < 0 ? 'var(--red)' : 'var(--sub)';
    }
  }

  function confirmBuy() {
    if (!activeSimRow) return;
    const buyQty   = parseFloat(document.getElementById('simInpQty').value) || 0;
    const buyPx    = parseFloat(document.getElementById('simInpPx').value)  || 0;
    const isStable = STABLECOINS.includes(String(activeSimRow.t).toUpperCase());
    if (buyQty <= 0) { alert(currentUiLang === 'en' ? 'Invalid Quantity.' : 'Cantidad inválida.'); return; }
    if (buyPx <= 0 && !isStable){ alert(currentUiLang === 'en' ? 'Invalid Price.' : 'Precio de compra inválido.'); return; }

    saveStateToHistory();
    const buyInv = buyQty * buyPx;
    activeSimRow.qty = (activeSimRow.qty || 0) + buyQty; activeSimRow.inv = (activeSimRow.inv || 0) + buyInv; activeSimRow.p = false;

    TRADES.push({
      id: Date.now(), date: new Date().toISOString(), type: 'Buy',
      symbol: activeSimRow.t, assetType: activeSimTid === 'cr' ? 'CR' : 'STOCKS',
      broker: activeSimTid === 'xt' ? 'XTB' : activeSimTid === 'sw' ? 'Schwab' : '',
      qty: buyQty, price: buyPx, amount: -buyInv, asset: activeSimRow.t, px: buyPx, inv: buyInv,
      wallet: activeSimRow.wallet || ''
    });
    recalc(false); closeSim('buy'); showToast((currentUiLang === 'en' ? '✅ Buy registered: ' : '✅ Compra registrada: ') + activeSimRow.t);
  }

  function confirmSell() {
    if (!activeSimRow) return;
    const sellQty = parseFloat(document.getElementById('sellInpQty').value) || 0;
    const sellPx  = parseFloat(document.getElementById('sellInpPx').value)  || 0;
    if (sellQty <= 0 || sellQty > activeSimRow.qty) { alert(currentUiLang === 'en' ? 'Invalid quantity or exceeds funds.' : 'Cantidad inválida o supera fondos.'); return; }
    if (sellPx <= 0) { alert(currentUiLang === 'en' ? 'Invalid sell price.' : 'Precio de venta inválido.'); return; }

    saveStateToHistory();
    const avg = activeSimRow.inv / activeSimRow.qty; const pnl = (sellPx - avg) * sellQty;
    activeSimRow.qty -= sellQty; activeSimRow.inv -= sellQty * avg;
    if (activeSimRow.qty < 0.000001) { activeSimRow.qty = 0; activeSimRow.inv = 0; }

    TRADES.push({
      id: Date.now(), date: new Date().toISOString(), type: 'Sell',
      symbol: activeSimRow.t, assetType: activeSimTid === 'cr' ? 'CR' : 'STOCKS',
      broker: activeSimTid === 'xt' ? 'XTB' : activeSimTid === 'sw' ? 'Schwab' : '',
      qty: sellQty, price: sellPx, amount: sellQty * sellPx, pnl, asset: activeSimRow.t, px: sellPx, inv: sellQty * avg,
      wallet: activeSimRow.wallet || ''
    });
    recalc(false); closeSim('sell');
    const glLabel = pnl >= 0 ? (currentUiLang === 'en' ? 'Profit' : 'Ganancia') : (currentUiLang === 'en' ? 'Loss' : 'Pérdida');
    showToast(`✅ ${currentUiLang === 'en' ? 'Sell registered' : 'Venta registrada'}. ${glLabel}: $${f(Math.abs(pnl))} USD`);
  }

  function renderTable(data, tid) {
    const opp      = tid === 'cr' ? oppCrypto : oppStocks;
    const isCrypto = tid === 'cr';
    const m = str => isPrivacyMode ? '••••' : str;

    const D = currentUiLang === 'en'
      ? { thAsset: 'Asset', thCoin: 'Coin', thQty: 'Qty.', thAvg: 'Avg Price', thPx: 'Current Price', thVal: 'Value USD', thInv: 'Invested USD', thGl: '% P/L', thPnl: 'Profit', next: 'next' }
      : { thAsset: 'Activo', thCoin: 'Moneda', thQty: 'Cant.', thAvg: 'Precio Prom', thPx: 'Precio Actual', thVal: 'Valor USD', thInv: 'Invertido USD', thGl: '% G/L', thPnl: 'Profit', next: 'próximo' };

    const thead = `<thead><tr>
      <th></th>${getTh(tid, isCrypto ? D.thCoin : D.thAsset, 't')}${isCrypto ? getTh(tid, 'Stake', 'staking') : ''}${isCrypto ? getTh(tid, 'Wallet / Exchange', 'wallet')  : ''}
      ${getTh(tid, D.thQty, 'qty')}${getTh(tid, D.thAvg, 'avg')}${getTh(tid, D.thPx,  'px')}${getTh(tid, D.thVal, 'cur')}${getTh(tid, D.thInv, 'inv')}${getTh(tid, D.thGl,  'gl')}${getTh(tid, D.thPnl, 'pnl')}<th></th>
    </tr></thead>`;

    const tbody = data.map(row => {
      calc(row);
      const isPend   = row.p || !row.qty;
      const isStable = STABLECOINS.includes(String(row.t).toUpperCase());
      const isOpp    = !isPend && row.avg > 0 && row.px > 0 && ((row.avg - row.px) / row.avg * 100) >= opp;

      let pxBadge = '';
      if (!isStable && row.pxChange !== undefined && row.pxChange !== null && !isPend && !isNaN(row.pxChange)) {
        const isPos = row.pxChange >= 0;
        pxBadge = `<div style="font-size:0.65rem;font-weight:700;padding:1px 4px;border-radius:4px;margin-top:2px;background:${isPos ? '#3fb95022' : '#f7816622'}" class="${isPos ? 'g' : 'r'}">${isPos ? '▲' : '▼'} ${Math.abs(row.pxChange).toFixed(2)}%</div>`;
      }

      let qtyCell = '';
      if (isPrivacyMode) { qtyCell = '••••'; } else if (isPend) { qtyCell = '<span style="color:var(--sub)">—</span>'; } else if (isCrypto && row.staking) {
        const formula = row.qtyExpr ? row.qtyExpr.replace(/'/g, "\\'") : row.qty;
        qtyCell = `<input class="ci" style="width:75px;font-weight:bold;color:var(--blue);border-color:var(--green)" value="${row.qty}" title="Editar cantidad en Staking" onfocus="this.value='${formula}'" onblur="upd('${tid}',${row.id},'qty',this.value)" onkeyup="if(event.key==='Enter')this.blur()">`;
      } else { qtyCell = isCrypto ? parseFloat(Number(row.qty).toFixed(4)) : fQty(row.qty); }

      const placeholder = isCrypto ? 'BTC, ETH...' : 'TICKER'; const dash = '<span style="color:var(--sub)">—</span>';

      return `<tr class="${isPend ? 'pending' : ''}" data-id="${row.id}">
        <td class="drag-handle" title="Mover">☰</td>
        <td><input class="ci ticker ${isOpp ? 'opp-glow' : ''}" value="${row.t || ''}" placeholder="${placeholder}" onblur="upd('${tid}',${row.id},'t',this.value)" onkeyup="if(event.key==='Enter')this.blur()">${isPend ? `<span class="badge">${D.next}</span>` : ''}</td>
        ${isCrypto ? `<td><input type="checkbox" class="chk-staking" ${row.staking ? 'checked' : ''} onchange="upd('${tid}',${row.id},'staking',this.checked)"></td>` : ''}
        ${isCrypto ? `<td><input class="ci wallet" value="${row.wallet || ''}" placeholder="Binance, Ledger..." onblur="upd('${tid}',${row.id},'wallet',this.value)" onkeyup="if(event.key==='Enter')this.blur()"></td>` : ''}
        <td class="computed" style="font-weight:600">${qtyCell}</td><td class="computed">${isPend ? dash : fU(row.avg, isCrypto ? 4 : 2)}</td>
        <td class="computed ${isOpp ? 'opp-glow' : ''}" style="font-weight:700;vertical-align:middle"><div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><span>${row.px || 0}</span>${pxBadge}</div></td>
        <td class="computed">${isPend ? dash : m(fU(row.cur))}</td><td class="computed" style="color:var(--blue)">${isPend ? dash : m(fU(row.inv))}</td>
        <td class="computed">${isPend ? dash : fP(row.gl)}</td><td class="computed">${isPend ? dash : (isPrivacyMode ? '••••' : fGain(row.pnl))}</td>
        <td class="action-btns"><button class="icon-btn" onmousedown="openSim('${tid}',${row.id})" title="🛒">🛒</button><button class="icon-btn" onmousedown="openSell('${tid}',${row.id})" title="💸">💸</button><button class="icon-btn btn-del" onmousedown="delRow('${tid}',${row.id})" title="✕">✕</button></td>
      </tr>`;
    }).join('');

    const tbl = document.getElementById('tbl-' + tid); tbl.innerHTML = thead + '<tbody>' + tbody + '</tbody>';

    const tbodyEl = tbl.querySelector('tbody');
    if (tbodyEl) {
      new Sortable(tbodyEl, { handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', forceFallback: true, fallbackOnBody: true, onEnd: evt => {
        if (evt.oldIndex === evt.newIndex) return;
        const arr = tid === 'sw' ? SW : tid === 'xt' ? XT : CR;
        arr.splice(evt.newIndex, 0, arr.splice(evt.oldIndex, 1)[0]);
        sortState[tid].col = null; recalc();
      }});
    }
  }

  function upd(tid, id, field, val) {
    const row = (tid === 'sw' ? SW : tid === 'xt' ? XT : CR).find(x => x.id === id);
    if (!row) return;
    if      (field === 't')       row[field] = String(val).toUpperCase().trim();
    else if (field === 'wallet')  row[field] = String(val).trim();
    else if (field === 'staking') row[field] = val;
    else if (field === 'qty') { row.qtyExpr = String(val).trim(); row[field] = evalMath(val); }
    else row[field] = rv(val);
    recalc();
  }

  function addRow(tid) { (tid === 'sw' ? SW : tid === 'xt' ? XT : CR).push({ id: nid++, t: '', wallet: '', qty: 0, inv: 0, px: 0, p: true, staking: false }); recalc(); }
  function delRow(tid, id) { if (!confirm(currentUiLang === 'en' ? 'Delete this asset?' : '¿Eliminar este activo?')) return; if (tid === 'sw') SW = SW.filter(x => x.id !== id); else if (tid === 'xt') XT = XT.filter(x => x.id !== id); else CR = CR.filter(x => x.id !== id); recalc(); }

  // ══════════════════════════════════════════════════════════════════════
  // 14. MASTER RECALC — rebuilds the entire UI in one pass
  // ══════════════════════════════════════════════════════════════════════
  function recalc(pushToHistory = true) {
    renderTable(SW, 'sw');
    renderTable(XT, 'xt');
    renderTable(CR, 'cr');
    renderCards();
    renderSummary();
    renderCharts();
    renderSubAccounts();
    renderHistoryTables(); // 🔥 Llamada limpia al historial

    if (pushToHistory) saveStateToHistory();
    else updateUndoRedoButtons();

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveDataToFirebase, 1500);
  }

    // ══════════════════════════════════════════════════════════════════════
  // 14.5 RENDER HISTORY TABLES (Navegación Mensual - Año en Curso)
  // ══════════════════════════════════════════════════════════════════════
  function changeHistoryMonth(offset) {
    viewedHistoryMonth += offset;
    if (viewedHistoryMonth < 0) viewedHistoryMonth = 0;   
    if (viewedHistoryMonth > 11) viewedHistoryMonth = 11; 
    renderHistoryTables();
  }

  function renderHistoryTables() {
    const currentYear = new Date().getFullYear();
    const m = str => isPrivacyMode ? '••••' : str;

    const monthNamesEs = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = currentUiLang === 'en' ? monthNamesEn[viewedHistoryMonth] : monthNamesEs[viewedHistoryMonth];

    document.querySelectorAll('.hist-month-label').forEach(el => el.innerText = `${monthName} ${currentYear}`);
    document.querySelectorAll('.lbl-hist-title').forEach(el => el.innerText = currentUiLang === 'en' ? 'Transaction History' : 'Historial de Transacciones');

    const D = currentUiLang === 'en'
      ? { date: 'Date', type: 'Type', asset: 'Asset', qty: 'Qty.', px: 'Price', total: 'Total', empty: 'No transactions this month.' }
      : { date: 'Fecha', type: 'Tipo', asset: 'Activo', qty: 'Cant.', px: 'Precio', total: 'Total', empty: 'No hay transacciones este mes.' };

    const thead = `<thead><tr><th style="text-align:left; padding-left:10px">${D.date}</th><th>${D.type}</th><th>${D.asset}</th><th>${D.qty}</th><th>${D.px}</th><th>${D.total}</th><th></th></tr></thead>`;

    const buildTbody = (assetTypeFilter) => {
      const filtered = TRADES.filter(t => {
        if (!t || !t.date) return false;
        const d = new Date(t.date);
        let isCripto = t.assetType === 'CR' || String(t.type || '').toUpperCase() === 'CR' || String(t.type || '').toUpperCase() === 'CRIPTO';
        if (!t.assetType && CR.some(c => c.t === (t.symbol || t.asset))) isCripto = true;
        const matchesFilter = assetTypeFilter === 'CR' ? isCripto : !isCripto;
        return d.getFullYear() === currentYear && d.getMonth() === viewedHistoryMonth && matchesFilter;
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      if (filtered.length === 0) return `<tbody><tr><td colspan="7" style="padding:15px; color:var(--sub)">${D.empty}</td></tr></tbody>`;

      return '<tbody>' + filtered.map(t => {
        const rawType = String(t.type || '').toUpperCase();
        const isBuy = rawType === 'BUY' || rawType === 'COMPRA';
        const typeStr = isBuy ? (currentUiLang === 'en' ? 'BUY' : 'COMPRA') : (currentUiLang === 'en' ? 'SELL' : 'VENTA');
        const typeColor = isBuy ? 'var(--green)' : 'var(--red)';
        
        let dateStr = "—";
        try { dateStr = new Date(t.date).toLocaleDateString(currentUiLang === 'en' ? 'en-US' : 'es-CO'); } catch(e){}

        const px = t.price || t.px || 0;
        const amount = t.amount !== undefined ? t.amount : (isBuy ? -(t.qty * px) : (t.qty * px));
        
        // 🔥 LÓGICA PARA MOSTRAR LA BILLETERA 🔥
        let walletStr = t.wallet || '';
        if (!walletStr && assetTypeFilter === 'CR') {
          const foundAsset = CR.find(c => c.t === (t.symbol || t.asset));
          if (foundAsset && foundAsset.wallet) walletStr = foundAsset.wallet;
        }
        
        let displaySymbol = t.symbol || t.asset || '—';
        if (assetTypeFilter === 'CR' && walletStr) {
          displaySymbol += ` <span style="font-size:0.7rem; color:var(--sub); font-weight:normal;">(${walletStr})</span>`;
        } else if (assetTypeFilter !== 'CR') {
          const sym = t.symbol || t.asset || '';
          const brokerTag = t.broker || (XT.some(x => x.t === sym) && !SW.some(x => x.t === sym) ? 'XTB' : SW.some(x => x.t === sym) && !XT.some(x => x.t === sym) ? 'Schwab' : '');
          if (brokerTag) displaySymbol += ` <span style="font-size:0.7rem; color:var(--sub); font-weight:normal;">(${brokerTag})</span>`;
        }

        return `<tr>
          <td style="text-align:left; padding-left:10px; font-size:0.75rem; color:var(--sub)">${dateStr}</td>
          <td style="font-weight:bold; color:${typeColor}">${typeStr}</td>
          <td style="font-weight:bold; color:var(--blue)">${displaySymbol}</td>
          <td>${m(fQty(t.qty))}</td>
          <td>${m(fU(px))}</td>
          <td style="font-weight:bold; color:${amount < 0 ? 'var(--red)' : 'var(--green)'}">${m(fU(amount))}</td>
          <td><button class="icon-btn btn-del" onmousedown="deleteTrade(${t.id})" title="Eliminar Transacción">✕</button></td>
        </tr>`;
      }).join('') + '</tbody>';
    }; // 🔥 ¡AQUÍ ESTABA EL ERROR, FALTABA ESTA LLAVE CERRANDO EL buildTbody! 🔥

    const tblSw = document.getElementById('tbl-hist-sw'); 
    const tblCr = document.getElementById('tbl-hist-cr');
    if (tblSw) tblSw.innerHTML = thead + buildTbody('STOCKS');
    if (tblCr) tblCr.innerHTML = thead + buildTbody('CR');
  }
   // 🔥 FUNCIÓN ACTUALIZADA: Eliminar transacción y revertir saldos 🔥
  function deleteTrade(tradeId) {
    const msg = currentUiLang === 'en' ? 'Delete this transaction and restore balance?' : '¿Eliminar esta transacción y restaurar el saldo en el portafolio?';
    if (!confirm(msg)) return;
    
    // 1. Encontrar la transacción ANTES de borrarla
    const tradeToDel = TRADES.find(t => t.id === tradeId);
    if (!tradeToDel) return;

    saveStateToHistory(); // Guardar estado para poder usar "Deshacer"

    // 2. Determinar si fue Compra o Venta
    const rawType = String(tradeToDel.type || '').toUpperCase();
    const isBuy = rawType === 'BUY' || rawType === 'COMPRA';

    // 3. Buscar el activo correspondiente en los portafolios (SW, XT o CR)
    const targetSymbol = tradeToDel.symbol || tradeToDel.asset;
    const targetWallet = tradeToDel.wallet || '';
    
    let foundAsset = null;
    const findAsset = (arr) => arr.find(a => a.t === targetSymbol && (a.wallet || '') === targetWallet);

    if (tradeToDel.assetType === 'CR' || targetWallet !== '') {
      foundAsset = findAsset(CR); // Buscar en Cripto
    } else {
      foundAsset = findAsset(SW) || findAsset(XT); // Buscar en Acciones
    }

    // 4. Revertir la operación matemática en el portafolio
    if (foundAsset) {
      const tQty = parseFloat(tradeToDel.qty) || 0;
      const tInv = parseFloat(tradeToDel.inv) || 0; // Usamos el 'inv' exacto que se guardó al confirmar

      if (isBuy) {
        // Revertir Compra: Quitar las acciones que habían entrado
        foundAsset.qty = (foundAsset.qty || 0) - tQty;
        foundAsset.inv = (foundAsset.inv || 0) - tInv;
      } else {
        // Revertir Venta: Devolver las acciones que habían salido
        foundAsset.qty = (foundAsset.qty || 0) + tQty;
        foundAsset.inv = (foundAsset.inv || 0) + tInv;
      }

      // Limpieza de seguridad: evitar saldos negativos microscópicos por decimales
      if (foundAsset.qty < 0.000001) {
        foundAsset.qty = 0;
        foundAsset.inv = 0;
        foundAsset.p = true; // (Opcional) Vuelve a poner la etiqueta "next" si queda en 0
      }
    }

    // 5. Borrar el registro del historial
    TRADES = TRADES.filter(t => t.id !== tradeId); 
    
    // 6. Recalcular todo (esto actualiza visuales y guarda en Firebase)
    recalc(); 
    
    const toastMsg = currentUiLang === 'en' ? '✅ Trade deleted & balance restored' : '✅ Historial borrado y saldo restaurado';
    showToast(toastMsg);
  }

  function renderSubAccounts() {
    const panel = document.getElementById('sub-accounts-panel');
    if (currentView !== 'crypto') { panel.style.display = 'none'; return; }
    panel.style.display = 'block';

    const m = str => isPrivacyMode ? '••••' : str;
    const tbody = document.getElementById('sub-tbody');
    let totalUsersUSD = 0;

    tbody.innerHTML = SUB_USERS.map(u => {
      totalUsersUSD += parseFloat(u.usd) || 0;
      const usdVal = isPrivacyMode ? '••••' : u.usd;
      const formula = u.usdExpr ? u.usdExpr.replace(/'/g, "\\'") : u.usd;
      
      return `<tr>
          <td style="text-align:left;padding-left:10px"><input class="ci" style="width:100px;text-align:left;font-weight:bold;border:none;background:transparent" value="${u.name}" onblur="updSub(${u.id},'name',this.value)" onkeyup="if(event.key==='Enter')this.blur()"></td>
          <td><input type="text" class="ci" style="width:100px;font-weight:bold;color:var(--blue)" value="${usdVal}" ${isPrivacyMode ? 'readonly' : ''} onblur="updSub(${u.id},'usd',this.value)" onfocus="if(!isPrivacyMode) this.value='${formula}'" onkeyup="if(event.key==='Enter')this.blur()"></td>
          <td><button class="icon-btn btn-del" onmousedown="delSub(${u.id})" title="Eliminar">✕</button></td>
        </tr>`;
    }).join('');

    const allCryptoItems   = CR.filter(a => a.t && a.qty > 0);
    const currentCryptoIds = allCryptoItems.map(a => String(a.id));
    SELECTED_STABLES       = SELECTED_STABLES.filter(id => currentCryptoIds.includes(String(id)));

    let dropdownHtml = allCryptoItems.length === 0
      ? '<div class="stable-empty">No hay criptomonedas activas.</div>'
      : allCryptoItems.map(a => {
          const isChecked   = SELECTED_STABLES.includes(String(a.id)) ? 'checked' : '';
          const displayName = `${a.t} ${a.wallet ? `(${a.wallet})` : ''}`;
          return `<label class="stable-option"><input type="checkbox" ${isChecked} onchange="toggleStableSelection('${a.id}', this.checked)"> ${displayName} - <span style="color:var(--green)">$${f(a.qty * (a.px || 1))}</span></label>`;
        }).join('');

    let totalStableUSD = 0;
    allCryptoItems.forEach(asset => { if (SELECTED_STABLES.includes(String(asset.id))) totalStableUSD += asset.qty * (asset.px || 1); });
    const totalCristh = totalStableUSD - totalUsersUSD;

    document.querySelector('#tbl-sub tfoot').innerHTML = `
      <tr style="background:var(--cardAlt);font-weight:bold"><td style="text-align:left;padding-left:10px;color:var(--sub)">TOTAL USD USERS</td><td style="color:var(--blue)">${m('$' + f(totalUsersUSD))}</td><td></td></tr>
      <tr style="background:var(--bg);font-weight:bold"><td style="text-align:left;padding-left:10px;color:var(--sub)">TOTAL USD CRISTH<span style="font-size:0.65rem;font-weight:normal;color:var(--sub);display:block">(Respaldos - Usuarios)</span></td><td style="color:${totalCristh >= 0 ? 'var(--green)' : 'var(--red)'}">${m('$' + f(totalCristh))}
          <div class="stables-dropdown-container">
            <button class="btn-choose-stables" onclick="toggleFondosMenu(this)">⚙️ Fondos</button>
            <div id="stables-menu-list" class="stables-menu">
              <div style="font-size:0.7rem;color:var(--sub);border-bottom:1px solid var(--border);padding-bottom:6px;margin-bottom:6px">Selecciona los fondos de respaldo:</div>${dropdownHtml}
            </div>
          </div>
        </td><td></td></tr>`;
  }

  function toggleFondosMenu(btn) {
    const menu = document.getElementById('stables-menu-list');
    if (!menu) return;
    menu.classList.toggle('show');
    if (menu.classList.contains('show')) {
      const r = btn.getBoundingClientRect();
      menu.style.left = r.left + 'px';
      menu.style.bottom = (window.innerHeight - r.top + 8) + 'px';
      menu.style.top = 'auto';
    }
  }
  window.addEventListener('click', e => { if (!e.target.closest('.stables-dropdown-container')) { const menu = document.getElementById('stables-menu-list'); if (menu && menu.classList.contains('show')) menu.classList.remove('show'); } });
  function toggleStableSelection(idStr, isChecked) { if (isChecked) { if (!SELECTED_STABLES.includes(idStr)) SELECTED_STABLES.push(idStr); } else { SELECTED_STABLES = SELECTED_STABLES.filter(id => id !== idStr); } recalc(); }
  function updSub(id, field, val) { if (isPrivacyMode) return; const user = SUB_USERS.find(u => u.id === id); if (!user) return; if (field === 'name') { user.name = val; } else if (field === 'usd') { user.usdExpr = String(val).trim(); user.usd = evalMath(val); } recalc(); }
  function addSubAccount() { const newId = SUB_USERS.length > 0 ? Math.max(...SUB_USERS.map(u => u.id)) + 1 : 1; SUB_USERS.push({ id: newId, name: 'Nuevo', usd: 0 }); recalc(); }
  function delSub(id) { if (!confirm(currentUiLang === 'en' ? 'Delete user?' : '¿Eliminar usuario?')) return; SUB_USERS = SUB_USERS.filter(u => u.id !== id); recalc(); }

  function renderCards() {
    const rt  = rate(); const now = new Date().toLocaleTimeString('es-CO');
    const D = currentUiLang === 'en'
      ? { lblS: '💼 Stocks + Skandia Portfolio', lblC: '₿ Crypto Portfolio', inv: '📥 Invested Capital', ret: '📈 Total Return', retSub: '% on investment', trm: '💱 Live Exchange Rate', trmSub: '1 USD = ' + f(rt,0) + ' COP', trmAct: 'Upd: ' + now, best: '🏆 Best Asset', worst: '⚠️ Worst Asset', wallet: 'Digital Wallet' }
      : { lblS: '💼 Portafolio Acciones + Skandia', lblC: '₿ Portafolio Cripto', inv: '📥 Capital Invertido', ret: '📈 Retorno Total', retSub: '% sobre invertido', trm: '💱 TRM en Vivo', trmSub: '1 USD = ' + f(rt,0) + ' COP', trmAct: 'Act: ' + now, best: '🏆 Mejor Activo', worst: '⚠️ Más Rezagado', wallet: 'Billetera Digital' };

    let activeAssets, tInv, tCur, tPnl, tPct, lblGlobal, valInvStr, htmlSub;

    if (currentView === 'stocks') {
      activeAssets = [...SW.map(calc), ...XT.map(calc)].filter(x => x.qty > 0); tCur = activeAssets.reduce((s, x) => s + x.cur, 0); const bInv = activeAssets.reduce((s, x) => s + x.inv, 0);
      if (skInvVal <= 0) skInvVal = 14613200; const skUSD = skCurVal / rt, skIUSD = skInvVal / rt;
      tInv = bInv + skIUSD; tCur += skUSD; tPnl = tCur - tInv; tPct = tInv > 0 ? (tPnl / tInv) * 100 : 0;
      lblGlobal = D.lblS; valInvStr = '$' + f(tInv); htmlSub = `Brokers <span style="color:#e6edf3;font-weight:600">${isPrivacyMode ? '••••' : '$' + f(tCur - skUSD)}</span> · Skandia <span style="color:#e6edf3;font-weight:600">${isPrivacyMode ? '••••' : '$' + f(skUSD)}</span>`;
    } else {
      activeAssets = CR.map(calc).filter(x => x.qty > 0); const tCurRaw = activeAssets.reduce((s, x) => s + x.cur, 0); const tInvRaw = activeAssets.reduce((s, x) => s + x.inv, 0);
      const totalUsersUSD = SUB_USERS.reduce((s, u) => s + (parseFloat(u.usd) || 0), 0);
      tInv = tInvRaw - totalUsersUSD; tCur = tCurRaw - totalUsersUSD; tPnl = tCur - tInv; tPct = tInv > 0 ? (tPnl / tInv) * 100 : 0;
      lblGlobal = D.lblC; valInvStr = '$' + f(tInv); htmlSub = `${D.wallet} <span style="color:#e6edf3;font-weight:600">${isPrivacyMode ? '••••' : '$' + f(tCurRaw)}</span>`;
    }

    const named = activeAssets.filter(x => x.t && !STABLECOINS.includes(String(x.t).toUpperCase()));
    const best = named.length ? [...named].sort((a, b) => b.gl - a.gl)[0] : null; const worst = named.length ? [...named].sort((a, b) => a.gl - b.gl)[0] : null;
    const bCls = best && best.gl >= 0 ? 'g' : 'r'; const wCls = worst && worst.gl >= 0 ? 'g' : 'r'; const glSign = (n, v) => `${n >= 0 ? '+' : '-'}$${f(Math.abs(n), v)}`;

    document.getElementById('cards').innerHTML = `
      <div class="card" style="border-color:#58a6ff33"><div class="lbl">${lblGlobal}</div><div class="val b">${isPrivacyMode ? '••••' : '$' + f(tCur)}</div><div class="s2" style="color:var(--sub);margin-top:3px">${htmlSub}</div><div class="s2" style="color:var(--green);margin-top:2px;font-weight:600">${isPrivacyMode ? '••••' : fCOP(tCur * rt)}</div></div>
      <div class="card"><div class="lbl">${D.inv}</div><div class="val">${isPrivacyMode ? '••••' : valInvStr}</div><div class="s2" style="color:var(--sub);margin-top:3px">${isPrivacyMode ? '••••' : fCOP(tInv * rt)}</div></div>
      <div class="card" style="border-color:${tPnl >= 0 ? '#3fb95033' : '#f7816633'}"><div class="lbl">${D.ret}</div><div class="val ${tPnl >= 0 ? 'g' : 'r'}">${isPrivacyMode ? '••••' : glSign(tPnl, 2)}</div><div class="s2 ${tPct >= 0 ? 'g' : 'r'}" style="margin-top:3px">${tPct >= 0 ? '+' : ''}${f(tPct, 1)}% ${D.retSub}</div><div class="s2 ${tPnl >= 0 ? 'g' : 'r'}" style="margin-top:2px;font-weight:600">${isPrivacyMode ? '••••' : (tPnl >= 0 ? '+' : '-') + ' ' + fCOP(Math.abs(tPnl) * rt)}</div></div>
      <div class="card" style="border-color:#ffa65733"><div class="lbl">${D.trm}</div><div class="val" style="color:#ffa657">${f(rt, 0)} <span style="font-size:.72rem;font-weight:400;color:var(--sub)">COP</span></div><div class="s2 hide-mob" style="color:var(--sub);margin-top:3px">${D.trmSub}</div><div class="s2 hide-mob" style="color:#555;margin-top:2px;font-size:.62rem">${D.trmAct}</div></div>
      <div class="card" style="border-color:${best && best.gl >= 0 ? '#3fb95033' : '#f7816633'}"><div class="lbl">${D.best}</div><div class="val ${bCls}">${best ? best.t : '—'}</div><div class="s2 ${bCls}" style="margin-top:3px">${isPrivacyMode ? '••••' : (best ? glSign(best.pnl, 2) : '')}</div><div class="s2 ${bCls}" style="margin-top:2px">${isPrivacyMode ? '••••' : (best ? (best.gl >= 0 ? '+' : '') + f(best.gl, 1) + '%' : '')}</div><div class="s2 hide-mob ${bCls}" style="margin-top:2px;font-size:.68rem">${isPrivacyMode ? '••••' : (best ? (best.pnl >= 0 ? '+' : '-') + fCOP(Math.abs(best.pnl) * rt) : '')}</div></div>
      <div class="card" style="border-color:${worst && worst.gl >= 0 ? '#3fb95033' : '#f7816633'}"><div class="lbl">${D.worst}</div><div class="val ${wCls}">${worst ? worst.t : '—'}</div><div class="s2 ${wCls}" style="margin-top:3px">${isPrivacyMode ? '••••' : (worst ? glSign(worst.pnl, 2) : '')}</div><div class="s2 ${wCls}" style="margin-top:2px">${isPrivacyMode ? '••••' : (worst ? f(worst.gl, 1) + '%' : '')}</div><div class="s2 hide-mob ${wCls}" style="margin-top:2px;font-size:.68rem">${isPrivacyMode ? '••••' : (worst ? (worst.pnl >= 0 ? '+' : '-') + fCOP(Math.abs(worst.pnl) * rt) : '')}</div></div>`;
  }

  function renderSummary() {
    const rt = rate(); const m = str => isPrivacyMode ? '••••' : str;
    const D = currentUiLang === 'en'
      ? { inv: 'Invested', act: 'Current', sk: '🇨🇴 Skandia BITCOIN Portfolio ₿', skCap: 'Invested Capital', skCur: 'Current Value', skRet: 'Skandia Return', tInv: 'Total Invested', tEq: 'USD Equivalent', tCurCOP: 'Current Total COP', tCurUSD: 'Current Total USD', crInv: '₿ Crypto Investment', tInvCr: 'Total Crypto Invested', summaryS: '📋 Consolidated Stocks Summary', summaryC: '📋 Consolidated Crypto Summary' }
      : { inv: 'Invertido', act: 'Actual', sk: '🇨🇴 Skandia Portafolio BITCOIN ₿', skCap: 'Capital Invertido', skCur: 'Valor Actual', skRet: 'Rendimiento Skandia', tInv: 'Total Invertido', tEq: 'Equivalente USD', tCurCOP: 'Total Actual COP', tCurUSD: 'Total Actual USD', crInv: '₿ Inversión Cripto', tInvCr: 'Total Invertido Cripto', summaryS: '📋 Resumen Consolidado de Acciones', summaryC: '📋 Resumen Consolidado Cripto' };

    document.getElementById('lbl-summary').textContent = currentView === 'stocks' ? D.summaryS : D.summaryC;

    if (currentView === 'stocks') {
      const sA = SW.map(calc).filter(x => x.qty > 0); const xA = XT.map(calc).filter(x => x.qty > 0);
      const sI = sA.reduce((s, x) => s + x.inv, 0), sC = sA.reduce((s, x) => s + x.cur, 0); const xI = xA.reduce((s, x) => s + x.inv, 0), xC = xA.reduce((s, x) => s + x.cur, 0);
      if (skInvVal <= 0) skInvVal = 14613200;
      const skI_USD = skInvVal / rt, skC_USD = skCurVal / rt;
      const tI_USD = sI + xI + skI_USD, tC_USD = sC + xC + skC_USD; const tI_COP = (sI + xI) * rt + skInvVal; const tC_COP = (sC + xC) * rt + skCurVal;
      const skPnl = skCurVal - skInvVal; const skRet = skInvVal > 0 ? (skPnl / skInvVal) * 100 : 0; const copFmt = n => new Intl.NumberFormat('es-CO').format(n);

      document.getElementById('sum-content').innerHTML = `
        <div class="sum-grid">
          <div class="sum-card"><div style="font-size:.65rem;color:var(--sub);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">🇺🇸 Schwab USA</div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.75rem;color:var(--sub)">${D.inv}</span><span style="font-size:.8rem;font-weight:600">${m('$' + f(sI))}</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:.75rem;color:var(--sub)">${D.act}</span><span style="font-size:.8rem;font-weight:600" class="b">${m(fU(sC))}</span></div></div>
          <div class="sum-card"><div style="font-size:.65rem;color:var(--sub);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">🇪🇺 XTB Europe</div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.75rem;color:var(--sub)">${D.inv}</span><span style="font-size:.8rem;font-weight:600">${m('$' + f(xI))}</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:.75rem;color:var(--sub)">${D.act}</span><span style="font-size:.8rem;font-weight:600" class="b">${m(fU(xC))}</span></div></div>
        </div>
        <div class="sk-panel">
          <div class="sk-hdr"><div class="sk-title-badge">${D.sk}</div></div>
          <div class="sk-grid">
            <div><label style="font-size:.7rem;color:var(--sub)">${D.skCap}</label><div class="sk-edit-group"><span class="sk-edit-badge">COP</span><input class="sk-edit-input" id="skInv" value="${isPrivacyMode ? '••••' : copFmt(skInvVal)}" ${isPrivacyMode ? 'readonly' : ''} onfocus="skFocus(this)" onblur="skBlur(this,'inv')" onkeyup="if(event.key==='Enter')this.blur()"></div><div style="font-size:.65rem;color:var(--sub);text-align:right;margin-top:3px">≈ ${m('$' + f(skI_USD))} USD</div></div>
            <div><label style="font-size:.7rem;color:var(--sub)">${D.skCur}</label><div class="sk-edit-group"><span class="sk-edit-badge">COP</span><input class="sk-edit-input" id="skCur" value="${isPrivacyMode ? '••••' : copFmt(skCurVal)}" ${isPrivacyMode ? 'readonly' : ''} onfocus="skFocus(this)" onblur="skBlur(this,'cur')" onkeyup="if(event.key==='Enter')this.blur()"></div><div style="font-size:.65rem;color:var(--sub);text-align:right;margin-top:3px">≈ ${m(fU(skC_USD))} USD</div></div>
          </div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #3fb95022;display:flex;justify-content:space-between;align-items:center"><span style="font-size:.7rem;color:var(--sub)">${D.skRet}</span><span style="font-size:.8rem;font-weight:700" class="${skPnl >= 0 ? 'g' : 'r'}">${isPrivacyMode ? '••••' : (skPnl >= 0 ? '+' : '-') + ' ' + fCOP(Math.abs(skPnl))} (${skRet >= 0 ? '+' : ''}${f(skRet, 2)}%)</span></div>
        </div>
        <div class="totals-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><div style="font-size:.75rem;color:var(--sub);margin-bottom:2px">${D.tInv}</div><div style="font-size:1.15rem;font-weight:700;color:#e6edf3;letter-spacing:.5px">${m(fCOP(tI_COP))}</div></div><div style="text-align:right"><div style="font-size:.7rem;color:var(--sub);margin-bottom:2px">${D.tEq}</div><div style="font-size:.9rem;font-weight:600;color:var(--sub)">${m('$' + f(tI_USD))}</div></div></div><div style="border-top:1px solid var(--border);margin:12px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:.8rem;color:var(--green);font-weight:700;margin-bottom:2px">${D.tCurCOP}</div><div style="font-size:1.5rem;font-weight:800;color:var(--green);letter-spacing:.5px;text-shadow:0 0 10px rgba(63,185,80,0.2)">${m(fCOP(tC_COP))}</div></div><div style="text-align:right"><div style="font-size:.75rem;color:var(--blue);font-weight:600;margin-bottom:2px">${D.tCurUSD}</div><div style="font-size:1.2rem;font-weight:800;color:var(--blue)">${m('$' + f(tC_USD))}</div></div></div>
        </div>`;
    } else {
      const cA = CR.map(calc).filter(x => x.qty > 0);
      const totalUsersUSD = SUB_USERS.reduce((s, u) => s + (parseFloat(u.usd) || 0), 0);
      const cI = cA.reduce((s, x) => s + x.inv, 0) - totalUsersUSD; const cC = cA.reduce((s, x) => s + x.cur, 0) - totalUsersUSD;
      document.getElementById('sum-content').innerHTML = `
        <div class="sum-grid"><div class="sum-card" style="border-color:#f3ba2f44"><div style="font-size:.65rem;color:var(--yellow);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">${D.crInv}</div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.75rem;color:var(--sub)">${D.inv}</span><span style="font-size:.8rem;font-weight:600">${m('$' + f(cI))}</span></div><div style="display:flex;justify-content:space-between"><span style="font-size:.75rem;color:var(--sub)">${D.act}</span><span style="font-size:.8rem;font-weight:600" class="b">${m(fU(cC))}</span></div></div></div>
        <div class="totals-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><div style="font-size:.75rem;color:var(--sub);margin-bottom:2px">${D.tInvCr}</div><div style="font-size:1.15rem;font-weight:700;color:#e6edf3;letter-spacing:.5px">${m(fCOP(cI * rt))}</div></div><div style="text-align:right"><div style="font-size:.7rem;color:var(--sub);margin-bottom:2px">${D.tEq}</div><div style="font-size:.9rem;font-weight:600;color:var(--sub)">${m('$' + f(cI))}</div></div></div><div style="border-top:1px solid var(--border);margin:12px 0"></div>
          <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:.8rem;color:var(--green);font-weight:700;margin-bottom:2px">${D.tCurCOP}</div><div style="font-size:1.5rem;font-weight:800;color:var(--green);letter-spacing:.5px;text-shadow:0 0 10px rgba(63,185,80,0.2)">${m(fCOP(cC * rt))}</div></div><div style="text-align:right"><div style="font-size:.75rem;color:var(--blue);font-weight:600;margin-bottom:2px">${D.tCurUSD}</div><div style="font-size:1.2rem;font-weight:800;color:var(--blue)">${m('$' + f(cC))}</div></div></div>
        </div>`;
    }
  }

  function renderCharts() {
    document.getElementById('lbl-bar').textContent = currentUiLang === 'en' ? 'Performance % P/L' : 'Rendimiento % G/L';
    const rawData = currentView === 'stocks' ? [...SW.map(calc), ...XT.map(x => { const c = calc(x); c.isXT = true; return c; })] : [...CR.map(calc)];
    const all = rawData.filter(x => x.qty > 0 && x.t);
    const STABLES = ['USDT','USDC','EUSD'];
    const labels = all.map(x => { let name = String(x.t); if (STABLES.includes(name.toUpperCase()) && x.wallet) name += ` (${x.wallet})`; if (x.isXT) name += ' (XTB)'; return name; });
    const values = all.map(x => x.cur); const gls = all.map(x => x.gl); const total = values.reduce((a, b) => a + b, 0); const isMob = window.innerWidth <= 768;
    const labelsPct = labels.map((t, i) => `${t} (${total > 0 ? (values[i] / total * 100).toFixed(1) : 0}%)`);

    if (dChart) dChart.destroy();
    if (labels.length) {
      const legendRows = Math.ceil(labels.length / 2);
      const legendFontSize = labels.length > 16 ? 9 : labels.length > 10 ? 10 : 11;
      const legendPadding = labels.length > 16 ? 4 : labels.length > 10 ? 6 : 8;
      const legendBoxWidth = labels.length > 16 ? 8 : 10;
      const donutHeight = isMob ? Math.max(280, legendRows * 22 + 180) : Math.max(200, legendRows * (legendFontSize + legendPadding + 2));
      document.getElementById('donut-wrap').style.height = donutHeight + 'px';
      const donutPctPlugin = { id: 'donutPct', afterDraw: chart => { const ctx = chart.ctx; chart.data.datasets.forEach((ds, i) => { const meta = chart.getDatasetMeta(i); if (!meta.hidden) { meta.data.forEach((el, j) => { const pct = (ds.data[j] / total * 100); if (pct >= 4) { ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 3; const pos = el.tooltipPosition(); ctx.fillText(pct.toFixed(1) + '%', pos.x, pos.y); ctx.shadowBlur = 0; } }); } }); } };
      dChart = new Chart(document.getElementById('donut'), { type: 'doughnut', data: { labels: labelsPct, datasets: [{ data: values, backgroundColor: CHART_COLORS.slice(0, labels.length), borderWidth: 2, borderColor: '#161b22' }] }, plugins: [donutPctPlugin], options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: isMob ? 'bottom' : 'right', labels: { color: '#e6edf3', font: { size: legendFontSize }, boxWidth: legendBoxWidth, padding: legendPadding } } } } });
    }

    if (bChart) bChart.destroy();
    if (labels.length) {
      const barHeight = isMob ? Math.max(280, labels.length * 40) : Math.max(200, labels.length * 18 + 80);
      document.getElementById('bar-wrap').style.height = barHeight + 'px';
      const pctPlugin = { id: 'pct', afterDraw: chart => { const ctx = chart.ctx; const isH = chart.options.indexAxis === 'y'; chart.data.datasets.forEach((ds, i) => { const meta = chart.getDatasetMeta(i); if (!meta.hidden) { meta.data.forEach((el, j) => { ctx.fillStyle = ds.borderColor[j]; const v = ds.data[j]; const text = (v >= 0 ? '+' : '') + f(v, 1) + '%'; if (isMob && isH) { ctx.font = 'bold 11px sans-serif'; ctx.textBaseline = 'middle'; const zeroX = chart.scales.x.getPixelForValue(0); ctx.textAlign = v >= 0 ? 'right' : 'left'; ctx.fillText(`${chart.data.labels[j]} (${text})`, zeroX + (v >= 0 ? -8 : 8), el.y); } else { ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = v >= 0 ? 'bottom' : 'top'; ctx.fillText(text, el.x, el.y + (v >= 0 ? -6 : 6)); } }); } }); } };
      bChart = new Chart(document.getElementById('bar'), { type: 'bar', data: { labels, datasets: [{ label: currentUiLang === 'en' ? 'Performance' : 'Rendimiento', data: gls, backgroundColor: gls.map(g => g >= 0 ? '#3fb95055' : '#f7816655'), borderColor: gls.map(g => g >= 0 ? '#3fb950' : '#f78166'), borderWidth: 1 }] }, plugins: [pctPlugin], options: { responsive: true, maintainAspectRatio: false, indexAxis: isMob ? 'y' : 'x', layout: { padding: { top: isMob ? 0 : 25, bottom: isMob ? 0 : 10, left: isMob ? 120 : 0, right: isMob ? 120 : 0 } }, plugins: { legend: { display: false } }, scales: { x: { display: !isMob, ticks: { color: '#e6edf3', font: { size: 9 }, maxRotation: 55, minRotation: 35, autoSkip: false }, grid: { color: '#21262d' } }, y: { display: !isMob, ticks: { color: '#8b949e', callback: v => v + '%' }, grid: { color: '#21262d' } } } } });
    }
  }

  async function fetchRealTimeData() {
    if (document.activeElement?.tagName === 'INPUT' || !currentUser) return;
    try { const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-COP'); const data = await res.json(); if (data?.USDCOP?.bid) document.getElementById('rateInput').value = parseFloat(data.USDCOP.bid).toFixed(2); } catch (e) {}

    const fetchStockPrice = async row => {
      try {
        if (String(row.t).toUpperCase().includes('.UK')) {
          const sym = String(row.t).toUpperCase().replace('.UK', '.L'); const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`; const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl); const data = await res.json(); const meta = data?.chart?.result?.[0]?.meta;
          if (meta) { row.px = meta.regularMarketPrice; row.pxChange = (meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100; } return;
        }
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${row.t}&token=${FINNHUB_API_KEY}`); const data = await res.json();
        if (data?.c) { row.px = data.c; row.pxChange = data.dp !== undefined && data.dp !== null ? data.dp : (data.pc > 0 ? (data.c - data.pc) / data.pc * 100 : undefined); }
      } catch (e) { console.error('Stock price error:', row.t, e); }
    };

        const fetchCryptoPrice = async row => {
      const ticker = String(row.t).toUpperCase().trim();
      if (!ticker) return;
      if (STABLECOINS.includes(ticker)) { row.px = 1.00; row.pxChange = null; return; }
      
      // 1. Binance
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${ticker}USDT`);
        if (res.ok) { const data = await res.json(); if (data.lastPrice) { row.px = parseFloat(data.lastPrice); row.pxChange = parseFloat(data.priceChangePercent); return; } }
      } catch (e) {}

      // 2. MEXC
      try { 
        const res = await fetch(`https://api.mexc.com/api/v3/ticker/24hr?symbol=${ticker}USDT`); 
        if (res.ok) { const data = await res.json(); if (data.lastPrice) { row.px = parseFloat(data.lastPrice); row.pxChange = parseFloat(data.priceChangePercent) * 100; return; } } 
      } catch (e) {}

      // 3. Gate.io (Excelente para micro-caps y gemas)
      try {
        const res = await fetch(`https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${ticker}_USDT`);
        if (res.ok) { const data = await res.json(); if (data.length > 0 && data[0].last) { row.px = parseFloat(data[0].last); row.pxChange = parseFloat(data[0].change_percentage); return; } }
      } catch (e) {}

      // 4. KuCoin
      try {
        const res = await fetch(`https://api.kucoin.com/api/v1/market/stats?symbol=${ticker}-USDT`);
        if (res.ok) { const json = await res.json(); if (json.data && json.data.last) { row.px = parseFloat(json.data.last); row.pxChange = parseFloat(json.data.changeRate) * 100; return; } }
      } catch (e) {}

      // 5. CoinGecko Fallback (Busca globalmente por ticker o por el nombre completo si no está en exchanges)
      try {
        const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${ticker}`);
        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.coins && searchData.coins.length > 0) {
                const coinId = searchData.coins[0].id; // Toma el ID oficial interno de CoinGecko
                const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    if (priceData[coinId] && priceData[coinId].usd) {
                        row.px = parseFloat(priceData[coinId].usd);
                        row.pxChange = parseFloat(priceData[coinId].usd_24h_change || 0);
                        return;
                    }
                }
            }
        }
      } catch (e) {
         console.warn('No se pudo encontrar precio en ninguna API para:', ticker);
      }
    };

    try { await Promise.all([ ...SW.filter(r => r.t).map(fetchStockPrice), ...XT.filter(r => r.t).map(fetchStockPrice), ...CR.filter(r => r.t).map(fetchCryptoPrice) ]); } catch (e) {}
    recalc(false);
  }

  setInterval(fetchRealTimeData, 60_000);

  function toggleDrop() { document.getElementById('drop-pdf').classList.toggle('show'); }
  window.addEventListener('click', e => { if (!e.target.closest('.dropdown')) document.querySelectorAll('.drop-content').forEach(d => d.classList.remove('show')); });
  let repStart = '', repEnd = '';

  function openAssetModal() {
    const start = document.getElementById('start-date').value; const end = document.getElementById('end-date').value;
    if (!start || !end) { showToast(currentUiLang === 'en' ? '⚠️ Select both dates' : '⚠️ Selecciona ambas fechas'); return; }
    if (new Date(start) > new Date(end)) { showToast(currentUiLang === 'en' ? '⚠️ Start must be before End' : '⚠️ Inicio debe ser antes del fin'); return; }
    repStart = start; repEnd = end; document.querySelectorAll('.drop-content').forEach(d => d.classList.remove('show')); document.getElementById('repLangSelect').value = currentUiLang;
    document.getElementById('assetModalTitle').innerText = currentUiLang === 'en' ? '📑 Select Assets' : '📑 Seleccionar Activos';
    document.getElementById('assetModalDesc').innerText = currentUiLang === 'en' ? 'Choose assets and select report type.' : 'Elige los activos y el tipo de reporte.';
    document.getElementById('lblAllAssets').innerText = currentUiLang === 'en' ? 'Select All' : 'Seleccionar Todos';
    document.getElementById('btnGenHistorial').innerText = currentUiLang === 'en' ? 'Generate History (Tables only)' : 'Generar Historial (Solo Tablas)';
    document.getElementById('btnGenCompleto').innerText = currentUiLang === 'en' ? 'Generate Full Report (AI + Charts)' : 'Generar Reporte Completo (IA + Gráficas)';
    document.getElementById('btnCanAssetRep').innerText = currentUiLang === 'en' ? 'Cancel' : 'Cancelar';
    document.getElementById('lblRepLang').innerText = currentUiLang === 'en' ? 'PDF Lang:' : 'Idioma PDF:';
    document.getElementById('btnGenHistorial').style.background = currentUiLang === 'en' ? '#2ea043' : '#1f6feb'; document.getElementById('btnGenHistorial').style.borderColor = currentUiLang === 'en' ? '#3fb950' : '#388bfd';
    document.getElementById('btnGenCompleto').style.background = currentUiLang === 'en' ? '#1f6feb' : '#2ea043'; document.getElementById('btnGenCompleto').style.borderColor = currentUiLang === 'en' ? '#388bfd' : '#3fb950';

    const searchInput = document.getElementById('searchAssetInput'); searchInput.placeholder = currentUiLang === 'en' ? '🔍 Search asset...' : '🔍 Buscar activo...'; searchInput.value = '';
    const assetMap = new Map(); [...SW, ...XT, ...CR].forEach(a => { if (!a?.t) return; const ticker = String(a.t).toUpperCase(); const label = ['USDT','USDC','EUSD'].includes(ticker) && a.wallet ? `${ticker} (${a.wallet})` : ticker; assetMap.set(label, ticker); });
    const sortedLabels = Array.from(assetMap.keys()).sort(); const container = document.getElementById('assetCheckboxes');
    container.innerHTML = sortedLabels.length === 0 ? `<p style="color:var(--sub);font-size:0.8rem">${currentUiLang === 'en' ? 'No assets found.' : 'No hay activos registrados.'}</p>` : sortedLabels.map((label, i) => `<div class="asset-item modal-asset-row"><input type="checkbox" class="chk-asset-item" id="chk_${i}" value="${assetMap.get(label)}" checked><label for="chk_${i}">${label}</label></div>`).join('');
    document.getElementById('chkAllAssets').checked = true; document.getElementById('assetModal').style.display = 'flex';
  }

  function filterAssets() { const query = document.getElementById('searchAssetInput').value.toLowerCase(); document.querySelectorAll('.modal-asset-row').forEach(row => { row.style.display = row.querySelector('label').innerText.toLowerCase().includes(query) ? 'flex' : 'none'; }); }
  function closeAssetModal() { document.getElementById('assetModal').style.display = 'none'; }
  function toggleAllAssets(checked) { document.querySelectorAll('.modal-asset-row').forEach(row => { if (row.style.display !== 'none') row.querySelector('.chk-asset-item').checked = checked; }); }

  async function pedirReporte(tipo) {
    const selected = Array.from(document.querySelectorAll('.chk-asset-item:checked')).map(c => c.value);
    if (selected.length === 0) { showToast(currentUiLang === 'en' ? '⚠️ Select at least one asset' : '⚠️ Selecciona al menos un activo'); return; }
    const selectedLang = document.getElementById('repLangSelect').value; closeAssetModal(); const loadingScreen = document.getElementById('pdfLoading'); loadingScreen.style.display = 'flex';
    try {
      let url = `${PDF_FUNCTION_URL}?lang=${selectedLang}&start=${repStart}&end=${repEnd}`;
      if (tipo === 'historial') url += `&assets=${encodeURIComponent(selected.join(','))}`;
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      setTimeout(() => { loadingScreen.style.display = 'none'; const msg = tipo === 'completo' ? (currentUiLang === 'en' ? '✅ Full Report processing! Check Telegram.' : '✅ ¡Reporte Completo en proceso! Revisa Telegram.') : (currentUiLang === 'en' ? '✅ History processing! Check Telegram.' : '✅ ¡Historial en proceso! Revisa Telegram.'); showToast(msg); }, 2500);
    } catch (error) { loadingScreen.style.display = 'none'; showToast(currentUiLang === 'en' ? '❌ Network error.' : '❌ Error de red.'); }
  }
  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registered successfully!', reg))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
  }
