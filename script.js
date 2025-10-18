// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

const FIELD_WIDTH = 300;
const FIELD_HEIGHT = 500;
canvas.width = FIELD_WIDTH;
canvas.height = FIELD_HEIGHT;

canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.top = "50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.background = "#222";
canvas.style.touchAction = "none";

// --- Платформа ---
let paddleWidth = canvas.width * 0.25;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

// --- Шарик ---
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 60;
let dx = 3;
let dy = -3;

// --- Счет ---
let score = 0;

// --- Состояние игры ---
let gameState = "menu"; // menu, playing, story1, popup

// --- Кирпичи ---
const brickRowCount = 4;
const brickColumnCount = 6;
const brickPadding = 5;
const brickOffsetTop = 40;
const brickOffsetLeft = 20;
const brickWidth = (canvas.width - 40) / brickColumnCount;
const brickHeight = 25;
let bricks = [];

function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// --- Сюжетный уровень ---
let storyHitCount = 0;
let storyTargetX = canvas.width / 2;
let storyTargetY = 100;
let storyPaddleX = canvas.width / 2 - 25;
const storyPaddleWidth = 50;
let storyHitRegistered = false;

// --- Поп-ап ---
let popupMessage = "";
let popupButtons = [];

// --- Игровые функции ---
function startGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    gameState = "playing";
}

function startStoryLevel1() {
    storyHitCount = 0;
    storyTargetX = canvas.width / 2;
    storyHitRegistered = false;
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    gameState = "story1";
}

function hideCanvas() {
    canvas.style.display = "none";
}

// --- Рисование ---
function drawBall() {
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", ballX, ballY);
}

function drawPaddle() {
    ctx.font = "36px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("🍆", paddleX + paddleWidth / 2, canvas.height - 30);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.font = "28px 'Segoe UI Emoji', Arial";
                ctx.textAlign = "center";
                ctx.fillText("🍑", brickX + brickWidth / 2, brickY + brickHeight / 2);
            }
        }
    }
}

function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Обананеных персиков: " + score, 10, 25);
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1 &&
                ballX > b.x && ballX < b.x + brickWidth &&
                ballY > b.y && ballY < b.y + brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if (score === brickRowCount * brickColumnCount) {
                    showPopup("🎉 Гигант! 🍆🍌🍑", [
                        {text: "Еееще...", action: startGame, color:"#4CAF50"},
                        {text: "Я спать", action: hideCanvas, color:"#f44336"}
                    ]);
                }
            }
        }
    }
}

// --- Меню ---
function drawButton(text, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
}


function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Заголовок ---
    const title = "🍑 АРКАНОИД СТРАСТИ 🍌";
    const fontSize = canvas.width < 350 ? 20 : 28;

    ctx.font = fontSize + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const paddingX = 10;
    const paddingY = 5;
    const textWidth = ctx.measureText(title).width;
    const rectWidth = textWidth + paddingX * 2;
    const rectHeight = fontSize + paddingY * 2;
    const rectX = canvas.width / 2 - rectWidth / 2;
    const rectY = 50;

    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width / 2, rectY + rectHeight / 2);

    // --- Декоративные смайлики кроватей сверху и снизу заголовка ---
    ctx.font = "24px 'Segoe UI Emoji', Arial";
    for(let i = 0; i < canvas.width; i += 40) {
        ctx.fillText("🛏️", i + 20, rectY - 30); // сверху
        ctx.fillText("🛏️", i + 20, rectY + rectHeight + 20); // снизу
    }

    // --- Кнопки ---
    const btnY1 = rectY + rectHeight + 60; 
    const btnY2 = btnY1 + 60;
    drawButton("Играть", canvas.width/2-70, btnY1, 140, 40, "#4CAF50");
    drawButton("Сюжет", canvas.width/2-70, btnY2, 140, 40, "#f44336");

    // --- Декоративные смайлики возле кнопок ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("🛏️", canvas.width/2 - 100, btnY1 + 20); // рядом с первой кнопкой
    ctx.fillText("🛏️", canvas.width/2 + 100, btnY1 + 20);
    ctx.fillText("🛏️", canvas.width/2 - 100, btnY2 + 20); // рядом со второй кнопкой
    ctx.fillText("🛏️", canvas.width/2 + 100, btnY2 + 20);

    canvas.menuButtonY1 = btnY1;
    canvas.menuButtonY2 = btnY2;
}


// --- Поп-ап ---
function showPopup(message, buttons) {
    popupMessage = message;
    popupButtons = buttons.map(btn => ({...btn})); // копия с возможностью изменения координат
    gameState = "popup";
}

// --- Сюжетный уровень: переменные для "поцелуя"
let kissX = canvas.width / 2;
let kissY = canvas.height - 60;
let kSpeed = 4;
let kAngle = (Math.random() * Math.PI / 3) - Math.PI / 6; // угол между -30° и +30°
let kdx = kSpeed * Math.cos(kAngle);
let kdy = -kSpeed * Math.sin(kAngle);

