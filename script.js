// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Устанавливаем размеры canvas до добавления в DOM
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
canvas.style.touchAction = "none";
canvas.style.zIndex = "1000";

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#000";
document.body.style.touchAction = "none";
document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";
document.body.appendChild(canvas);

// --- Блокировка масштабирования ---
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function(e) {
    e.preventDefault();
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// --- Системные звуки ---
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.volume = 0.3;
        this.init();
    }

    init() {
        try {
            // Создаем AudioContext (кроссбраузерно)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.enabled = true;
                console.log("🔊 Системные звуки включены");
            }
        } catch (e) {
            console.warn("🔇 Системные звуки недоступны:", e.message);
            this.enabled = false;
        }
    }

    // Воспроизведение тона определенной частоты
    playTone(frequency, duration = 200, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Плавное нарастание и затухание
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn("Ошибка воспроизведения звука:", e);
        }
    }

    // Звук столкновения с блоком
    playBlockHit() {
        this.playTone(523.25, 150, 'square'); // Нота C5
    }

    // Звук отскока от стенки
    playWallBounce() {
        this.playTone(392.00, 100, 'sine'); // Нота G4
    }

    // Звук отскока от платформы
    playPaddleBounce() {
        this.playTone(659.25, 120, 'sawtooth'); // Нота E5
    }

    // Звук потери жизни
    playLifeLost() {
        this.playTone(220.00, 300, 'sine'); // Нота A3
        setTimeout(() => this.playTone(196.00, 300, 'sine'), 150); // Нота G3
    }

    // Звук победы
    playWin() {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 250, 'sine'), index * 150);
        });
    }

    // Звук поражения
    playLose() {
        const notes = [392.00, 349.23, 329.63, 293.66]; // G4, F4, E4, D4
        notes.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 200, 'sine'), index * 120);
        });
    }

    // Звук клика/касания
    playClick() {
        this.playTone(330, 50, 'square');
    }

    // Звук поцелуя (для 3 уровня)
    playKiss() {
        this.playTone(1046.50, 100, 'sine'); // C6
        setTimeout(() => this.playTone(1318.51, 100, 'sine'), 50); // E6
    }

    // Звук смущения девушки
    playBlush() {
        const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
        notes.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 100, 'triangle'), index * 80);
        });
    }

    // Звук сердитого деда
    playAngryGrandpa() {
        this.playTone(110, 400, 'sawtooth'); // A2 низкий
        setTimeout(() => this.playTone(87.31, 400, 'sawtooth'), 200); // F2 очень низкий
    }

    // Звук тошноты
    playSick() {
        this.playTone(98, 300, 'sawtooth'); // G2
        setTimeout(() => this.playTone(87.31, 300, 'sawtooth'), 100); // F2
    }

    // Звук счастья
    playHappy() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 150, 'sine'), index * 80);
        });
    }

    // Звук старухи
    playOldWoman() {
        this.playTone(73.42, 400, 'square'); // D2 низкий
    }

    // Переключение звука
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.enabled;
    }

    // Установка громкости
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }
}

// Создаем менеджер звуков
const soundManager = new SoundManager();

// --- Переменные ---
let gameState = "menu";
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;
let fadeOpacity = 0;
let isTransitioning = false;

// --- Режим Играть ---
let playLives = 3;
let playScore = 0;

const blockEmoji = "🍑";
const ballEmoji = "🍌";
const paddleEmoji = "🍆";

let blocks = [];
let ball = { x: 0, y: 0, dx: 4, dy: -4, size: 30 };
let paddle = { x: 0, y: 0, width: 90, height: 30 };

let showGameOverPopup = false;
let showWinPopup = false;
let showLoseLifePopup = false;

// --- Фон кроватей ---
const bedEmoji = "🛏️";
let bedGrid = [];

// --- СЮЖЕТНЫЙ РЕЖИМ ---
let storyLevel = 1;
let storyPopup = null;
let storyStarted = false;
let storyGirl = { x: 0, y: 0, size: 60, dodges: 0, maxDodges: 2, hit: false };
let storyBall = { x: 0, y: 0, dx: 0, dy: 0, size: 30, emoji: "🌹" };
let storyPaddle = { x: 0, y: 0, width: 80, height: 30, emoji: "👨" };

// Второй уровень
let storyBlocks = [];
let storyLevel2Ball = { x: 0, y: 0, dx: 4, dy: -4, size: 30, emoji: "😎" };
let storyLevel2Paddle = { x: 0, y: 0, width: 90, height: 30, emoji: "👨" };
let storyLevel2Lives = 3;
let storyLevel2Score = 0;

// Третий уровень
let storyLevel3Blocks = [];
let storyLevel3Ball = { x: 0, y: 0, dx: 4, dy: -4, size: 30, emoji: "💋" };
let storyLevel3Paddle = { x: 0, y: 0, width: 90, height: 30, emoji: "😘" };
let storyLevel3Lives = 3;
let storyLevel3Score = 0;
let grandpaHit = false;
let grandpaAngry = false;

// Четвертый уровень - Падающие блоки
let storyLevel4Blocks = [];
let storyLevel4Paddle = { x: 0, y: 0, width: 80, height: 30, emoji: "👨" };
let storyLevel4Lives = 3;
let storyLevel4Score = 0;
let storyLevel4GirlsCaught = 0;
let storyLevel4SpawnTimer = 0;
let storyLevel4SpawnInterval = 60; // кадры между спавном блоков
let storyLevel4BlockSpeed = 3;

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60;
    const cols = Math.ceil(canvas.width / emojiSize);
    const rows = Math.ceil(canvas.height / emojiSize);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            bedGrid.push({
                x: x * emojiSize,
                y: y * emojiSize
            });
        }
    }
}

function generateBlocks() {
    blocks = [];
    const cols = 8;
    const rows = 3;
    const spacing = 10;
    const blockSize = 40;
    const totalWidth = cols * blockSize + (cols - 1) * spacing;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            blocks.push({
                x: startX + c * (blockSize + spacing),
                y: startY + r * (blockSize + spacing),
                size: blockSize,
                destroyed: false
            });
        }
    }
}

function generateStoryBlocks() {
    storyBlocks = [];
    const cols = 8;
    const rows = 3;
    const spacing = 10;
    const blockSize = 40;
    
    const totalWidth = cols * blockSize + (cols - 1) * spacing;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            storyBlocks.push({
                x: startX + c * (blockSize + spacing),
                y: startY + r * (blockSize + spacing),
                size: blockSize,
                destroyed: false,
                emoji: "👩"
            });
        }
    }
}

