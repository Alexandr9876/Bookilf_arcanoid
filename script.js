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
createBricks();

// --- Счет ---
let score = 0;

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

// --- Отрисовка объектов ---
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

// --- Перезапуск игры ---
function restartGame() {
    x = canvas.width / 2;
    y = canvas.height - 60;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    draw();
}

// --- Основной цикл ---
function draw() {
    animationId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // Отскок шарика от стен
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - 40) {
        if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else showMenu("💀 Игра кончила_ся!");
    }

    x += dx;
    y += dy;
}

// --- Запуск игры ---
draw();

