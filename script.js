// Tentukan pemenang
let names = [];
let currentRotation = 0;
let isSpinning = false;
let targetRotation = 0;
let animationId = null;
let selectedWinner = "";

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B500', '#6BCF7F', '#FF85A2', '#A8E6CF'
];

// Elemen DOM
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const updateBtn = document.getElementById('updateBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const clearBtn = document.getElementById('clearBtn');
const spinBtn = document.getElementById('spinBtn');
const winnerDisplay = document.getElementById('winnerDisplay');
const showWinnerToggle = document.getElementById('showWinnerToggle');
const soundToggle = document.getElementById('soundToggle');
const removeWinnerCheck = document.getElementById('removeWinnerCheck');
const confettiCheck = document.getElementById('confettiCheck');
const popupOverlay = document.getElementById('popupOverlay');
const popupWinnerName = document.getElementById('popupWinnerName');
const closePopup = document.getElementById('closePopup');
const popupShowWinnerToggle = document.getElementById('popupShowWinnerToggle');

canvas.width = 500;
canvas.height = 500;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 220;

// Parse nama dari textarea
function parseNames() {
    const text = nameInput.value.trim();
    if (!text) return [];
    return text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
}

// Update nama dan gambar roda
function updateWheel() {
    names = parseNames();
    if (names.length < 2) {
        alert('Minimal 2 nama diperlukan!');
        return;
    }
    drawWheel();
}

// Acak urutan nama
function shuffleNames() {
    const currentNames = parseNames();
    if (currentNames.length === 0) return;
    
    for (let i = currentNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentNames[i], currentNames[j]] = [currentNames[j], currentNames[i]];
    }
    
    nameInput.value = currentNames.join('\n');
    updateWheel();
}

// Hapus semua nama
function clearNames() {
    if (confirm('Hapus semua nama?')) {
        nameInput.value = '';
        names = [];
        drawWheel();
        winnerDisplay.textContent = 'Tekan SPIN!';
        selectedWinner = "";
    }
}

// Gambar roda
function drawWheel() {
    if (names.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#e0e0e0';
        ctx.fill();
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#666';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tambahkan Nama', centerX, centerY);
        return;
    }

    const numSlices = names.length;
    const anglePerSlice = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Gambar setiap slice
    for (let i = 0; i < numSlices; i++) {
        // Start dari atas (index 0 di posisi 12 o'clock)
        const startAngle = i * anglePerSlice - Math.PI / 2;
        const endAngle = startAngle + anglePerSlice;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(names[i], radius - 20, 7);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

// Spin roda
function spinWheel() {
    if (isSpinning) return;
    if (names.length < 2) {
        alert('Minimal 2 nama diperlukan!');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    winnerDisplay.textContent = '...';

    // 🎯 1. TENTUKAN PEMENANG DULU
    const winnerIndex = Math.floor(Math.random() * names.length);
    selectedWinner = names[winnerIndex];

    const numSlices = names.length;
    const anglePerSlice = 360 / numSlices;

    // Slice start dari -90deg (atas)
    const targetAngle =
        winnerIndex * anglePerSlice +
        anglePerSlice / 2;

    // 🎡 2. HITUNG ROTASI KE ARAH PEMENANG
    const spins = 6; // jumlah putaran penuh
    targetRotation =
        currentRotation +
        spins * 360 +
        (360 - targetAngle) -
        (currentRotation % 360);

    const startTime = Date.now();
    const duration = 4000;
    const startRotation = currentRotation;

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        currentRotation =
            startRotation + (targetRotation - startRotation) * ease;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentRotation = targetRotation % 360;
            finishSpin();
        }
    }

    animate();
}


// Selesai spin
function finishSpin() {
    isSpinning = false;
    spinBtn.disabled = false;

    // winner SUDAH PASTI BENAR
    updateWinnerDisplay();

    setTimeout(() => {
        showWinnerPopup();
        if (confettiCheck.checked) createConfetti();
    }, 300);

    if (removeWinnerCheck.checked) {
        setTimeout(removeWinner, 3500);
    }
}


// Tentukan pemenang


// Update tampilan pemenang di kotak (panel kanan)
function updateWinnerDisplay() {
    if (showWinnerToggle.checked) {
        winnerDisplay.textContent = selectedWinner;
        winnerDisplay.className = 'winner-name';
    } else {
        winnerDisplay.textContent = '🔒 Disembunyikan';
        winnerDisplay.className = 'hidden-winner';
    }
}

// Update tampilan pemenang di popup
function updatePopupWinnerDisplay() {
    if (!popupWinnerName || !selectedWinner) return;
    
    if (popupShowWinnerToggle && popupShowWinnerToggle.checked) {
        popupWinnerName.textContent = selectedWinner;
        popupWinnerName.style.fontSize = '56px';
        popupWinnerName.style.fontStyle = 'normal';
    } else {
        popupWinnerName.textContent = '🔒 Disembunyikan';
        popupWinnerName.style.fontSize = '42px';
        popupWinnerName.style.fontStyle = 'italic';
    }
}

// Tampilkan popup
function showWinnerPopup() {
    if (!selectedWinner) {
        console.error('Tidak ada pemenang yang dipilih!');
        return;
    }
    
    // Sinkronkan toggle popup dengan toggle utama
    if (popupShowWinnerToggle) {
        popupShowWinnerToggle.checked = showWinnerToggle.checked;
    }
    
    // Update tampilan popup dengan nama pemenang
    updatePopupWinnerDisplay();
    
    // Tampilkan popup
    popupOverlay.classList.add('show');
}

// Tutup popup
function hideWinnerPopup() {
    popupOverlay.classList.remove('show');
}

// Hapus pemenang
function removeWinner() {
    names = names.filter(name => name !== selectedWinner);
    nameInput.value = names.join('\n');
    drawWheel();
}

// Suara spin
function playSpinSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Confetti
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = '1';
            confetti.style.transform = 'rotate(0deg)';
            confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear`;
            confetti.style.zIndex = '9998';
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Event listener dasar
updateBtn.addEventListener('click', updateWheel);
shuffleBtn.addEventListener('click', shuffleNames);
clearBtn.addEventListener('click', clearNames);
spinBtn.addEventListener('click', spinWheel);
closePopup.addEventListener('click', hideWinnerPopup);

// Klik di luar popup untuk tutup
popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) hideWinnerPopup();
});

// Toggle di panel pengaturan
showWinnerToggle.addEventListener('change', () => {
    if (selectedWinner) {
        updateWinnerDisplay();
    }
});

// Inisialisasi - Load nama dari textarea dan gambar roda
document.addEventListener('DOMContentLoaded', () => {
    // Parse nama dari textarea yang sudah ada default value
    names = parseNames();
    drawWheel();
    
    // Toggle untuk show/hide pemenang di popup
    const popupToggle = document.getElementById('popupShowWinnerToggle');
    if (popupToggle) {
        popupToggle.addEventListener('change', () => {
            updatePopupWinnerDisplay();
        });
    }
    
    // Tombol hapus pemenang di popup
    const removeWinnerBtn = document.getElementById('removeWinnerBtn');
    if (removeWinnerBtn) {
        removeWinnerBtn.addEventListener('click', () => {
            if (!selectedWinner) return;

            if (!confirm(`Hapus "${selectedWinner}" dari daftar?`)) return;

            removeWinner();
            hideWinnerPopup();
            winnerDisplay.textContent = 'Tekan SPIN!';
            selectedWinner = "";
        });
    }
});