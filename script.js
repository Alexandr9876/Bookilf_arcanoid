// --- Настройка Canvas ---
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// --- Сюжетный уровень ---
let storyHitCount = 0;
let storyTargetX = canvas.width / 2;
let storyTargetY = 100;
let storyPaddleX = canvas.width / 2 - 25;
const storyPaddleWidth = 50;
let storyHitRegistered = false;

function resizeCanvas() {
    // Используем реальные размеры видимой области
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Устанавливаем размер canvas
    canvas.width = width;
    canvas.height = height;

    // Настройки для растяжения на весь экран
    Object.assign(canvas.style, {
        position: "fixed",
        left: "0",
        top: "0",
        margin: "0",
        padding: "0",
        width: "100vw",
        height: "100vh",
        background: "#222",
        touchAction: "none",
        display: "block",
        overflow: "hidden"
    });

    // Пересчитываем объекты под новый размер
    storyPaddleX = canvas.width / 2 - storyPaddleWidth / 2;
    storyTargetX = canvas.width / 2;
    storyTargetY = canvas.height / 4;
    kissX = canvas.width / 2;
    kissY = canvas.height / 2;

    paddleWidth = canvas.width * 0.25;
    brickWidth = (canvas.width - 40) / brickColumnCount;

    createBricks();
}


// Перерисовываем при загрузке и изменении ориентации
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);


// --- Летающие смайлики в меню ---
let maleX = 50, maleY = canvas.height - 50, maleDx = 2;
let femaleX = 250, femaleY = canvas.height - 50, femaleDx = -2;

// --- Вертикально летающие символы пола ---
let maleSymbolY = canvas.height - 100;
let femaleSymbolY = canvas.height - 150;
let maleSymbolDy = 1.2;
let femaleSymbolDy = 1.5;

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

    const totalWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
    const offsetX = (canvas.width - totalWidth) / 2; // центрирование по ширине
    const offsetY = 60; // отступ сверху

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = offsetX + c * (brickWidth + brickPadding);
            const brickY = offsetY + r * (brickHeight + brickPadding);
            bricks[c][r] = { x: brickX, y: brickY, status: 1 };
        }
    }
}


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
    storyDodgeCount = 0;

    kissX = canvas.width / 2;
    kissY = canvas.height - 60;

    // ✅ добавляем скорость поцелуя (3 раза быстрее обычного шара)
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

    // --- Прямоугольник платформы для коллизий ---
    const paddleRect = {
        x: storyPaddleX,
        y: canvas.height - 30 - 14, // 14 — половина размера смайлика
        w: storyPaddleWidth,
        h: 28
    };

    // --- Поцелуй (мяч) ---
    ctx.font = "28px 'Segoe UI Emoji', Arial";
    ctx.fillText("💋", kissX, kissY);

    // --- Грустный/смущённый смайлик ---
    ctx.font = "56px 'Segoe UI Emoji', Arial"; // крупнее
    ctx.fillText(dodgeCount < 3 ? "👧" : "💖", storyTargetX, storyTargetY);

    // --- Движение поцелуя ---
    if (kissX + kdx > canvas.width - 14 || kissX + kdx < 14) kdx = -kdx;
    if (kissY + kdy < 14) kdy = -kdy;

    // --- Проверка столкновения с платформой ---
    const kissRect = { x: kissX - 14, y: kissY - 14, w: 28, h: 28 };
    if (rectsOverlap(kissRect.x, kissRect.y, kissRect.w, kissRect.h,
                     paddleRect.x, paddleRect.y, paddleRect.w, paddleRect.h)) {
        kdy = -kdy;
        kissY = paddleRect.y - kissRect.h / 2 - 1; // смещаем поцелуй чуть выше
    }

    // --- Проверяем, упал ли поцелуй ---
    if (kissY > canvas.height - 14) {
        showPopup("Подкат провелен 💔", [
            {text:"Ещё раз", action:startStoryLevel1, color:"#4CAF50"},
            {text:"Я спать", action:()=>gameState="menu", color:"#f44336"}
        ]);
        return;
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

// --- Функция проверки пересечения прямоугольников ---
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2){
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
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