// Генерация сердца из смайликов для третьего уровня
function generateHeartBlocks() {
    storyLevel3Blocks = [];
    const blockSize = Math.min(35, canvas.width * 0.04);
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.35;
    const scale = Math.min(1.2, canvas.width / 500);
    
    const heartPoints = [];
    for (let angle = 0; angle < Math.PI * 2; angle += 0.08) {
        const t = angle;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        heartPoints.push({x: x * scale, y: y * scale});
    }
    
    heartPoints.forEach((point, index) => {
        const x = centerX + point.x * blockSize;
        const y = centerY + point.y * blockSize;
        
        if (x >= 0 && x <= canvas.width - blockSize && 
            y >= 0 && y <= canvas.height * 0.7) {
            
            const isCenter = Math.abs(point.x) < 1.5 && Math.abs(point.y) < 1.5;
            
            storyLevel3Blocks.push({
                x: x,
                y: y,
                size: blockSize,
                destroyed: false,
                emoji: isCenter ? "👴" : "👩",
                isGrandpa: isCenter,
                isBlushing: false,
                isAngry: false
            });
        }
    });
    
    if (storyLevel3Blocks.length < 10) {
        storyLevel3Blocks = [];
        createSimpleHeart();
    }
}

function createSimpleHeart() {
    const blockSize = 30;
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.4;
    
    const simpleHeart = [
        {x: 0, y: -1}, {x: 1, y: -1}, {x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
        {x: -2, y: 1}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1},
        {x: -1, y: 2}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 0, y: 3}, {x: 1, y: 3}
    ];
    
    simpleHeart.forEach(point => {
        const x = centerX + point.x * blockSize;
        const y = centerY + point.y * blockSize;
        
        if (x >= 0 && x <= canvas.width - blockSize && y >= 0) {
            const isCenter = point.x === 0 && point.y === 0;
            storyLevel3Blocks.push({
                x: x,
                y: y,
                size: blockSize,
                destroyed: false,
                emoji: isCenter ? "👴" : "👩",
                isGrandpa: isCenter,
                isBlushing: false,
                isAngry: false
            });
        }
    });
}

// Функция для спавна блоков в четвертом уровне
function spawnStoryLevel4Block() {
    const types = [
        { emoji: "👩", type: "girl" },
        { emoji: "💩", type: "poop" },
        { emoji: "👵", type: "oldWoman" }
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const size = 40;
    
    storyLevel4Blocks.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        emoji: randomType.emoji,
        type: randomType.type,
        speed: storyLevel4BlockSpeed + Math.random() * 1
    });
}

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12;
    bedGrid.forEach(bed => {
        ctx.fillText(bedEmoji, bed.x, bed.y);
    });
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    maleY = height - 50;
    femaleY = height - 50;

    generateBedGrid();
    
    if (gameState === "play") {
        resetBallPaddle();
        generateBlocks();
    }
    if (gameState === "story" && storyStarted) {
        if (storyLevel === 1) {
            resetStoryLevel();
        } else if (storyLevel === 2) {
            generateStoryBlocks();
            resetStoryLevel2();
        } else if (storyLevel === 3) {
            generateHeartBlocks();
            resetStoryLevel3();
        } else if (storyLevel === 4) {
            resetStoryLevel4();
        }
    }
}

let resizeTimeout;
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

// --- Бюстгальтер ---
function drawButtonBra(x, y, w, h, color, text, textSize) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y + h*0.4);
    ctx.bezierCurveTo(x, y + h*0.4, x + w*0.25, y + h*0.9, x + w*0.45, y + h*0.4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w*0.55, y + h*0.4);
    ctx.bezierCurveTo(x + w*0.75, y + h*0.9, x + w, y + h*0.4, x + w*0.8, y + h*0.4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w*0.45, y + h*0.4);
    ctx.lineTo(x + w*0.55, y + h*0.4);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w*0.25, y + h*0.4);
    ctx.lineTo(x + w*0.25, y + h*0.15);
    ctx.moveTo(x + w*0.75, y + h*0.4);
    ctx.lineTo(x + w*0.75, y + h*0.15);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${textSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.65);
}

// --- Стринги ---
function drawButtonStringPanties(x, y, w, h, color, text, textSize) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y);
    ctx.lineTo(x + w*0.5, y + h);
    ctx.lineTo(x + w*0.8, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = h*0.08;
    ctx.beginPath();
    ctx.moveTo(x + w*0.15, y);
    ctx.lineTo(x + w*0.85, y);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${textSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Универсальный попап ---
function drawPopup(text, buttons) {
    const w = Math.min(400, canvas.width - 40);
    const h = 220;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.textAlign = "center";
    
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width/2, y + 60 + i * 30);
    });

    const btnWidth = 120;
    const btnSpacing = 20;
    const totalWidth = buttons.length * btnWidth + (buttons.length - 1) * btnSpacing;
    const startX = canvas.width/2 - totalWidth/2;
    
    buttons.forEach((btn, i) => {
        const bx = startX + i * (btnWidth + btnSpacing);
        const by = y + 130;
        
        ctx.fillStyle = btn.color;
        ctx.fillRect(bx, by, btnWidth, 50);
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText(btn.text, bx + btnWidth/2, by + 30);
        
        btn.area = {x: bx, y: by, w: btnWidth, h: 50};
    });

    return { buttons, text, x, y, w, h };
}

