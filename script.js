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
    if (now - lastTouchEnd <= 300) e.preventDefault();
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

// --- Режим История ---
let storyIndex = 0;
let showStoryButtons = false;
let storyLines = [
    { type: "text", content: "Добро пожаловать в мир Бананоида! 🍌" },
    { type: "text", content: "Персики захватили твою комнату!" },
    { type: "choice", content: "Что делать?", options: ["Сражаться", "Сдаться"] },
    { type: "text", content: "Ты решил сражаться!" }
];

let level2Ready = false; // флаг, чтобы после победы запустить второй уровень
let showLevel2Popup = false;

// --- Уровень 2 ---
let level2 = {
    girlX: 0,
    girlY: 100,
    girlSize: 40,
    girlHitCount: 0,
    ball: { x: 0, y: 0, dx: 4, dy: -4, size: 30 },
    boyX: 0,
    boyY: 0,
    boyEmoji: "👨",
    girlEmoji: "👩",
    ballEmoji: "🌹",
    hearts: []
};

// --- Фон кроватей ---
const bedEmoji = "🛏️";
let bedGrid = [];

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60;
    const cols = Math.ceil(canvas.width / emojiSize);
    const rows = Math.ceil(canvas.height / emojiSize);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            bedGrid.push({ x: x * emojiSize, y: y * emojiSize });
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
            blocks.push({ x: startX + c*(blockSize+spacing), y: startY + r*(blockSize+spacing), size: blockSize, destroyed: false });
        }
    }
}

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12;
    bedGrid.forEach(bed => ctx.fillText(bedEmoji, bed.x, bed.y));
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;
    generateBedGrid();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Кнопки ---
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
    ctx.fillStyle = "#fff";
    ctx.font = `${textSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h*0.65);
}

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
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

// --- История ---
function drawStory() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBedBackground();

    if(storyLines[storyIndex]) {
        const line = storyLines[storyIndex];
        ctx.fillStyle = "#000";
        ctx.font = "32px 'Segoe UI Emoji', Arial";
        ctx.textAlign = "center";
        ctx.fillText(line.content, canvas.width/2, canvas.height*0.5);
        showStoryButtons = true;
    }

    if(showStoryButtons) {
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(canvas.width/2 - 75, canvas.height*0.7, 150, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.fillText("Далее", canvas.width/2, canvas.height*0.7 + 25);
    }
}

// --- Игровой уровень 1 ---
function drawPlay() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBedBackground();

    ctx.font = `${blocks[0]?.size || 40}px 'Segoe UI Emoji', Arial`;
    blocks.forEach(block => { if(!block.destroyed) ctx.fillText(blockEmoji, block.x, block.y); });

    // счетчик и жизни
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Обананено персичков: ${playScore}`, 20, 40);
    ctx.fillText(`Таблеток Виагра: ${playLives}`, 20, 70);

    // шарик и движение
    ctx.font = `${ball.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(ballEmoji, ball.x, ball.y);
    ball.x += ball.dx;
    ball.y += ball.dy;
    if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
    if(ball.y < 0) ball.dy = -ball.dy;

    // платформа
    ctx.textBaseline = "bottom";
    ctx.font = `${paddle.height*3}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(paddleEmoji, paddle.x, paddle.y);
    ctx.textBaseline = "top";
    if(ball.y + ball.size >= paddle.y - paddle.height*3 &&
       ball.y <= paddle.y &&
       ball.x + ball.size >= paddle.x &&
       ball.x <= paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }

    // столкновения с блоками
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

    // падение шарика
   if(ball.y > canvas.height) {
    if (playLives > 1) {
        showLoseLifePopup = true;
        resetBallPaddle();
    } else {
        showGameOverPopup = true;
    }
}


    // победа
    if(blocks.every(block => block.destroyed)) {
        showWinPopup = true;
        level2Ready = true;
    }

    if(showWinPopup) drawWinPopup();
    else if(showLoseLifePopup) drawLoseLifePopup();
    else if(showGameOverPopup) drawGameOverPopup();
}

