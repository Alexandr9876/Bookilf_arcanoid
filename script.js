// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.style.margin = 0;
document.body.style.overflow = "hidden";
document.body.appendChild(canvas);

// --- Переменные ---
let gameState = "menu";
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;

let popupMessage = "";
let popupButtons = [];

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Кнопки ---
function drawButton(text, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
}

// --- Меню ---
function drawMenu() {
    // Фон
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок с эмодзи
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width / 2, 100);

    // Кнопки
    drawButton("Играть", canvas.width / 2 - 70, 200, 140, 50, "#4CAF50");
    drawButton("Сюжет", canvas.width / 2 - 70, 270, 140, 50, "#f44336");

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
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Играть
    if (x >= canvas.width / 2 - 70 && x <= canvas.width / 2 + 70) {
        if (y >= 200 && y <= 250) {
            alert("Запускаем режим Арканоид!"); // Здесь потом будет startGame()
        }
        if (y >= 270 && y <= 320) {
            alert("Запускаем режим Сюжет!"); // Здесь потом будет startStory()
        }
    }
});

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") {
        drawMenu();
    }

    requestAnimationFrame(draw);
}

// --- Запуск ---
draw();
