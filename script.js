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

// --- Блокировка масштабирования и скролла (совместимо с iPhone) ---
["gesturestart", "gesturechange", "gestureend"].forEach(evt => {
  document.addEventListener(evt, e => {
    if (e.cancelable) e.preventDefault();
  });
});

document.addEventListener("touchmove", e => {
  if (e.scale && e.scale !== 1 && e.cancelable) e.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener("touchend", e => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300 && e.cancelable) e.preventDefault(); // блок двойного тапа
  lastTouchEnd = now;
});

// Чтобы canvas активировался на iOS после касания
canvas.addEventListener("touchstart", () => {}, { passive: true });


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
ctx.fillStyle = "#000000"; // черный цвет
ctx.fillText(`Обананено персичков: ${playScore}`, 20, 40);

// 💊 показываем жизни смайликами
ctx.font = "28px 'Segoe UI Emoji', Arial";
ctx.fillText("💊".repeat(playLives), 20, 70);



    // движение шарика
    ball.x += ball.dx;
    ball.y += ball.dy;

    // проверка столкновений со стенками
    if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
    if(ball.y < 0) ball.dy = -ball.dy;

// Проверка столкновения с платформой
if(ball.y + ball.size >= paddle.y - paddle.height*3 &&
   ball.y <= paddle.y &&
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
        showLoseLifePopup = true; // показываем "Таблеточку?"
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
    ctx.fillText("Ням 💊", canvas.width/2, y + 50);

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

// --- СЮЖЕТНЫЙ РЕЖИМ ---
let storyLevel = 0;
let storyPopup = null;
let storyLives = 3;
let storyBlocks = [];
let storyBall = {};
let storyPaddle = {};
let storyMessage = "";
let storyStarted = false;

// Универсальный попап
function drawStoryPopup(text, buttons) {
    const w = 400, h = 220;
    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width/2, y + 70);

    buttons.forEach((btn, i) => {
        const bx = x + 60 + i * 160;
        const by = y + 130;
        ctx.fillStyle = btn.color;
        ctx.fillRect(bx, by, 120, 50);
        ctx.fillStyle = "#fff";
        ctx.fillText(btn.text, bx + 60, by + 30);
        btn.area = {x: bx, y: by, w: 120, h: 50};
    });

    storyPopup = {buttons};
}

// --- Обработчик кликов для сюжета ---
canvas.addEventListener("click", e => {
    if (gameState !== "story" || !storyPopup) return;

    const { clientX: x, clientY: y } = e;
    storyPopup.buttons.forEach(btn => {
        if (x >= btn.area.x && x <= btn.area.x + btn.area.w &&
            y >= btn.area.y && y <= btn.area.y + btn.area.h) {
            btn.onClick();
        }
    });
});

// --- Запуск сюжета ---
function startStory() {
    gameState = "story";
    storyLevel = 0;
    storyStarted = false;
    drawStoryIntro();
}

function drawStoryIntro() {
    drawStoryPopup("У... Какая красотка!", [
        {text:"Начать", color:"#4CAF50", onClick:()=>startStoryLevel(1)}
    ]);
}

// --- Запуск конкретного уровня ---
function startStoryLevel(lvl) {
    storyPopup = null;
    storyLevel = lvl;
    storyLives = 3;
    storyStarted = true;

    // Настройки уровня
    const levels = {
        1: {block:"👩", paddle:"👨", ball:"🌹"},
        2: {block:"❤️", paddle:"📱", ball:"❓"},
        3: {block:"🍕", paddle:"🍳", ball:"👨‍🍳"},
        4: {block:"❤️", paddle:"🎁", ball:"🍬"},
        5: {block:"👩", paddle:"👨", ball:"💋"}
    };

    const setup = levels[lvl];
    storyBlocks = [];
    const cols = 7;
    const rows = 3;
    const spacing = 10;
    const size = 40;
    const startX = (canvas.width - (cols * size + (cols - 1)*spacing)) / 2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            storyBlocks.push({x: startX + c*(size+spacing), y: startY + r*(size+spacing), size, destroyed:false});
        }
    }

    storyBall = {x: canvas.width/2, y: canvas.height/2, dx: 4, dy: -4, size: 30, emoji: setup.ball};
    storyPaddle = {x: canvas.width/2 - 50, y: canvas.height - 60, width: 100, height: 30, emoji: setup.paddle};
    storyMessage = setup.block;
}

// --- Отрисовка сюжета ---
function drawStory() {
    // фон
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    if (!storyStarted && !storyPopup) return drawStoryIntro();

    // рисуем блоки
    ctx.font = "40px 'Segoe UI Emoji'";
    storyBlocks.forEach(b => { if (!b.destroyed) ctx.fillText(storyMessage, b.x, b.y); });

    // шарик
    ctx.font = "32px 'Segoe UI Emoji'";
    ctx.fillText(storyBall.emoji, storyBall.x, storyBall.y);

    // платформа
    ctx.font = "48px 'Segoe UI Emoji'";
    ctx.fillText(storyPaddle.emoji, storyPaddle.x, storyPaddle.y);

    // движение
    storyBall.x += storyBall.dx;
    storyBall.y += storyBall.dy;

    if(storyBall.x < 0 || storyBall.x > canvas.width - storyBall.size) storyBall.dx = -storyBall.dx;
    if(storyBall.y < 0) storyBall.dy = -storyBall.dy;

    // столкновение с платформой
    if(storyBall.y + storyBall.size >= storyPaddle.y - 40 &&
       storyBall.x > storyPaddle.x && storyBall.x < storyPaddle.x + storyPaddle.width) {
        storyBall.dy = -storyBall.dy;
    }

    // столкновения с блоками
    storyBlocks.forEach(b => {
        if(!b.destroyed &&
           storyBall.x + storyBall.size > b.x &&
           storyBall.x < b.x + b.size &&
           storyBall.y + storyBall.size > b.y &&
           storyBall.y < b.y + b.size) {
            b.destroyed = true;
            storyBall.dy = -storyBall.dy;
        }
    });

    // проигрыш
    if(storyBall.y > canvas.height) {
        storyLives--;
        if(storyLives > 0) {
            storyBall.x = canvas.width/2;
            storyBall.y = canvas.height/2;
            storyBall.dy = -4;
        } else {
            drawStoryPopup("Ты проиграл 💔", [
                {text:"Выйти", color:"#f44336", onClick:()=>{gameState="menu"; storyStarted=false;}},
                {text:"Заново", color:"#4CAF50", onClick:()=>startStoryLevel(storyLevel)}
            ]);
        }
    }

    // победа
    if(storyBlocks.every(b=>b.destroyed) && !storyPopup) {
        let text="", next=null;
        switch(storyLevel){
            case 1: text="Первый шаг сделан 💐"; next=2; break;
            case 2: text="Она согласилась на свидание 💬"; next=3; break;
            case 3: text="Свидание прошло успешно 🍷"; next=4; break;
            case 4: text="Она влюблена ❤️"; next=5; break;
            case 5: text="Пора действовать 💋"; next=null; break;
        }
        const btns = [
            {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                if(next) startStoryLevel(next);
                else { gameState="menu"; storyStarted=false; }
            }},
            {text:"Выйти", color:"#f44336", onClick:()=>{
                gameState="menu"; storyStarted=false;
            }}
        ];
        drawStoryPopup(text, btns);
    }

    // попап
    if (storyPopup) drawStoryPopup(storyPopup.text, storyPopup.buttons);
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



