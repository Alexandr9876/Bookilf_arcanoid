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
let x = canvas.width / 2;
let y = canvas.height - 60;
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
let storyPaddleX = canvas.width / 2;
let storyPaddleWidth = 50;
let storyHitRegistered = false;

// --- Поп-ап ---
let popupMessage = "";
let popupButtons = [];

// --- Игровые функции ---
function startGame() {
    x = canvas.width / 2;
    y = canvas.height - 60;
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
    canvas.style.display="none";
}

// --- Рисование ---
function drawBall() {
    ctx.font = "28px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍌", x, y);
}

function drawPaddle() {
    ctx.font = "36px 'Segoe UI Emoji'";
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
                ctx.font = "28px 'Segoe UI Emoji'";
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
                x > b.x && x < b.x + brickWidth &&
                y > b.y && y < b.y + brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if (score === brickRowCount * brickColumnCount) {
                    showPopup("🎉 Гигант! 🍆🍌🍑", [
                        {text: "Еееще...", action: startGame},
                        {text: "Я спать", action: hideCanvas}
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
    ctx.fillText(text, x + w/2, y + h/2);
}

function drawMenu() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = "28px Arial";
    ctx.textAlign="center";
    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(20,50,canvas.width-40,40);
    ctx.fillStyle="#fff";
    ctx.fillText("🍑 АРКАНОИД СТРАСТИ 🍌", canvas.width/2, 70);

    drawButton("Играть", canvas.width/2 - 70, 200, 140, 40, "#4CAF50");
    drawButton("Сюжет", canvas.width/2 - 70, 260, 140, 40, "#f44336");
}

// --- Поп-ап ---
function showPopup(message, buttons) {
    popupMessage = message;
    popupButtons = buttons;
    gameState = "popup";
}

// --- Сюжетный уровень ---
function drawStoryLevel1() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.font="36px 'Segoe UI Emoji'";
    ctx.textAlign="center";
    ctx.fillText("😊", storyPaddleX + storyPaddleWidth/2, canvas.height - 30);
    const kissY = canvas.height - 60 - storyHitCount*40;
    ctx.font="28px 'Segoe UI Emoji'";
    ctx.fillText("💋", storyPaddleX + storyPaddleWidth/2, kissY);
    ctx.fillText(storyHitCount<5?"😢":"😳", storyTargetX, storyTargetY);

    if (!storyHitRegistered && Math.abs((storyPaddleX + storyPaddleWidth/2)-storyTargetX)<30){
        storyHitCount++;
        storyHitRegistered = true;
        storyTargetX = Math.random()*(canvas.width-40)+20;
    }
    if (Math.abs((storyPaddleX + storyPaddleWidth/2)-storyTargetX)>=30){
        storyHitRegistered=false;
    }

    if (storyHitCount>=5){
        showPopup("Первый шаг — сделан", [
            {text:"Продолжить", action:startStoryLevel1},
            {text:"В главное меню", action:()=>gameState="menu"}
        ]);
    }
}

// --- Обработчик касаний и кликов ---
function handlePointer(e){
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if(e.touches){clientX=e.touches[0].clientX; clientY=e.touches[0].clientY;}
    else{clientX=e.clientX; clientY=e.clientY;}
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    if(gameState==="menu"){
        if(clickX>=canvas.width/2-70 && clickX<=canvas.width/2+70){
            if(clickY>=200 && clickY<=240) startGame();
            if(clickY>=260 && clickY<=300) startStoryLevel1();
        }
    }
    else if(gameState==="popup"){
        popupButtons.forEach(btn=>{
            if(clickX>=btn.x && clickX<=btn.x+btn.w && clickY>=btn.y && clickY<=btn.y+btn.h){
                btn.action();
            }
        });
    }
}

canvas.addEventListener("click", handlePointer);
canvas.addEventListener("touchstart", handlePointer);

// --- Управление свайпом ---
canvas.addEventListener("touchmove", e=>{
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const relativeX = touch.clientX - rect.left;

    if(gameState==="playing"){
        paddleX = relativeX - paddleWidth/2;
        if(paddleX<0)paddleX=0;
        if(paddleX+paddleWidth>canvas.width)paddleX=canvas.width-paddleWidth;
    }
    else if(gameState==="story1"){
        storyPaddleX = relativeX - storyPaddleWidth/2;
        if(storyPaddleX<0)storyPaddleX=0;
        if(storyPaddleX+storyPaddleWidth>canvas.width)storyPaddleX=canvas.width-storyPaddleWidth;
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

        if(x+dx>canvas.width-ballRadius || x+dx<ballRadius) dx=-dx;
        if(y+dy<ballRadius) dy=-dy;
        else if(y+dy>canvas.height-paddleHeight-ballRadius){
            if(x>paddleX && x<paddleX+paddleWidth) dy=-dy;
            else showPopup("💀 Игра кончила_ся!", [
                {text:"Еееще...", action:startGame},
                {text:"Я спать", action:hideCanvas}
            ]);
        }

        x+=dx; y+=dy;
    }
    else if(gameState==="story1") drawStoryLevel1();

    if(gameState==="popup"){
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#fff";
        ctx.font="24px Arial";
        ctx.textAlign="center";
        ctx.fillText(popupMessage, canvas.width/2, canvas.height/2-50);

        const btnWidth=140, btnHeight=40;
        popupButtons.forEach((btn,i)=>{
            const bx = canvas.width/2 - btnWidth/2;
            const by = canvas.height/2 + i*50;
            btn.x=bx; btn.y=by; btn.w=btnWidth; btn.h=btnHeight;
            ctx.fillStyle = i===0?"#4CAF50":"#f44336";
            ctx.fillRect(bx,by,btnWidth,btnHeight);
            ctx.fillStyle="#fff";
            ctx.font="18px Arial";
            ctx.fillText(btn.text,bx+btnWidth/2,by+btnHeight/2);
        });
    }

    requestAnimationFrame(draw);
}

draw();
