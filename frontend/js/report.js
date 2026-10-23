/* =====================================================
   report.js — Report Page: Charts, Table, Filters
   ===================================================== */

let allPredictions = [];
let intentChart = null;
let confChart   = null;

// ── Load Analytics Data ────────────────────────────────
async function loadAnalytics() {
  try {
    const res  = await fetch('/api/analytics');
    const data = await res.json();

    allPredictions = data.predictions || [];

    updateSummaryCards(data);
    renderIntentChart(data.intent_counts);
    renderConfChart(data.confidence.values || []);
    renderTable(allPredictions);
  } catch (err) {
    showToast('Load Error', 'Could not fetch analytics data. Run the pipeline first.', 'error');
    console.error(err);
  }
}

// ── Summary Cards ──────────────────────────────────────
function updateSummaryCards(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const counts = data.intent_counts || {};
  set('r-total',     data.total);
  set('r-avg-conf',  data.confidence.average + '%');
  set('r-min-conf',  data.confidence.min + '%');
  set('r-max-conf',  data.confidence.max + '%');
  set('r-sales',     counts['sales'] || 0);
  set('r-service',   counts['service'] || 0);
  set('r-complaint', counts['complaint'] || 0);
  set('r-other',     counts['Other'] || counts['other'] || 0);
}

// ── Intent Doughnut Chart ──────────────────────────────
function renderIntentChart(counts = {}) {
  const ctx = document.getElementById('chart-intent');
  if (!ctx) return;

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const COLORS = {
    sales:     'rgba(52,211,153,0.85)',
    service:   'rgba(56,189,248,0.85)',
    complaint: 'rgba(248,113,113,0.85)',
    Other:     'rgba(148,163,184,0.85)',
    Error:     'rgba(251,146,60,0.85)',
  };

  if (intentChart) intentChart.destroy();

  intentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(l => COLORS[l] || 'rgba(108,99,255,0.7)'),
        borderColor: 'transparent',
        borderRadius: 6,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94A3B8', padding: 16, font: { family: 'Inter', size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} conversations`
          }
        }
      }
    }
  });
}

// ── Confidence Histogram ───────────────────────────────
function renderConfChart(values = []) {
  const ctx = document.getElementById('chart-conf');
  if (!ctx || !values.length) return;

  // Build 10 buckets: 0–10%, 10–20%, ... 90–100%
  const buckets = Array(10).fill(0);
  values.forEach(v => {
    const idx = Math.min(Math.floor(v / 10), 9);
    buckets[idx]++;
  });

  const labels = buckets.map((_, i) => `${i * 10}–${(i + 1) * 10}%`);

  if (confChart) confChart.destroy();

  confChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Conversations',
        data: buckets,
        backgroundColor: 'rgba(108,99,255,0.55)',
        borderColor: 'rgba(108,99,255,0.9)',
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} conversation(s)`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94A3B8', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: { color: '#94A3B8', stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

// ── Data Table ─────────────────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById('report-tbody');
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:2.5rem;color:var(--text-muted);">
          No predictions yet. Run the pipeline from the Home page.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((row, i) => {
    const conf     = row.confidence;
    const confPct  = conf !== null && conf !== undefined ? (conf * 100).toFixed(1) : null;
    const confFill = confPct ? `<div class="conf-bar-wrap">
      <div class="conf-bar"><div class="conf-bar-fill" style="width:${confPct}%;background:${confColorVal(conf)}"></div></div>
      <span class="conf-text">${confPct}%</span>
    </div>` : '<span class="conf-text">N/A</span>';

    const shortTx = (row.transcript || '').replace(/\n/g, ' ').substring(0, 90);

    return `<tr>
      <td class="td-id">${row.conversation_id || '—'}</td>
      <td>${intentBadge(row.predicted_intent)}</td>
      <td>${confFill}</td>
      <td class="td-transcript" title="${(row.transcript || '').replace(/"/g,'&quot;')}">${shortTx}…</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewTranscript(${i})" id="view-btn-${i}">
          👁 View
        </button>
      </td>
    </tr>`;
  }).join('');
}

function confColorVal(v) {
  if (v >= 0.75) return 'var(--intent-sales)';
  if (v >= 0.5)  return 'var(--intent-service)';
  return 'var(--intent-complaint)';
}

// ── View Full Transcript Modal ─────────────────────────
function viewTranscript(idx) {
  const row = allPredictions[idx];
  if (!row) return;

  const modal = document.getElementById('transcript-modal');
  const body  = document.getElementById('modal-body');
  if (!modal || !body) return;

  const lines = (row.transcript || '').split('\n');
  const html = lines.map(line => {
    const isCustomer = line.toLowerCase().startsWith('customer:');
    const isAI       = line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('agent:');
    const cls = isCustomer ? 'user' : (isAI ? '' : '');
    return `<div class="chat-bubble ${isCustomer ? 'user' : ''}">
      <div class="chat-avatar">${isCustomer ? 'C' : 'AI'}</div>
      <div class="chat-text">${line}</div>
    </div>`;
  }).join('');

  body.innerHTML = `
    <div style="margin-bottom:1rem;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <code class="mono" style="color:var(--brand-secondary);">${row.conversation_id}</code>
      ${intentBadge(row.predicted_intent)}
      <span class="conf-text">Confidence: ${row.confidence ? (row.confidence * 100).toFixed(1) + '%' : 'N/A'}</span>
    </div>
    <div class="chat-window" style="max-height:360px;">${html}</div>
  `;

  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('transcript-modal');
  if (modal) modal.style.display = 'none';
}

// ── Search & Filter ────────────────────────────────────
function applyFilters() {
  const query   = (document.getElementById('search-input')?.value || '').toLowerCase();
  const active  = document.querySelector('.filter-btn.active')?.dataset.intent || 'all';

  const filtered = allPredictions.filter(row => {
    const matchIntent = active === 'all' || (row.predicted_intent || '').toLowerCase() === active;
    const matchQuery  = !query ||
      (row.conversation_id || '').toLowerCase().includes(query) ||
      (row.transcript      || '').toLowerCase().includes(query) ||
      (row.predicted_intent|| '').toLowerCase().includes(query);
    return matchIntent && matchQuery;
  });

  renderTable(filtered);

  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
}

// ── Export ─────────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(allPredictions, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'predictions.json' });
  a.click(); URL.revokeObjectURL(url);
  showToast('Exported', 'predictions.json downloaded.', 'success');
}

function exportCSV() {
  const headers = ['conversation_id', 'predicted_intent', 'confidence', 'transcript'];
  const rows    = allPredictions.map(r => [
    r.conversation_id,
    r.predicted_intent,
    r.confidence ?? '',
    (r.transcript || '').replace(/\n/g, ' ').replace(/,/g, ';')
  ]);

  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'predictions.csv' });
  a.click(); URL.revokeObjectURL(url);
  showToast('Exported', 'predictions.csv downloaded.', 'success');
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAnalytics();

  document.getElementById('search-input')?.addEventListener('input', applyFilters);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('transcript-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});
