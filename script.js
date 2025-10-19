// --- Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Глобальные переменные ---
let gameState = "menu"; // menu, playing, popup
let score = 0;
let lives = 3;

// --- Меню ---
let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 150, femaleY = 0, femaleDx = -2;

// --- Платформа и мяч ---
let paddleX = 0, paddleWidth = 100, paddleHeight = 10;
let ballX = 0, ballY = 0, dx = 3, dy = -3;
const ballRadius = 10;

// --- Кирпичи ---
let bricks = [];
const brickRowCount = 4;
const brickColumnCount = 6;
let brickWidth = 0;
const brickHeight = 25;
const brickPadding = 5;

// --- Попап ---
let popupMessage = "";
let popupButtons = [];

// --- Resize canvas ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    paddleWidth = Math.max(canvas.width * 0.25, 100);
    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;
    brickWidth = Math.max((canvas.width - 40) / brickColumnCount, 30);
    createBricks();
}

// --- Создание блоков ---
function createBricks() {
    bricks = [];
    const offsetX = (canvas.width - (brickWidth + brickPadding) * brickColumnCount + brickPadding) / 2;
    const offsetY = 60;
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = offsetX + c * (brickWidth + brickPadding);
            const brickY = offsetY + r * (brickHeight + brickPadding);
            bricks[c][r] = { x: brickX, y: brickY, status: 1 };
        }
    }
}

// --- Старт игры ---
function startGame() {
    lives = 3;
    score = 0;
    dx = 3; dy = -3;
    createBricks();
    gameState = "playing";
}

// --- Меню ---
function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "36px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("🍑 Бананоид 🍌", canvas.width/2, 80);

    drawButton("Играть", canvas.width/2-70, 200, 140, 50, "#4CAF50");
    drawButton("Сюжет", canvas.width/2-70, 270, 140, 50, "#f44336");

    // Движущиеся смайлики пола
    ctx.font = "48px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);
    maleX += maleDx; if(maleX < 20 || maleX > canvas.width-20) maleDx = -maleDx;
    femaleX += femaleDx; if(femaleX < 20 || femaleX > canvas.width-20) femaleDx = -femaleDx;
}

function drawButton(text, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w/2, y + h/2);
}

// --- Арканоид ---
function drawBall() {
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("🍌", ballX, ballY);
}

function drawPaddle() {
    ctx.font = "36px 'Segoe UI Emoji', Arial";
    ctx.fillText("🍆", paddleX + paddleWidth/2, canvas.height - 30);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b && b.status === 1) {
                ctx.font = "28px 'Segoe UI Emoji', Arial";
                ctx.fillText("🍑", b.x + brickWidth/2, b.y + brickHeight/2);
            }
        }
    }
}

function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Обананенных персиков: " + score, 10, 25);
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b && b.status === 1) {
                if (ballX > b.x && ballX < b.x+brickWidth && ballY > b.y && ballY < b.y+brickHeight) {
                    b.status = 0;
                    dy = -dy;
                    score++;
                    if (score === brickRowCount*brickColumnCount) {
                        showPopup("🎉 Гигант! 🍆🍌🍑", [
                            { text:"Повторить", action:startGame },
                            { text:"Выйти", action:()=>gameState="menu" }
                        ]);
                    }
                }
            }
        }
    }
}

// --- Попап ---
function showPopup(message, buttons) {
    popupMessage = message;
    popupButtons = buttons.map(b => ({...b}));
    gameState = "popup";
}

// --- Управление платформой ---
canvas.addEventListener("mousemove", e => {
    if(gameState === "playing"){
        const rect = canvas.getBoundingClientRect();
        paddleX = e.clientX - rect.left - paddleWidth/2;
        if(paddleX < 0) paddleX = 0;
        if(paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
});
canvas.addEventListener("touchmove", e => {
    if(gameState === "playing"){
        const rect = canvas.getBoundingClientRect();
        paddleX = e.touches[0].clientX - rect.left - paddleWidth/2;
        if(paddleX < 0) paddleX = 0;
        if(paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
    e.preventDefault();
}, {passive:false});

// --- Клик по меню/попап ---
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (gameState === "menu") {
        if (x >= canvas.width/2-70 && x <= canvas.width/2+70) {
            if (y >= 200 && y <= 250) startGame();
            if (y >= 270 && y <= 320) startStoryLevel1();
        }
    } else if(gameState === "popup") {
        popupButtons.forEach(btn => {
            if (x >= btn.x && x <= btn.x+btn.w && y >= btn.y && y <= btn.y+btn.h) {
                btn.action();
            }
        });
    }
});

// --- Главный цикл ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    else if (gameState === "playing") {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        collisionDetection();

        if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
        if (ballY + dy < ballRadius) dy = -dy;
        else if (ballY + dy > canvas.height - paddleHeight - ballRadius) {
            if(ballX > paddleX && ballX < paddleX + paddleWidth) dy = -dy;
            else {
                lives--;
                if(lives > 0) showPopup("Я могу еще раз!", [{text:"Продолжить", action: startGame}]);
                else showPopup("Давно не было просто!", [
                    { text:"Повторить", action:startGame },
                    { text:"Выйти", action:()=>gameState="menu" }
                ]);
            }
        }

        ballX += dx;
        ballY += dy;
    }

    if(gameState==="popup"){
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#fff";
        ctx.font="22px Arial";
        ctx.textAlign="center";
        ctx.fillText(popupMessage,canvas.width/2,canvas.height/2-60);

        const bw=140,bh=40;
        popupButtons.forEach((btn,i)=>{
            const bx=canvas.width/2-bw/2,by=canvas.height/2+i*60;
            btn.x=bx; btn.y=by; btn.w=bw; btn.h=bh;
            ctx.fillStyle=btn.color || "#4CAF50";
            ctx.fillRect(bx,by,bw,bh);
            ctx.fillStyle="#fff"; ctx.font="18px Arial";
            ctx.fillText(btn.text,bx+bw/2,by+bh/2);
        });
    }

    requestAnimationFrame(draw);
}

// --- Инициализация ---
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
draw();
