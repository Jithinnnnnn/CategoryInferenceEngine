/* =====================================================
   home.js — Automotive CRM Home & Dealership Voice AI
   ===================================================== */

// ── 1. Dealership Car Inventory Dataset ───────────────
const CAR_INVENTORY = [
  {
    id: 'car-seltos-2024',
    make: 'Kia',
    model: 'Seltos GT Line',
    year: 2024,
    category: 'suv',
    fuel: 'Petrol Turbo',
    transmission: '7-Speed DCT',
    mileage: '16.5 km/l',
    power: '160 PS',
    price: '₹19.45 Lakh',
    rawPrice: 1945000,
    status: 'sale',
    statusLabel: '🔥 On Sale Now',
    statusClass: 'car-status-sale',
    highlight: 'Level 2 ADAS · Panoramic Sunroof · Bose 8-Speaker Audio',
    color: 'Imperial Matte Blue',
    isSale: true,
    isElectric: false,
    isSuv: true,
    isSedan: false,
  },
  {
    id: 'car-modely-2024',
    make: 'Tesla',
    model: 'Model Y Long Range',
    year: 2024,
    category: 'electric',
    fuel: '100% Electric',
    transmission: 'Single-Speed AWD',
    mileage: '533 km Range',
    power: '384 hp',
    price: '$44,990',
    rawPrice: 44990,
    status: 'sale',
    statusLabel: '⚡ EV On Sale',
    statusClass: 'car-status-sale',
    highlight: 'Autopilot · 15" Touchscreen · 0-100 in 4.8s · Supercharging',
    color: 'Pearl White Multi-Coat',
    isSale: true,
    isElectric: true,
    isSuv: true,
    isSedan: false,
  },
  {
    id: 'car-creta-2024',
    make: 'Hyundai',
    model: 'Creta SX (O)',
    year: 2024,
    category: 'suv',
    fuel: '1.5L CRDi Diesel',
    transmission: '6-Speed Automatic',
    mileage: '19.1 km/l',
    power: '116 PS',
    price: '₹18.20 Lakh',
    rawPrice: 1820000,
    status: 'sale',
    statusLabel: '🏷️ Special Offer',
    statusClass: 'car-status-sale',
    highlight: 'Ventilated Seats · Dual Zone AC · Bluelink Connected Car',
    color: 'Ranger Khaki',
    isSale: true,
    isElectric: false,
    isSuv: true,
    isSedan: false,
  },
  {
    id: 'car-bmw3-2023',
    make: 'BMW',
    model: '330i M Sport',
    year: 2023,
    category: 'sedan',
    fuel: '2.0L TwinPower Turbo',
    transmission: '8-Speed Steptronic',
    mileage: '14.8 km/l',
    power: '258 hp',
    price: '$42,500',
    rawPrice: 42500,
    status: 'sale',
    statusLabel: '⭐ Certified Pre-Owned',
    statusClass: 'car-status-sale',
    highlight: 'M Aerodynamics · BMW Live Cockpit Professional · Harman Kardon',
    color: 'Portimao Blue',
    isSale: true,
    isElectric: false,
    isSuv: false,
    isSedan: true,
  },
  {
    id: 'car-nexon-2024',
    make: 'Tata',
    model: 'Nexon EV Empowered+',
    year: 2024,
    category: 'electric',
    fuel: '40.5 kWh EV Battery',
    transmission: 'Automatic e-Drive',
    mileage: '465 km Range',
    power: '143 PS',
    price: '₹17.15 Lakh',
    rawPrice: 1715000,
    status: 'sale',
    statusLabel: '🔥 On Sale Now',
    statusClass: 'car-status-sale',
    highlight: 'Vehicle-to-Vehicle Charging · 12.3" Cinematic Screen · 5-Star Safety',
    color: 'Empowered Oxide',
    isSale: true,
    isElectric: true,
    isSuv: true,
    isSedan: false,
  },
  {
    id: 'car-xuv700-2024',
    make: 'Mahindra',
    model: 'XUV700 AX7 Luxury',
    year: 2024,
    category: 'suv',
    fuel: 'mStallion Turbo AWD',
    transmission: '6-Speed Torque Converter',
    mileage: '13.0 km/l',
    power: '200 PS',
    price: '₹24.75 Lakh',
    rawPrice: 2475000,
    status: 'booked',
    statusLabel: '🔒 Booked (Delivery Pending)',
    statusClass: 'car-status-booked',
    highlight: '7-Seater · Sony 3D Sound · Dual 10.25" Screens · Smart Door Handles',
    color: 'Midnight Black',
    isSale: false,
    isElectric: false,
    isSuv: true,
    isSedan: false,
  },
  {
    id: 'car-merc-2024',
    make: 'Mercedes-Benz',
    model: 'C 200 Sedan',
    year: 2024,
    category: 'sedan',
    fuel: 'Mild-Hybrid Turbo',
    transmission: '9G-TRONIC Auto',
    mileage: '15.4 km/l',
    power: '204 hp',
    price: '$49,800',
    rawPrice: 49800,
    status: 'testdrive',
    statusLabel: '🏎️ Test Drive Ready',
    statusClass: 'car-status-testdrive',
    highlight: 'MBUX Navigation · Ambient Lighting 64 Colors · Panoramic Roof',
    color: 'Obsidian Black',
    isSale: false,
    isElectric: false,
    isSuv: false,
    isSedan: true,
  },
  {
    id: 'car-landcruiser-2025',
    make: 'Toyota',
    model: 'Land Cruiser 300 ZX',
    year: 2025,
    category: 'suv',
    fuel: '3.3L Twin-Turbo V6',
    transmission: '10-Speed Direct Shift',
    mileage: '10.2 km/l',
    power: '305 hp',
    price: '₹2.10 Crore',
    rawPrice: 21000000,
    status: 'preorder',
    statusLabel: '📦 Upcoming / Pre-Order',
    statusClass: 'car-status-preorder',
    highlight: 'Multi-Terrain Monitor · Full-time 4WD · Crawl Control',
    color: 'Precious White Pearl',
    isSale: false,
    isElectric: false,
    isSuv: true,
    isSedan: false,
  },
];