// --- Запуск уровня 2 ---
function startLevel2() {
    gameState = "level2";
    level2.girlX = canvas.width/2 - 20;
    level2.girlY = 100;
    level2.boyX = canvas.width/2 - 20;
    level2.boyY = canvas.height - 50;
    level2.ball.x = canvas.width/2;
    level2.ball.y = canvas.height/2;
    level2.girlHitCount = 0;
    level2.hearts = [];
    level2.girlEmoji = "👩";
    showLevel2Popup = false;
}

// --- Отрисовка уровня 2 ---
function drawLevel2() {
    ctx.fillStyle = "#ffefd5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // девушка
    ctx.font = `${level2.girlSize}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(level2.girlEmoji, level2.girlX, level2.girlY);

    // парень
    ctx.textBaseline = "bottom";
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText(level2.boyEmoji, level2.boyX, level2.boyY);
    ctx.textBaseline = "top";

    // шарик
    ctx.font = `${level2.ball.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(level2.ballEmoji, level2.ball.x, level2.ball.y);

    // движение шарика
    level2.ball.x += level2.ball.dx;
    level2.ball.y += level2.ball.dy;

    if(level2.ball.x < 0 || level2.ball.x > canvas.width - level2.ball.size) level2.ball.dx = -level2.ball.dx;
    if(level2.ball.y < 0) level2.ball.dy = -level2.ball.dy;

    // попадание по девушке
    if(level2.ball.x + level2.ball.size > level2.girlX &&
       level2.ball.x < level2.girlX + level2.girlSize &&
       level2.ball.y + level2.ball.size > level2.girlY &&
       level2.ball.y < level2.girlY + level2.girlSize) {

        level2.girlHitCount++;
        level2.ball.dy = -level2.ball.dy;

        if(level2.girlHitCount >= 6) {
            level2.girlEmoji = "😳";
            for(let i=0;i<50;i++){
                level2.hearts.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height});
            }
            showLevel2Popup = true;
        }
    }

    // сердечки
    ctx.font = "24px 'Segoe UI Emoji', Arial";
    level2.hearts.forEach(h => ctx.fillText("❤️", h.x, h.y));
}

// --- Остальные функции (попапы, сбросы) ---
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
    const w=300,h=180,x=canvas.width/2 - w/2,y=canvas.height/2 - h/2;
    ctx.fillStyle="rgba(0,0,0,0.8)";
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#fff";
    ctx.font="20px Arial";
    ctx.textAlign="center";
    ctx.fillText("Ты сражался, как тигр 🐯",canvas.width/2,y+50);
    ctx.fillStyle="#4CAF50"; ctx.fillRect(x+40,y+100,90,40); ctx.fillStyle="#fff"; ctx.fillText("Еще раз",x+85,y+120);
    ctx.fillStyle="#f44336"; ctx.fillRect(x+170,y+100,90,40); ctx.fillStyle="#fff"; ctx.fillText("Выйти",x+215,y+120);
}

function drawWinPopup() {
    const w=300,h=180,x=canvas.width/2 - w/2,y=canvas.height/2 - h/2;
    ctx.fillStyle="rgba(0,0,0,0.8)";
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#fff";
    ctx.font="20px Arial";
    ctx.textAlign="center";
    ctx.fillText(level2Ready?"Ты проснулся. Пора сделать сон явью! Найдем тебе пару!":"Ты Гигант! 💪",canvas.width/2,y+50);
    ctx.fillStyle="#4CAF50"; ctx.fillRect(x+40,y+100,90,40); ctx.fillStyle="#fff"; ctx.fillText("Еще раз",x+85,y+120);
    ctx.fillStyle = "#f44336"; 
ctx.fillRect(x+170, y+100, 90, 40); 
ctx.fillStyle = "#fff"; 
ctx.fillText("Выйти", x+215, y+120);

}