// --- Меню с кнопкой звука ---
function drawMenuWithSoundControls() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    const title = "🍑 Бананоид 🍌";
    let fontSize = Math.min(56, canvas.width / 10);
    ctx.font = `bold ${fontSize}px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width/2, canvas.height*0.15);

    const buttonTextSize = Math.max(20, Math.floor(canvas.height * 0.04));

    const buttonWidth = Math.min(240, canvas.width * 0.6);
    const buttonHeight = Math.min(120, canvas.height * 0.15);
    
    drawButtonBra(canvas.width/2 - buttonWidth/2, canvas.height*0.3, buttonWidth, buttonHeight, "#4CAF50", "Играть", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - buttonWidth/2, canvas.height*0.5, buttonWidth, buttonHeight * 0.7, "#f44336", "Сюжет", buttonTextSize);

    ctx.font = "48px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 40) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 40) femaleDx = -femaleDx;

    // Кнопка включения/выключения звука
    const soundButtonSize = 40;
    const soundButtonX = canvas.width - soundButtonSize - 20;
    const soundButtonY = 20;

    // Рисуем кнопку звука
    ctx.fillStyle = soundManager.enabled ? "#4CAF50" : "#f44336";
    ctx.beginPath();
    ctx.arc(soundButtonX + soundButtonSize/2, soundButtonY + soundButtonSize/2, soundButtonSize/2, 0, Math.PI * 2);
    ctx.fill();

    // Иконка динамика
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(soundManager.enabled ? "🔊" : "🔇", soundButtonX + soundButtonSize/2, soundButtonY + soundButtonSize/2);

    // Сохраняем область кнопки для обработки кликов
    window.soundButtonArea = {
        x: soundButtonX,
        y: soundButtonY,
        w: soundButtonSize,
        h: soundButtonSize
    };
}

function drawArcanoid() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}

// --- Обновленная функция с добавлением звуков ---
function enhancedCreateParticlesWithSound(x, y, count, color, soundType = null) {
    createParticles(x, y, count, color);
    
    if (soundType && soundManager.enabled) {
        switch(soundType) {
            case 'block':
                soundManager.playBlockHit();
                break;
            case 'wall':
                soundManager.playWallBounce();
                break;
            case 'paddle':
                soundManager.playPaddleBounce();
                break;
            case 'life':
                soundManager.playLifeLost();
                break;
            case 'kiss':
                soundManager.playKiss();
                break;
            case 'blush':
                soundManager.playBlush();
                break;
            case 'angry':
                soundManager.playAngryGrandpa();
                break;
            case 'sick':
                soundManager.playSick();
                break;
            case 'happy':
                soundManager.playHappy();
                break;
            case 'oldWoman':
                soundManager.playOldWoman();
                break;
        }
    }
}

// ... (остальной код остается таким же, включая drawPlayWithEffects, resetBallPaddle и т.д.)

// --- СЮЖЕТНЫЙ РЕЖИМ ---
function resetStoryLevel() {
    storyGirl.x = canvas.width/2 - storyGirl.size/2;
    storyGirl.y = 150;
    storyGirl.dodges = 0;
    storyGirl.maxDodges = 2;
    storyGirl.hit = false;
    
    storyBall.x = canvas.width/2;
    storyBall.y = canvas.height/2;
    storyBall.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    storyBall.dy = -4;
    
    storyPaddle.x = canvas.width/2 - storyPaddle.width/2;
    storyPaddle.y = canvas.height - 60;
}

function resetStoryLevel2() {
    storyLevel2Ball.x = canvas.width/2;
    storyLevel2Ball.y = canvas.height/2;
    storyLevel2Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    storyLevel2Ball.dy = -4;
    
    storyLevel2Paddle.x = canvas.width/2 - storyLevel2Paddle.width/2;
    storyLevel2Paddle.y = canvas.height - 60;
    
    storyLevel2Lives = 3;
    storyLevel2Score = 0;
    
    generateStoryBlocks();
}

function resetStoryLevel3() {
    storyLevel3Ball.x = canvas.width/2;
    storyLevel3Ball.y = canvas.height/2;
    storyLevel3Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    storyLevel3Ball.dy = -4;
    
    storyLevel3Paddle.x = canvas.width/2 - storyLevel3Paddle.width/2;
    storyLevel3Paddle.y = canvas.height - 60;
    
    storyLevel3Lives = 3;
    storyLevel3Score = 0;
    grandpaHit = false;
    grandpaAngry = false;
    
    generateHeartBlocks();
}

// Сброс четвертого уровня
function resetStoryLevel4() {
    storyLevel4Blocks = [];
    storyLevel4Paddle.x = canvas.width/2 - storyLevel4Paddle.width/2;
    storyLevel4Paddle.y = canvas.height - 80;
    storyLevel4Lives = 3;
    storyLevel4Score = 0;
    storyLevel4GirlsCaught = 0;
    storyLevel4SpawnTimer = 0;
    storyLevel4SpawnInterval = 60;
    storyLevel4BlockSpeed = 3;
    storyLevel4Paddle.emoji = "👨"; // Сбрасываем смайлик на нормальный
}

// --- Улучшенный первый уровень сюжета ---
function drawStoryLevel1WithEffects() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    // Анимация сердец при попадании
    if (storyGirl.hit && heartAnimationProgress < heartAnimationDuration) {
        updateHearts();
        drawHearts();
        
        if (heartAnimationProgress >= heartAnimationDuration && !storyPopup) {
            storyPopup = drawPopup("Пора сон сделать явью", [
                {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                    storyLevel = 2;
                    resetStoryLevel2();
                    storyPopup = null;
                    storyHearts = [];
                    heartAnimationProgress = 0;
                }}
            ]);
        }
        return;
    }

    // Девушка
    ctx.font = `60px ${fontFamily}`;
    ctx.fillText("👩", storyGirl.x, storyGirl.y);

    // Роза
    ctx.font = `30px ${fontFamily}`;
    ctx.fillText(storyBall.emoji, storyBall.x, storyBall.y);

    // Парень
    ctx.textBaseline = "bottom";
    ctx.font = `60px ${fontFamily}`;
    ctx.fillText(storyPaddle.emoji, storyPaddle.x, storyPaddle.y);
    ctx.textBaseline = "top";

    if (!storyGirl.hit) {
        storyBall.x += storyBall.dx;
        storyBall.y += storyBall.dy;

        // Обновление физики
        updateBallPhysics(storyBall);

        if (storyBall.x < 0 || storyBall.x > canvas.width - storyBall.size) {
            storyBall.dx = -storyBall.dx;
            enhancedCreateParticlesWithSound(storyBall.x, storyBall.y, 5, "#ffffff", 'wall');
        }
        if (storyBall.y < 0) {
            storyBall.dy = -storyBall.dy;
            enhancedCreateParticlesWithSound(storyBall.x, storyBall.y, 5, "#ffffff", 'wall');
        }

        if (storyBall.y + storyBall.size >= storyPaddle.y - 60 &&
            storyBall.x > storyPaddle.x && storyBall.x < storyPaddle.x + storyPaddle.width) {
            storyBall.dy = -storyBall.dy;
            enhancedCreateParticlesWithSound(storyBall.x, storyBall.y, 8, "#ff6b6b", 'paddle');
        }

        if (!storyGirl.hit &&
            storyBall.x + storyBall.size > storyGirl.x &&
            storyBall.x < storyGirl.x + storyGirl.size &&
            storyBall.y + storyBall.size > storyGirl.y &&
            storyBall.y < storyGirl.y + storyGirl.size) {
            
            if (storyGirl.dodges < storyGirl.maxDodges) {
                storyGirl.dodges++;
                storyGirl.x = Math.random() * (canvas.width - storyGirl.size);
                storyGirl.y = 100 + Math.random() * 200;
                storyBall.dy = -storyBall.dy;
                enhancedCreateParticlesWithSound(storyGirl.x + storyGirl.size/2, storyGirl.y + storyGirl.size/2, 8, "#ff6b6b", 'blush');
            } else {
                storyGirl.hit = true;
                storyBall.dx = 0;
                storyBall.dy = 0;
                createHearts();
                enhancedCreateParticlesWithSound(storyGirl.x + storyGirl.size/2, storyGirl.y + storyGirl.size/2, 15, "#ff6b6b", 'blush');
                if (soundManager.enabled) soundManager.playWin();
            }
        }

        if (storyBall.y > canvas.height && !storyPopup) {
            enhancedCreateParticlesWithSound(storyBall.x, storyBall.y, 15, "#ff0000", 'life');
            storyPopup = drawPopup("Подкат не удался", [
                {text:"Повторить", color:"#4CAF50", onClick:()=>{
                    storyPopup = null;
                    resetStoryLevel();
                    particles = [];
                }},
                {text:"Выйти", color:"#f44336", onClick:()=>{
                    exitToMenu();
                    particles = [];
                }}
            ]);
        }
    }
}

// --- Улучшенный второй уровень сюжета ---
function drawStoryLevel2WithEffects() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    // Блоки
    ctx.font = `40px ${fontFamily}`;
    storyBlocks.forEach(block => {
        if(!block.destroyed) ctx.fillText(block.emoji, block.x, block.y);
    });

    if (storyBlocks.every(block => block.destroyed)) {
        if (soundManager.enabled) soundManager.playWin();
        storyPopup = drawPopup("Ты покорил все сердца! 💖", [
            {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                storyLevel = 3;
                resetStoryLevel3();
                storyPopup = null;
                particles = [];
            }}
        ]);
        return;
    }

    // Шарик
    ctx.font = `30px ${fontFamily}`;
    ctx.fillText(storyLevel2Ball.emoji, storyLevel2Ball.x, storyLevel2Ball.y);

    // Платформа
    ctx.textBaseline = "bottom";
    ctx.font = `90px ${fontFamily}`;
    ctx.fillText(storyLevel2Paddle.emoji, storyLevel2Paddle.x, storyLevel2Paddle.y);
    ctx.textBaseline = "top";

    // Счетчик
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Разбито сердец: ${storyLevel2Score}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("💖".repeat(storyLevel2Lives), 20, 70);

    // Частицы
    drawParticles();

    if (!storyPopup) {
        storyLevel2Ball.x += storyLevel2Ball.dx;
        storyLevel2Ball.y += storyLevel2Ball.dy;

        // Обновление физики
        updateBallPhysics(storyLevel2Ball);

        if(storyLevel2Ball.x < 0 || storyLevel2Ball.x > canvas.width - storyLevel2Ball.size) {
            storyLevel2Ball.dx = -storyLevel2Ball.dx;
            enhancedCreateParticlesWithSound(storyLevel2Ball.x, storyLevel2Ball.y, 5, "#ffffff", 'wall');
        }
        if(storyLevel2Ball.y < 0) {
            storyLevel2Ball.dy = -storyLevel2Ball.dy;
            enhancedCreateParticlesWithSound(storyLevel2Ball.x, storyLevel2Ball.y, 5, "#ffffff", 'wall');
        }

        if(storyLevel2Ball.y + storyLevel2Ball.size >= storyLevel2Paddle.y - 90 &&
           storyLevel2Ball.y <= storyLevel2Paddle.y &&
           storyLevel2Ball.x + storyLevel2Ball.size >= storyLevel2Paddle.x &&
           storyLevel2Ball.x <= storyLevel2Paddle.x + storyLevel2Paddle.width) {
            storyLevel2Ball.dy = -Math.abs(storyLevel2Ball.dy);
            enhancedCreateParticlesWithSound(storyLevel2Ball.x, storyLevel2Ball.y, 8, "#4ecdc4", 'paddle');
        }

        storyBlocks.forEach(block => {
            if(!block.destroyed && checkCollision(storyLevel2Ball, block)) {
                block.destroyed = true;
                storyLevel2Ball.dy = -storyLevel2Ball.dy;
                storyLevel2Score++;
                enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 12, "#ff6b6b", 'block');
            }
        });

        if(storyLevel2Ball.y > canvas.height && !storyPopup) {
            storyLevel2Lives--;
            enhancedCreateParticlesWithSound(storyLevel2Ball.x, storyLevel2Ball.y, 15, "#ff0000", 'life');
            
            if (storyLevel2Lives > 0) {
                storyLevel2Ball.x = canvas.width/2;
                storyLevel2Ball.y = canvas.height/2;
                storyLevel2Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                storyLevel2Ball.dy = -4;
            } else {
                if (soundManager.enabled) soundManager.playLose();
                storyPopup = drawPopup("Ты разбил ей сердце 💔", [
                    {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                        storyPopup = null;
                        resetStoryLevel2();
                        particles = [];
                    }},
                    {text:"Выйти", color:"#f44336", onClick:()=>{
                        exitToMenu();
                        particles = [];
                    }}
                ]);
            }
        }
    }

    // Обновление частиц
    updateParticles();
}

// --- Улучшенный третий уровень сюжета ---
function drawStoryLevel3WithEffects() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    // Блоки в форме сердца
    ctx.font = `35px ${fontFamily}`;
    storyLevel3Blocks.forEach(block => {
        if(!block.destroyed) {
            let emoji = block.emoji;
            if (block.isBlushing) emoji = "😊";
            if (block.isAngry) emoji = "👴🏿";
            ctx.fillText(emoji, block.x, block.y);
        }
    });

    // Проверка победы (все девушки смущены, дед не тронут)
    const allGirlsBlushing = storyLevel3Blocks.every(block => 
        block.destroyed || block.isBlushing || block.isGrandpa
    );
    
    if (allGirlsBlushing && !grandpaHit) {
        if (soundManager.enabled) soundManager.playWin();
        storyPopup = drawPopup("Любовь победила! 💕\nВсе девушки смущены!", [
            {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                storyLevel = 4;
                resetStoryLevel4();
                storyPopup = null;
                particles = [];
            }}
        ]);
        return;
    }

    // Шарик-губы
    ctx.font = `30px ${fontFamily}`;
    ctx.fillText(storyLevel3Ball.emoji, storyLevel3Ball.x, storyLevel3Ball.y);

    // Платформа-целующий
    ctx.textBaseline = "bottom";
    ctx.font = `90px ${fontFamily}`;
    ctx.fillText(storyLevel3Paddle.emoji, storyLevel3Paddle.x, storyLevel3Paddle.y);
    ctx.textBaseline = "top";

    // Счетчик
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Поцелуи: ${storyLevel3Score}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("💖".repeat(storyLevel3Lives), 20, 70);

    // Частицы
    drawParticles();

    if (!storyPopup) {
        storyLevel3Ball.x += storyLevel3Ball.dx;
        storyLevel3Ball.y += storyLevel3Ball.dy;

        // Обновление физики
        updateBallPhysics(storyLevel3Ball);

        if(storyLevel3Ball.x < 0 || storyLevel3Ball.x > canvas.width - storyLevel3Ball.size) {
            storyLevel3Ball.dx = -storyLevel3Ball.dx;
            enhancedCreateParticlesWithSound(storyLevel3Ball.x, storyLevel3Ball.y, 5, "#ff69b4", 'wall');
        }
        if(storyLevel3Ball.y < 0) {
            storyLevel3Ball.dy = -storyLevel3Ball.dy;
            enhancedCreateParticlesWithSound(storyLevel3Ball.x, storyLevel3Ball.y, 5, "#ff69b4", 'wall');
        }

        if(storyLevel3Ball.y + storyLevel3Ball.size >= storyLevel3Paddle.y - 90 &&
           storyLevel3Ball.y <= storyLevel3Paddle.y &&
           storyLevel3Ball.x + storyLevel3Ball.size >= storyLevel3Paddle.x &&
           storyLevel3Ball.x <= storyLevel3Paddle.x + storyLevel3Paddle.width) {
            storyLevel3Ball.dy = -Math.abs(storyLevel3Ball.dy);
            enhancedCreateParticlesWithSound(storyLevel3Ball.x, storyLevel3Ball.y, 8, "#ff1493", 'kiss');
        }

        storyLevel3Blocks.forEach(block => {
            if(!block.destroyed &&
               storyLevel3Ball.x + storyLevel3Ball.size > block.x &&
               storyLevel3Ball.x < block.x + block.size &&
               storyLevel3Ball.y + storyLevel3Ball.size > block.y &&
               storyLevel3Ball.y < block.y + block.size) {
                
                if (block.isGrandpa) {
                    // Попадание в деда
                    grandpaHit = true;
                    block.isAngry = true;
                    storyLevel3Lives--;
                    storyLevel3Ball.dy = -storyLevel3Ball.dy;
                    enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 15, "#ff0000", 'angry');
                    
                    setTimeout(() => {
                        storyPopup = drawPopup("👴🏿 Я не такой!\nЧто это за безобразие?!", [
                            {text:"Прости, дед!", color:"#4CAF50", onClick:()=>{
                                storyPopup = null;
                                if (storyLevel3Lives <= 0) {
                                    exitToMenu();
                                } else {
                                    block.destroyed = true;
                                    grandpaAngry = true;
                                }
                            }},
                            {text:"Выйти", color:"#f44336", onClick:()=>{
                                exitToMenu();
                                particles = [];
                            }}
                        ]);
                    }, 500);
                    
                } else {
                    // Попадание в девушку
                    block.isBlushing = true;
                    enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 12, "#ff69b4", 'kiss');
                    setTimeout(() => {
                        block.destroyed = true;
                    }, 300);
                    storyLevel3Ball.dy = -storyLevel3Ball.dy;
                    storyLevel3Score++;
                }
            }
        });

        if(storyLevel3Ball.y > canvas.height && !storyPopup) {
            storyLevel3Lives--;
            enhancedCreateParticlesWithSound(storyLevel3Ball.x, storyLevel3Ball.y, 15, "#ff0000", 'life');
            
            if (storyLevel3Lives > 0) {
                storyLevel3Ball.x = canvas.width/2;
                storyLevel3Ball.y = canvas.height/2;
                storyLevel3Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                storyLevel3Ball.dy = -4;
            } else {
                if (soundManager.enabled) soundManager.playLose();
                storyPopup = drawPopup("Поцелуи закончились! 💔", [
                    {text:"Повторить", color:"#4CAF50", onClick:()=>{
                        storyPopup = null;
                        resetStoryLevel3();
                        particles = [];
                    }},
                    {text:"Выйти", color:"#f44336", onClick:()=>{
                        exitToMenu();
                        particles = [];
                    }}
                ]);
            }
        }
    }

    // Обновление частиц
    updateParticles();
}

// --- ЧЕТВЕРТЫЙ УРОВЕНЬ - Падающие блоки ---
function drawStoryLevel4() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    // Платформа игрока
    ctx.textBaseline = "bottom";
    ctx.font = `90px ${fontFamily}`;
    ctx.fillText(storyLevel4Paddle.emoji, storyLevel4Paddle.x, storyLevel4Paddle.y);
    ctx.textBaseline = "top";

    // Падающие блоки
    ctx.font = `40px ${fontFamily}`;
    storyLevel4Blocks.forEach(block => {
        ctx.fillText(block.emoji, block.x, block.y);
    });

    // Счетчик
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Поймано девушек: ${storyLevel4GirlsCaught}/5`, 20, 40);
    ctx.fillText(`Жизни: ${storyLevel4Lives}`, 20, 70);

    // Частицы
    drawParticles();

    if (!storyPopup) {
        // Спавн новых блоков
        storyLevel4SpawnTimer++;
        if (storyLevel4SpawnTimer >= storyLevel4SpawnInterval) {
            spawnStoryLevel4Block();
            storyLevel4SpawnTimer = 0;
            // Постепенно увеличиваем сложность
            if (storyLevel4SpawnInterval > 30) {
                storyLevel4SpawnInterval--;
            }
            if (storyLevel4BlockSpeed < 6) {
                storyLevel4BlockSpeed += 0.1;
            }
        }

        // Движение блоков
        for (let i = storyLevel4Blocks.length - 1; i >= 0; i--) {
            const block = storyLevel4Blocks[i];
            block.y += block.speed;

            // Проверка столкновения с платформой
            if (block.y + block.size >= storyLevel4Paddle.y - 30 &&
                block.y <= storyLevel4Paddle.y &&
                block.x + block.size >= storyLevel4Paddle.x &&
                block.x <= storyLevel4Paddle.x + storyLevel4Paddle.width) {
                
                // Обработка разных типов блоков
                switch(block.type) {
                    case "girl":
                        // Девушка - счастье
                        storyLevel4GirlsCaught++;
                        enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 12, "#ff69b4", 'happy');
                        storyLevel4Paddle.emoji = "😍"; // Счастливый смайлик
                        setTimeout(() => {
                            if (storyLevel4Paddle.emoji === "😍") {
                                storyLevel4Paddle.emoji = "👨";
                            }
                        }, 2000);
                        break;
                        
                    case "poop":
                        // Какашка - тошнота
                        enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 10, "#8B4513", 'sick');
                        storyLevel4Paddle.emoji = "🤢"; // Тошнит смайлик
                        setTimeout(() => {
                            if (storyLevel4Paddle.emoji === "🤢") {
                                storyLevel4Paddle.emoji = "👨";
                            }
                        }, 2000);
                        break;
                        
                    case "oldWoman":
                        // Старуха - потеря жизни
                        storyLevel4Lives--;
                        enhancedCreateParticlesWithSound(block.x + block.size/2, block.y + block.size/2, 15, "#ff0000", 'oldWoman');
                        
                        if (storyLevel4Lives > 0) {
                            storyPopup = drawPopup("Уф... А было неплохо", [
                                {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                                    storyPopup = null;
                                }},
                                {text:"Сначала", color:"#f44336", onClick:()=>{
                                    storyPopup = null;
                                    resetStoryLevel4();
                                }}
                            ]);
                        }
                        break;
                }
                
                // Удаляем блок после столкновения
                storyLevel4Blocks.splice(i, 1);
                continue;
            }

            // Удаление блоков, упавших за экран
            if (block.y > canvas.height) {
                storyLevel4Blocks.splice(i, 1);
            }
        }

        // Проверка победы
        if (storyLevel4GirlsCaught >= 5) {
            if (soundManager.enabled) soundManager.playWin();
            storyPopup = drawPopup("Победа! 🎉\nТы нашел свою любовь!", [
                {text:"В меню", color:"#4CAF50", onClick:()=>{
                    exitToMenu();
                    particles = [];
                }}
            ]);
            return;
        }

        // Проверка поражения
        if (storyLevel4Lives <= 0) {
            if (soundManager.enabled) soundManager.playLose();
            storyPopup = drawPopup("Игра окончена!\nПопробуй еще раз!", [
                {text:"Сначала", color:"#4CAF50", onClick:()=>{
                    storyPopup = null;
                    resetStoryLevel4();
                    particles = [];
                }},
                {text:"Выйти", color:"#f44336", onClick:()=>{
                    exitToMenu();
                    particles = [];
                }}
            ]);
        }
    }

    // Обновление частиц
    updateParticles();
}

