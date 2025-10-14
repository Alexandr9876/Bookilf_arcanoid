const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Настройка правильного соотношения сторон ---
let screenWidth = window.innerWidth;
if (screenWidth > 480) screenWidth = 480; // ограничиваем максимальную ширину
canvas.width = screenWidth;
canvas.height = canvas.width * 2 / 3; // соотношение 3:2

// центрируем Canvas
canvas.style.display = "block";
canvas.style.margin = "0 auto";
canvas.style.background = "#222";
canvas.style.touchAction = "none"; // отключаем стандартное скроллирование

// --- Управление ---
let rightPressed = false;
let leftPressed = false;
let touchX = null;

// Клавиатура (ПК)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "ArrowLeft") leftPressed = false;
});

// Свайп/движение пальцем
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

// Создаём кирпичи 🍑
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

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
            alert("🎉 Победа! 🍆🍌🍑");
            document.location.reload();
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

// --- Основной цикл ---
function draw() {
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
      alert("💀 Игра кончила_сь!");
      document.location.reload();
    }
  }

  x += dx;
  y += dy;

  // клавиатурное управление (ПК)
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
  else if (leftPressed && paddleX > 0) paddleX -= 6;

  requestAnimationFrame(draw);
}

draw();