// ── 2. CRM Leads Initial Records ──────────────────────
const CRM_LEADS = [
  {
    id: 'LEAD-101',
    customer: 'Rajesh Sharma',
    phone: '+91 98201 44521',
    vehicle: 'Kia Seltos GT Line',
    channel: '🎙️ Voice AI Call',
    intent: 'Sales',
    status: 'Hot Lead',
    statusClass: 'lead-status-hot',
    time: '10 mins ago',
  },
  {
    id: 'LEAD-102',
    customer: 'Sarah Jenkins',
    phone: '+1 (415) 890-2341',
    vehicle: 'Tesla Model Y',
    channel: '🌐 Web Showroom',
    intent: 'Sales',
    status: 'Warm Lead',
    statusClass: 'lead-status-warm',
    time: '25 mins ago',
  },
  {
    id: 'LEAD-103',
    customer: 'Amit Patel',
    phone: '+91 99042 11984',
    vehicle: 'Hyundai Creta SX',
    channel: '🎙️ Voice AI Call',
    intent: 'Service',
    status: 'New',
    statusClass: 'lead-status-new',
    time: '1 hour ago',
  },
  {
    id: 'LEAD-104',
    customer: 'David Miller',
    phone: '+1 (312) 554-9912',
    vehicle: 'BMW 330i M Sport',
    channel: '📱 WhatsApp Lead',
    intent: 'Sales',
    status: 'Hot Lead',
    statusClass: 'lead-status-hot',
    time: '2 hours ago',
  },
  {
    id: 'LEAD-105',
    customer: 'Pooja Iyer',
    phone: '+91 97400 88219',
    vehicle: 'Tata Nexon EV',
    channel: '🎙️ Voice AI Call',
    intent: 'Sales',
    status: 'Warm Lead',
    statusClass: 'lead-status-warm',
    time: '3 hours ago',
  },
];

// ── 3. State Management ───────────────────────────────
let currentFilter = 'all';
let searchQuery = '';
let isListening = false;
let isSpeaking = false;
let speechRecognizer = null;

