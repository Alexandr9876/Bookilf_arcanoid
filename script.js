// --- Новое для режима истории ---
let level1Complete = false;
let showLevel2StartButton = false;
let showLevel2Popup = false;

// --- Новая история для уровня 1 ---
storyLines = [
    { type: "text", content: "Добро пожаловать в мир Бананоида! 🍌" },
    { type: "text", content: "Персики захватили твою комнату!" },
    { type: "choice", content: "Что делать?", options: ["Сражаться", "Сдаться"] },
    { type: "text", content: "Ты решил сражаться!" }
];

// --- Клик по истории ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;

    if(gameState === "story" && showStoryButtons) {
        const btnX = canvas.width/2 - 75;
        const btnY = canvas.height*0.7;
        const btnW = 150;
        const btnH = 50;

        if(x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            storyIndex++;
            showStoryButtons = false;

            if(storyIndex >= storyLines.length) {
                level1Complete = true;
                showLevel2StartButton = true;
            }
        }
    }

    // Кнопка начать уровень 2
    if(gameState === "story" && showLevel2StartButton) {
        const btnX = canvas.width/2 - 75;
        const btnY = canvas.height*0.7;
        const btnW = 150;
        const btnH = 50;

        if(x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            showLevel2StartButton = false;
            startLevel2();
        }
    }
});

// --- Рисуем историю ---
function drawStory() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff9eb5");
    gradient.addColorStop(1, "#ffd6a5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBedBackground();

    ctx.fillStyle = "#000";
    ctx.font = "32px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";

    if(!level1Complete) {
        const line = storyLines[storyIndex];
        if(line) ctx.fillText(line.content, canvas.width/2, canvas.height*0.5);
        showStoryButtons = true;
    } else {
        ctx.fillText("Ты проснулся. Пора сделать сон явью! Найдем тебе пару!", canvas.width/2, canvas.height*0.5);
    }

    if(showStoryButtons || showLevel2StartButton) {
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(canvas.width/2 - 75, canvas.height*0.7, 150, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.fillText(level1Complete ? "Начать" : "Далее", canvas.width/2, canvas.height*0.7 + 25);
    }
}

// --- Уровень 2 ---
function startLevel2() {
    gameState = "level2";
    level2.girlX = canvas.width/2 - 20;
    level2.girlY = 100;
    level2.boyX = canvas.width/2 - 40;
    level2.boyY = canvas.height - 50;
    level2.ball.x = canvas.width/2;
    level2.ball.y = canvas.height/2;
    level2.girlHitCount = 0;
    level2.hearts = [];
    level2.girlEmoji = "👩";
}

// --- Рисуем уровень 2 ---
function drawLevel2() {
    ctx.fillStyle = "#ffefd5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // девушка
    ctx.font = `${level2.girlSize}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(level2.girlEmoji, level2.girlX, level2.girlY);

    // парень
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.textBaseline = "bottom";
    ctx.fillText(level2.boyEmoji, level2.boyX, level2.boyY);
    ctx.textBaseline = "top";

    // шарик
    ctx.font = `${level2.ball.size}px 'Segoe UI Emoji', Arial`;
    ctx.fillText(level2.ballEmoji, level2.ball.x, level2.ball.y);

    // движение шарика
    level2.ball.x += level2.ball.dx;
    level2.ball.y += level2.ball.dy;

    // столкновение со стенками
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
            // заполнение сердечками
            for(let i=0;i<50;i++){
                level2.hearts.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height});
            }
            showLevel2Popup = true;
        }
    }

    // движение парня (платформа)
    level2.boyX = Math.min(Math.max(level2.boyX, 0), canvas.width - 50);

    // отрисовка сердечек
    ctx.font = "24px 'Segoe UI Emoji', Arial";
    level2.hearts.forEach(h => ctx.fillText("❤️", h.x, h.y));

    // Попап после заполнения сердечками
    if(showLevel2Popup) {
        const w = 300, h = 180;
        const x = canvas.width/2 - w/2;
        const y = canvas.height/2 - h/2;

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Первый шаг сделан", canvas.width/2, y + 50);

        // кнопки
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(x + 40, y + 100, 90, 40);
        ctx.fillStyle = "#fff";
        ctx.fillText("Продолжить", x + 85, y + 120);

        ctx.fillStyle = "#f44336";
        ctx.fillRect(x + 170, y + 100, 90, 40);
        ctx.fillStyle = "#fff";
        ctx.fillText("Выйти", x + 215, y + 120);
    }
}

// --- Обработка клика по кнопкам уровня 2 ---
canvas.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;

    if(gameState === "level2" && showLevel2Popup) {
        const px = canvas.width/2 - 150;
        const py = canvas.height/2 - 90;

        // Продолжить
        if(x >= px + 40 && x <= px + 130 && y >= py + 100 && y <= py + 140) {
            showLevel2Popup = false;
            gameState = "menu";
        }

        // Выйти
        if(x >= px + 170 && x <= px + 260 && y >= py + 100 && y <= py + 140) {
            showLevel2Popup = false;
            gameState = "menu";
        }
    }
});

// --- В главном цикле ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    if (gameState === "arcanoid") drawArcanoid();
    if(gameState === "play") drawPlay();
    if (gameState === "story") drawStory();
    if (gameState === "level2") drawLevel2();

    if (isTransitioning) {
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(draw);
}
