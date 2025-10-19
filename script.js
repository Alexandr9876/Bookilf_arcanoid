<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Бананоид</title>
<style>
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    touch-action: none; /* предотвращает масштабирование и скролл на тач-устройствах */
  }
</style>
</head>
<body>
<script>
// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.display = "block";
document.body.appendChild(canvas);

// --- Переменные ---
let gameState = "menu";
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 60;
    femaleY = canvas.height - 60;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Бюстгальтер ---
function drawButtonBra(x, y, w, h, color, text, textSize) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y + h*0.4);
    ctx.bezierCurveTo(x, y + h*0.4, x + w*0.25, y + h*0.9, x + w*0.45, y + h*0.4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w*0.55, y + h*0.4);
    ctx.bezierCurveTo(x + w*0.75, y + h*0.9, x + w, y + h*0.4, x + w*0.8, y + h*0.4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w*0.45, y + h*0.4);
    ctx.lineTo(x + w*0.55, y + h*0.4);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w*0.25, y + h*0.4);
    ctx.lineTo(x + w*0.25, y + h*0.15);
    ctx.moveTo(x + w*0.75, y + h*0.4);
    ctx.lineTo(x + w*0.75, y + h*0.15);
    ctx.stroke();

    // Рамка вокруг текста
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w*0.1, y + h*0.55, w*0.8, h*0.2);

    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x + w/2, y + h*0.65);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = Math.floor(textSize/10);
    ctx.strokeText(text, x + w/2, y + h*0.65);
}

// --- Стринги ---
function drawButtonStringPanties(x, y, w, h, color, text, textSize) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x + w*0.2, y);          
    ctx.lineTo(x + w*0.5, y + h);      
    ctx.lineTo(x + w*0.8, y);          
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = h*0.08;
    ctx.beginPath();
    ctx.moveTo(x + w*0.15, y);
    ctx.lineTo(x + w*0.85, y);
    ctx.stroke();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + w*0.1, y + h*0.25, w*0.8, h*0.5);

    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x + w/2, y + h/2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = Math.floor(textSize/10);
    ctx.strokeText(text, x + w/2, y + h/2);
}

// --- Меню ---
function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const title = "🍑 Бананоид 🍌";
    let fontSize = 56; 
    ctx.font = `${fontSize}px 'Segoe UI Emoji', Arial`;
    let textWidth = ctx.measureText(title).width;

    while (textWidth > canvas.width - 40 && fontSize > 10) {
        fontSize -= 2;
        ctx.font = `${fontSize}px 'Segoe UI Emoji', Arial`;
        textWidth = ctx.measureText(title).width;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width/2, canvas.height*0.15);

    const buttonTextSize = Math.floor(canvas.height * 0.06);

    drawButtonBra(canvas.width/2 - 120, canvas.height*0.3, 240, 120, "#4CAF50", "Играть", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - 100, canvas.height*0.5, 200, 80, "#f44336", "Сюжет", buttonTextSize);

    const emojiSize = Math.floor(canvas.height * 0.08);
    ctx.font = `${emojiSize}px 'Segoe UI Emoji', Arial`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("👨", Math.min(Math.max(maleX, 20), canvas.width - 20), canvas.height - 10);
    ctx.fillText("👩", Math.min(Math.max(femaleX, 20), canvas.width - 20), canvas.height - 10);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 20) maleDx = -maleDx;
    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 20) femaleDx = -femaleDx;
}

// --- Клик по меню ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;

    if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120 &&
        y >= canvas.height*0.3 && y <= canvas.height*0.3 + 120)
        alert("Запускаем режим Арканоид!");

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

draw();

// --- Блокировка масштабирования через жесты ---
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});
</script>
</body>
</html>
