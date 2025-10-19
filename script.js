// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Canvas на весь экран
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.display = "block";
document.body.style.margin = 0;
document.body.style.padding = 0;
document.body.style.overflow = "hidden";
document.body.appendChild(canvas);

// --- Meta viewport ---
// Для мобильных устройств нужно добавить в <head> HTML:
// <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

// --- Переменные ---
let gameState = "menu";
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Кнопки в виде бюстгальтера ---
function drawButtonBra(x, y, w, h, color, text) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const radius = h / 2;
    ctx.moveTo(x + radius, y);
    ctx.arc(x + radius, y + radius, radius, Math.PI * 1.5, Math.PI * 0.5);
    ctx.arc(x + w - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();

    // Текст
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(h/2)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Кнопки в виде трусиков ---
function drawButtonPanties(x, y, w, h, color, text) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w*0.2, y + h);
    ctx.lineTo(x + w*0.8, y + h);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();

    // Текст
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(h/2)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2 - 5);
}

// --- Меню ---
function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок с эмодзи
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width / 2, canvas.height * 0.15);

    // Кнопки
    drawButtonBra(canvas.width / 2 - 100, canvas.height * 0.35, 200, 60, "#4CAF50", "Играть");
    drawButtonPanties(canvas.width / 2 - 100, canvas.height * 0.45, 200, 60, "#f44336", "Сюжет");

    // Движущиеся смайлики внизу
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 20) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 20) femaleDx = -femaleDx;
}

// --- Клик по меню ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;

    // Играть (бюстгальтер)
    if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
        y >= canvas.height * 0.35 && y <= canvas.height * 0.35 + 60)
        alert("Запускаем режим Арканоид!");

    // Сюжет (трусики)
    if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
        y >= canvas.height * 0.45 && y <= canvas.height * 0.45 + 60)
        alert("Запускаем режим Сюжет!");
});

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();

    requestAnimationFrame(draw);
}

// --- Запуск ---
draw();
