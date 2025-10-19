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
let showGameOverPopup = false;


// --- Фон кроватей ---
const bedEmoji = "🛏️";
let bedGrid = [];

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60; // шаг между кроватями (можно увеличить или уменьшить)
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

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12; // лёгкая прозрачность
    bedGrid.forEach(bed => {
        ctx.fillText(bedEmoji, bed.x, bed.y);
    });
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;

    generateBedGrid(); // обновляем сетку кроватей при изменении размера
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Бюстгальтер ---
function drawButtonBra(x, y, w, h, color, text, textSize) {
    ctx.fillStyle = color;

    // Левая чашка
    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y + h*0.4);
    ctx.bezierCurveTo(x, y + h*0.4, x + w*0.25, y + h*0.9, x + w*0.45, y + h*0.4);
    ctx.fill();

    // Правая чашка
    ctx.beginPath();
    ctx.moveTo(x + w*0.55, y + h*0.4);
    ctx.bezierCurveTo(x + w*0.75, y + h*0.9, x + w, y + h*0.4, x + w*0.8, y + h*0.4);
    ctx.fill();

    // Мостик
    ctx.beginPath();
    ctx.moveTo(x + w*0.45, y + h*0.4);
    ctx.lineTo(x + w*0.55, y + h*0.4);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Шлейки
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w*0.25, y + h*0.4);
    ctx.lineTo(x + w*0.25, y + h*0.15);
    ctx.moveTo(x + w*0.75, y + h*0.4);
    ctx.lineTo(x + w*0.75, y + h*0.15);
    ctx.stroke();

    // Текст
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
   // Фон: мягкий романтичный градиент
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, "#ff9eb5");  // светло-розовый верх
gradient.addColorStop(1, "#ffd6a5");  // персиковый низ
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

    // фон кроватей
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

    drawButtonBra(canvas.width/2 - 120, canvas.height*0.3, 240, 120, "#4CAF50", "Отбананить", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - 100, canvas.height*0.5, 200, 80, "#f44336", "История", buttonTextSize);

    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 40) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 40) femaleDx = -femaleDx;
}

// --- Арканоид (Бананоид) ---
let paddle = { x: 0, y: 0, w: 90, h: 30, speed: 8 };
let ball = { x: 0, y: 0, dx: 4, dy: -4, size: 24 };
let blocks = [];
let score = 0;
let lives = 3;

function initArcanoid() {
    paddle.w = 90;
    paddle.h = 30;
    paddle.x = canvas.width / 2 - paddle.w / 2;
    paddle.y = canvas.height - 80;

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4;
    ball.dy = -4;

    score = 0;
    lives = 3;

    generateBlocks();
}

function generateBlocks() {
    blocks = [];
    const cols = 8;
    const rows = 4;
    const gap = 12;
    const size = 36;
    const offsetX = (canvas.width - (cols * (size + gap))) / 2;
    const offsetY = 80;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            blocks.push({
                x: offsetX + c * (size + gap),
                y: offsetY + r * (size + gap),
                w: size,
                h: size,
                hit: false
            });
        }
    }
}

