const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Настройка Canvas ---
let screenWidth = window.innerWidth;
if (screenWidth > 480) screenWidth = 480;
canvas.width = screenWidth;
canvas.height = canvas.width * 2 / 3;

canvas.style.display = "block";
canvas.style.margin = "0 auto";
canvas.style.background = "#222";
canvas.style.touchAction = "none";

let rightPressed = false;
let leftPressed = false;
let touchX = null;

// --- Управление клавиатурой ---
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "ArrowLeft") leftPressed = false;
});

// --- Управление пальцем ---
canvas.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", (e) => {
  const moveX = e.touches[0].clientX;
  if (touchX !== null) {
    const deltaX = moveX - touchX;
    paddleX += deltaX;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    touchX = moveX;
  }
});
canvas.addEventListener("touchend", () => {
  touchX = null;
});

// --- Настройки объектов ---
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 60;
let dx = 3;
let dy = -3;

const paddleWidth = canvas.width * 0.25;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = (canvas.width - 80) / brickColumnCount;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 30;

let score = 0;

// Создаём кирпичи
const bricks = [];
function createBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
createBricks();

// --- Отрисовка ---
function drawBall() {
  ctx.font = "28px 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🍌", x, y);
}

function drawPaddle() {
  ctx.font = "36px 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🍆", paddleX + paddleWidth / 2, canvas.height - 30);
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.font = "28px 'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🍑", brickX + brickWidth / 2, brickY + brickHeight / 2);
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            showMenu("🎉 Победа! 🍆🍌🍑");
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Счёт: " + score, 10, 25);
}

// --- Меню после проигрыша/победы ---
function showMenu(message) {
  cancelAnimationFrame(animationId);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

  // Кнопки "Заново" и "Выйти"
  const buttonWidth = 120;
  const buttonHeight = 40;
  const startX = canvas.width / 2 - buttonWidth - 10;
  const exitX = canvas.width / 2 + 10;
  const buttonY = canvas.height / 2;

  // Отрисовка кнопок
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(startX, buttonY, buttonWidth, buttonHeight);
  ctx.fillStyle = "#f44336";
  ctx.fillRect(exitX, buttonY, buttonWidth, buttonHeight);

  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Заново", startX + buttonWidth / 2, buttonY + 25);
  ctx.fillText("Выйти", exitX + buttonWidth / 2, buttonY + 25);

  // Обработка клика/тача
  function clickHandler(e) {
    let clientX, clientY;
    if (e.type.startsWith("touch")) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (
      clientX >= startX &&
      clientX <= startX + buttonWidth &&
      clientY >= buttonY &&
      clientY <= buttonY + buttonHeight
    ) {
      restartGame();
      removeListeners();
    } else if (
      clientX >= exitX &&
      clientX <= exitX + buttonWidth &&
      clientY >= buttonY &&
      clientY <= buttonY + buttonHeight
    ) {
      canvas.remove();
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
let animationId;
function draw() {
  animationId = requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - 40) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else {
      showMenu("💀 Игра кончила_сь!");
    }
  }

  x += dx;
  y += dy;

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
  else if (leftPressed && paddleX > 0) paddleX -= 6;
}

draw();
