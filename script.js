// === НАСТРОЙКА CANVAS ===
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = 360;
canvas.height = 600;
canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.top = "50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.background = "#222";
canvas.style.touchAction = "none";
canvas.style.userSelect = "none";

let gameState = "menu"; // menu, level1, level2, end
let animationId;

// === ОБЩИЕ ЭЛЕМЕНТЫ ===
let paddle = { x: 150, y: 560, w: 80, h: 20, emoji: "🌶️" };
let ball = { x: 180, y: 300, dx: 2, dy: -2, r: 10, emoji: "😊" };
let bricks = [];
let score = 0;
let dodges = 0;

// === УПРАВЛЕНИЕ (мышь + палец) ===
function handlePointerMove(clientX) {
  const rect = canvas.getBoundingClientRect();
  paddle.x = clientX - rect.left - paddle.w / 2;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
}
canvas.addEventListener("mousemove", (e) => handlePointerMove(e.clientX));
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  handlePointerMove(e.touches[0].clientX);
}, { passive: false });

// === МЕНЮ ===
function drawMenu() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Узор кроватей
  ctx.font = "28px 'Segoe UI Emoji'";
  for (let y = 0; y < canvas.height; y += 60)
    for (let x = 0; x < canvas.width; x += 60)
      ctx.fillText("🛏️", x, y);

  // Летающие символы
  ctx.font = "36px 'Segoe UI Emoji'";
  const t = Date.now() / 500;
  ctx.fillText("♂️", 50 + Math.sin(t) * 30, 100 + Math.cos(t) * 40);
  ctx.fillText("♀️", 260 + Math.cos(t) * 30, 140 + Math.sin(t) * 40);

  // Заголовок
  ctx.font = "28px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("🍑 Арканоид любви 🍌", canvas.width / 2, 80);

  drawButton("Начать", canvas.width / 2 - 70, 300, 140, 40, "#4CAF50");
  drawButton("Обнулиться", canvas.width / 2 - 70, 360, 140, 40, "#f44336");
}

function drawButton(text, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 26);
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
    if (x >= 110 && x <= 250 && y >= 300 && y <= 340) startLevel1();
    if (x >= 110 && x <= 250 && y >= 360 && y <= 400) {
      score = 0;
      localStorage.removeItem("progress");
    }
  } else if (gameState === "end") {
    if (x >= 90 && x <= 190 && y >= 400 && y <= 440) restartLevel();
    if (x >= 210 && x <= 350 && y >= 400 && y <= 440) {
      gameState = "menu";
    }
  } else if (gameState === "level1end") {
    if (x >= 90 && x <= 190 && y >= 400 && y <= 440) startLevel2();
    if (x >= 210 && x <= 350 && y >= 400 && y <= 440) gameState = "menu";
  }
}

// === УРОВЕНЬ 1 ===
function startLevel1() {
  gameState = "level1";
  paddle.emoji = "🌶️";
  ball.emoji = "😊";
  ball.x = 180; ball.y = 300; ball.dx = 2; ball.dy = -2;
  bricks = [{ x: 150, y: 100, w: 60, h: 40, emoji: "🍑", hit: false }];
  dodges = 0;
  draw();
}

function updateLevel1() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < 10 || ball.x > canvas.width - 10) ball.dx *= -1;
  if (ball.y < 10) ball.dy *= -1;

  if (
    ball.y > paddle.y - 10 &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    ball.dy *= -1;
  }

  const b = bricks[0];
  if (!b.hit) {
    if (Math.abs(ball.x - (b.x + b.w / 2)) < 40 && dodges < 5) {
      b.x += (Math.random() > 0.5 ? -1 : 1) * 60;
      if (b.x < 20) b.x = 20;
      if (b.x > canvas.width - 80) b.x = canvas.width - 80;
      dodges++;
    }
    if (
      ball.x > b.x &&
      ball.x < b.x + b.w &&
      ball.y > b.y &&
      ball.y < b.y + b.h &&
      dodges >= 5
    ) {
      b.hit = true;
      score++;
      // **СТОП УРОВНЯ**
      gameState = "level1end";
      cancelAnimationFrame(animationId);
      drawLevel1End();
    }
  }

  if (ball.y > canvas.height) {
    gameState = "level1end";
    cancelAnimationFrame(animationId);
    drawLevel1End("Игра окончена!");
  }
}

function drawLevel1End(msg = "В первый раз всегда так...\nНеловко, странно, но приятно!") {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  const lines = msg.split("\n");
  lines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, 200 + i * 30));

  drawButton("Продолжить", 90, 400, 100, 40, "#4CAF50");
  drawButton("Выйти", 210, 400, 140, 40, "#f44336");
}

// === УРОВЕНЬ 2 ===
function startLevel2() {
  gameState = "level2";
  paddle.emoji = "🍆";
  ball.emoji = "🍌";
  ball.x = 180; ball.y = 300; ball.dx = 2; ball.dy = -2;
  bricks = [];
  for (let i = 0; i < 3; i++) {
    bricks.push({ x: 80 + i * 80, y: 100, w: 50, h: 40, emoji: "🍑", hit: false });
  }
  draw();
}

function updateLevel2() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < 10 || ball.x > canvas.width - 10) ball.dx *= -1;
  if (ball.y < 10) ball.dy *= -1;

  if (
    ball.y > paddle.y - 10 &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w
  ) {
    ball.dy *= -1;
  }

  for (const b of bricks) {
    if (!b.hit && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
      b.hit = true;
      ball.dy *= -1;
      score++;
    }
  }

  if (bricks.every(b => b.hit)) {
    showEndMessage("💦 Второй тур завершен! 💦");
  }

  if (ball.y > canvas.height) {
    showEndMessage("Игра окончена!");
  }
}

// === РИСОВАНИЕ ===
function drawPaddle() { ctx.font = "32px 'Segoe UI Emoji'"; ctx.fillText(paddle.emoji, paddle.x + paddle.w / 2 - 10, paddle.y + 10); }
function drawBall() { ctx.font = "26px 'Segoe UI Emoji'"; ctx.fillText(ball.emoji, ball.x - 8, ball.y + 8); }
function drawBricks() { ctx.font = "28px 'Segoe UI Emoji'"; for (const b of bricks) { if (!b.hit) ctx.fillText(b.emoji, b.x, b.y + 25); } }

// === ПЕРЕЗАПУСК УРОВНЯ ===
function restartLevel() {
  if (gameState === "end" && bricks.length === 1) startLevel1();
  else if (gameState === "end" && bricks.length > 1) startLevel2();
}

// === ЦИКЛ ===
function draw() {
  animationId = requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "menu") { drawMenu(); return; }
  if (gameState === "level1") { drawBricks(); drawPaddle(); drawBall(); updateLevel1(); return; }
  if (gameState === "level2") { drawBricks(); drawPaddle(); drawBall(); updateLevel2(); return; }
  if (gameState === "level1end") return; // уровень остановлен
}

draw();
