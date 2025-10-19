// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.display = "block";
document.body.style.margin = 0;
document.body.style.padding = 0;
document.body.style.overflow = "hidden";
document.body.appendChild(canvas);

// --- Блокировка масштабирования и скролла на мобильных ---
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
document.addEventListener("gestureend", e => e.preventDefault());

document.addEventListener("touchmove", e => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) e.preventDefault(); // блок двойного тапа
    lastTouchEnd = now;
}, false);

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

// --- Новое: история и уровень 2 ---
let storyIndex = 0;
let storyLines = [
    "Однажды утром…",
    "Главный герой проснулся и увидел персики...",
    "Пора действовать!"
];
let showStoryNextButton = false;

let level2Started = false;
let level2Score = 0;
let level2Blocks = [];
let showLevel2Popup = false;
let showLevel2StartButton = false;

// --- Фон кроватей ---
const bedEmoji = "🛏️";
let bedGrid = [];

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60;
    const cols = Math.ceil(canvas.width / emojiSize);
    const rows = Math.ceil(canvas.height / emojiSize);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            bedGrid.push({ x: x * emojiSize, y: y * emojiSize });
        }
    }
}

function generateBlocks() {
    blocks = [];
    const cols = 8;
    const rows = 3;
    const spacing = 10;
    const blockSize = 40;
    const startX = (canvas.width - (cols * blockSize + (cols - 1) * spacing)) / 2;
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

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12;
    bedGrid.forEach(bed => ctx.fillText(bedEmoji, bed.x, bed.y));
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;

    generateBedGrid();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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
    ctx.font = `${textSize}px Arial`;
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
    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Меню ---
function drawMenu() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    const title = "🍑 Бананоид 🍌";
    let fontSize = 56;
    ctx.font = `${fontSize}px 'Segoe UI Emoji', Arial`;
    let textWidth = ctx.measureText(title).width;

    while (textWidth > canvas.width - 40 && fontSize > 10) {
        fontSize -= 2;
        ctx.font = `${fontSize}px 'Segoe UI Emoji', Arial`;
        textWidth = ctx.measureText(title).width;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width/2, canvas.height*0.15);

    const buttonTextSize = Math.floor(canvas.height * 0.06);
    drawButtonBra(canvas.width/2 - 120, canvas.height*0.3, 240, 120, "#4CAF50", "Играть", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - 100, canvas.height*0.5, 200, 80, "#f44336", "Сюжет", buttonTextSize);

    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 40) maleDx = -maleDx;
    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 40) femaleDx = -femaleDx;
}

// --- Игровые заглушки ---
function drawArcanoid() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}

// --- История и уровень 2 ---
function drawStory() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(storyLines[storyIndex], canvas.width/2, canvas.height/2);

    if (storyIndex < storyLines.length - 1) {
        showStoryNextButton = true;
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(canvas.width/2 - 60, canvas.height*0.7, 120, 50);
        ctx.fillStyle = "#fff";
        ctx.fillText("Далее", canvas.width/2, canvas.height*0.7 + 25);
    } else {
        showLevel2StartButton = true;
        ctx.fillStyle = "#2196F3";
        ctx.fillRect(canvas.width/2 - 80, canvas.height*0.7, 160, 50);
        ctx.fillStyle = "#fff";
        ctx.fillText("Начать уровень 2", canvas.width/2, canvas.height*0.7 + 25);
    }
}

function startLevel2() {
    level2Started = true;
    gameState = "play";
    level2Score = 0;
    showLevel2Popup = false;
    generateLevel2Blocks();
}

function generateLevel2Blocks() {
    level2Blocks = [];
    const cols = 6;
    const rows = 2;
    const spacing = 10;
    const blockSize = 40;
    const startX = (canvas.width - (cols * blockSize + (cols - 1) * spacing)) / 2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            level2Blocks.push({
                x: startX + c * (blockSize + spacing),
                y: startY + r * (blockSize + spacing),
                size: blockSize,
                destroyed: false
            });
        }
    }
}

function drawLevel2() {
    drawBedBackground();
    ctx.font = `${ball.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(ballEmoji, ball.x, ball.y);

    ctx.textBaseline = "bottom";
    ctx.font = `${paddle.height*3}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(paddleEmoji, paddle.x, paddle.y);
    ctx.textBaseline = "top";

    ctx.font = `${level2Blocks[0]?.size || 40}px 'Segoe UI Emoji', Arial`;
    level2Blocks.forEach(block => { if(!block.destroyed) ctx.fillText("🌹", block.x, block.y); });

    if(level2Blocks.every(b => b.destroyed)) { showLevel2Popup = true; }

    ball.x += ball.dx;
    ball.y += ball.dy;
    if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
    if(ball.y < 0) ball.dy = -ball.dy;

    if(ball.y + ball.size >= paddle.y - paddle.height*3 &&
       ball.y <= paddle.y &&
       ball.x + ball.size >= paddle.x &&
       ball.x <= paddle.x + paddle.width) { ball.dy = -ball.dy; }

    level2Blocks.forEach(block => {
        if(!block.destroyed &&
           ball.x + ball.size > block.x &&
           ball.x < block.x + block.size &&
           ball.y + ball.size > block.y &&
           ball.y < block.y + block.size) {
            block.destroyed = true;
            ball.dy = -ball.dy;
            level2Score++;
        }
    });

    if(showLevel2Popup) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 90, 300, 180);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText("Первый шаг сделан! 🌹", canvas.width/2, canvas.height/2 - 20);
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(canvas.width/2 - 60, canvas.height/2 + 20, 120, 50);
        ctx.fillStyle = "#fff";
        ctx.fillText("Ок", canvas.width/2, canvas.height/2 + 45);
    }
}

// --- Остальные функции drawPlay(), popups, resetBallPaddle() остаются без изменений ---

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    else if (gameState === "arcanoid") drawArcanoid();
    else if (gameState === "story") drawStory();
    else if(gameState === "play") {
        if(level2Started) drawLevel2();
        else drawPlay();
    }

    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
}

draw();
