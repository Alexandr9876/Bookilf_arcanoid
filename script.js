// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
document.body.style.margin = 0;
document.body.style.padding = 0;
document.body.style.overflow = "hidden";

document.body.appendChild(canvas);

// --- Переменные ---
let gameState = "menu";

// Смайлики внизу
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;

// Два кружка: ♂ и ♀
let floatingCircles = [
    {x: 100, y: canvas.height * 0.8, size: 40, speed: 1.5, type: "male", dir: -1},
    {x: canvas.width - 100, y: canvas.height * 0.8, size: 40, speed: 1.5, type: "female", dir: -1}
];

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;

    // Обновляем позиции кружков, если за пределами
    floatingCircles[0].y = Math.min(floatingCircles[0].y, canvas.height - 100);
    floatingCircles[1].y = Math.min(floatingCircles[1].y, canvas.height - 100);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Кнопки овальные ---
function drawButton(text, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = `${Math.floor(h/2)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Главное меню ---
function drawMenu() {
    // Фон
    ctx.fillStyle = "#ffefc1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Анимированные "кровати"
    ctx.font = "40px 'Segoe UI Emoji', Arial";
    for (let y = 50; y < canvas.height; y += 100) {
        for (let x = 50; x < canvas.width; x += 100) {
            ctx.fillText("🛏️", x, y);
        }
    }

    // Подложка под название
    const titleWidth = 400;
    const titleHeight = 70;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect((canvas.width-titleWidth)/2, canvas.height*0.12, titleWidth, titleHeight);

    // Заголовок
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width/2, canvas.height*0.15 + titleHeight/2 - 10);

    // Кнопки
    drawButton("Играть", canvas.width/2 - 70, canvas.height*0.35, 140, 50, "#4CAF50");
    drawButton("Сюжет", canvas.width/2 - 70, canvas.height*0.45, 140, 50, "#f44336");

    // Смайлики внизу
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 20) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 20) femaleDx = -femaleDx;

    // Анимация двух кружков
    floatingCircles.forEach(circle => {
        // Тень
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 5;

        ctx.fillStyle = circle.type === "male" ? "#1E90FF" : "#FF69B4";
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.size/2, 0, Math.PI*2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = `${circle.size/1.5}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(circle.type === "male" ? "♂" : "♀", circle.x, circle.y);

        // Движение вверх/вниз, не заходит на кнопки
        circle.y += circle.speed * circle.dir;
        if (circle.y - circle.size/2 < canvas.height*0.25 || circle.y + circle.size/2 > canvas.height*0.8) {
            circle.dir *= -1;
        }
    });
}

// --- Клик по меню ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;

    if (x >= canvas.width/2 - 70 && x <= canvas.width/2 + 70) {
        if (y >= canvas.height*0.35 && y <= canvas.height*0.35 + 50)
            alert("Запускаем режим Арканоид!");
        if (y >= canvas.height*0.45 && y <= canvas.height*0.45 + 50)
            alert("Запускаем режим Сюжет!");
    }
});

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();

    requestAnimationFrame(draw);
}

// --- Запуск ---
draw();
