const API_URL = 'https://script.google.com/macros/s/AKfycbx2SGI4RnlWTEUshrNOXQimkGpvKY0IvkcCSyKlswgH5ubwE1tiRe7rHgjZCVOiuU07jA/exec';

let participants = [];
let originalParticipants = [];
let winners = [];
let isDrawing = false;

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    namesContainer: document.getElementById('names-container'),
    resultDisplay: document.getElementById('result-display'),
    rollingName: document.getElementById('rolling-name'),
    winnerName: document.getElementById('winner-name'),
    drawBtn: document.getElementById('draw-btn'),
    resetBtn: document.getElementById('reset-btn'),
    fullResetBtn: document.getElementById('full-reset-btn'),
    winnersSection: document.getElementById('winners-section'),
    winnersList: document.getElementById('winners-list')
};

// Initialize App
async function init() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
        
        const data = await response.json();
        
        // Extract names
        originalParticipants = data
            .map(item => item['이름'])
            .filter(name => name && name.trim() !== '');

        participants = [...originalParticipants];

        if (participants.length === 0) {
            throw new Error('시트에 참가자 이름이 없습니다.');
        }

        // Get the prize name from headers (keys)
        // Find the first key that is not empty, not '이름', and not 'Timestamp'
        const keys = Object.keys(data[0]);
        const prizeNameKey = keys.find(k => k !== '' && k !== '이름' && k !== 'Timestamp');
        
        if (prizeNameKey) {
            document.getElementById('prize-name').textContent = prizeNameKey;
        }

        renderNames();
        
        elements.loading.classList.add('hidden');
        elements.namesContainer.classList.remove('hidden');
        elements.drawBtn.classList.remove('hidden');

    } catch (err) {
        elements.loading.classList.add('hidden');
        elements.error.textContent = err.message;
        elements.error.classList.remove('hidden');
    }
}

// Render Names Grid
function renderNames() {
    elements.namesContainer.innerHTML = '';
    participants.forEach(name => {
        const badge = document.createElement('div');
        badge.className = 'name-badge';
        badge.textContent = name;
        elements.namesContainer.appendChild(badge);
    });
}

// Draw Logic
function startDraw() {
    if (isDrawing || participants.length === 0) return;
    
    isDrawing = true;
    
    // UI Updates
    elements.drawBtn.disabled = true;
    elements.namesContainer.classList.add('hidden');
    elements.resultDisplay.classList.remove('hidden');
    elements.rollingName.classList.remove('hidden');
    elements.winnerName.classList.add('hidden');
    elements.resetBtn.classList.add('hidden');
    elements.fullResetBtn.classList.add('hidden');

    const duration = 3000; // 3 seconds
    const interval = 50; // Change name every 50ms
    let startTime = Date.now();
    let rollInterval;

    // Play rolling animation
    rollInterval = setInterval(() => {
        const randomIdx = Math.floor(Math.random() * participants.length);
        elements.rollingName.textContent = participants[randomIdx];
        
        if (Date.now() - startTime >= duration) {
            clearInterval(rollInterval);
            finishDraw();
        }
    }, interval);
}

function finishDraw() {
    // Pick final winner
    const winnerIdx = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIdx];

    // Remove winner from participants pool and add to winners
    participants.splice(winnerIdx, 1);
    winners.push(winner);

    // Update Winners UI
    const winnerBadge = document.createElement('div');
    winnerBadge.className = 'winner-badge';
    winnerBadge.textContent = winner;
    elements.winnersList.appendChild(winnerBadge);
    elements.winnersSection.classList.remove('hidden');

    // UI Updates
    elements.rollingName.classList.add('hidden');
    
    elements.winnerName.textContent = winner;
    elements.winnerName.classList.remove('hidden');
    
    fireConfetti();

    // Show reset button
    elements.drawBtn.classList.add('hidden');
    elements.drawBtn.disabled = false;
    
    // Only show next draw if participants are left
    if (participants.length > 0) {
        elements.resetBtn.classList.remove('hidden');
    }
    elements.fullResetBtn.classList.remove('hidden');
    
    isDrawing = false;
}

function resetDraw() {
    elements.resultDisplay.classList.add('hidden');
    elements.winnerName.classList.add('hidden');
    
    // Update names grid to show remaining participants
    renderNames();
    elements.namesContainer.classList.remove('hidden');
    
    elements.resetBtn.classList.add('hidden');
    elements.fullResetBtn.classList.add('hidden');
    elements.drawBtn.classList.remove('hidden');
}

function fullReset() {
    // Reset data
    participants = [...originalParticipants];
    winners = [];
    
    // Reset UI
    elements.resultDisplay.classList.add('hidden');
    elements.winnerName.classList.add('hidden');
    elements.winnersSection.classList.add('hidden');
    elements.winnersList.innerHTML = '';
    
    renderNames();
    elements.namesContainer.classList.remove('hidden');
    
    elements.resetBtn.classList.add('hidden');
    elements.fullResetBtn.classList.add('hidden');
    elements.drawBtn.classList.remove('hidden');
    elements.drawBtn.disabled = false;
}

// Confetti Effect
function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#e11d48', '#be123c', '#881337', '#fde047']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#e11d48', '#be123c', '#881337', '#fde047']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Event Listeners
elements.drawBtn.addEventListener('click', startDraw);
elements.resetBtn.addEventListener('click', resetDraw);
elements.fullResetBtn.addEventListener('click', fullReset);

// Start
document.addEventListener('DOMContentLoaded', init);
