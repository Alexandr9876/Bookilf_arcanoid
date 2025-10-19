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

// --- Бюстгальтер реалистичный ---
function drawButtonBra(x, y, w, h, color, text) {
    ctx.fillStyle = color;

    // Левая чашка
    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y + h*0.3);
    ctx.bezierCurveTo(x, y + h*0.3, x + w*0.25, y + h*0.9, x + w*0.4, y + h*0.3);
    ctx.fill();

    // Правая чашка
    ctx.beginPath();
    ctx.moveTo(x + w*0.6, y + h*0.3);
    ctx.bezierCurveTo(x + w*0.75, y + h*0.9, x + w, y + h*0.3, x + w*0.8, y + h*0.3);
    ctx.fill();

    // Мостик
    ctx.beginPath();
    ctx.moveTo(x + w*0.4, y + h*0.3);
    ctx.lineTo(x + w*0.6, y + h*0.3);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Соски (выпуклости)
    ctx.beginPath();
    ctx.arc(x + w*0.25, y + h*0.65, h*0.07, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w*0.75, y + h*0.65, h*0.07, 0, Math.PI*2);
    ctx.fill();

    // Текст по центру
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(h/4)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.85);
}

// --- Трусики танго реалистичные ---
function drawButtonPanties(x, y, w, h, color, text) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + w*0.1, y);           // левый верх
    ctx.quadraticCurveTo(x, y + h*0.5, x + w*0.5, y + h); // левая сторона плавная
    ctx.quadraticCurveTo(x + w, y + h*0.5, x + w*0.9, y); // правая сторона плавная
    ctx.closePath();
    ctx.fill();

    // Текст по центру
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(h/4)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.5);
}

// --- Меню ---
function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width/2, canvas.height*0.15);

    // Кнопки
    drawButtonBra(canvas.width/2 - 100, canvas.height*0.35, 200, 80, "#4CAF50", "Играть");
    drawButtonPanties(canvas.width/2 - 100, canvas.height*0.5, 200, 80, "#f44336", "Сюжет");

    // Смайлики внизу
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
    if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
        y >= canvas.height*0.35 && y <= canvas.height*0.35 + 80)
        alert("Запускаем режим Арканоид!");

    // Сюжет (трусики)
    if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
        y >= canvas.height*0.5 && y <= canvas.height*0.5 + 80)
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
