/* =====================================================
   app.js — Global Utilities (Toast, Spinner, Theme)
   ===================================================== */

// ── Toast System ──────────────────────────────────────
const TOAST_ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

function showToast(title, message = '', type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || 'ℹ️'}</span>
    <div>
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Active Nav Link ────────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === path || (path === '/' && href === '/') ||
                     (path !== '/' && href !== '/' && path.startsWith(href));
    link.classList.toggle('active', isActive);
  });
}

// ── Confidence Color Helper ────────────────────────────
function confColor(value) {
  if (value >= 0.75) return 'var(--intent-sales)';
  if (value >= 0.50) return 'var(--intent-service)';
  return 'var(--intent-complaint)';
}

// ── Format Confidence ──────────────────────────────────
function formatConf(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
}

// ── Badge HTML Generator ───────────────────────────────
function intentBadge(intent) {
  const map = {
    sales:     { cls: 'badge-sales',     icon: '🛒' },
    service:   { cls: 'badge-service',   icon: '🔧' },
    complaint: { cls: 'badge-complaint', icon: '⚠️' },
    other:     { cls: 'badge-other',     icon: '💬' },
    error:     { cls: 'badge-error',     icon: '❌' },
  };
  const key = (intent || 'other').toLowerCase();
  const meta = map[key] || map['other'];
  return `<span class="badge ${meta.cls}">${meta.icon} ${intent || 'Other'}</span>`;
}

// ── DOM Ready ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
});
