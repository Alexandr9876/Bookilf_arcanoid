// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Переменные ---
let storyHitCount = 0;
let storyTargetX, storyTargetY;
let storyPaddleX;
const storyPaddleWidth = 50;
let storyHitRegistered = false;

let maleX, maleY, maleDx;
let femaleX, femaleY, femaleDx;
let maleSymbolY, femaleSymbolY, maleSymbolDy, femaleSymbolDy;

let paddleWidth, paddleHeight = 10;
let paddleX;

const ballRadius = 10;
let ballX, ballY, dx = 3, dy = -3;

let score = 0;
let gameState = "menu"; // menu, playing, story1, popup

const brickRowCount = 4;
const brickColumnCount = 6;
const brickPadding = 5;
const brickOffsetTop = 40;
let brickWidth, brickHeight = 25;
let bricks = [];

let popupMessage = "";
let popupButtons = [];

// --- Переменные для "поцелуя" ---
let kissX, kissY, kdx, kdy;
let dodgeCount = 0;
let targetDodging = false;

// --- Resize Canvas ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Сюжетный уровень
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    storyTargetX = canvas.width / 2;
    storyTargetY = canvas.height / 4;

    // Поцелуй
    kissX = canvas.width / 2;
    kissY = canvas.height - 60;
    kdx = 9;
    kdy = -9;
    dodgeCount = 0;
    targetDodging = false;

    // Меню
    maleX = 50; maleY = canvas.height - 50; maleDx = 2;
    femaleX = 250; femaleY = canvas.height - 50; femaleDx = -2;
    maleSymbolY = canvas.height - 100; femaleSymbolY = canvas.height - 150;
    maleSymbolDy = 1.2; femaleSymbolDy = 1.5;

    // Платформа
    paddleWidth = canvas.width * 0.25;
    paddleX = (canvas.width - paddleWidth) / 2;

    // Шарик
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;

    // Кирпичи
    brickWidth = (canvas.width - 40) / brickColumnCount;
    createBricks();
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

// --- Кирпичи ---
function createBricks() {
    bricks = [];
    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = brickOffsetTop;

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = offsetX + c * (brickWidth + brickPadding);
            const brickY = offsetY + r * (brickHeight + brickPadding);
            bricks[c][r] = { x: brickX, y: brickY, status: 1 };
        }
    }
}

// --- Игровые функции ---
function startGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    dx = 3; dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    gameState = "playing";
}

function startStoryLevel1() {
    storyHitCount = 0;
    storyHitRegistered = false;
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    dodgeCount = 0;
    targetDodging = false;

    kissX = canvas.width / 2;
    kissY = canvas.height - 60;

    const kSpeed = 9;
    const kAngle = (Math.random() * Math.PI / 3) - Math.PI / 6;
    kdx = kSpeed * Math.cos(kAngle);
    kdy = -kSpeed * Math.sin(kAngle);

    gameState = "story1";
}

// --- Рисование ---
function drawBall() {
    ctx.font = "28px 'Segoe UI Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", ballX, ballY);
}

function drawPaddle() {
    ctx.font = "36px 'Segoe UI Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍆", paddleX + paddleWidth / 2, canvas.height - 30);
}

function drawBricks() {
    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2;

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = offsetX + c * (brickWidth + brickPadding);
                const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
                b.x = brickX; b.y = brickY;
                ctx.font = "28px 'Segoe UI Emoji', sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🍑", brickX + brickWidth / 2, brickY + brickHeight / 2);
            }
        }
    }
}

function drawScore() {
    ctx.font = "18px Arial";
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
                        { text: "Еееще...", action: startGame, color: "#4CAF50" },
                        { text: "Я спать", action: () => gameState = "menu", color: "#f44336" }
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

    const title = "🍑 АРКАНОИД СТРАСТИ 🍌";
    const fontSize = canvas.width < 350 ? 20 : 26;
    ctx.font = fontSize + "px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(title).width;
    const rectWidth = textWidth + 20;
    const rectHeight = fontSize + 12;
    const rectX = canvas.width / 2 - rectWidth / 2;
    const rectY = 50;

    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.fillStyle = "#fff";
    ctx.fillText(title, canvas.width / 2, rectY + rectHeight / 2);

    ctx.font = "24px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
    for(let i=0;i<canvas.width;i+=40){
        ctx.fillText("🛏️", i+20, rectY-25);
        ctx.fillText("🛏️", i+20, rectY+rectHeight+20);
    }

    const btnY1 = rectY + rectHeight + 60;
    const btnY2 = btnY1 + 60;
    drawButton("Играть", canvas.width/2-70, btnY1, 140, 40, "#4CAF50");
    drawButton("Сюжет", canvas.width/2-70, btnY2, 140, 40, "#f44336");

    ctx.font = "32px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);
    maleX += maleDx; if(maleX<20||maleX>canvas.width-20) maleDx=-maleDx;
    femaleX += femaleDx; if(femaleX<20||femaleX>canvas.width-20) femaleDx=-femaleDx;
    canvas.menuButtonY1=btnY1; canvas.menuButtonY2=btnY2;
}

// --- Поп-ап ---
function showPopup(message, buttons) {
    popupMessage = message;
    popupButtons = buttons.map(b => ({...b}));
    gameState = "popup";
}

