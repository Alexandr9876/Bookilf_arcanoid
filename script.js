const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let paddle = { x: 160, y: 570, w: 80, h: 20 };
let ball = { x: 200, y: 300, dx: 2, dy: -2, r: 10 };
let bricks = [];
let score = 0;
let level = 1;
let gameState = "menu"; // menu | level1 | game
let dodges = 0; // для первого тура

const rows = 4;
const cols = 6;
const brickW = 60;
const brickH = 20;

function saveProgress() {
  localStorage.setItem("level", level);
  localStorage.setItem("score", score);
}

function loadProgress() {
  level = parseInt(localStorage.getItem("level") || "1");
  score = parseInt(localStorage.getItem("score") || "0");
}

function resetProgress() {
  localStorage.removeItem("level");
  localStorage.removeItem("score");
  level = 1;
  score = 0;
}

// 🌈 Главное меню
let flyingIcons = Array.from({ length: 10 }, () => ({
  x: Math.random() * 400,
  y: Math.random() * 600,
  dx: (Math.random() - 0.5) * 1.5,
  dy: (Math.random() - 0.5) * 1.5,
  emoji: Math.random() > 0.5 ? "♂️" : "♀️"
}));

function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // фон — кровати узором
  for (let x = 0; x < canvas.width; x += 60) {
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.font = "30px Arial";
      ctx.fillText("🛏️", x, y + 30);
    }
  }

  // летающие смайлы
  for (let i of flyingIcons) {
    ctx.fillText(i.emoji, i.x, i.y);
    i.x += i.dx;
    i.y += i.dy;
    if (i.x < 0 || i.x > 400) i.dx *= -1;
    if (i.y < 0 || i.y > 600) i.dy *= -1;
  }

  // текст
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("🔥 Арканоид страсти 🔥", 70, 120);

  // кнопки
  drawButton(130, 250, "Начать");
  drawButton(130, 320, "Обнулиться");
}

function drawButton(x, y, text) {
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x - 10, y - 25, 150, 40);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

// Проверка клика по кнопке
canvas.addEventListener("click", e => {
  let rect = canvas.getBoundingClientRect();
  let mx = e.clientX - rect.left;
  let my = e.clientY - rect.top;

  if (gameState === "menu") {
    if (mx > 120 && mx < 280 && my > 230 && my < 270) {
      loadProgress();
      if (level === 1) gameState = "level1";
      else gameState = "game";
      createBricks();
    }
    if (mx > 120 && mx < 280 && my > 300 && my < 340) {
      resetProgress();
    }
  } else if (gameState === "endOfLevel1") {
    // кнопки в конце первого тура
    if (mx > 100 && mx < 200 && my > 300 && my < 340) startLevel1();
    if (mx > 220 && mx < 340 && my > 300 && my < 340) {
      gameState = "game";
      level = 2;
      createBricks();
    }
    if (mx > 150 && mx < 300 && my > 360 && my < 400) gameState = "menu";
  }
});

// 🎮 Первый уровень
let peach = { x: 170, y: 200, w: 60, h: 60, dodge: false };

function startLevel1() {
  gameState = "level1";
  paddle = { x: 160, y: 570, w: 80, h: 20 };
  ball = { x: 200, y: 500, dx: 0, dy: -4, r: 10 };
  dodges = 0;
}

function drawLevel1() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // рисуем перчик
  ctx.font = "30px Arial";
  ctx.fillText("🌶️", paddle.x + 25, paddle.y + 20);

  // рисуем шар (палка)
  ctx.fillText("🍆", ball.x - 10, ball.y + 8);

  // рисуем персик
  ctx.fillText("🍑", peach.x, peach.y);

  ball.x += ball.dx;
  ball.y += ball.dy;

  // отражения
  if (ball.x < 10 || ball.x > 390) ball.dx *= -1;
  if (ball.y < 10) ball.dy *= -1;

  // отражение от перчика
  if (
    ball.y > paddle.y - 10 &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    ball.dy *= -1;
  }

  // увертливый персик
  if (
    Math.abs(ball.x - peach.x) < 30 &&
    Math.abs(ball.y - peach.y) < 30 &&
    dodges < 5
  ) {
    // увернулся
    peach.x = 50 + Math.random() * 300;
    peach.y = 100 + Math.random() * 200;
    dodges++;
    ball.dy *= -1;
  } else if (
    Math.abs(ball.x - peach.x) < 30 &&
    Math.abs(ball.y - peach.y) < 30 &&
    dodges >= 5
  ) {
    // попал!
    gameState = "endOfLevel1";
  }

  // движение мышью
  document.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.w / 2;
  });
}

function drawEndLevel1() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(
    "В первый раз всегда так... Неловко, странно, но приятно!",
    15,
    200
  );
  drawButton(120, 320, "Ещё!");
  drawButton(240, 320, "Сменим позу");
  drawButton(160, 380, "Я спать...");
}

// 🎯 Основные уровни (твой текущий геймплей)
function createBricks() {
  bricks = [];
  for (let r = 0; r < rows + level - 1; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({ x: 20 + c * 65, y: 40 + r * 30, hit: false });
    }
  }
}

document.addEventListener("mousemove", e => {
  if (gameState === "game") {
    let rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.w / 2;
  }
});

function drawPaddle() {
  ctx.font = "24px Arial";
  ctx.fillText("🌶️", paddle.x + 25, paddle.y + 18);
}

function drawBall() {
  ctx.font = "24px Arial";
  ctx.fillText("🍆", ball.x - 8, ball.y + 8);
}

function drawBricks() {
  ctx.font = "24px Arial";
  for (let b of bricks) {
    if (!b.hit) ctx.fillText("🍑", b.x, b.y + 18);
  }
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Счёт: " + score + "  Уровень: " + level, 10, 20);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  drawBall();
  drawScore();

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < 10 || ball.x > 390) ball.dx *= -1;
  if (ball.y < 10) ball.dy *= -1;

  if (
    ball.y > paddle.y - 10 &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    ball.dy *= -1;
  }

  for (let b of bricks) {
    if (!b.hit && ball.x > b.x && ball.x < b.x + brickW && ball.y > b.y && ball.y < b.y + brickH) {
      b.hit = true;
      ball.dy *= -1;
      score += 10;
      saveProgress();
    }
  }

  if (bricks.every(b => b.hit)) {
    level++;
    ball.x = 200;
    ball.y = 300;
    ball.dx = 2 + level * 0.5;
    ball.dy = -2 - level * 0.5;
    createBricks();
  }

  if (ball.y > 600) {
    alert("Игра окончена! Счёт: " + score);
    resetProgress();
    document.location.reload();
  }
}

function loop() {
  if (gameState === "menu") drawMenu();
  else if (gameState === "level1") drawLevel1();
  else if (gameState === "endOfLevel1") drawEndLevel1();
  else if (gameState === "game") drawGame();

  requestAnimationFrame(loop);
}

loop();
