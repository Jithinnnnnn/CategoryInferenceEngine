/* =====================================================
   bot.js — AI Bot Page: Interactive Conversation + Live Inference
   ===================================================== */

const SAMPLE_CONVOS = [
  {
    id: 'CONV_SALES_001',
    label: '🛒 Sales Inquiry',
    messages: [
      { speaker: 'customer', text: 'Hi, I am interested in purchasing a new SUV. What models do you offer?' },
      { speaker: 'ai',       text: 'Hello! We offer the Kia Seltos and Kia Sonet. Are you looking for a compact or mid-size?' },
      { speaker: 'customer', text: 'I want to check out the Kia Seltos. What is the starting price and available variants?' },
      { speaker: 'ai',       text: 'The Kia Seltos starts at around $24,490 and comes in multiple variants. Would you like to schedule a test drive?' },
      { speaker: 'customer', text: 'Yes, I would love to book a test drive for this weekend!' },
    ]
  },
  {
    id: 'CONV_SVC_001',
    label: '🔧 Service Request',
    messages: [
      { speaker: 'customer', text: 'My car has hit 10,000 km and I need to book a service.' },
      { speaker: 'ai',       text: 'Happy to help! A standard 10,000 km service includes oil change, filter check, tyre rotation, and a safety inspection.' },
      { speaker: 'customer', text: 'How long will it take and what is the cost estimate?' },
      { speaker: 'ai',       text: 'The service typically takes 2–3 hours. Cost estimate is around $80–120 depending on additional findings.' },
    ]
  },
  {
    id: 'CONV_CMP_001',
    label: '⚠️ Complaint',
    messages: [
      { speaker: 'customer', text: 'I had my car serviced two weeks ago and the same problem has come back. This is unacceptable!' },
      { speaker: 'ai',       text: 'I sincerely apologise for the inconvenience. Could you share your service reference number?' },
      { speaker: 'customer', text: 'It is SR-2024-4891. The noise from the engine is back — I want a proper resolution this time.' },
      { speaker: 'ai',       text: 'I understand your frustration. I am escalating this to our technical team immediately and will have someone call you within 2 hours.' },
    ]
  },
];

// ── State ──────────────────────────────────────────────
let currentMessages = [];
let isInferring = false;