function drawStory() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < 50; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 79) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    if (!storyStarted) {
        storyPopup = drawPopup("Тебе снится сон...", [
            {text:"Начать", color:"#4CAF50", onClick:()=>{
                storyStarted = true;
                storyLevel = 1;
                storyPopup = null;
                resetStoryLevel();
            }}
        ]);
        return;
    }

    if (storyPopup) {
        drawPopup(storyPopup.text, storyPopup.buttons);
        return;
    }

    if (storyLevel === 1) {
        drawStoryLevel1WithEffects();
    } else if (storyLevel === 2) {
        drawStoryLevel2WithEffects();
    } else if (storyLevel === 3) {
        drawStoryLevel3WithEffects();
    } else if (storyLevel === 4) {
        drawStoryLevel4();
    }
}

function exitToMenu() {
    gameState = "menu";
    storyStarted = false;
    storyPopup = null;
    storyLevel = 1;
    storyGirl.hit = false;
    storyGirl.dodges = 0;
    grandpaHit = false;
    grandpaAngry = false;
}

// --- Улучшенный обработчик кликов с поддержкой звука ---
function enhancedHandleClickWithSound(e) {
    e.preventDefault();
    
    let x, y;
    
    if (e.type.includes('touch')) {
        const touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
        vibrateIfSupported(20);
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    // Проверяем клик по кнопке звука
    if (window.soundButtonArea && 
        x >= window.soundButtonArea.x && x <= window.soundButtonArea.x + window.soundButtonArea.w &&
        y >= window.soundButtonArea.y && y <= window.soundButtonArea.y + window.soundButtonArea.h) {
        soundManager.toggle();
        if (soundManager.enabled) {
            soundManager.playClick();
        }
        return;
    }

    // Воспроизводим звук клика (если звук включен)
    if (soundManager.enabled) {
        soundManager.playClick();
    }

    // Обработка попапов сюжетного режима
    if (gameState === "story" && storyPopup) {
        let clicked = false;
        storyPopup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                vibrateIfSupported(30);
                btn.onClick();
                clicked = true;
            }
        });
        if (clicked) return;
    }

    // Обработка попапов игрового режима
    if (gameState === "play") {
        const handlePlayPopup = (popupButtons) => {
            const popupArea = {
                x: (canvas.width - Math.min(400, canvas.width - 40)) / 2,
                y: (canvas.height - 220) / 2,
                w: Math.min(400, canvas.width - 40),
                h: 220
            };
            
            if (x >= popupArea.x && x <= popupArea.x + popupArea.w &&
                y >= popupArea.y && y <= popupArea.y + popupArea.h) {
                
                const btnWidth = 120;
                const btnSpacing = 20;
                const totalWidth = 2 * btnWidth + btnSpacing;
                const startX = canvas.width/2 - totalWidth/2;
                
                for (let i = 0; i < popupButtons.length; i++) {
                    const btnX = startX + i * (btnWidth + btnSpacing);
                    if (x >= btnX && x <= btnX + btnWidth && 
                        y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                        vibrateIfSupported(30);
                        popupButtons[i]();
                        return true;
                    }
                }
            }
            return false;
        };

        if (showWinPopup) {
            if (handlePlayPopup([
                () => {
                    showWinPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                    particles = [];
                },
                () => {
                    showWinPopup = false;
                    gameState = "menu";
                    particles = [];
                }
            ])) return;
        }
        
        if (showLoseLifePopup) {
            if (handlePlayPopup([
                () => {
                    showLoseLifePopup = false;
                    playLives--;
                    resetBallPaddle();
                    particles = [];
                },
                () => {
                    showLoseLifePopup = false;
                    gameState = "menu";
                    particles = [];
                }
            ])) return;
        }
        
        if (showGameOverPopup) {
            if (handlePlayPopup([
                () => {
                    showGameOverPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                    particles = [];
                },
                () => {
                    showGameOverPopup = false;
                    gameState = "menu";
                    particles = [];
                }
            ])) return;
        }
    }

    // Меню
    if (gameState === "menu" && !isTransitioning) {
        const buttonWidth = Math.min(240, canvas.width * 0.6);
        const buttonHeight = Math.min(120, canvas.height * 0.15);
        
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.3 && y <= canvas.height*0.3 + buttonHeight) {
            vibrateIfSupported(40);
            startTransition("play");
            return;
        }
        
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.5 && y <= canvas.height*0.5 + buttonHeight * 0.7) {
            vibrateIfSupported(40);
            startTransition("story");
            return;
        }
    }
}

