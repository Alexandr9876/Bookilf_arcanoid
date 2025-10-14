const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Платформа
let paddle = { x: 160, y: 570, w: 80, h: 20 };

// Шарик
let ball = { x: 200, y: 300, dx: 2, dy: -2, r: 10 };

// Блоки
let bricks = [];
let score = 0;
let level = 1;

const rows = 4;
const cols = 6;
const brickW = 60;
const brickH = 20;

function createBricks() {
  bricks = [];
  for (let r = 0; r < rows + level - 1; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({ x: 20 + c * 65, y: 40 + r * 30, hit: false });
    }
  }
}

createBricks();

// Управление платформой мышью
document.addEventListener("mousemove", e => {
  let rect = canvas.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.w / 2;
});

// Рисуем платформу
function drawPaddle() {
  ctx.font = "24px Arial";
  ctx.fillText("🍆", paddle.x + 25, paddle.y + 18);
}

// Рисуем шарик
function drawBall() {
  ctx.font = "24px Arial";
  ctx.fillText("🍌", ball.x - 8, ball.y + 8);
}

// Рисуем блоки
function drawBricks() {
  ctx.font = "24px Arial";
  for (let b of bricks) {
    if (!b.hit) ctx.fillText("🍑", b.x, b.y + 18);
  }
}

// Счёт и уровень
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Счёт: " + score + "  Уровень: " + level, 10, 20);
}

// Основная функция игры
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  drawBall();
  drawScore();

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Отскок от стен
  if (ball.x < 10 || ball.x > 390) ball.dx *= -1;
  if (ball.y < 10) ball.dy *= -1;

  // Отскок от платформы
  if (ball.y > paddle.y - 10 && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
    ball.dy *= -1;
  }

  // Столкновение с блоками
  for (let b of bricks) {
    if (!b.hit && ball.x > b.x && ball.x < b.x + brickW && ball.y > b.y && ball.y < b.y + brickH) {
      b.hit = true;
      ball.dy *= -1;
      score += 10;
    }
  }

  // Новый уровень
  if (bricks.every(b => b.hit)) {
    level++;
    ball.x = 200;
    ball.y = 300;
    ball.dx = 2 + level * 0.5;
    ball.dy = -2 - level * 0.5;
    createBricks();
  }

  // Игра окончена
  if (ball.y > 600) {
    alert("Игра окончена! Счёт: " + score);
    document.location.reload();
  }

  requestAnimationFrame(draw);
}

draw();