// ── Render Chat Window ─────────────────────────────────
function renderChat() {
  const window_ = document.getElementById('chat-window');
  if (!window_) return;

  if (!currentMessages.length) {
    window_.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  height:100%;gap:1rem;color:var(--text-muted);text-align:center;">
        <div style="font-size:3rem;">💬</div>
        <div style="font-size:0.9rem;">Load a sample or type a message to begin</div>
      </div>`;
    return;
  }

  window_.innerHTML = currentMessages.map(msg => {
    const isUser = msg.speaker === 'customer';
    const label  = isUser ? 'C' : msg.speaker === 'ai' ? 'AI' : 'AG';
    return `
      <div class="chat-bubble ${isUser ? 'user' : ''}">
        <div class="chat-avatar">${label}</div>
        <div class="chat-text">${msg.text}</div>
      </div>`;
  }).join('');

  window_.scrollTop = window_.scrollHeight;
}

// ── Load Sample Conversation ───────────────────────────
function loadSample(idx) {
  const sample = SAMPLE_CONVOS[idx];
  if (!sample) return;

  currentMessages = [...sample.messages];
  renderChat();
  clearResult();

  document.querySelectorAll('.sample-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });

  showToast('Sample Loaded', `"${sample.label}" — ready to classify.`, 'info');
}

// ── Add Custom Message ─────────────────────────────────
function addMessage() {
  const speakerEl = document.getElementById('msg-speaker');
  const textEl    = document.getElementById('msg-text');
  if (!speakerEl || !textEl) return;

  const speaker = speakerEl.value;
  const text    = textEl.value.trim();

  if (!text) {
    showToast('Empty Message', 'Please type something before adding.', 'warning');
    return;
  }

  currentMessages.push({ speaker, text });
  textEl.value = '';
  renderChat();
  clearResult();
}

// ── Clear Conversation ─────────────────────────────────
function clearConversation() {
  currentMessages = [];
  renderChat();
  clearResult();
  document.querySelectorAll('.sample-btn').forEach(b => b.classList.remove('active'));
}

// ── Clear Result Panel ─────────────────────────────────
function clearResult() {
  const panel = document.getElementById('result-panel');
  if (panel) panel.classList.remove('visible');
}

// ── Build Transcript from Messages ────────────────────
function buildTranscript() {
  return currentMessages
    .map(m => `${m.speaker.charAt(0).toUpperCase() + m.speaker.slice(1)}: ${m.text}`)
    .join('\n');
}

// ── Run Live Inference ─────────────────────────────────
async function runInference() {
  if (isInferring) return;

  const btn = document.getElementById('btn-classify');
  if (!btn) return;

  if (!currentMessages.length) {
    showToast('No Conversation', 'Add messages or load a sample first.', 'warning');
    return;
  }

  const customerMsgs = currentMessages.filter(m => m.speaker === 'customer');
  if (!customerMsgs.length) {
    showToast('No Customer Messages', 'At least one customer message is required.', 'warning');
    return;
  }

  isInferring = true;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Classifying…';
  clearResult();

  const transcript = buildTranscript();

  try {
    const res  = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || 'Inference failed');

    showResult(data.predicted_intent, data.confidence);
    showToast('Classified! ✅', `Intent: ${data.predicted_intent}`, 'success');

  } catch (err) {
    showToast('Inference Error', err.message, 'error');
    console.error(err);
  } finally {
    isInferring = false;
    btn.disabled = false;
    btn.innerHTML = '⚡ Classify Intent';
  }
}

// ── Show Result ────────────────────────────────────────
function showResult(intent, confidence) {
  const panel    = document.getElementById('result-panel');
  const badgeEl  = document.getElementById('result-badge');
  const meterFil = document.getElementById('result-meter-fill');
  const confText = document.getElementById('result-conf-text');
  const descEl   = document.getElementById('result-desc');

  if (!panel) return;

  const DESCRIPTIONS = {
    sales:     'The customer is primarily interested in purchasing a vehicle, exploring pricing, variants, offers, financing, or booking a test drive.',
    service:   'The customer is inquiring about vehicle maintenance, routine servicing, repairs, or technical questions without a complaint.',
    complaint: 'The customer is dissatisfied and is reporting poor service quality, delays, damage, or an unresolved issue requiring escalation.',
    Other:     'The conversation does not clearly fall into a sales, service, or complaint category — may be a greeting, general enquiry, or off-topic.',
  };

  if (badgeEl)  badgeEl.innerHTML = intentBadge(intent);

  const confPct = confidence !== null && confidence !== undefined ? confidence * 100 : null;

  if (meterFil) {
    setTimeout(() => {
      meterFil.style.width = confPct ? `${confPct}%` : '0%';
      meterFil.style.background = confPct >= 75 ? 'var(--intent-sales)'
                                : confPct >= 50 ? 'var(--intent-service)'
                                : 'var(--intent-complaint)';
    }, 50);
  }

  if (confText) confText.textContent = confPct ? `${confPct.toFixed(1)}% confidence` : 'Confidence: N/A';
  if (descEl)   descEl.textContent = DESCRIPTIONS[intent] || DESCRIPTIONS['Other'];

  panel.classList.add('visible');
}

// ── Build Sample Buttons ───────────────────────────────
function buildSampleButtons() {
  const container = document.getElementById('sample-buttons');
  if (!container) return;

  SAMPLE_CONVOS.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost sample-btn';
    btn.id = `sample-btn-${i}`;
    btn.textContent = s.label;
    btn.addEventListener('click', () => loadSample(i));
    container.appendChild(btn);
  });
}

// ── Handle URL Params (sample from home page) ──────────
function handleQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const raw    = params.get('sample');
  if (!raw) return;

  try {
    const sample = JSON.parse(decodeURIComponent(raw));
    if (sample.text) {
      currentMessages = [{ speaker: 'customer', text: sample.text }];
      renderChat();
    }
  } catch {}
}

// ── Enter Key on Textarea ──────────────────────────────
function handleTextareaKey(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    addMessage();
  }
}

// ── Init ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSampleButtons();
  handleQueryParams();
  renderChat();

  document.getElementById('btn-add-msg')?.addEventListener('click', addMessage);
  document.getElementById('btn-clear')?.addEventListener('click', clearConversation);
  document.getElementById('btn-classify')?.addEventListener('click', runInference);
  document.getElementById('msg-text')?.addEventListener('keydown', handleTextareaKey);
});