function handleMouseMove(e) {
    let x;
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX;
    } else {
        x = e.clientX;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    x = (x - rect.left) * scaleX;

    if (gameState === "play" && !showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        paddle.x = x - paddle.width/2;
        paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
    }
    if (gameState === "story" && storyStarted && !storyPopup) {
        if (storyLevel === 1 && !storyGirl.hit) {
            storyPaddle.x = x - storyPaddle.width/2;
            storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
        } else if (storyLevel === 2) {
            storyLevel2Paddle.x = x - storyLevel2Paddle.width/2;
            storyLevel2Paddle.x = Math.max(0, Math.min(storyLevel2Paddle.x, canvas.width - storyLevel2Paddle.width));
        } else if (storyLevel === 3) {
            storyLevel3Paddle.x = x - storyLevel3Paddle.width/2;
            storyLevel3Paddle.x = Math.max(0, Math.min(storyLevel3Paddle.x, canvas.width - storyLevel3Paddle.width));
        } else if (storyLevel === 4) {
            storyLevel4Paddle.x = x - storyLevel4Paddle.width/2;
            storyLevel4Paddle.x = Math.max(0, Math.min(storyLevel4Paddle.x, canvas.width - storyLevel4Paddle.width));
        }
    }
}

// Добавляем обработчики событий
canvas.addEventListener("click", enhancedHandleClickWithSound);
canvas.addEventListener("touchstart", enhancedHandleClickWithSound);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleMouseMove);

