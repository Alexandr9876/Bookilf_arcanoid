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

// --- Блокировка масштабирования и скролла на мобильных ---
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
document.addEventListener("gestureend", e => e.preventDefault());

document.addEventListener("touchmove", e => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) e.preventDefault(); // блок двойного тапа
    lastTouchEnd = now;
}, false);

// --- Переменные ---
let gameState = "menu";
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;
let fadeOpacity = 0;
let isTransitioning = false;
// --- Режим Играть ---
let playLives = 3;
let playScore = 0;

const blockEmoji = "🍑";
const ballEmoji = "🍌";
const paddleEmoji = "🍆";

let blocks = [];
let ball = { x: 0, y: 0, dx: 4, dy: -4, size: 30 };
let paddle = { x: 0, y: 0, width: 90, height: 30 };

let showGameOverPopup = false;
let showWinPopup = false;
let showLoseLifePopup = false;




// --- Фон кроватей ---
const bedEmoji = "🛏️";
let bedGrid = [];

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60; // шаг между кроватями (можно увеличить или уменьшить)
    const cols = Math.ceil(canvas.width / emojiSize);
    const rows = Math.ceil(canvas.height / emojiSize);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            bedGrid.push({
                x: x * emojiSize,
                y: y * emojiSize
            });
        }
    }
}
function generateBlocks() {
    blocks = [];
    const cols = 8;
    const rows = 3;
    const spacing = 10;
    const blockSize = 40;
    const startX = (canvas.width - (cols * blockSize + (cols-1)*spacing))/2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            blocks.push({
                x: startX + c*(blockSize+spacing),
                y: startY + r*(blockSize+spacing),
                size: blockSize,
                destroyed: false
            });
        }
    }
}

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12; // лёгкая прозрачность
    bedGrid.forEach(bed => {
        ctx.fillText(bedEmoji, bed.x, bed.y);
    });
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;

    generateBedGrid(); // обновляем сетку кроватей при изменении размера
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Бюстгальтер ---
function drawButtonBra(x, y, w, h, color, text, textSize) {
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

    // Мостик
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

    // Текст
    ctx.fillStyle = "#fff";
    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.65);
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

    ctx.fillStyle = "#fff";
    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Меню ---
function drawMenu() {
   // Фон: мягкий романтичный градиент
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, "#ff9eb5");  // светло-розовый верх
gradient.addColorStop(1, "#ffd6a5");  // персиковый низ
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

    // фон кроватей
    drawBedBackground();

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

    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 40) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 40) femaleDx = -femaleDx;
}

// --- Игровые заглушки ---
function drawArcanoid() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}

