// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Фиксированное поле ---
const FIELD_WIDTH = 300;
const FIELD_HEIGHT = 500;
canvas.width = FIELD_WIDTH;
canvas.height = FIELD_HEIGHT;

canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.top = "50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.background = "#222";
canvas.style.touchAction = "none";
canvas.style.userSelect = "none";
canvas.style.overflow = "hidden";

// --- Платформа ---
let paddleWidth = canvas.width * 0.25;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

// --- Шарик ---
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 60;
let dx = 3;
let dy = -3;

// --- Счет ---
let score = 0;

// --- Состояние игры ---
let gameState = "menu"; // menu, playing, end

// --- Кирпичи ---
const brickRowCount = 4;
const brickColumnCount = 6;
const brickPadding = 5;
const brickOffsetTop = 40;
const brickOffsetLeft = 20;
const brickWidth = (canvas.width - 40) / brickColumnCount;
const brickHeight = 25;
let bricks = [];

function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// --- Запуск игры ---
function startGame() {
    x = canvas.width / 2;
    y = canvas.height - 60;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    gameState = "playing";
}

// --- Перезапуск игры ---
function restartGame() {
    startGame();
}

// --- Отрисовка ---
function drawBall() {
    ctx.font = "28px 'Segoe UI Emoji','Noto Color Emoji','Apple Color Emoji',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", x, y);
}

function drawPaddle() {
    ctx.font = "36px 'Segoe UI Emoji','Noto Color Emoji','Apple Color Emoji',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍆", paddleX + paddleWidth / 2, canvas.height - 30);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.font = "28px 'Segoe UI Emoji','Noto Color Emoji','Apple Color Emoji',sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🍑", brickX + brickWidth / 2, brickY + brickHeight / 2);
            }
        }
    }
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Обананеных персиков: " + score, 10, 25);
}

// --- Проверка столкновений ---
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1 &&
                x > b.x && x < b.x + brickWidth &&
                y > b.y && y < b.y + brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if (score === brickRowCount * brickColumnCount) showMenu("🎉 Гигант! 🍆🍌🍑");
            }
        }
    }
}

// --- Меню ---
function drawButton(text, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic"; // <-- добавлено
    ctx.fillText(text, x + w / 2, y + 26);
}

function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Узоры кроватей — центрируем по сетке
    ctx.font = "28px 'Segoe UI Emoji','Noto Color Emoji','Apple Color Emoji',sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const cellSize = 60; // расстояние между эмодзи
    const startX = cellSize / 2;
    const startY = cellSize / 2;
    for (let yPos = startY; yPos < canvas.height; yPos += cellSize) {
        for (let xPos = startX; xPos < canvas.width; xPos += cellSize) {
            ctx.fillText("🛏️", xPos, yPos);
        }
    }

    // Летающие символы
    ctx.font = "36px 'Segoe UI Emoji'";
    const t = Date.now() / 500;
    ctx.fillText("♂️", 50 + Math.sin(t) * 30, 100 + Math.cos(t) * 40);
    ctx.fillText("♀️", 260 + Math.cos(t) * 30, 140 + Math.sin(t) * 40);

    // Заголовок
const title = "🍑 АРКАНОИД СТРАСТИ 🍌";
ctx.font = "28px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Размеры прямоугольника под текст
const paddingX = 10;
const paddingY = 5;
const textWidth = ctx.measureText(title).width;
const rectX = canvas.width / 2 - textWidth / 2 - paddingX;
const rectY = 70 - 28 / 2 - paddingY; // 70 — центр текста по Y, 28 — размер шрифта
const rectWidth = textWidth + paddingX * 2;
const rectHeight = 28 + paddingY * 2;

// Рисуем цветной прямоугольник
ctx.fillStyle = "#FF69B4"; // ярко-розовый, можно менять
ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

// Рисуем текст поверх прямоугольника
ctx.fillStyle = "#fff";
ctx.fillText(title, canvas.width / 2, 70);


    drawButton("Начать", canvas.width / 2 - 70, 300, 140, 40, "#4CAF50");
    drawButton("Обнулиться", canvas.width / 2 - 70, 360, 140, 40, "#f44336");
}

canvas.addEventListener("click", handleMenuClick);
canvas.addEventListener("touchstart", handleMenuClick);

function handleMenuClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (gameState === "menu") {
        // Начать игру
        if (x >= 110 && x <= 250 && y >= 300 && y <= 340) startGame();
        // Обнулиться
        if (x >= 110 && x <= 250 && y >= 360 && y <= 400) restartGame();
    }
}

// --- Управление свайпом ---
canvas.addEventListener("touchstart", (e) => e.preventDefault());
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    let relativeX = touch.clientX - rect.left;
    paddleX = relativeX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
});

// --- Меню после проигрыша или победы ---
let animationId;
function showMenu(message) {
    cancelAnimationFrame(animationId);

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 50);

    const buttonWidth = 120;
    const buttonHeight = 40;
    const startX = canvas.width / 2 - buttonWidth - 10;
    const exitX = canvas.width / 2 + 10;
    const buttonY = canvas.height / 2;

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(startX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = "#f44336";
    ctx.fillRect(exitX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Еееще...", startX + buttonWidth / 2, buttonY + 25);
    ctx.fillText("Я спать", exitX + buttonWidth / 2, buttonY + 25);

    function clickHandler(e) {
        let clientX, clientY;
        if (e.type.startsWith("touch")) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        clientX -= rect.left;
        clientY -= rect.top;

        if (clientX >= startX && clientX <= startX + buttonWidth &&
            clientY >= buttonY && clientY <= buttonY + buttonHeight) {
            restartGame();
            removeListeners();
        } else if (clientX >= exitX && clientX <= exitX + buttonWidth &&
                   clientY >= buttonY && clientY <= buttonY + buttonHeight) {
            hideCanvas();
            removeListeners();
        }
    }

    function removeListeners() {
        canvas.removeEventListener("click", clickHandler);
        canvas.removeEventListener("touchstart", clickHandler);
    }

    canvas.addEventListener("click", clickHandler);
    canvas.addEventListener("touchstart", clickHandler);
}

function hideCanvas() {
    canvas.style.display = "none";
}

// --- Основной цикл ---
function draw() {
    animationId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") {
        drawMenu();
        return;
    }

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Отскок шарика от стен
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - paddleHeight - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else showMenu("💀 Игра кончила_ся!");
    }

    x += dx;
    y += dy;
}

// --- Запуск игры ---
draw();



