<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍌 БАНАНОИД 🍑</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #222;
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>

    <script>
        // Получаем canvas и контекст
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Настройки игры
        let gameState = 'menu'; // menu, playing, gameOver
        let score = 0;
        let lives = 3;

        // Мяч
        const ballRadius = 10;
        let ballX = 0;
        let ballY = 0;
        let ballSpeedX = 5;
        let ballSpeedY = -5;

        // Платформа
        const paddleHeight = 15;
        const paddleWidth = 100;
        let paddleX = 0;

        // Кирпичи
        const brickRowCount = 5;
        const brickColumnCount = 8;
        const brickWidth = 75;
        const brickHeight = 20;
        const brickPadding = 10;
        const brickOffsetTop = 60;
        const brickOffsetLeft = 30;
        
        let bricks = [];

        // Инициализация
        function init() {
            resizeCanvas();
            createBricks();
            resetBall();
            
            // Слушатели событий
            window.addEventListener('resize', resizeCanvas);
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('touchmove', touchMoveHandler, { passive: false });
            canvas.addEventListener('click', clickHandler);
            
            // Запуск игрового цикла
            gameLoop();
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Пересчет позиций
            paddleX = (canvas.width - paddleWidth) / 2;
            if (gameState === 'menu') {
                ballX = canvas.width / 2;
                ballY = canvas.height / 2;
            }
        }

        function createBricks() {
            bricks = [];
            for (let c = 0; c < brickColumnCount; c++) {
                bricks[c] = [];
                for (let r = 0; r < brickRowCount; r++) {
                    bricks[c][r] = { x: 0, y: 0, status: 1 };
                }
            }
        }

        function resetBall() {
            ballX = canvas.width / 2;
            ballY = canvas.height - 50;
            ballSpeedX = 5;
            ballSpeedY = -5;
        }

        function mouseMoveHandler(e) {
            const relativeX = e.clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }

        function touchMoveHandler(e) {
            e.preventDefault();
            const relativeX = e.touches[0].clientX - canvas.offsetLeft;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }

        function clickHandler(e) {
            if (gameState === 'menu') {
                startGame();
            } else if (gameState === 'gameOver') {
                resetGame();
            }
        }

        function startGame() {
            gameState = 'playing';
            score = 0;
            lives = 3;
            createBricks();
            resetBall();
        }

        function resetGame() {
            gameState = 'menu';
        }

        function collisionDetection() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const brick = bricks[c][r];
                    if (brick.status === 1) {
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        
                        if (ballX > brickX && 
                            ballX < brickX + brickWidth && 
                            ballY > brickY && 
                            ballY < brickY + brickHeight) {
                            ballSpeedY = -ballSpeedY;
                            brick.status = 0;
                            score++;
                            
                            if (score === brickRowCount * brickColumnCount) {
                                gameState = 'gameOver';
                            }
                        }
                    }
                }
            }
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fill();
            ctx.closePath();
        }

        function drawBricks() {
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        
                        ctx.beginPath();
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = '#ff5722';
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        function drawScore() {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('Счёт: ' + score, 8, 20);
            ctx.fillText('Жизни: ' + lives, canvas.width - 80, 20);
        }

        function drawMenu() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '48px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('🍌 БАНАНОИД 🍑', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Кликните чтобы начать', canvas.width / 2, canvas.height / 2 + 50);
            
            // Анимированный мяч в меню
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
            ctx.closePath();
            
            // Двигаем мяч в меню
            ballX += 3;
            if (ballX > canvas.width - ballRadius || ballX < ballRadius) {
                ballSpeedX = -ballSpeedX;
            }
        }

        function drawGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '48px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Счёт: ' + score, canvas.width / 2, canvas.height / 2);
            ctx.fillText('Кликните для рестарта', canvas.width / 2, canvas.height / 2 + 50);
        }

        function update() {
            if (gameState !== 'playing') return;

            // Движение мяча
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            // Столкновение со стенами
            if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
                ballSpeedX = -ballSpeedX;
            }
            if (ballY + ballSpeedY < ballRadius) {
                ballSpeedY = -ballSpeedY;
            } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
                // Столкновение с платформой
                if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                    ballSpeedY = -ballSpeedY;
                    // Добавляем немного физики - угол отскока зависит от места удара
                    const hitPos = (ballX - paddleX) / paddleWidth;
                    ballSpeedX = 8 * (hitPos - 0.5);
                } else {
                    lives--;
                    if (lives <= 0) {
                        gameState = 'gameOver';
                    } else {
                        resetBall();
                    }
                }
            }

            collisionDetection();
        }

        function draw() {
            // Очистка canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем элементы игры
            drawBricks();
            drawBall();
            drawPaddle();
            drawScore();
            
            // Рисуем экраны меню/конца игры
            if (gameState === 'menu') {
                drawMenu();
            } else if (gameState === 'gameOver') {
                drawGameOver();
            }
        }

        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }

        // Запускаем игру
        init();
    </script>
</body>
</html>