// ── 4. Render Car Inventory Grid ───────────────────────
function renderCars() {
  const container = document.getElementById('car-grid');
  if (!container) return;

  const filtered = CAR_INVENTORY.filter(car => {
    // Tab filter
    if (currentFilter === 'sale' && !car.isSale) return false;
    if (currentFilter === 'electric' && !car.isElectric) return false;
    if (currentFilter === 'suv' && !car.isSuv) return false;
    if (currentFilter === 'sedan' && !car.isSedan) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.fuel.toLowerCase().includes(q) ||
        car.price.toLowerCase().includes(q) ||
        car.highlight.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; color:var(--text-muted);">
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
        <h3>No matching vehicles found</h3>
        <p>Try clearing your search query or switching to another filter tab.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(car => `
    <div class="car-card fade-up">
      <div class="car-card-header">
        <span class="car-status-pill ${car.statusClass}">${car.statusLabel}</span>
        <div class="car-title-wrap">
          <div class="car-title">${car.make} ${car.model}</div>
          <span class="car-year">${car.year}</span>
        </div>
        <div class="car-subtitle">${car.highlight}</div>
      </div>

      <div class="car-body">
        <div class="car-specs-grid">
          <div class="car-spec-item" title="Fuel Engine">
            <span class="icon">⛽</span>
            <span>${car.fuel}</span>
          </div>
          <div class="car-spec-item" title="Transmission">
            <span class="icon">⚙️</span>
            <span>${car.transmission}</span>
          </div>
          <div class="car-spec-item" title="Efficiency / Range">
            <span class="icon">📈</span>
            <span>${car.mileage}</span>
          </div>
          <div class="car-spec-item" title="Engine Output">
            <span class="icon">⚡</span>
            <span>${car.power}</span>
          </div>
        </div>

        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">
          🎨 Finish: <strong style="color:var(--text-secondary);">${car.color}</strong>
        </div>

        <div class="car-price-row">
          <div>
            <div class="car-price-label">Dealership Price</div>
            <div class="car-price-val">${car.price}</div>
          </div>
          ${car.isSale ? '<span class="badge badge-sales">In Stock</span>' : '<span class="badge badge-other">Inquire</span>'}
        </div>

        <div class="car-card-actions">
          <button class="btn btn-primary btn-sm" onclick="bookTestDrive('${car.id}')">
            🚗 Test Drive
          </button>
          <button class="btn btn-secondary btn-sm" onclick="askVoiceAboutCar('${car.make} ${car.model}')">
            🎙️ Voice Query
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── 5. Render CRM Leads Table ─────────────────────────
function renderLeads() {
  const tbody = document.getElementById('crm-leads-tbody');
  if (!tbody) return;

  tbody.innerHTML = CRM_LEADS.map(lead => `
    <tr>
      <td>
        <strong style="color:var(--text-primary); font-size:0.9rem;">${lead.customer}</strong>
        <div style="font-size:0.75rem; color:var(--text-muted);">${lead.phone} • ${lead.time}</div>
      </td>
      <td>
        <span style="font-weight:600; color:var(--brand-secondary);">${lead.vehicle}</span>
      </td>
      <td>
        <span style="font-size:0.8rem; color:var(--text-secondary);">${lead.channel}</span>
      </td>
      <td>
        ${typeof intentBadge === 'function' ? intentBadge(lead.intent) : `<span class="badge">${lead.intent}</span>`}
      </td>
      <td>
        <span class="lead-status-pill ${lead.statusClass}">${lead.status}</span>
      </td>
      <td>
        <button class="btn btn-ghost" style="padding:4px 8px; font-size:0.75rem;" onclick="callLead('${lead.customer}', '${lead.vehicle}')">
          📞 Call
        </button>
      </td>
    </tr>
  `).join('');
}

// ── 6. Dealership Actions ─────────────────────────────
window.bookTestDrive = function(carId) {
  const car = CAR_INVENTORY.find(c => c.id === carId);
  if (!car) return;

  if (typeof showToast === 'function') {
    showToast('Test Drive Requested! 🚗', `We reserved a provisional slot for the ${car.make} ${car.model}. Our sales concierge will confirm.`, 'success');
  }

  // Add lead to CRM table dynamically
  CRM_LEADS.unshift({
    id: `LEAD-${Date.now().toString().slice(-4)}`,
    customer: 'Walk-in Prospect',
    phone: '+1 (555) 019-8321',
    vehicle: `${car.make} ${car.model}`,
    channel: '🚗 Showroom Request',
    intent: 'Sales',
    status: 'Hot Lead',
    statusClass: 'lead-status-hot',
    time: 'Just now',
  });
  renderLeads();

  // Animate counters
  const totalEl = document.getElementById('stat-total');
  if (totalEl) {
    const current = parseInt(totalEl.textContent, 10) || 18;
    totalEl.textContent = current + 1;
  }
};

window.askVoiceAboutCar = function(carName) {
  const input = document.getElementById('voice-text-input');
  if (input) {
    input.value = `Tell me about the ${carName} and check if it is on sale.`;
    handleVoiceInquiry(input.value);
  }
  // Scroll to voice agent
  const sec = document.getElementById('voice-agent-section');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
};

window.callLead = function(customer, vehicle) {
  if (typeof showToast === 'function') {
    showToast(`Calling ${customer}…`, `Initiating voice call about the ${vehicle}.`, 'info');
  }
  askVoiceAboutCar(vehicle);
};

// ── 7. AI Voice Agent (Speech-to-Text & Text-to-Speech) ─
function initVoiceAgent() {
  const micBtn = document.getElementById('mic-btn');
  const fallbackForm = document.getElementById('voice-fallback-form');
  const clearBtn = document.getElementById('btn-clear-voice');

  // Check Web Speech API support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.continuous = false;
    speechRecognizer.interimResults = false;
    speechRecognizer.lang = 'en-US';

    speechRecognizer.onstart = () => {
      isListening = true;
      updateVoiceUI('listening');
    };

    speechRecognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceInquiry(transcript);
    };

    speechRecognizer.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isListening = false;
      updateVoiceUI('idle');
      if (typeof showToast === 'function' && event.error !== 'no-speech') {
        showToast('Microphone Notice', `Mic status: ${event.error}. You can also type below!`, 'warning');
      }
    };

    speechRecognizer.onend = () => {
      isListening = false;
      if (!isSpeaking) updateVoiceUI('idle');
    };
  }

  // Mic click handler
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        updateVoiceUI('idle');
        return;
      }

      if (!speechRecognizer) {
        if (typeof showToast === 'function') {
          showToast('Speech Recognition', 'Microphone not supported in this browser. Please use the text input below!', 'warning');
        }
        document.getElementById('voice-text-input')?.focus();
        return;
      }

      if (isListening) {
        speechRecognizer.stop();
        isListening = false;
        updateVoiceUI('idle');
      } else {
        try {
          speechRecognizer.start();
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  // Quick Chips
  document.querySelectorAll('.voice-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) handleVoiceInquiry(query);
    });
  });

  // Fallback text form
  if (fallbackForm) {
    fallbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('voice-text-input');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      input.value = '';
      handleVoiceInquiry(text);
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const windowEl = document.getElementById('voice-stream-window');
      if (windowEl) {
        windowEl.innerHTML = `
          <div class="voice-bubble agent">
            <div class="voice-bubble-content">
              <strong>🤖 AutoSphere Voice Agent:</strong><br/>
              "Live conversation cleared. How else can I assist you with our cars or services?"
            </div>
          </div>
        `;
      }
      const badge = document.getElementById('voice-intent-badge');
      if (badge) badge.style.display = 'none';
    });
  }
}

// Update Visual UI State for Voice Agent
function updateVoiceUI(state) {
  const hud = document.getElementById('voice-hud');
  const micBtn = document.getElementById('mic-btn');
  const pill = document.getElementById('voice-status-pill');

  if (!hud || !micBtn || !pill) return;

  hud.classList.remove('active');
  micBtn.classList.remove('listening', 'speaking');
  pill.classList.remove('listening', 'speaking');

  if (state === 'listening') {
    hud.classList.add('active');
    micBtn.classList.add('listening');
    micBtn.innerHTML = '🛑';
    pill.classList.add('listening');
    pill.textContent = '🔴 Listening… Speak your question';
  } else if (state === 'classifying') {
    hud.classList.add('active');
    pill.textContent = '🧠 Analyzing Intent with Laya AI…';
  } else if (state === 'speaking') {
    hud.classList.add('active');
    micBtn.classList.add('speaking');
    micBtn.innerHTML = '🔊';
    pill.classList.add('speaking');
    pill.textContent = '🔊 Voice Agent Speaking…';
  } else {
    micBtn.innerHTML = '🎙️';
    pill.textContent = '⚪ Standby · Click to Talk';
  }
}

// ── 8. Process Voice Inquiries with NLP + Dealership AI ──
async function handleVoiceInquiry(userText) {
  if (!userText || !userText.trim()) return;

  // Append user bubble to transcript
  appendVoiceBubble('user', userText);
  updateVoiceUI('classifying');

  let predictedIntent = 'Sales';
  let confidence = 0.95;

  // 1. Call backend Laya classifier (/api/predict)
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: userText }),
    });
    if (res.ok) {
      const data = await res.json();
      predictedIntent = data.predicted_intent || 'Sales';
      confidence = data.confidence || 0.92;
    }
  } catch (err) {
    console.warn('API predict error, using contextual fallback:', err);
  }

  // Update intent indicator badge in header
  const badgeEl = document.getElementById('voice-intent-badge');
  if (badgeEl) {
    badgeEl.style.display = 'inline-block';
    badgeEl.innerHTML = typeof intentBadge === 'function' ? intentBadge(predictedIntent) : predictedIntent;
  }

  // 2. Formulate Smart Dealership Voice Response
  const spokenResponse = generateDealershipReply(userText, predictedIntent);

  // 3. Append Agent bubble to transcript
  appendVoiceBubble('agent', spokenResponse, predictedIntent, confidence);

  // 4. Speak response aloud using browser SpeechSynthesis
  speakText(spokenResponse);
}

// Generate contextual dealership voice answer
function generateDealershipReply(query, intent) {
  const lower = query.toLowerCase();

  // Cars on sale inquiry
  if (lower.includes('sale') || lower.includes('discount') || lower.includes('deal') || lower.includes('offer')) {
    const onSaleCars = CAR_INVENTORY.filter(c => c.isSale).map(c => `${c.make} ${c.model} at ${c.price}`);
    return `We currently have 5 great cars on sale: the ${onSaleCars.slice(0, 3).join(', ')}, and more. Would you like to schedule a test drive or hear the financing rates for any of these?`;
  }

  // Specific car inquiries
  if (lower.includes('seltos')) {
    return `The 2024 Kia Seltos GT Line is in stock and on sale for ₹19.45 Lakh! It features Level 2 ADAS, a panoramic sunroof, and a 160 horsepower Turbo engine. Shall I reserve a test drive slot for you?`;
  }
  if (lower.includes('tesla') || lower.includes('model y')) {
    return `The Tesla Model Y Long Range is available for $44,990 with 533 km of all-electric range and dual motor all-wheel drive. Supercharging is ready! Would you like to view delivery options?`;
  }
  if (lower.includes('creta')) {
    return `The 2024 Hyundai Creta SX Diesel Automatic is on sale at ₹18.20 Lakh with ventilated leather seats and Bluelink connected car tech. It delivers 19 kilometers per liter. Would you like to book an appointment?`;
  }
  if (lower.includes('bmw')) {
    return `The BMW 330i M Sport is priced at $42,500. It is a certified pre-owned unit with 258 horsepower and the full M aerodynamic package.`;
  }
  if (lower.includes('electric') || lower.includes('ev')) {
    return `We have excellent electric vehicles available right now: the Tesla Model Y with 533 km range, and the Tata Nexon EV Empowered Plus starting at ₹17.15 Lakh.`;
  }

  // Test drive request
  if (lower.includes('test drive') || lower.includes('drive') || lower.includes('appointment')) {
    return `I would be thrilled to book a test drive for you! We have slots available today at 3:00 PM and tomorrow at 11:00 AM. Which time suits you best?`;
  }

  // Intent: Service
  if (intent === 'Service' || lower.includes('service') || lower.includes('maintenance') || lower.includes('oil') || lower.includes('repair')) {
    return `I've routed this to our Certified Service Center. Our diagnostic technicians can inspect your vehicle and provide routine maintenance. What day would you like to bring your car in?`;
  }

  // Intent: Complaint
  if (intent === 'Complaint' || lower.includes('complaint') || lower.includes('problem') || lower.includes('issue') || lower.includes('upset')) {
    return `I am truly sorry to hear that you experienced an issue. I have escalated your ticket with highest priority to our dealership general manager for prompt resolution within two hours.`;
  }

  // General Sales default
  return `Thank you for your interest! AutoSphere Dealership has 8 premium vehicles in fleet, with 5 special deals on sale today. How can our sales advisors assist you further?`;
}

// Speak aloud using SpeechSynthesis
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    updateVoiceUI('idle');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.02;

  // Pick a smooth natural voice if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (englishVoice) utterance.voice = englishVoice;

  utterance.onstart = () => {
    isSpeaking = true;
    updateVoiceUI('speaking');
  };

  utterance.onend = () => {
    isSpeaking = false;
    updateVoiceUI('idle');
  };

  utterance.onerror = () => {
    isSpeaking = false;
    updateVoiceUI('idle');
  };

  window.speechSynthesis.speak(utterance);
}

// Append bubble to transcript
function appendVoiceBubble(sender, text, intent = null, confidence = null) {
  const windowEl = document.getElementById('voice-stream-window');
  if (!windowEl) return;

  const bubble = document.createElement('div');
  bubble.className = `voice-bubble ${sender}`;

  if (sender === 'user') {
    bubble.innerHTML = `
      <div class="voice-bubble-content">
        <strong>👤 You (Voice):</strong><br/>
        "${text}"
      </div>
    `;
  } else {
    bubble.innerHTML = `
      <div class="voice-bubble-content">
        <strong>🤖 AutoSphere Concierge:</strong><br/>
        "${text}"
        ${intent ? `
          <div class="voice-detected-tag">
            <span>Inferred Intent:</span>
            ${typeof intentBadge === 'function' ? intentBadge(intent) : `<span class="badge">${intent}</span>`}
            ${confidence ? `<span>(${(confidence * 100).toFixed(0)}% conf)</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  windowEl.appendChild(bubble);
  windowEl.scrollTop = windowEl.scrollHeight;
}

// ── 9. Animate Numbers Helper ─────────────────────────
function animateCounter(el, target, duration = 1200, suffix = '') {
  if (!el || isNaN(target)) return;
  const start = performance.now();
  const from = 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ── 10. Load Backend Stats & Health ────────────────────
async function loadStats() {
  try {
    const [analyticsRes, statusRes] = await Promise.all([
      fetch('/api/analytics'),
      fetch('/api/status'),
    ]);

    const analytics = await analyticsRes.json();
    const status    = await statusRes.json();

    const totalEl = document.getElementById('stat-total');
    const confEl  = document.getElementById('stat-confidence');

    if (totalEl && analytics.total) {
      animateCounter(totalEl, analytics.total);
    }
    if (confEl && analytics.confidence?.average) {
      animateCounter(confEl, analytics.confidence.average, 1200, '%');
    }

    // Update status dots
    updateStatusDot('status-raw',     status.raw_exists);
    updateStatusDot('status-cleaned', status.cleaned_exists);
    updateStatusDot('status-output',  status.output_exists);

  } catch (err) {
    console.warn('Stats load error:', err);
  }
}

function updateStatusDot(id, alive) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = alive ? 'var(--intent-sales)' : 'var(--intent-complaint)';
  el.title = alive ? 'File exists' : 'File not found';
}

// ── 11. Run Pipeline Trigger ───────────────────────────
async function runPipeline() {
  const btn = document.getElementById('btn-run-pipeline');
  if (!btn) return;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Syncing…';
  if (typeof showToast === 'function') {
    showToast('CRM Pipeline Triggered', 'Synchronizing conversation data with Laya intent engine…', 'info', 4000);
  }

  try {
    const res = await fetch('/api/run-pipeline', { method: 'POST' });
    const data = await res.json();

    if (data.status === 'ok') {
      if (typeof showToast === 'function') {
        showToast('Pipeline Synchronized ✅', `Updated ${data.summary.total_classified} conversation records.`, 'success');
      }
      await loadStats();
    } else {
      throw new Error(data.detail || 'Unknown error');
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('Sync Failed', err.message, 'error');
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '⚡ Sync AI Pipeline';
  }
}

// ── 12. Initialization ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Update inventory counts
  const countAll = document.getElementById('count-all');
  const countSale = document.getElementById('count-sale');
  const countEv = document.getElementById('count-ev');
  const countSuv = document.getElementById('count-suv');
  const countSedan = document.getElementById('count-sedan');

  if (countAll) countAll.textContent = CAR_INVENTORY.length;
  if (countSale) countSale.textContent = CAR_INVENTORY.filter(c => c.isSale).length;
  if (countEv) countEv.textContent = CAR_INVENTORY.filter(c => c.isElectric).length;
  if (countSuv) countSuv.textContent = CAR_INVENTORY.filter(c => c.isSuv).length;
  if (countSedan) countSedan.textContent = CAR_INVENTORY.filter(c => c.isSedan).length;

  // Render sections
  renderCars();
  renderLeads();
  initVoiceAgent();
  loadStats();

  // Tab Filtering
  document.querySelectorAll('.tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderCars();
    });
  });

  // Search input
  const searchInput = document.getElementById('car-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCars();
    });
  }

  // Pipeline button
  const runBtn = document.getElementById('btn-run-pipeline');
  if (runBtn) runBtn.addEventListener('click', runPipeline);

  // Pre-load voices for SpeechSynthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
});