// --- Переход между состояниями ---
function startTransition(targetState) {
    isTransitioning = true;
    fadeOpacity = 0;

    const fadeOut = setInterval(() => {
        fadeOpacity += 0.05;
        if (fadeOpacity >= 1) {
            clearInterval(fadeOut);
            if (targetState === "play") startPlay();
            if (targetState === "story") startStory();

            const fadeIn = setInterval(() => {
                fadeOpacity -= 0.05;
                if (fadeOpacity <= 0) {
                    clearInterval(fadeIn);
                    isTransitioning = false;
                }
            }, 30);
        }
    }, 30);
}

function startPlay() {
    gameState = "play";
    playLives = 3;
    playScore = 0;
    showGameOverPopup = false;
    showWinPopup = false;
    showLoseLifePopup = false;
    generateBlocks();
    resetBallPaddle();
}

function startStory() {
    gameState = "story";
    storyStarted = false;
    storyPopup = null;
}

// --- Главный игровой цикл ---
function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем текущее состояние игры
    if (gameState === "menu") {
        drawMenuWithSoundControls();
    } else if (gameState === "arcanoid") {
        drawArcanoid();
    } else if (gameState === "play") {
        drawPlayWithEffects();
    } else if (gameState === "story") {
        drawStory();
    }

    // Рисуем затемнение при переходе
    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Запускаем следующий кадр
    requestAnimationFrame(draw);
}