// --- Сюжетный уровень ---
function drawStoryLevel1() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("😎", storyPaddleX + storyPaddleWidth / 2, canvas.height - 30);

    const paddleRect = {
        x: storyPaddleX,
        y: canvas.height - 30 - 14,
        w: storyPaddleWidth,
        h: 28
    };

    ctx.fillText("💋", kissX, kissY);
    ctx.font = "56px 'Segoe UI Emoji', Arial";
    ctx.fillText(dodgeCount < 3 ? "👧" : "💖", storyTargetX, storyTargetY);

    if (kissX + kdx > canvas.width - 14 || kissX + kdx < 14) kdx = -kdx;
    if (kissY + kdy < 14) kdy = -kdy;

    const kissRect = { x: kissX - 14, y: kissY - 14, w: 28, h: 28 };
    if (rectsOverlap(kissRect.x, kissRect.y, kissRect.w, kissRect.h,
                     paddleRect.x, paddleRect.y, paddleRect.w, paddleRect.h)) {
        kdy = -kdy;
        kissY = paddleRect.y - kissRect.h / 2 - 1;
    }

    if (kissY > canvas.height - 14) {
        showPopup("Подкат провелен 💔", [
            {text:"Ещё раз", action:startStoryLevel1, color:"#4CAF50"},
            {text:"Я спать", action:()=>gameState="menu", color:"#f44336"}
        ]);
        return;
    }

    kissX += kdx;
    kissY += kdy;

    const dxToTarget = storyTargetX - kissX;
    const dyToTarget = storyTargetY - kissY;
    const distance = Math.sqrt(dxToTarget*dxToTarget + dyToTarget*dyToTarget);

    if (distance < 60 && dodgeCount < 3 && !targetDodging) {
        storyTargetX = Math.random() * (canvas.width - 80) + 40;
        storyTargetY = Math.random() * (canvas.height / 2 - 80) + 40;
        dodgeCount++;
        targetDodging = true;
        setTimeout(()=> targetDodging = false, 800);
    }

    if (distance < 50 && dodgeCount >= 3) {
        showPopup("Первый шаг — сделан 💞", [
            {text:"Продолжить", action:startStoryLevel1, color:"#4CAF50"},
            {text:"В меню", action:()=>gameState="menu", color:"#f44336"}
        ]);
    }
}

// --- Проверка пересечения прямоугольников ---
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2){
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// --- Обработчик кликов/касаний ---
function handlePointer(e){
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if(gameState==="menu"){
        const b1=canvas.menuButtonY1,b2=canvas.menuButtonY2;
        if(x>=canvas.width/2-70 && x<=canvas.width/2+70){
            if(y>=b1&&y<=b1+40) startGame();
            if(y>=b2&&y<=b2+40) startStoryLevel1();
        }
    } else if(gameState==="popup"){
        popupButtons.forEach(btn=>{
            if(x>=btn.x&&x<=btn.x+btn.w&&y>=btn.y&&y<=btn.y+btn.h) btn.action();
        });
    }
}

canvas.addEventListener("click", handlePointer);
canvas.addEventListener("touchstart", handlePointer);

canvas.addEventListener("touchmove", e=>{
    e.preventDefault();
    const touch=e.touches[0];
    const rect=canvas.getBoundingClientRect();
    const relX=touch.clientX-rect.left;
    if(gameState==="playing")
        paddleX=Math.min(Math.max(relX-paddleWidth/2,0),canvas.width-paddleWidth);
    else if(gameState==="story1")
        storyPaddleX=Math.min(Math.max(relX-storyPaddleWidth/2,0),canvas.width-storyPaddleWidth);
});

// --- Цикл ---
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(gameState==="menu") drawMenu();
    else if(gameState==="playing"){
        drawBricks(); drawBall(); drawPaddle(); drawScore(); collisionDetection();

        if(ballX+dx>canvas.width-ballRadius||ballX+dx<ballRadius) dx=-dx;
        if(ballY+dy<ballRadius) dy=-dy;
        else if(ballY+dy>canvas.height-paddleHeight-ballRadius){
            if(ballX>paddleX&&ballX<paddleX+paddleWidth) dy=-dy;
            else showPopup("💀 Игра кончила_ся!", [
                {text:"Еееще...", action:startGame, color:"#4CAF50"},
                {text:"Я спать", action:()=>gameState="menu", color:"#f44336"}
            ]);
        }

        ballX+=dx; ballY+=dy;
    }
    else if(gameState==="story1") drawStoryLevel1();

    if(gameState==="popup"){
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#fff";
        ctx.font="22px Arial";
        ctx.textAlign="center";
        ctx.fillText(popupMessage,canvas.width/2,canvas.height/2-60);
        const bw=140,bh=40;
        popupButtons.forEach((btn,i)=>{
            const bx=canvas.width/2-bw/2;
            const by=canvas.height/2+i*60;
            btn.x=bx;btn.y=by;btn.w=bw;btn.h=bh;
            ctx.fillStyle=btn.color||"#4CAF50";
            ctx.fillRect(bx,by,bw,bh);
            ctx.fillStyle="#fff";
            ctx.font="18px Arial";
            ctx.fillText(btn.text,bx+bw/2,by+bh/2);
        });
    }

    requestAnimationFrame(draw);
}

draw();