function drawLoseLifePopup() {
    const w=300,h=150,x=canvas.width/2 - w/2,y=canvas.height/2 - h/2;
    ctx.fillStyle="rgba(0,0,0,0.8)";
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#fff";
    ctx.font="20px Arial";
    ctx.textAlign="center";
    ctx.fillText("Ой! Шарик упал 😢",canvas.width/2,y+50);
    ctx.fillStyle="#4CAF50"; ctx.fillRect(x+105,y+90,90,40); ctx.fillStyle="#fff"; ctx.fillText("Продолжить",x+150,y+110);
}

// --- Основной цикл --- 
function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    switch(gameState) {
        case "menu":
            drawMenu();
            break;
        case "story":
            drawStory();
            break;
        case "play":
            drawPlay();
            break;
        case "level2":
            drawLevel2();
            break;
    }

    requestAnimationFrame(gameLoop);
}
gameLoop();

// --- Управление мышью и касанием --- 
canvas.addEventListener("mousemove", e => {
    if(gameState === "play") {
        paddle.x = e.clientX - paddle.width/2;
        if(paddle.x < 0) paddle.x = 0;
        if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener("touchmove", e => {
    if(gameState === "play" && e.touches.length > 0) {
        paddle.x = e.touches[0].clientX - paddle.width/2;
        if(paddle.x < 0) paddle.x = 0;
        if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }
}, { passive: false });

// --- Клики --- 
canvas.addEventListener("click", e => {
    const mx = e.clientX, my = e.clientY;

    if(gameState === "menu") {
        // Играть
        if(mx >= canvas.width/2 - 120 && mx <= canvas.width/2 + 120 &&
           my >= canvas.height*0.3 && my <= canvas.height*0.3 + 120) {
            gameState = "play";
            resetBallPaddle();
            generateBlocks();
        }
        // Сюжет
        if(mx >= canvas.width/2 - 100 && mx <= canvas.width/2 + 100 &&
           my >= canvas.height*0.5 && my <= canvas.height*0.5 + 80) {
            gameState = "story";
            storyIndex = 0;
        }
    }

    if(gameState === "story" && showStoryButtons) {
        if(mx >= canvas.width/2 - 75 && mx <= canvas.width/2 + 75 &&
           my >= canvas.height*0.7 && my <= canvas.height*0.7 + 50) {
            storyIndex++;
            if(storyIndex >= storyLines.length) {
                gameState = "menu";
                showStoryButtons = false;
            }
        }
    }

    // Попапы
    if(showGameOverPopup) {
        // Еще раз
        if(mx >= canvas.width/2 - 110 && mx <= canvas.width/2 - 20 &&
           my >= canvas.height/2 + 50 && my <= canvas.height/2 + 90) {
            playLives = 3;
            playScore = 0;
            showGameOverPopup = false;
            resetBallPaddle();
            generateBlocks();
        }
        // Выйти
        if(mx >= canvas.width/2 + 20 && mx <= canvas.width/2 + 110 &&
           my >= canvas.height/2 + 50 && my <= canvas.height/2 + 90) {
            gameState = "menu";
            showGameOverPopup = false;
        }
    }

    if(showWinPopup) {
        // Еще раз
        if(mx >= canvas.width/2 - 110 && mx <= canvas.width/2 - 20 &&
           my >= canvas.height/2 + 50 && my <= canvas.height/2 + 90) {
            showWinPopup = false;
            if(level2Ready) startLevel2();
            else {
                playLives = 3;
                playScore = 0;
                resetBallPaddle();
                generateBlocks();
                gameState = "play";
            }
        }
        // Выйти
        if(mx >= canvas.width/2 + 20 && mx <= canvas.width/2 + 110 &&
           my >= canvas.height/2 + 50 && my <= canvas.height/2 + 90) {
            gameState = "menu";
            showWinPopup = false;
        }
    }

    if(showLoseLifePopup) {
        if(mx >= canvas.width/2 - 45 && mx <= canvas.width/2 + 45 &&
           my >= canvas.height/2 + 40 && my <= canvas.height/2 + 80) {
            playLives--;
            resetBallPaddle();
            showLoseLifePopup = false;
        }
    }

    if(showLevel2Popup) {
        // Клик закрывает попап
        showLevel2Popup = false;
    }
});