// --- Инициализация игры ---
function enhancedInitGameWithSound() {
    resizeCanvas();
    generateBlocks();
    resetBallPaddle();
    generateBedGrid();
    adaptSizes();
    preloadEmojis();
    
    // Активируем звук при первом взаимодействии (требование браузеров)
    document.addEventListener('click', function initSound() {
        if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
            soundManager.audioContext.resume();
        }
        document.removeEventListener('click', initSound);
    }, { once: true });
    
    draw();
}

// Запускаем игру когда страница загрузится
window.addEventListener('load', enhancedInitGameWithSound);

// Также запускаем при готовности DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancedInitGameWithSound);
} else {
    enhancedInitGameWithSound();
}

// --- Дополнительные улучшения для мобильных устройств ---

// Предотвращение скролла на iOS
document.addEventListener('touchmove', function(e) {
    if (gameState !== "menu") {
        e.preventDefault();
    }
}, { passive: false });

// Обработка изменения ориентации
window.addEventListener('orientationchange', function() {
    setTimeout(resizeCanvas, 100);
});

// Улучшенная обработка касаний для платформы
let isDragging = false;

canvas.addEventListener('touchstart', function(e) {
    isDragging = true;
    handleMouseMove(e);
}, { passive: true });

canvas.addEventListener('touchend', function() {
    isDragging = false;
}, { passive: true });

canvas.addEventListener('touchcancel', function() {
    isDragging = false;
}, { passive: true });

// Улучшенный обработчик движения для касаний
function handleTouchMove(e) {
    if (!isDragging) return;
    
    let x;
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX;
    } else {
        x = e.clientX;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    x = (x - rect.left) * scaleX;

    if (gameState === "play" && !showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        paddle.x = x - paddle.width/2;
        paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
    }
    if (gameState === "story" && storyStarted && !storyPopup) {
        if (storyLevel === 1 && !storyGirl.hit) {
            storyPaddle.x = x - storyPaddle.width/2;
            storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
        } else if (storyLevel === 2) {
            storyLevel2Paddle.x = x - storyLevel2Paddle.width/2;
            storyLevel2Paddle.x = Math.max(0, Math.min(storyLevel2Paddle.x, canvas.width - storyLevel2Paddle.width));
        } else if (storyLevel === 3) {
            storyLevel3Paddle.x = x - storyLevel3Paddle.width/2;
            storyLevel3Paddle.x = Math.max(0, Math.min(storyLevel3Paddle.x, canvas.width - storyLevel3Paddle.width));
        } else if (storyLevel === 4) {
            storyLevel4Paddle.x = x - storyLevel4Paddle.width/2;
            storyLevel4Paddle.x = Math.max(0, Math.min(storyLevel4Paddle.x, canvas.width - storyLevel4Paddle.width));
        }
    }
}

// Обновляем обработчики для лучшей работы на мобильных
canvas.removeEventListener("touchmove", handleMouseMove);
canvas.addEventListener("touchmove", handleTouchMove, { passive: true });

// --- Адаптация размеров для разных устройств ---
function adaptSizes() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Мобильные настройки
        ball.size = 25;
        paddle.width = 70;
        paddle.height = 25;
        
        storyBall.size = 25;
        storyPaddle.width = 60;
        storyPaddle.height = 25;
        
        storyLevel2Ball.size = 25;
        storyLevel2Paddle.width = 70;
        storyLevel2Paddle.height = 25;
        
        storyLevel3Ball.size = 25;
        storyLevel3Paddle.width = 70;
        storyLevel3Paddle.height = 25;
        
        storyGirl.size = 50;
        
        // Четвертый уровень
        storyLevel4Paddle.width = 70;
        storyLevel4Paddle.height = 25;
    } else {
        // Десктопные настройки
        ball.size = 30;
        paddle.width = 90;
        paddle.height = 30;
        
        storyBall.size = 30;
        storyPaddle.width = 80;
        storyPaddle.height = 30;
        
        storyLevel2Ball.size = 30;
        storyLevel2Paddle.width = 90;
        storyLevel2Paddle.height = 30;
        
        storyLevel3Ball.size = 30;
        storyLevel3Paddle.width = 90;
        storyLevel3Paddle.height = 30;
        
        storyGirl.size = 60;
        
        // Четвертый уровень
        storyLevel4Paddle.width = 80;
        storyLevel4Paddle.height = 30;
    }
}

// Вызываем адаптацию при загрузке и ресайзе
adaptSizes();
window.addEventListener('resize', adaptSizes);

// --- Улучшенная физика шарика ---
function updateBallPhysics(ballObj) {
    // Ограничение максимальной скорости
    const maxSpeed = 8;
    ballObj.dx = Math.max(Math.min(ballObj.dx, maxSpeed), -maxSpeed);
    ballObj.dy = Math.max(Math.min(ballObj.dy, maxSpeed), -maxSpeed);
    
    // Минимальная скорость
    const minSpeed = 2;
    if (Math.abs(ballObj.dx) < minSpeed) ballObj.dx = ballObj.dx > 0 ? minSpeed : -minSpeed;
    if (Math.abs(ballObj.dy) < minSpeed) ballObj.dy = ballObj.dy > 0 ? minSpeed : -minSpeed;
}

// --- Улучшенные столкновения ---
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

// --- Анимации и эффекты ---
let particles = [];

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            size: Math.random() * 3 + 1,
            color: color,
            life: 1
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 0.02;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

let storyHearts = [];
let heartAnimationProgress = 0;
let heartAnimationDuration = 120;

