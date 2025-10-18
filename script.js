// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.style.position = "absolute";
canvas.style.left = "50%";
canvas.style.top = "50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.background = "#222";
canvas.style.touchAction = "none";

// --- Игровые константы ---
const brickRowCount = 4;
const brickColumnCount = 6;
const brickPadding = 5;
const brickOffsetTop = 40;
const brickOffsetLeft = 20;
const paddleHeight = 10;
const ballRadius = 10;
const storyPaddleWidth = 50;

// --- Игровые переменные ---
let paddleWidth, paddleX;
let ballX, ballY, dx = 3, dy = -3;
let bricks = [];
let brickWidth, brickHeight = 25;

let maleX = 50, maleY = 0, maleDx = 2;
let femaleX = 250, femaleY = 0, femaleDx = -2;
let maleSymbolY = 0, femaleSymbolY = 0, maleSymbolDy = 1.2, femaleSymbolDy = 1.5;

let score = 0;
let gameState = "menu";

let storyTargetX, storyTargetY = 100;
let storyPaddleX;
let storyHitRegistered = false;
let storyDodgeCount = 0;

let kissX, kissY, kdx = 9, kdy = -9;
let dodgeCount = 0;
let targetDodging = false;

let popupMessage = "";
let popupButtons = [];

// --- Функция масштабирования Canvas ---
function resizeCanvas() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = canvas.height * (3 / 5);
    }

    // --- Пересчёт размеров игровых объектов ---
    paddleWidth = canvas.width * 0.25;
    paddleX = (canvas.width - paddleWidth) / 2;

    ballX = canvas.width / 2;
    ballY = canvas.height - 60;

    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    storyTargetX = canvas.width / 2;

    maleY = canvas.height - 50;
    femaleY = canvas.height - 50;
    maleSymbolY = canvas.height - 100;
    femaleSymbolY = canvas.height - 150;

    brickWidth = (canvas.width - 40) / brickColumnCount;
    createBricks();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- Создание кирпичей ---
function createBricks() {
    bricks = [];
    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2;
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
    ballX = canvas.width / 2;
    ballY = canvas.height - 60;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    createBricks();
    gameState = "playing";
}

// --- Старт сюжетного уровня ---
function startStoryLevel1() {
    storyHitRegistered = false;
    storyDodgeCount = 0;
    dodgeCount = 0;
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    storyTargetX = canvas.width / 2;
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
    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", ballX, ballY);
}

function drawPaddle() {
   ctx.font = "36px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🍆", paddleX + paddleWidth / 2, canvas.height - 30);
}

function drawBricks() {
    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2; // центрируем

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = offsetX + c * (brickWidth + brickPadding);
                const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
                b.x = brickX;
                b.y = brickY;
                ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
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
                        {text:"Еееще...", action:startGame, color:"#4CAF50"},
                        {text:"Я спать", action:()=>gameState="menu", color:"#f44336"}
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

    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("🛏️", canvas.width/2 - 100, btnY1 + 20);
    ctx.fillText("🛏️", canvas.width/2 + 100, btnY1 + 20);
    ctx.fillText("🛏️", canvas.width/2 - 100, btnY2 + 20);
    ctx.fillText("🛏️", canvas.width/2 + 100, btnY2 + 20);

    ctx.font = "32px 'Segoe UI Emoji', Arial";
    ctx.fillText("👨", maleX, maleY);
    ctx.fillText("👩", femaleX, femaleY);
    maleX += maleDx; if(maleX<20||maleX>canvas.width-20) maleDx=-maleDx;
    femaleX += femaleDx; if(femaleX<20||femaleX>canvas.width-20) femaleDx=-femaleDx;
    canvas.menuButtonY1=btnY1; canvas.menuButtonY2=btnY2;

        // --- Вертикально движущиеся символы пола ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("♂️", canvas.width / 2 - 40, maleSymbolY);
    ctx.fillText("♀️", canvas.width / 2 + 40, femaleSymbolY);

    // --- Движение вверх-вниз ---
    maleSymbolY += maleSymbolDy;
    femaleSymbolY += femaleSymbolDy;

    if (maleSymbolY > canvas.height - 40 || maleSymbolY < canvas.height - 120) maleSymbolDy = -maleSymbolDy;
    if (femaleSymbolY > canvas.height - 60 || femaleSymbolY < canvas.height - 140) femaleSymbolDy = -femaleSymbolDy;

}

// --- Поп-ап ---
function showPopup(message, buttons) {
    popupMessage = message;
    popupButtons = buttons.map(b => ({...b}));
    gameState = "popup";
}

// --- Сюжетный уровень: переменные для "поцелуя"
let kissX = canvas.width / 2;
let kissY = canvas.height - 60;
let kdx = 9; // в 3 раза быстрее
let kdy = -9;
let dodgeCount = 0;
let targetDodging = false;

function drawStoryLevel1() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Платформа (смайлик в очках) ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.textAlign = "center";
    ctx.fillText("😎", storyPaddleX + storyPaddleWidth / 2, canvas.height - 30);

    // --- Поцелуй (мяч) ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("💋", kissX, kissY);

    // --- Грустный/смущённый смайлик ---
    ctx.font = "56px 'Segoe UI Emoji', Arial"; // крупнее в 2 раза
    ctx.fillText(dodgeCount < 3 ? "👧" : "💖", storyTargetX, storyTargetY);

    // --- Движение поцелуя ---
    if (kissX + kdx > canvas.width - 10 || kissX + kdx < 10) kdx = -kdx;
    if (kissY + kdy < 10) kdy = -kdy;
    else if (kissY + kdy > canvas.height - 60) {
        if (kissX > storyPaddleX && kissX < storyPaddleX + storyPaddleWidth) {
            kdy = -kdy;
        } else {
            // поцелуй упал
            showPopup("Игра окончена 💔", [
                {text:"Ещё раз", action:startStoryLevel1, color:"#4CAF50"},
                {text:"Я спать", action:()=>gameState="menu", color:"#f44336"}
            ]);
            return;
        }
    }

    kissX += kdx;
    kissY += kdy;

    // --- Проверяем, летит ли поцелуй прямо в грустного ---
    const dxToTarget = storyTargetX - kissX;
    const dyToTarget = storyTargetY - kissY;
    const distance = Math.sqrt(dxToTarget*dxToTarget + dyToTarget*dyToTarget);

    // если поцелуй близко летит к цели — увернуться
    if (distance < 60 && dodgeCount < 3 && !targetDodging) {
        storyTargetX = Math.random() * (canvas.width - 80) + 40;
        storyTargetY = Math.random() * (canvas.height / 2 - 80) + 40;
        dodgeCount++;
        targetDodging = true;
        setTimeout(()=> targetDodging = false, 800);
    }

    // --- Когда после 3 уворотов попал ---
    if (distance < 50 && dodgeCount >= 3) {
        showPopup("Первый шаг — сделан 💞", [
            {text:"Продолжить", action:startStoryLevel1, color:"#4CAF50"},
            {text:"В меню", action:()=>gameState="menu", color:"#f44336"}
        ]);
    }
}


// --- Обработчик касаний и кликов ---
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

// --- Свайп ---
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


