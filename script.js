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
    ctx.moveTo(x + w*0.2, y + h*0.4);
    ctx.bezierCurveTo(x, y + h*0.4, x + w*0.25, y + h*0.9, x + w*0.45, y + h*0.4);
    ctx.fill();

    // Правая чашка
    ctx.beginPath();
    ctx.moveTo(x + w*0.55, y + h*0.4);
    ctx.bezierCurveTo(x + w*0.75, y + h*0.9, x + w, y + h*0.4, x + w*0.8, y + h*0.4);
    ctx.fill();

    // Мостик сверху
    ctx.beginPath();
    ctx.moveTo(x + w*0.45, y + h*0.4);
    ctx.lineTo(x + w*0.55, y + h*0.4);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Шлейки
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w*0.25, y + h*0.4);
    ctx.lineTo(x + w*0.25, y + h*0.15);
    ctx.moveTo(x + w*0.75, y + h*0.4);
    ctx.lineTo(x + w*0.75, y + h*0.15);
    ctx.stroke();

    // Текст по центру чашек
    ctx.fillStyle = "#fff";
    const fontSize = Math.floor(h / 3); // крупный одинаковый размер
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.75);
}

// --- Стринги ---
function drawButtonStringPanties(x, y, w, h, color, text) {
    ctx.fillStyle = color;

    // Основной треугольник
    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y);          
    ctx.lineTo(x + w*0.5, y + h);      
    ctx.lineTo(x + w*0.8, y);          
    ctx.closePath();
    ctx.fill();

    // Резинка сверху (тонкая линия)
    ctx.strokeStyle = color;
    ctx.lineWidth = h*0.1;
    ctx.beginPath();
    ctx.moveTo(x + w*0.15, y);
    ctx.lineTo(x + w*0.85, y);
    ctx.stroke();

    // Текст на резинке
    ctx.fillStyle = "#fff";
    const fontSize = Math.floor(h / 3); // одинаковый размер текста
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(text, x + w/2, y + h*0.05);
}

// --- Меню ---
function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок
    ctx.font = "56px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width/2, canvas.height*0.15);

    // Кнопки
    drawButtonBra(canvas.width/2 - 120, canvas.height*0.3, 240, 120, "#4CAF50", "Играть");
    drawButtonStringPanties(canvas.width/2 - 100, canvas.height*0.5, 200, 80, "#f44336", "Сюжет");

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

    // Играть
    if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120 &&
        y >= canvas.height*0.3 && y <= canvas.height*0.3 + 120)
        alert("Запускаем режим Арканоид!");

    // Сюжет
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
