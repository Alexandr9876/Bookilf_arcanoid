// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Устанавливаем размеры canvas до добавления в DOM
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.display = "block";
canvas.style.touchAction = "none";
canvas.style.zIndex = "1000";

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#000";
document.body.style.touchAction = "none";
document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";
document.body.appendChild(canvas);

// --- Блокировка масштабирования ---
document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function(e) {
    e.preventDefault();
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
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

// --- СЮЖЕТНЫЙ РЕЖИМ ---
let storyLevel = 1;
let storyPopup = null;
let storyStarted = false;
let storyGirl = { x: 0, y: 0, size: 60, dodges: 0, maxDodges: 5, hit: false };
let storyBall = { x: 0, y: 0, dx: 0, dy: 0, size: 30, emoji: "🌹" };
let storyPaddle = { x: 0, y: 0, width: 80, height: 30, emoji: "👨" };

// Второй уровень
let storyBlocks = [];
let storyLevel2Ball = { x: 0, y: 0, dx: 4, dy: -4, size: 30, emoji: "😎" };
let storyLevel2Paddle = { x: 0, y: 0, width: 90, height: 30, emoji: "👨" };
let storyLevel2Lives = 3;
let storyLevel2Score = 0;

function generateBedGrid() {
    bedGrid = [];
    const emojiSize = 60;
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

function generateStoryBlocks() {
    storyBlocks = [];
    const cols = 8;
    const rows = 3;
    const spacing = 10;
    const blockSize = 40;
    const startX = (canvas.width - (cols * blockSize + (cols-1)*spacing))/2;
    const startY = 100;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            storyBlocks.push({
                x: startX + c*(blockSize+spacing),
                y: startY + r*(blockSize+spacing),
                size: blockSize,
                destroyed: false,
                emoji: "👩"
            });
        }
    }
}

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.12;
    bedGrid.forEach(bed => {
        ctx.fillText(bedEmoji, bed.x, bed.y);
    });
    ctx.globalAlpha = 1.0;
}

// --- Resize ---
function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    maleY = height - 50;
    femaleY = height - 50;

    generateBedGrid();
    
    if (gameState === "play") {
        resetBallPaddle();
        generateBlocks();
    }
    if (gameState === "story" && storyStarted) {
        if (storyLevel === 1) {
            resetStoryLevel();
        } else if (storyLevel === 2) {
            resetStoryLevel2();
        }
    }
}