function drawArcanoid() {
    // фон
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- блоки (персики) ---
    ctx.font = "32px 'Segoe UI Emoji', Arial";
    blocks.forEach(b => {
        if (!b.hit) ctx.fillText("🍑", b.x, b.y);
    });

    // --- платформа (баклажан, крупнее остальных) ---
    ctx.font = "96px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("🍆", paddle.x + paddle.w / 2, paddle.y);

    // --- мяч (банан) ---
    ctx.font = "32px 'Segoe UI Emoji', Arial";
    ctx.fillText("🍌", ball.x, ball.y);

    // --- счёт и жизни ---
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`🍑: ${score}`, 20, 35);
    ctx.textAlign = "right";
    ctx.fillText(`❤️: ${lives}`, canvas.width - 20, 35);

    // --- движение ---
    ball.x += ball.dx;
    ball.y += ball.dy;

    // --- столкновения со стенами ---
    if (ball.x < 0 || ball.x > canvas.width - 32) ball.dx *= -1;
    if (ball.y < 0) ball.dy *= -1;

    // --- падение ---
  if (ball.y > canvas.height) {
    lives--;
    if (lives > 0) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dy = -4;
    } else {
        showGameOverPopup = true;
    }
}


    // --- движение платформы (мышь / палец) ---
    canvas.onmousemove = e => {
        paddle.x = e.clientX - paddle.w / 2;
    };
    canvas.ontouchmove = e => {
        const touch = e.touches[0];
        paddle.x = touch.clientX - paddle.w / 2;
    };

    // --- отскок от платформы ---
    if (ball.y + ball.size > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w) {
        ball.dy *= -1;
        ball.y = paddle.y - ball.size;
    }

    // --- отскок от блоков ---
    blocks.forEach(b => {
        if (!b.hit &&
            ball.x > b.x && ball.x < b.x + b.w &&
            ball.y > b.y && ball.y < b.y + b.h) {
            b.hit = true;
            ball.dy *= -1;
            score++;
        }
    });
if (showGameOverPopup) {
    // затемнение фона
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // окно попапа
    const popupW = 400;
    const popupH = 200;
    const popupX = canvas.width / 2 - popupW / 2;
    const popupY = canvas.height / 2 - popupH / 2;

    ctx.fillStyle = "#fff";
    ctx.fillRect(popupX, popupY, popupW, popupH);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 4;
    ctx.strokeRect(popupX, popupY, popupW, popupH);

    // текст
    ctx.fillStyle = "#000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ты сражался, как тигр", canvas.width / 2, popupY + 60);

    // кнопки
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(popupX + 40, popupY + 120, 140, 50);
    ctx.fillStyle = "#fff";
    ctx.fillText("Еще раз", popupX + 40 + 70, popupY + 120 + 25);

    ctx.fillStyle = "#f44336";
    ctx.fillRect(popupX + 220, popupY + 120, 140, 50);
    ctx.fillStyle = "#fff";
    ctx.fillText("Выйти", popupX + 220 + 70, popupY + 120 + 25);


}

function drawStory() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffb6c1";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}

// --- Клики по меню ---
canvas.addEventListener("click", e => {
   if (showGameOverPopup) {
    const x = e.clientX;
    const y = e.clientY;

    const popupW = 400;
    const popupH = 200;
    const popupX = canvas.width / 2 - popupW / 2;
    const popupY = canvas.height / 2 - popupH / 2;

    // "Еще раз"
    if (x >= popupX + 40 && x <= popupX + 40 + 140 &&
        y >= popupY + 120 && y <= popupY + 120 + 50) {
        initArcanoid();
        showGameOverPopup = false;
        return;
    }

    // "Выйти"
    if (x >= popupX + 220 && x <= popupX + 220 + 140 &&
        y >= popupY + 120 && y <= popupY + 120 + 50) {
        showGameOverPopup = false;
        gameState = "menu";
        return;
    }
}

    if (gameState !== "menu" || isTransitioning) return;

    const x = e.clientX;
    const y = e.clientY;

    if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120 &&
        y >= canvas.height*0.3 && y <= canvas.height*0.3 + 120) {
        startTransition("arcanoid");
    }

    if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
        y >= canvas.height*0.5 && y <= canvas.height*0.5 + 80) {
        startTransition("story");
    }
});

// --- Переход ---
function startTransition(targetState) {
    isTransitioning = true;
    fadeOpacity = 0;

    const fadeOut = setInterval(() => {
        fadeOpacity += 0.05;
        if (fadeOpacity >= 1) {
            clearInterval(fadeOut);
            if (targetState === "arcanoid") startArcanoid();
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

// --- Запуск режимов ---
function startArcanoid() {
    initArcanoid();
    gameState = "arcanoid";
}

function startStory() {
    gameState = "story";
}

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    if (gameState === "arcanoid") drawArcanoid();
    if (gameState === "story") drawStory();

    // затемнение при переходе
    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
}

// --- Запуск ---
draw();






