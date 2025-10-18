// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

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

// --- Кирпичи ---
const brickRowCount = 4;
const brickColumnCount = 6;
const brickPadding = 5;
const brickOffsetTop = 40;
const brickOffsetLeft = 20;
let brickWidth;
let brickHeight;
let bricks = [];

// --- Платформа ---
let paddleWidth;
const paddleHeight = 10;
let paddleX;

// --- Сюжетная платформа ---
const storyPaddleWidth = 50;
const storyPaddleHeight = 20;
let storyPaddleX;
let storyTargetX;
let storyTargetY = 100;
let storyHitCount = 0;
let storyHitRegistered = false;

// --- Летающие смайлики в меню ---
let maleX = 50, maleY = canvas.height - 50, maleDx = 2;
let femaleX = 250, femaleY = canvas.height - 50, femaleDx = -2;

// --- Вертикально летающие символы пола ---
let maleSymbolY = canvas.height - 100;
let femaleSymbolY = canvas.height - 150;
let maleSymbolDy = 1.2;
let femaleSymbolDy = 1.5;

// --- Шарик ---
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 60;
let dx = 3;
let dy = -3;

// --- Сюжетный "поцелуй" ---
let kissX = canvas.width / 2;
let kissY = canvas.height - 60;
let kdx = 9;
let kdy = -9;
let dodgeCount = 0;
let targetDodging = false;

// --- Счет и состояние ---
let score = 0;
let gameState = "menu"; // menu, playing, story1, popup

// --- Поп-ап ---
let popupMessage = "";
let popupButtons = [];

// --- Функция ресайза ---
function resizeCanvas() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = canvas.height * (FIELD_WIDTH / FIELD_HEIGHT);
    }

    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = "translate(-50%, -50%)";

    // --- пересчет размеров объектов ---
    brickWidth = (canvas.width - 40) / brickColumnCount;
    brickHeight = 25;

    paddleWidth = canvas.width * 0.25;
    paddleX = (canvas.width - paddleWidth) / 2;

    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    storyTargetX = canvas.width / 2;
    kissX = canvas.width / 2;

    createBricks();
}

// --- вызов при старте ---
resizeCanvas();

// --- вызов при изменении размера окна ---
window.addEventListener("resize", resizeCanvas);

// --- Создание кирпичей ---
function createBricks() {
    bricks = [];
    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = 60;

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = offsetX + c * (brickWidth + brickPadding);
            const brickY = offsetY + r * (brickHeight + brickPadding);
            bricks[c][r] = { x: brickX, y: brickY, status: 1 };
        }
    }
}

// --- Игровые функции ---
function startGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    gameState = "playing";
}

function startStoryLevel1() {
    storyHitCount = 0;
    storyTargetX = canvas.width / 2;
    storyHitRegistered = false;
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    dodgeCount = 0;
    kissX = canvas.width / 2;
    kissY = canvas.height - 60;

    const kSpeed = 9;
    const kAngle = (Math.random() * Math.PI / 3) - Math.PI / 6;
    kdx = kSpeed * Math.cos(kAngle);
    kdy = -kSpeed * Math.sin(kAngle);

    gameState = "story1";
}

// --- Запуск цикла ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    else if (gameState === "playing") {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        collisionDetection();

        if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
        if (ballY + dy < ballRadius) dy = -dy;
        else if (ballY + dy > canvas.height - paddleHeight - ballRadius) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) dy = -dy;
            else showPopup("💀 Игра кончила_ся!", [
                { text: "Еееще...", action: startGame, color: "#4CAF50" },
                { text: "Я спать", action: () => gameState = "menu", color: "#f44336" }
            ]);
        }

        ballX += dx;
        ballY += dy;
    }
    else if (gameState === "story1") drawStoryLevel1();

    if (gameState === "popup") drawPopup();

    requestAnimationFrame(draw);
}

draw();
