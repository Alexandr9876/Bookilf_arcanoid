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
canvas.style.touchAction = "none"; // Важно для iOS

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#000";
document.body.appendChild(canvas);

// --- Блокировка масштабирования и скролла (совместимо с iPhone) ---
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
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

// Предотвращение двойного тапа для масштабирования
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
let storyLevel = 0;
let storyPopup = null;
let storyStarted = false;
let storyGirl = { x: 0, y: 0, size: 60, dodges: 0, maxDodges: 5, hit: false };
let storyBall = { x: 0, y: 0, dx: 0, dy: 0, size: 30, emoji: "🌹" };
let storyPaddle = { x: 0, y: 0, width: 80, height: 30, emoji: "👨" };
let storyHearts = [];
let heartAnimationProgress = 0;
let heartAnimationDuration = 120;

// --- iOS detection ---
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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

function drawBedBackground() {
    ctx.font = "40px 'Segoe UI Emoji', Arial, sans-serif";
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
    
    // Устанавливаем точные размеры canvas
    canvas.width = width;
    canvas.height = height;
    
    // Обновляем CSS размеры
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
        resetStoryLevel();
    }
}

// Улучшенный обработчик resize для iOS
let resizeTimeout;
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100);
});
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
    
    // Добавляем рамку
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
        
        // Стиль кнопки
        ctx.fillStyle = btn.color;
        ctx.fillRect(bx, by, btnWidth, 50);
        
        // Текст кнопки
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
    ctx.font = `bold ${fontSize}px 'Segoe UI Emoji', Arial, sans-serif`;
    
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width/2, canvas.height*0.15);

    const buttonTextSize = Math.max(20, Math.floor(canvas.height * 0.04));

    // Увеличиваем зону клика для мобильных
    const buttonWidth = Math.min(240, canvas.width * 0.6);
    const buttonHeight = Math.min(120, canvas.height * 0.15);
    
    drawButtonBra(canvas.width/2 - buttonWidth/2, canvas.height*0.3, buttonWidth, buttonHeight, "#4CAF50", "Играть", buttonTextSize);
    drawButtonStringPanties(canvas.width/2 - buttonWidth/2, canvas.height*0.5, buttonWidth, buttonHeight * 0.7, "#f44336", "Сюжет", buttonTextSize);

    ctx.font = "48px 'Segoe UI Emoji', Arial, sans-serif";
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

    // блоки
    ctx.font = `${blocks[0]?.size || 40}px 'Segoe UI Emoji', Arial, sans-serif`;
    blocks.forEach(block => {
        if(!block.destroyed) ctx.fillText(blockEmoji, block.x, block.y);
    });

    if (blocks.every(block => block.destroyed)) {
        showWinPopup = true;
    }

    // шарик
    ctx.font = `${ball.size}px 'Segoe UI Emoji', Arial, sans-serif`;
    ctx.fillText(ballEmoji, ball.x, ball.y);

    // платформа
    ctx.textBaseline = "bottom";
    ctx.font = `${paddle.height*3}px 'Segoe UI Emoji', Arial, sans-serif`;
    ctx.fillText(paddleEmoji, paddle.x, paddle.y);
    ctx.textBaseline = "top";

    // счетчик и жизни
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Очки: ${playScore}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', Arial, sans-serif";
    ctx.fillText("💊".repeat(playLives), 20, 70);

    if (!showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if(ball.x < 0 || ball.x > canvas.width - ball.size) ball.dx = -ball.dx;
        if(ball.y < 0) ball.dy = -ball.dy;

        if(ball.y + ball.size >= paddle.y - paddle.height*3 &&
           ball.y <= paddle.y &&
           ball.x + ball.size >= paddle.x &&
           ball.x <= paddle.x + paddle.width) {
            ball.dy = -ball.dy;
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

    // Рисуем попапы
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
    
    storyHearts = [];
    heartAnimationProgress = 0;
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

    // Девушка
    ctx.font = `${storyGirl.size}px 'Segoe UI Emoji', Arial, sans-serif`;
    ctx.fillText("👩", storyGirl.x, storyGirl.y);

    // Роза
    ctx.font = `${storyBall.size}px 'Segoe UI Emoji', Arial, sans-serif`;
    ctx.fillText(storyBall.emoji, storyBall.x, storyBall.y);

    // Парень
    ctx.textBaseline = "bottom";
    ctx.font = `${storyPaddle.height*2}px 'Segoe UI Emoji', Arial, sans-serif`;
    ctx.fillText(storyPaddle.emoji, storyPaddle.x, storyPaddle.y);
    ctx.textBaseline = "top";

    if (storyGirl.hit && heartAnimationProgress < heartAnimationDuration) {
        heartAnimationProgress++;
        
        if (heartAnimationProgress % 5 === 0 && storyHearts.length < 30) {
            storyHearts.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 20 + Math.random() * 30,
                opacity: 0
            });
        }
        
        storyHearts.forEach(heart => {
            heart.opacity = Math.min(heart.opacity + 0.02, 1);
            ctx.globalAlpha = heart.opacity;
            ctx.font = `${heart.size}px 'Segoe UI Emoji', Arial, sans-serif`;
            ctx.fillText("❤️", heart.x, heart.y);
        });
        ctx.globalAlpha = 1.0;
        
        if (heartAnimationProgress >= heartAnimationDuration && !storyPopup) {
            storyPopup = drawPopup("Пора сон сделать явью", [
                {text:"Проснуться", color:"#4CAF50", onClick:()=>{
                    storyPopup = drawPopup("Скоро. В разработке", [
                        {text:"В меню", color:"#4CAF50", onClick:()=>{
                            gameState = "menu";
                            storyStarted = false;
                            storyPopup = null;
                        }}
                    ]);
                }}
            ]);
        }
        return;
    }

    if (!storyGirl.hit) {
        storyBall.x += storyBall.dx;
        storyBall.y += storyBall.dy;

        if (storyBall.x < 0 || storyBall.x > canvas.width - storyBall.size) {
            storyBall.dx = -storyBall.dx;
        }
        if (storyBall.y < 0) {
            storyBall.dy = -storyBall.dy;
        }

        if (storyBall.y + storyBall.size >= storyPaddle.y - 40 &&
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

// Функция для выхода в меню
function exitToMenu() {
    gameState = "menu";
    storyStarted = false;
    storyPopup = null;
    storyGirl.hit = false;
    storyGirl.dodges = 0;
    heartAnimationProgress = 0;
    storyHearts = [];
}

// --- Улучшенный обработчик кликов ---
function handleClick(e) {
    let x, y;
    
    if (e.type === 'touchstart' || e.type === 'touchend') {
        const touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    // Корректировка координат для canvas
    const rect = canvas.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;

    // Масштабирование координат если нужно
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    // Обработка попапов сюжетного режима
    if (gameState === "story" && storyPopup) {
        let clicked = false;
        storyPopup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
                clicked = true;
                e.preventDefault();
            }
        });
        if (clicked) return;
    }

    // Обработка попапов игрового режима
    if (gameState === "play") {
        // Попап победы
        if (showWinPopup) {
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
                
                // Кнопка "Еще раз"
                if (x >= startX && x <= startX + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showWinPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                    e.preventDefault();
                    return;
                }
                
                // Кнопка "Выйти"
                if (x >= startX + btnWidth + btnSpacing && x <= startX + btnWidth + btnSpacing + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showWinPopup = false;
                    gameState = "menu";
                    e.preventDefault();
                    return;
                }
            }
        }
        
        // Попап потери жизни
        if (showLoseLifePopup) {
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
                
                // Кнопка "Принять"
                if (x >= startX && x <= startX + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showLoseLifePopup = false;
                    playLives--;
                    resetBallPaddle();
                    e.preventDefault();
                    return;
                }
                
                // Кнопка "Выйти"
                if (x >= startX + btnWidth + btnSpacing && x <= startX + btnWidth + btnSpacing + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showLoseLifePopup = false;
                    gameState = "menu";
                    e.preventDefault();
                    return;
                }
            }
        }
        
        // Попап Game Over
        if (showGameOverPopup) {
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
                
                // Кнопка "Еще раз"
                if (x >= startX && x <= startX + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showGameOverPopup = false;
                    playLives = 3;
                    playScore = 0;
                    generateBlocks();
                    resetBallPaddle();
                    e.preventDefault();
                    return;
                }
                
                // Кнопка "Выйти"
                if (x >= startX + btnWidth + btnSpacing && x <= startX + btnWidth + btnSpacing + btnWidth && 
                    y >= popupArea.y + 130 && y <= popupArea.y + 130 + 50) {
                    showGameOverPopup = false;
                    gameState = "menu";
                    e.preventDefault();
                    return;
                }
            }
        }
    }

    // Меню
    if (gameState === "menu" && !isTransitioning) {
        const buttonWidth = Math.min(240, canvas.width * 0.6);
        const buttonHeight = Math.min(120, canvas.height * 0.15);
        
        // Кнопка "Играть"
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.3 && y <= canvas.height*0.3 + buttonHeight) {
            startTransition("arcanoid");
            e.preventDefault();
            return;
        }
        
        // Кнопка "Сюжет"
        if (x >= canvas.width/2 - buttonWidth/2 && x <= canvas.width/2 + buttonWidth/2 &&
            y >= canvas.height*0.5 && y <= canvas.height*0.5 + buttonHeight * 0.7) {
            startTransition("story");
            e.preventDefault();
            return;
        }
    }
}

// Улучшенные обработчики движения
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
    if (gameState === "story" && storyStarted && !storyPopup && !storyGirl.hit) {
        storyPaddle.x = x - storyPaddle.width/2;
        storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
    }
}

// Добавляем все типы событий
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

// Запускаем игру после загрузки
window.addEventListener('load', function() {
    resizeCanvas();
    draw();
});

// Дополнительная инициализация для iOS
if (isIOS) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(resizeCanvas, 100);
    });
}
