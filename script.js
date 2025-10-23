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
  if (now - lastTouchEnd <= 300 && e.cancelable) e.preventDefault();
  lastTouchEnd = now;
});

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

// --- СЮЖЕТНЫЙ РЕЖИМ ---
let storyLevel = 0;
let storyPopup = null;
let storyStarted = false;
let storyGirl = { x: 0, y: 0, size: 60, dodges: 0, maxDodges: 5, hit: false };
let storyBall = { x: 0, y: 0, dx: 0, dy: 0, size: 30, emoji: "🌹" };
let storyPaddle = { x: 0, y: 0, width: 80, height: 30, emoji: "👨" };
let storyHearts = [];
let heartAnimationProgress = 0;
let heartAnimationDuration = 120; // кадров

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
    ctx.font = "40px 'Segoe UI Emoji', Arial";
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;

    generateBedGrid();
    
    // Переинициализация игровых элементов при изменении размера
    if (gameState === "play") {
        resetBallPaddle();
        generateBlocks();
    }
    if (gameState === "story" && storyStarted) {
        resetStoryLevel();
    }
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

// --- Универсальный попап ---
function drawPopup(text, buttons) {
    const w = 400, h = 220;
    const x = canvas.width/2 - w/2;
    const y = canvas.height/2 - h/2;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    
    // Перенос строк если текст длинный
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width/2, y + 60 + i * 30);
    });

    buttons.forEach((btn, i) => {
        const btnWidth = 120;
        const btnSpacing = 40;
        const totalWidth = buttons.length * btnWidth + (buttons.length - 1) * btnSpacing;
        const startX = canvas.width/2 - totalWidth/2;
        
        const bx = startX + i * (btnWidth + btnSpacing);
        const by = y + 130;
        
        ctx.fillStyle = btn.color;
        ctx.fillRect(bx, by, btnWidth, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "18px Arial";
        ctx.fillText(btn.text, bx + btnWidth/2, by + 30);
        
        btn.area = {x: bx, y: by, w: btnWidth, h: 50};
    });

    return { buttons };
}

// --- Меню ---
function drawMenu() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    const title = "🍑 Уфноид 🍌";
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
    ctx.textBaseline = "top";

    // счетчик и жизни
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Обананено персичков: ${playScore}`, 20, 40);

    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("💊".repeat(playLives), 20, 70);

    // движение шарика (только если нет активного попапа)
    if (!showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
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
                showLoseLifePopup = true;
            } else {
                showGameOverPopup = true;
            }
            // Останавливаем мяч при показе попапа
            ball.dx = 0;
            ball.dy = 0;
        }
    }

    // Попапы
    if (showWinPopup) drawWinPopup();
    else if (showLoseLifePopup) drawLoseLifePopup();
    else if (showGameOverPopup) drawGameOverPopup();
}

function resetBallPaddle() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;

    paddle.width = 90;
    paddle.height = 30;
    paddle.x = canvas.width/2 - paddle.width/2;
    paddle.y = canvas.height - 50;
}

function drawGameOverPopup() {
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

function drawWinPopup() {
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
}

function drawLoseLifePopup() {
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
    // Фон сна - темный с звездами
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем звезды на фоне
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < 50; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 79) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    if (!storyStarted) {
        // Показываем попап начала сна
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

    // Девушка (уворачивающаяся)
    ctx.font = `${storyGirl.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText("👩", storyGirl.x, storyGirl.y);

    // Роза (шарик)
    ctx.font = `${storyBall.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(storyBall.emoji, storyBall.x, storyBall.y);

    // Парень (платформа)
    ctx.textBaseline = "bottom";
    ctx.font = `${storyPaddle.height*2}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(storyPaddle.emoji, storyPaddle.x, storyPaddle.y);
    ctx.textBaseline = "top";

    // Анимация сердечек после попадания
    if (storyGirl.hit && heartAnimationProgress < heartAnimationDuration) {
        heartAnimationProgress++;
        const progress = heartAnimationProgress / heartAnimationDuration;
        
        // Создаем новые сердечки
        if (heartAnimationProgress % 5 === 0 && storyHearts.length < 30) {
            storyHearts.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 20 + Math.random() * 30,
                opacity: 0
            });
        }
        
        // Анимируем сердечки
        storyHearts.forEach(heart => {
            heart.opacity = Math.min(heart.opacity + 0.02, 1);
            ctx.globalAlpha = heart.opacity;
            ctx.font = `${heart.size}px 'Segoe UI Emoji', Arial`;
            ctx.fillText("❤️", heart.x, heart.y);
        });
        ctx.globalAlpha = 1.0;
        
        // Когда анимация завершена, показываем попап
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

    // Движение розы
    if (!storyGirl.hit) {
        storyBall.x += storyBall.dx;
        storyBall.y += storyBall.dy;

        // Столкновение со стенами
        if (storyBall.x < 0 || storyBall.x > canvas.width - storyBall.size) {
            storyBall.dx = -storyBall.dx;
        }
        if (storyBall.y < 0) {
            storyBall.dy = -storyBall.dy;
        }

        // Столкновение с платформой
        if (storyBall.y + storyBall.size >= storyPaddle.y - 40 &&
            storyBall.x > storyPaddle.x && storyBall.x < storyPaddle.x + storyPaddle.width) {
            storyBall.dy = -storyBall.dy;
        }

        // Столкновение с девушкой
        if (!storyGirl.hit &&
            storyBall.x + storyBall.size > storyGirl.x &&
            storyBall.x < storyGirl.x + storyGirl.size &&
            storyBall.y + storyBall.size > storyGirl.y &&
            storyBall.y < storyGirl.y + storyGirl.size) {
            
            // Девушка уворачивается 5 раз
            if (storyGirl.dodges < storyGirl.maxDodges) {
                storyGirl.dodges++;
                // Перемещаем девушку в случайное место
                storyGirl.x = Math.random() * (canvas.width - storyGirl.size);
                storyGirl.y = 100 + Math.random() * 200;
                storyBall.dy = -storyBall.dy;
            } else {
                // Попадание после 5 уворотов
                storyGirl.hit = true;
                storyBall.dx = 0;
                storyBall.dy = 0;
            }
        }

        // Падение розы - проигрыш
        if (storyBall.y > canvas.height && !storyPopup) {
            storyPopup = drawPopup("Подкат не удался", [
                {text:"Повторить", color:"#4CAF50", onClick:()=>{
                    storyPopup = null;
                    resetStoryLevel();
                }},
                {text:"Выйти", color:"#f44336", onClick:()=>{
                    gameState = "menu";
                    storyStarted = false;
                    storyPopup = null;
                }}
            ]);
        }
    }
}

