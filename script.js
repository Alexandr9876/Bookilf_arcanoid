// script.js

window.addEventListener('load', () => {
    const menuContainer = document.createElement('div');
    menuContainer.id = 'main-menu';
    document.body.appendChild(menuContainer);

    Object.assign(menuContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        zIndex: '1000',
    });

    // Фон из смайликов кроватей
    const background = document.createElement('div');
    background.id = 'menu-background';
    menuContainer.appendChild(background);

    Object.assign(background.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        fontSize: '30px',
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        pointerEvents: 'none',
    });

    const bedEmoji = '🛏️';
    const cols = Math.ceil(window.innerWidth / 40);
    const rows = Math.ceil(window.innerHeight / 40);
    for (let i = 0; i < rows * cols; i++) {
        const span = document.createElement('span');
        span.textContent = bedEmoji;
        background.appendChild(span);
    }

    // Заголовок
    const title = document.createElement('h1');
    title.innerHTML = '🍑 Бананоид 🍌';
    Object.assign(title.style, {
        fontSize: '48px',
        margin: '20px',
        zIndex: '10',
        textAlign: 'center',
    });
    menuContainer.appendChild(title);

    // Движущиеся смайлики внизу
    const footer = document.createElement('div');
    Object.assign(footer.style, {
        position: 'absolute',
        bottom: '10px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontSize: '36px',
        zIndex: '10',
    });
    const male = document.createElement('span');
    male.textContent = '👨';
    const female = document.createElement('span');
    female.textContent = '👩';
    footer.appendChild(male);
    footer.appendChild(female);
    menuContainer.appendChild(footer);

    // Анимация смайликов
    let maleDirection = 1; // 1 — вправо, -1 — влево
    let femaleDirection = -1;

    function animateFooter() {
        const maleLeft = male.offsetLeft + maleDirection * 1; // скорость 1px
        const femaleLeft = female.offsetLeft + femaleDirection * 1;

        if (maleLeft <= 0 || maleLeft + male.offsetWidth >= window.innerWidth) maleDirection *= -1;
        if (femaleLeft <= 0 || femaleLeft + female.offsetWidth >= window.innerWidth) femaleDirection *= -1;

        male.style.left = maleLeft + 'px';
        female.style.left = femaleLeft + 'px';

        requestAnimationFrame(animateFooter);
    }

    male.style.position = 'relative';
    female.style.position = 'relative';
    animateFooter();

    // Кнопки
    const buttonsContainer = document.createElement('div');
    Object.assign(buttonsContainer.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: '10',
        marginTop: '40px',
    });
    menuContainer.appendChild(buttonsContainer);

    const playButton = document.createElement('button');
    playButton.textContent = 'Играть';
    const storyButton = document.createElement('button');
    storyButton.textContent = 'Сюжет';

    [playButton, storyButton].forEach(btn => {
        Object.assign(btn.style, {
            padding: '15px 40px',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '10px',
            border: '2px solid #000',
            backgroundColor: '#ffeb3b',
        });
        buttonsContainer.appendChild(btn);
    });

    // Заглушки для будущих режимов
    playButton.addEventListener('click', () => startGameMode('play'));
    storyButton.addEventListener('click', () => startGameMode('story'));

    // Функция для будущих уровней и арканоида
    function startGameMode(mode) {
        menuContainer.style.display = 'none'; // скрываем меню
        console.log(`Запуск режима: ${mode}`);
        // Здесь позже добавим логику арканоида и сюжета
    }
});