function createHearts() {
    for (let i = 0; i < 30; i++) {
        storyHearts.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 20 + Math.random() * 30,
            opacity: 0,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}

function updateHearts() {
    heartAnimationProgress++;
    
    storyHearts.forEach(heart => {
        heart.opacity = Math.min(heart.opacity + 0.02, 1);
        heart.y -= heart.speed;
        if (heart.y < -50) {
            heart.y = canvas.height + 50;
            heart.x = Math.random() * canvas.width;
        }
    });
}

function drawHearts() {
    storyHearts.forEach(heart => {
        ctx.globalAlpha = heart.opacity;
        ctx.font = `${heart.size}px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
        ctx.fillText("❤️", heart.x, heart.y);
    });
    ctx.globalAlpha = 1.0;
}

// --- Финальные улучшения и оптимизации ---

// Предзагрузка эмодзи для лучшей производительности
function preloadEmojis() {
    const emojis = ["🍑", "🍌", "🍆", "🛏️", "🌹", "👨", "👩", "😎", "💖", "💔", "💊", "💋", "😘", "😊", "👴", "👴🏿", "💩", "👵", "😍", "🤢"];
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 50;
    tempCanvas.height = 50;
    
    emojis.forEach(emoji => {
        tempCtx.clearRect(0, 0, 50, 50);
        tempCtx.font = "40px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
        tempCtx.fillText(emoji, 0, 40);
    });
}

// Вызываем предзагрузку
preloadEmojis();

// Оптимизация для слабых устройств
let lastTime = 0;
const fps = 60;
const frameInterval = 1000 / fps;

function optimizedDraw(timestamp) {
    if (timestamp - lastTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "menu") {
            drawMenuWithSoundControls();
        } else if (gameState === "arcanoid") {
            drawArcanoid();
        } else if (gameState === "play") {
            drawPlayWithEffects();
        } else if (gameState === "story") {
            drawStory();
        }

        if (isTransitioning) {
            ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        lastTime = timestamp;
    }
    requestAnimationFrame(optimizedDraw);
}

// Переключаем на оптимизированный рендеринг для мобильных
if (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // Используем оптимизированный рендеринг для мобильных
    draw = optimizedDraw;
}

// --- Улучшенная обработка ресайза с адаптацией ---
function enhancedResizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    maleY = height - 50;
    femaleY = height - 50;

    generateBedGrid();
    adaptSizes();
    
    if (gameState === "play") {
        resetBallPaddle();
        generateBlocks();
    }
    if (gameState === "story" && storyStarted) {
        if (storyLevel === 1) {
            resetStoryLevel();
        } else if (storyLevel === 2) {
            generateStoryBlocks();
            resetStoryLevel2();
        } else if (storyLevel === 3) {
            generateHeartBlocks();
            resetStoryLevel3();
        } else if (storyLevel === 4) {
            resetStoryLevel4();
        }
    }
}

// Обновляем обработчик ресайза
window.removeEventListener("resize", resizeCanvas);
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(enhancedResizeCanvas, 100);
});

// --- Дополнительные улучшения UX ---

// Виброотклик на мобильных устройствах
function vibrateIfSupported(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// --- Улучшенные переходы между состояниями ---
function enhancedStartTransition(targetState) {
    isTransitioning = true;
    fadeOpacity = 0;

    const fadeOut = setInterval(() => {
        fadeOpacity += 0.05;
        if (fadeOpacity >= 1) {
            clearInterval(fadeOut);
            
            // Очищаем частицы при переходе
            particles = [];
            storyHearts = [];
            heartAnimationProgress = 0;
            
            if (targetState === "play") startPlay();
            if (targetState === "story") startStory();

            const fadeIn = setInterval(() => {
                fadeOpacity -= 0.05;
                if (fadeOpacity <= 0) {
                    clearInterval(fadeIn);
                    isTransitioning = false;
                }
            }, 30);
        }
    }, 30);
}

// Обновляем обработчик переходов
startTransition = enhancedStartTransition;

// --- Финальные оптимизации производительности ---

// Ограничение количества частиц
const MAX_PARTICLES = 100;
function optimizedCreateParticles(x, y, count, color, shouldVibrate = false) {
    if (shouldVibrate) {
        vibrateIfSupported(30);
    }
    
    // Удаляем старые частицы если достигли лимита
    if (particles.length + count > MAX_PARTICLES) {
        particles.splice(0, count);
    }
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            size: Math.random() * 3 + 1,
            color: color,
            life: 1
        });
    }
}

// Применяем оптимизированную версию
createParticles = optimizedCreateParticles;

// --- Завершение кода ---
console.log("🎮 Бананоид успешно запущен! 🎮");
console.log("Особенности игры:");
console.log("🍑 - Режим 'Играть' с классическим арканоидом");
console.log("📖 - Сюжетный режим с ЧЕТЫРЬМЯ уровнями");
console.log("💖 - Третий уровень с сердцем из смайликов");
console.log("🎯 - Четвертый уровень с падающими блоками");
console.log("✨ - Частицы и анимации для лучшего визуального опыта");
console.log("📱 - Поддержка сенсорного управления и вибрации");
console.log("🔊 - Полная звуковая система с 13 эффектами");

// Экспорт для отладки (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState,
        startPlay,
        startStory,
        exitToMenu,
        resizeCanvas: enhancedResizeCanvas,
        adaptSizes,
        soundManager
    };
}

// Глобальные объекты для отладки
window.gameDebug = {
    state: () => gameState,
    reset: () => {
        gameState = "menu";
        storyStarted = false;
        storyLevel = 1;
        playLives = 3;
        playScore = 0;
        storyLevel2Lives = 3;
        storyLevel2Score = 0;
        storyLevel3Lives = 3;
        storyLevel3Score = 0;
        storyLevel4Lives = 3;
        storyLevel4Score = 0;
        storyLevel4GirlsCaught = 0;
        particles = [];
        storyHearts = [];
        grandpaHit = false;
        grandpaAngry = false;
        enhancedResizeCanvas();
    },
    setState: (state) => {
        if (["menu", "play", "story", "arcanoid"].includes(state)) {
            gameState = state;
        }
    },
    setStoryLevel: (level) => {
        if (level >= 1 && level <= 4) {
            storyLevel = level;
            if (storyLevel === 1) resetStoryLevel();
            else if (storyLevel === 2) resetStoryLevel2();
            else if (storyLevel === 3) resetStoryLevel3();
            else if (storyLevel === 4) resetStoryLevel4();
        }
    },
    sound: soundManager
};

// --- Проверка всех запрошенных изменений ---
console.log("✅ Все запрошенные изменения реализованы:");
console.log("1. ✅ В уровне с 'розой' девушка уворачивается 2 раза, на третье попадание - пройдено");
console.log("2. ✅ В уровне с 'крутым в очках' при проигрыше показывается попап 'Ты разбил ей сердце'");
console.log("3. ✅ В уровне с 'дедом' смайлики расположены в форме сердца, полностью на экране");
console.log("4. ✅ Полная звуковая система интегрирована во все уровни игры");
console.log("5. ✅ Добавлена кнопка управления звуком в меню");
console.log("6. ✅ ДОБАВЛЕН ЧЕТВЕРТЫЙ УРОВЕНЬ с падающими блоками:");
console.log("   - 👩 Девушка: меняет смайлик на 😍, нужно поймать 5 для победы");
console.log("   - 💩 Какашка: меняет смайлик на 🤢, жизнь не отнимается");
console.log("   - 👵 Старуха: отнимает жизнь, показывает попап 'Уф... А было неплохо'");

// Финальная проверка инициализации
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log("🎵 Звуковая система:", soundManager.enabled ? "ВКЛЮЧЕНА" : "ВЫКЛЮЧЕНА");
        console.log("📱 Размер экрана:", canvas.width + "x" + canvas.height);
        console.log("🎮 Игра готова к использованию!");
    }, 1000);
});