function drawStory() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffb6c1";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}
function drawPlay() {
    // фон
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    // блоки
    ctx.font = `${blocks[0]?.size || 40}px 'Segoe UI Emoji', Arial`;
   
      blocks.forEach(block => {
    if(!block.destroyed) ctx.fillText(blockEmoji, block.x, block.y);
});
// проверка победы
if (blocks.every(block => block.destroyed)) {
    showWinPopup = true;
}


    // шарик
    ctx.font = `${ball.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(ballEmoji, ball.x, ball.y);

    // платформа
    ctx.textBaseline = "bottom";
    ctx.font = `${paddle.height*3}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(paddleEmoji, paddle.x, paddle.y);
    ctx.textBaseline = "top"; // вернуть обратно для остальных элементов


    // счетчик и жизни
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Обананено персичков: ${playScore}`, 20, 40);
    ctx.fillText(`Таблеток Виагра: ${playLives}`, 20, 70);

    // движение шарика
    ball.x += ball.dx;
    ball.y += ball.dy;

    // проверка столкновений со стенками
    if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
    if(ball.y < 0) ball.dy = -ball.dy;

    // проверка столкновения с платформой
    if(ball.y + ball.size >= paddle.y &&
       ball.x + ball.size >= paddle.x &&
       ball.x <= paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }

    // проверка попадания по блокам
    blocks.forEach(block => {
        if(!block.destroyed &&
           ball.x + ball.size > block.x &&
           ball.x < block.x + block.size &&
           ball.y + ball.size > block.y &&
           ball.y < block.y + block.size) {
            block.destroyed = true;
            ball.dy = -ball.dy;
            playScore++;
        }
    });

    
   // проверка падения шарика
if(ball.y > canvas.height) {
    if (playLives > 1) {
        showLoseLifePopup = true; // показываем "Скушать таблетку"
    } else {
        showGameOverPopup = true;
    }
}



    // Попап при
  if (showWinPopup) drawWinPopup();
else if (showLoseLifePopup) drawLoseLifePopup();
else if (showGameOverPopup) drawGameOverPopup();


}
function resetBallPaddle() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.dx = 4;
    ball.dy = -4;

    paddle.width = 90;
    paddle.height = 30;
    paddle.x = canvas.width/2 - paddle.width/2;
    paddle.y = canvas.height - 50;
}

function drawGameOverPopup() {
    const w = 300, h = 180;
    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ты сражался, как тигр 🐯", canvas.width/2, y + 50);

    // кнопки
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x + 40, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Еще раз", x + 40 + 45, y + 120);

    ctx.fillStyle = "#f44336";
    ctx.fillRect(x + 170, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Выйти", x + 170 + 45, y + 120);
}

function drawWinPopup() {
    const w = 300, h = 180;
    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ты Гигант! 💪", canvas.width/2, y + 50);

    // кнопки
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x + 40, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Еще раз", x + 40 + 45, y + 120);

    ctx.fillStyle = "#f44336";
    ctx.fillRect(x + 170, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Выйти", x + 170 + 45, y + 120);
}

function drawLoseLifePopup() {
    const w = 300, h = 180;
    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Скушать таблетку 💊", canvas.width/2, y + 50);

    // кнопки
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x + 40, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Принять", x + 40 + 45, y + 120);

    ctx.fillStyle = "#f44336";
    ctx.fillRect(x + 170, y + 100, 90, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText("Выйти", x + 170 + 45, y + 120);
}

// --- Клики по меню ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;
// Попап победы
if (gameState === "play" && showWinPopup) {
    const px = canvas.width/2 - 150;
    const py = canvas.height/2 - 90;

    // Еще раз
    if(x >= px + 40 && x <= px + 130 && y >= py + 100 && y <= py + 140) {
        showWinPopup = false;
        playLives = 3;
        playScore = 0;
        generateBlocks();
        resetBallPaddle();
        return;
    }

    // Выйти
    if(x >= px + 170 && x <= px + 260 && y >= py + 100 && y <= py + 140) {
        showWinPopup = false;
        gameState = "menu";
        return;
    }
}

// Попап потеря жизни
if (gameState === "play" && showLoseLifePopup) {
    const px = canvas.width/2 - 150;
    const py = canvas.height/2 - 90;

    // Принять
    if(x >= px + 40 && x <= px + 130 && y >= py + 100 && y <= py + 140) {
        showLoseLifePopup = false;
        playLives--; // минус жизнь
        resetBallPaddle();
        return;
    }

    // Выйти
    if(x >= px + 170 && x <= px + 260 && y >= py + 100 && y <= py + 140) {
        showLoseLifePopup = false;
        gameState = "menu";
        return;
    }
}

    // Попап Game Over
    if(gameState === "play" && showGameOverPopup) {
        const px = canvas.width/2 - 150;
        const py = canvas.height/2 - 90;

        // Еще раз
        if(x >= px + 40 && x <= px + 130 && y >= py + 100 && y <= py + 140) {
            showGameOverPopup = false;
            playLives = 3;
            playScore = 0;
            generateBlocks();
            resetBallPaddle();
            return;
        }

        // Выйти
        if(x >= px + 170 && x <= px + 260 && y >= py + 100 && y <= py + 140) {
            gameState = "menu";
            return;
        }
    }

    // Меню
    if(gameState === "menu" && !isTransitioning) {
        if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120 &&
            y >= canvas.height*0.3 && y <= canvas.height*0.3 + 120) {
            startTransition("arcanoid");
        }
        if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
            y >= canvas.height*0.5 && y <= canvas.height*0.5 + 80) {
            startTransition("story");
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if(gameState === "play" && !showGameOverPopup) {
        paddle.x = e.clientX - paddle.width/2;
    }
});

canvas.addEventListener("touchmove", e => {
    if(gameState === "play" && !showGameOverPopup) {
        paddle.x = e.touches[0].clientX - paddle.width/2;
    }
}, {passive:false});

// --- Переход ---
function startTransition(targetState) {
    isTransitioning = true;
    fadeOpacity = 0;

    const fadeOut = setInterval(() => {
        fadeOpacity += 0.05;
        if (fadeOpacity >= 1) {
            clearInterval(fadeOut);
            if (targetState === "arcanoid") startArcanoid();
            if (targetState === "story") startStory();

            const fadeIn = setInterval(() => {
                fadeOpacity -= 0.05;
                if (fadeOpacity <= 0) {
                    clearInterval(fadeIn);
                    isTransitioning = false;
                }
            }, 30);
        }
    }, 30);
}

// --- Запуск режимов ---
function startArcanoid() {
    gameState = "play";
    playLives = 3;
    playScore = 0;
    generateBlocks();
    resetBallPaddle();
}

function startStory() {
    gameState = "story";
}

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    if (gameState === "arcanoid") drawArcanoid();
    if(gameState === "play") drawPlay();
    if (gameState === "story") drawStory();

    // затемнение при переходе
    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
}

// --- Запуск ---
draw();