let resizeTimeout;
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});

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

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${textSize}px Arial, sans-serif`;
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
    ctx.font = `bold ${textSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Универсальный попап ---
function drawPopup(text, buttons) {
    const w = Math.min(400, canvas.width - 40);
    const h = 220;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.textAlign = "center";
    
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width/2, y + 60 + i * 30);
    });

    const btnWidth = 120;
    const btnSpacing = 20;
    const totalWidth = buttons.length * btnWidth + (buttons.length - 1) * btnSpacing;
    const startX = canvas.width/2 - totalWidth/2;
    
    buttons.forEach((btn, i) => {
        const bx = startX + i * (btnWidth + btnSpacing);
        const by = y + 130;
        
        ctx.fillStyle = btn.color;
        ctx.fillRect(bx, by, btnWidth, 50);
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText(btn.text, bx + btnWidth/2, by + 30);
        
        btn.area = {x: bx, y: by, w: btnWidth, h: 50};
    });

    return { buttons, text, x, y, w, h };
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
    let fontSize = Math.min(56, canvas.width / 10);
    ctx.font = `bold ${fontSize}px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width/2, canvas.height*0.15);

    const buttonTextSize = Math.max(20, Math.floor(canvas.height * 0.04));

    const buttonWidth = Math.min(240, canvas.width * 0.6);
    const buttonHeight = Math.min(120, canvas.height * 0.15);
    
    drawButtonBra(canvas.width/2 - buttonWidth/2, canvas.height*0.3, buttonWidth, buttonHeight, "#4CAF50", "Играть", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - buttonWidth/2, canvas.height*0.5, buttonWidth, buttonHeight * 0.7, "#f44336", "Сюжет", buttonTextSize);

    ctx.font = "48px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);

    maleX += maleDx;
    if (maleX < 20 || maleX > canvas.width - 40) maleDx = -maleDx;

    femaleX += femaleDx;
    if (femaleX < 20 || femaleX > canvas.width - 40) femaleDx = -femaleDx;
}

function drawArcanoid() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Скоро (в разработке)", canvas.width/2, canvas.height/2);
}

function drawPlay() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    // Блоки
    ctx.font = `40px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    blocks.forEach(block => {
        if(!block.destroyed) {
            ctx.fillText(blockEmoji, block.x, block.y);
        }
    });

    if (blocks.every(block => block.destroyed)) {
        showWinPopup = true;
    }

    // Шарик
    ctx.font = `30px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
    ctx.fillText(ballEmoji, ball.x, ball.y);

    // Платформа
    ctx.textBaseline = "bottom";
    ctx.font = `90px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif`;
    ctx.fillText(paddleEmoji, paddle.x, paddle.y);
    ctx.textBaseline = "top";

    // Счетчик
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Очки: ${playScore}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("💊".repeat(playLives), 20, 70);

    if (!showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
        if(ball.y < 0) ball.dy = -ball.dy;

        if(ball.y + ball.size >= paddle.y - 90 &&
           ball.y <= paddle.y &&
           ball.x + ball.size >= paddle.x &&
           ball.x <= paddle.x + paddle.width) {
            ball.dy = -Math.abs(ball.dy);
        }

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

        if(ball.y > canvas.height) {
            if (playLives > 1) {
                showLoseLifePopup = true;
            } else {
                showGameOverPopup = true;
            }
            ball.dx = 0;
            ball.dy = 0;
        }
    }

    if (showWinPopup) {
        drawPopup("Ты Гигант! 💪", [
            {text:"Еще раз", color:"#4CAF50", onClick:()=>{
                showWinPopup = false;
                playLives = 3;
                playScore = 0;
                generateBlocks();
                resetBallPaddle();
            }},
            {text:"Выйти", color:"#f44336", onClick:()=>{
                showWinPopup = false;
                gameState = "menu";
            }}
        ]);
    } else if (showLoseLifePopup) {
        drawPopup("Ням 💊", [
            {text:"Принять", color:"#4CAF50", onClick:()=>{
                showLoseLifePopup = false;
                playLives--;
                resetBallPaddle();
            }},
            {text:"Выйти", color:"#f44336", onClick:()=>{
                showLoseLifePopup = false;
                gameState = "menu";
            }}
        ]);
    } else if (showGameOverPopup) {
        drawPopup("Ты сражался, как тигр 🐯", [
            {text:"Еще раз", color:"#4CAF50", onClick:()=>{
                showGameOverPopup = false;
                playLives = 3;
                playScore = 0;
                generateBlocks();
                resetBallPaddle();
            }},
            {text:"Выйти", color:"#f44336", onClick:()=>{
                showGameOverPopup = false;
                gameState = "menu";
            }}
        ]);
    }
}

function resetBallPaddle() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;

    paddle.width = Math.min(90, canvas.width * 0.2);
    paddle.height = 30;
    paddle.x = canvas.width/2 - paddle.width/2;
    paddle.y = canvas.height - 50;
}

// --- СЮЖЕТНЫЙ РЕЖИМ ---
function resetStoryLevel() {
    storyGirl.x = canvas.width/2 - storyGirl.size/2;
    storyGirl.y = 150;
    storyGirl.dodges = 0;
    storyGirl.hit = false;
    
    storyBall.x = canvas.width/2;
    storyBall.y = canvas.height/2;
    storyBall.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    storyBall.dy = -4;
    
    storyPaddle.x = canvas.width/2 - storyPaddle.width/2;
    storyPaddle.y = canvas.height - 60;
}

function resetStoryLevel2() {
    storyLevel2Ball.x = canvas.width/2;
    storyLevel2Ball.y = canvas.height/2;
    storyLevel2Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    storyLevel2Ball.dy = -4;
    
    storyLevel2Paddle.x = canvas.width/2 - storyLevel2Paddle.width/2;
    storyLevel2Paddle.y = canvas.height - 60;
    
    storyLevel2Lives = 3;
    storyLevel2Score = 0;
    
    generateStoryBlocks();
}

function drawStoryLevel1() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    ctx.font = `60px ${fontFamily}`;
    ctx.fillText("👩", storyGirl.x, storyGirl.y);

    ctx.font = `30px ${fontFamily}`;
    ctx.fillText(storyBall.emoji, storyBall.x, storyBall.y);

    ctx.textBaseline = "bottom";
    ctx.font = `60px ${fontFamily}`;
    ctx.fillText(storyPaddle.emoji, storyPaddle.x, storyPaddle.y);
    ctx.textBaseline = "top";

    if (!storyGirl.hit) {
        storyBall.x += storyBall.dx;
        storyBall.y += storyBall.dy;

        if (storyBall.x < 0 || storyBall.x > canvas.width - storyBall.size) {
            storyBall.dx = -storyBall.dx;
        }
        if (storyBall.y < 0) {
            storyBall.dy = -storyBall.dy;
        }

        if (storyBall.y + storyBall.size >= storyPaddle.y - 60 &&
            storyBall.x > storyPaddle.x && storyBall.x < storyPaddle.x + storyPaddle.width) {
            storyBall.dy = -storyBall.dy;
        }

        if (!storyGirl.hit &&
            storyBall.x + storyBall.size > storyGirl.x &&
            storyBall.x < storyGirl.x + storyGirl.size &&
            storyBall.y + storyBall.size > storyGirl.y &&
            storyBall.y < storyGirl.y + storyGirl.size) {
            
            if (storyGirl.dodges < storyGirl.maxDodges) {
                storyGirl.dodges++;
                storyGirl.x = Math.random() * (canvas.width - storyGirl.size);
                storyGirl.y = 100 + Math.random() * 200;
                storyBall.dy = -storyBall.dy;
            } else {
                storyGirl.hit = true;
                storyBall.dx = 0;
                storyBall.dy = 0;
                setTimeout(() => {
                    storyPopup = drawPopup("Пора сон сделать явью", [
                        {text:"Продолжить", color:"#4CAF50", onClick:()=>{
                            storyLevel = 2;
                            resetStoryLevel2();
                            storyPopup = null;
                        }}
                    ]);
                }, 1000);
            }
        }

        if (storyBall.y > canvas.height && !storyPopup) {
            storyPopup = drawPopup("Подкат не удался", [
                {text:"Повторить", color:"#4CAF50", onClick:()=>{
                    storyPopup = null;
                    resetStoryLevel();
                }},
                {text:"Выйти", color:"#f44336", onClick:()=>{
                    exitToMenu();
                }}
            ]);
        }
    }
}

function drawStoryLevel2() {
    const fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    
    ctx.font = `40px ${fontFamily}`;
    storyBlocks.forEach(block => {
        if(!block.destroyed) ctx.fillText(block.emoji, block.x, block.y);
    });

    if (storyBlocks.every(block => block.destroyed)) {
        storyPopup = drawPopup("Ты покорил все сердца! 💖", [
            {text:"В меню", color:"#4CAF50", onClick:()=>{
                exitToMenu();
            }}
        ]);
        return;
    }

    ctx.font = `30px ${fontFamily}`;
    ctx.fillText(storyLevel2Ball.emoji, storyLevel2Ball.x, storyLevel2Ball.y);

    ctx.textBaseline = "bottom";
    ctx.font = `90px ${fontFamily}`;
    ctx.fillText(storyLevel2Paddle.emoji, storyLevel2Paddle.x, storyLevel2Paddle.y);
    ctx.textBaseline = "top";

    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Разбито сердец: ${storyLevel2Score}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', Arial, sans-serif";
    ctx.fillText("💖".repeat(storyLevel2Lives), 20, 70);

    if (!storyPopup) {
        storyLevel2Ball.x += storyLevel2Ball.dx;
        storyLevel2Ball.y += storyLevel2Ball.dy;

        if(storyLevel2Ball.x < 0 || storyLevel2Ball.x > canvas.width - storyLevel2Ball.size) storyLevel2Ball.dx = -storyLevel2Ball.dx;
        if(storyLevel2Ball.y < 0) storyLevel2Ball.dy = -storyLevel2Ball.dy;

        if(storyLevel2Ball.y + storyLevel2Ball.size >= storyLevel2Paddle.y - 90 &&
           storyLevel2Ball.y <= storyLevel2Paddle.y &&
           storyLevel2Ball.x + storyLevel2Ball.size >= storyLevel2Paddle.x &&
           storyLevel2Ball.x <= storyLevel2Paddle.x + storyLevel2Paddle.width) {
            storyLevel2Ball.dy = -Math.abs(storyLevel2Ball.dy);
        }

        storyBlocks.forEach(block => {
            if(!block.destroyed &&
               storyLevel2Ball.x + storyLevel2Ball.size > block.x &&
               storyLevel2Ball.x < block.x + block.size &&
               storyLevel2Ball.y + storyLevel2Ball.size > block.y &&
               storyLevel2Ball.y < block.y + block.size) {
                block.destroyed = true;
                storyLevel2Ball.dy = -storyLevel2Ball.dy;
                storyLevel2Score++;
            }
        });

        if(storyLevel2Ball.y > canvas.height && !storyPopup) {
            storyLevel2Lives--;
            if (storyLevel2Lives > 0) {
                storyLevel2Ball.x = canvas.width/2;
                storyLevel2Ball.y = canvas.height/2;
                storyLevel2Ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                storyLevel2Ball.dy = -4;
            } else {
                storyPopup = drawPopup("Попробуй еще раз! 💔", [
                    {text:"Повторить", color:"#4CAF50", onClick:()=>{
                        storyPopup = null;
                        resetStoryLevel2();
                    }},
                    {text:"Выйти", color:"#f44336", onClick:()=>{
                        exitToMenu();
                    }}
                ]);
            }
        }
    }
}

function drawStory() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < 50; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 79) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    if (!storyStarted) {
        storyPopup = drawPopup("Тебе снится сон...", [
            {text:"Начать", color:"#4CAF50", onClick:()=>{
                storyStarted = true;
                storyLevel = 1;
                storyPopup = null;
                resetStoryLevel();
            }}
        ]);
        return;
    }

    if (storyPopup) {
        drawPopup(storyPopup.text, storyPopup.buttons);
        return;
    }

    if (storyLevel === 1) {
        drawStoryLevel1();
    } else if (storyLevel === 2) {
        drawStoryLevel2();
    }
}

function exitToMenu() {
    gameState = "menu";
    storyStarted = false;
    storyPopup = null;
    storyLevel = 1;
    storyGirl.hit = false;
    storyGirl.dodges = 0;
}

// --- Обработчики ---
function handleClick(e) {
    e.preventDefault();
    
    let x, y;
    
    if (e.type.includes('touch')) {
        const touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    if (gameState === "story" && storyPopup) {
        let clicked = false;
        storyPopup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
                clicked = true;
            }
        });
        if (clicked) return;
    }

    if (gameState === "play") {
        const handlePlayPopup = (popupButtons) => {
            const popupArea = {
                x: (canvas.width - Math.min(400, canvas.width - 40)) / 2,
                y: (canvas.height - 220) / 2,
                w: Math.min(400, canvas.width - 40),
                h: 220
            };
            
            if (x >= popupArea.x && x <= popupArea.x + popupArea.w &&
                y >= popupArea.y && y <= popupArea.y + popupArea.h) {
                
                const btnWidth = 120;
                const btnSpacing = 20;
                const totalWidth = 2 * btnWidth + btnSpacing;
                const startX = canvas.width/2 - totalWidth/2;
                
                for (let i = 0; i < popupButtons.length; i++) {
                    const btnX = startX + i * (btnWidth + btnSpacing);
                    if (x >= btnX && x <= btnX + btnWidth && 
                        y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                        popupButtons[i]();
                        return true;
                    }
                }
            }
            return false;
        };

        if (showWinPopup) {
            if (handlePlayPopup([
                () => {
                    showWinPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                },
                () => {
                    showWinPopup = false;
                    gameState = "menu";
                }
            ])) return;
        }
        
        if (showLoseLifePopup) {
            if (handlePlayPopup([
                () => {
                    showLoseLifePopup = false;
                    playLives--;
                    resetBallPaddle();
                },
                () => {
                    showLoseLifePopup = false;
                    gameState = "menu";
                }
            ])) return;
        }
        
        if (showGameOverPopup) {
            if (handlePlayPopup([
                () => {
                    showGameOverPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                },
                () => {
                    showGameOverPopup = false;
                    gameState = "menu";
                }
            ])) return;
        }
    }

    if (gameState === "menu" && !isTransitioning) {
        const buttonWidth = Math.min(240, canvas.width * 0.6);
        const buttonHeight = Math.min(120, canvas.height * 0.15);
        
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.3 && y <= canvas.height*0.3 + buttonHeight) {
            startTransition("play");
            return;
        }
        
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.5 && y <= canvas.height*0.5 + buttonHeight * 0.7) {
            startTransition("story");
            return;
        }
    }
}

function handleMouseMove(e) {
    let x;
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX;
    } else {
        x = e.clientX;
    }
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    x = (x - rect.left) * scaleX;

    if (gameState === "play" && !showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        paddle.x = x - paddle.width/2;
        paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
    }
    if (gameState === "story" && storyStarted && !storyPopup) {
        if (storyLevel === 1 && !storyGirl.hit) {
            storyPaddle.x = x - storyPaddle.width/2;
            storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
        } else if (storyLevel === 2) {
            storyLevel2Paddle.x = x - storyLevel2Paddle.width/2;
            storyLevel2Paddle.x = Math.max(0, Math.min(storyLevel2Paddle.x, canvas.width - storyLevel2Paddle.width));
        }
    }
}

canvas.addEventListener("click", handleClick);
canvas.addEventListener("touchstart", handleClick);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleMouseMove);

// --- Переход ---
function startTransition(targetState) {
    isTransitioning = true;
    fadeOpacity = 0;

    const fadeOut = setInterval(() => {
        fadeOpacity += 0.05;
        if (fadeOpacity >= 1) {
            clearInterval(fadeOut);
            if (targetState === "play") startPlay();
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

function startPlay() {
    gameState = "play";
    playLives = 3;
    playScore = 0;
    showGameOverPopup = false;
    showWinPopup = false;
    showLoseLifePopup = false;
    generateBlocks();
    resetBallPaddle();
}

function startStory() {
    gameState = "story";
    storyStarted = false;
    storyPopup = null;
}

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    else if (gameState === "arcanoid") drawArcanoid();
    else if (gameState === "play") drawPlay();
    else if (gameState === "story") drawStory();

    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
}

// --- Запуск ---
resizeCanvas();
generateBlocks();
resetBallPaddle();
draw