// --- Обработчик кликов ---
function handleClick(e) {
    const x = e.clientX;
    const y = e.clientY;

    // Обработка попапов сюжетного режима
    if (gameState === "story" && storyPopup) {
        storyPopup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
            }
        });
        return;
    }

    // Попап победы
    if (gameState === "play" && showWinPopup) {
        const popup = drawPopup("", []); // Создаем временный попап для получения координат
        popup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
            }
        });
        return;
    }

    // Попап потеря жизни
    if (gameState === "play" && showLoseLifePopup) {
        const popup = drawPopup("", []);
        popup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
            }
        });
        return;
    }

    // Попап Game Over
    if (gameState === "play" && showGameOverPopup) {
        const popup = drawPopup("", []);
        popup.buttons.forEach(btn => {
            if (btn.area && x >= btn.area.x && x <= btn.area.x + btn.area.w &&
                y >= btn.area.y && y <= btn.area.y + btn.area.h) {
                btn.onClick();
            }
        });
        return;
    }

    // Меню
    if (gameState === "menu" && !isTransitioning) {
        if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120 &&
            y >= canvas.height*0.3 && y <= canvas.height*0.3 + 120) {
            startTransition("arcanoid");
        }
        if (x >= canvas.width/2 - 100 && x <= canvas.width/2 + 100 &&
            y >= canvas.height*0.5 && y <= canvas.height*0.5 + 80) {
            startTransition("story");
        }
    }
}

canvas.addEventListener("click", handleClick);

// Обработчики движения платформы
function handleMouseMove(e) {
    if (gameState === "play" && !showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        paddle.x = e.clientX - paddle.width/2;
        paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
    }
    if (gameState === "story" && storyStarted && !storyPopup && !storyGirl.hit) {
        storyPaddle.x = e.clientX - storyPaddle.width/2;
        storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
    }
}

function handleTouchMove(e) {
    if (gameState === "play" && !showGameOverPopup && !showWinPopup && !showLoseLifePopup) {
        paddle.x = e.touches[0].clientX - paddle.width/2;
        paddle.x = Math.max(0, Math.min(paddle.x, canvas.width - paddle.width));
        e.preventDefault();
    }
    if (gameState === "story" && storyStarted && !storyPopup && !storyGirl.hit) {
        storyPaddle.x = e.touches[0].clientX - storyPaddle.width/2;
        storyPaddle.x = Math.max(0, Math.min(storyPaddle.x, canvas.width - storyPaddle.width));
        e.preventDefault();
    }
}

canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleTouchMove, {passive: false});

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

// --- Запуск ---
draw();