function drawStoryLevel1() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Платформа ---
    ctx.font = "36px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("😊", storyPaddleX + storyPaddleWidth / 2, canvas.height - 30);

    // --- Поцелуй как шарик ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("💋", kissX, kissY);

    // --- Грустный смайлик ---
    ctx.fillText(storyHitCount < 5 ? "😢" : "😳", storyTargetX, storyTargetY);

    // --- Движение поцелуя ---
    if (kissX + kdx > canvas.width - 10 || kissX + kdx < 10) kdx = -kdx;
    if (kissY + kdy < 10) kdy = -kdy;
    else if (kissY + kdy > canvas.height - 60) {
        if (kissX > storyPaddleX && kissX < storyPaddleX + storyPaddleWidth) {
            kdy = -kdy;
            // при каждом отскоке случайный угол
            kAngle = (Math.random() * Math.PI / 3) - Math.PI / 6;
            kdx = kSpeed * Math.cos(kAngle);
            kdy = -Math.abs(kSpeed * Math.sin(kAngle));
            storyHitCount++;
        } else {
            // Поцелуй упал — сброс позиции
            kissX = canvas.width / 2;
            kissY = canvas.height - 60;
            kAngle = (Math.random() * Math.PI / 3) - Math.PI / 6;
            kdx = kSpeed * Math.cos(kAngle);
            kdy = -kSpeed * Math.sin(kAngle);
        }
    }

    kissX += kdx;
    kissY += kdy;

    // --- Уворот смайлика ---
    if (Math.abs(kissX - storyTargetX) < 40) {
        storyTargetX = Math.random() * (canvas.width - 40) + 20;
    }

    // --- Проверка завершения уровня ---
    if (storyHitCount >= 5) {
        showPopup("Первый шаг — сделан", [
            {text:"Продолжить", action:startStoryLevel1, color:"#4CAF50"},
            {text:"В главное меню", action:()=>gameState="menu", color:"#f44336"}
        ]);
    }
}

// --- Обработчик касаний и кликов ---
function handlePointer(e){
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    if(gameState==="menu"){
        const btnY1 = canvas.menuButtonY1;
        const btnY2 = canvas.menuButtonY2;
        if(clickX >= canvas.width/2-70 && clickX <= canvas.width/2+70){
            if(clickY >= btnY1 && clickY <= btnY1+40) startGame();
            if(clickY >= btnY2 && clickY <= btnY2+40) startStoryLevel1();
        }
    } else if(gameState==="popup"){
        popupButtons.forEach(btn => {
            if(clickX >= btn.x && clickX <= btn.x + btn.w &&
               clickY >= btn.y && clickY <= btn.y + btn.h) {
                btn.action();
            }
        });
    }
}

canvas.addEventListener("click", handlePointer);
canvas.addEventListener("touchstart", handlePointer);

// --- Управление свайпом ---
canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;

    if(gameState === "playing"){
        paddleX = Math.min(Math.max(relativeX - paddleWidth/2, 0), canvas.width - paddleWidth);
    } else if(gameState === "story1"){
        storyPaddleX = Math.min(Math.max(relativeX - storyPaddleWidth/2, 0), canvas.width - storyPaddleWidth);
    }
});

// --- Основной цикл ---
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(gameState==="menu") drawMenu();
    else if(gameState==="playing"){
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        collisionDetection();

        if(ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
        if(ballY + dy < ballRadius) dy = -dy;
        else if(ballY + dy > canvas.height - paddleHeight - ballRadius){
            if(ballX > paddleX && ballX < paddleX + paddleWidth) dy = -dy;
            else showPopup("💀 Игра кончила_ся!", [
                {text:"Еееще...", action:startGame, color:"#4CAF50"},
                {text:"Я спать", action:hideCanvas, color:"#f44336"}
            ]);
        }

        ballX += dx;
        ballY += dy;
    }
    else if(gameState==="story1") drawStoryLevel1();

    // --- Отрисовка поп-апа ---
    if(gameState==="popup"){
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(popupMessage, canvas.width/2, canvas.height/2-50);

        const btnWidth = 140, btnHeight = 40;
        popupButtons.forEach((btn, i) => {
            const bx = canvas.width/2 - btnWidth/2;
            const by = canvas.height/2 + i*50;
            btn.x = bx;
            btn.y = by;
            btn.w = btnWidth;
            btn.h = btnHeight;
            ctx.fillStyle = btn.color || "#4CAF50";
            ctx.fillRect(bx, by, btnWidth, btnHeight);
            ctx.fillStyle = "#fff";
            ctx.font = "18px Arial";
            ctx.fillText(btn.text, bx + btnWidth/2, by + btnHeight/2);
        });
    }

    requestAnimationFrame(draw);
}

draw();


