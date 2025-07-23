// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const board = document.getElementById('board');
    const resetBtn = document.getElementById('reset');
    const themeBtn = document.getElementById('theme');
    const difficultyBtn = document.getElementById('difficulty');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const scoreDisplay = document.getElementById('score');
    const winMessage = document.getElementById('winMessage');
    const winTime = document.getElementById('winTime');
    const winMoves = document.getElementById('winMoves');
    const winScore = document.getElementById('winScore');
    const playAgainBtn = document.getElementById('playAgain');
    
    // Lista de imágenes científicas para las cartas (en el mismo directorio)
    const scienceImageFiles = [
        'microscopio.png',
        'tubos_ensayo.png', 
        'adn.png',
        'celula.png',
        'telescopio.png',
        'planeta.png',
        'atomico.png',
        'formula.png',
        'virus.png',
        'laboratorio.png'
    ];
    
    // Definición de niveles de dificultad
    const difficultyLevels = [
        { name: "Fácil", pairs: 6, columns: 3 },
        { name: "Medio", pairs: 8, columns: 4 },
        { name: "Difícil", pairs: 10, columns: 5 }
    ];
    
    // Variables de estado del juego
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let score = 0;
    let timer;
    let seconds = 0;
    let isGameStarted = false;
    let isDarkMode = true;
    let currentDifficulty = 1;
    
    // Inicializar el juego
    function initGame() {
        resetGameState();
        createCards();
        updateBoardLayout();
    }
    
    // Reiniciar estado del juego
    function resetGameState() {
        board.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        score = 0;
        seconds = 0;
        movesDisplay.textContent = moves;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = '00:00';
        clearInterval(timer);
        isGameStarted = false;
        difficultyBtn.innerHTML = `<i class="fas fa-cogs"></i> ${difficultyLevels[currentDifficulty].name}`;
    }
    
    // Crear las cartas del juego (modificado para GitHub Pages)
    function createCards() {
        let gameImages = [...scienceImageFiles].slice(0, difficultyLevels[currentDifficulty].pairs);
        gameImages = [...gameImages, ...gameImages];
        gameImages = shuffleArray(gameImages);
        
        gameImages.forEach((imageFile, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.image = imageFile;
            card.dataset.index = index;
            
            // Usar ruta directa para las imágenes (mismo directorio)
            card.innerHTML = `
                <div class="card-front"><img src="${getImagePath(imageFile)}" alt="Elemento científico"></div>
                <div class="card-back"></div>
            `;
            
            card.addEventListener('click', flipCard);
            board.appendChild(card);
            cards.push(card);
        });
    }
    
    
    function getImagePath(filename) {
       
        if (window.location.hostname.includes('github.io')) {
            const repoName = window.location.pathname.split('/')[1] || '';
            return repoName ? `/${repoName}/${filename}` : `/${filename}`;
        }
      
        return filename;
    }
    
    // Barajar un array (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Voltear una carta
    function flipCard(e) {
        e.preventDefault();
        if (!isGameStarted) {
            startTimer();
            isGameStarted = true;
        }
        if (flippedCards.length >= 2 || this.classList.contains('flipped') || flippedCards.includes(this)) {
            return;
        }
        this.classList.add('flipped');
        flippedCards.push(this);
        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkForMatch();
        }
    }
    
    // Comprobar si cartas volteadas coinciden
    function checkForMatch() {
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        const image1 = card1.dataset.image;
        const image2 = card2.dataset.image;
        
        if (image1 === image2) {
            matchedPairs++;
            score += 100;
            scoreDisplay.textContent = score;
            card1.classList.add('matched');
            card2.classList.add('matched');
            if (seconds < 60) {
                score += 50;
                scoreDisplay.textContent = score;
            }
            flippedCards = [];
            if (matchedPairs === difficultyLevels[currentDifficulty].pairs) {
                endGame();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }
    
    // Iniciar temporizador
    function startTimer() {
        timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            if (seconds % 10 === 0 && seconds > 0 && flippedCards.length === 0) {
                score = Math.max(0, score - 10);
                scoreDisplay.textContent = score;
            }
        }, 1000);
    }
    
    // Finalizar el juego
    function endGame() {
        clearInterval(timer);
        if (moves === difficultyLevels[currentDifficulty].pairs) {
            score += 500;
        } else if (moves <= difficultyLevels[currentDifficulty].pairs * 1.5) {
            score += 300;
        } else if (moves <= difficultyLevels[currentDifficulty].pairs * 2) {
            score += 100;
        }
        scoreDisplay.textContent = score;
        winTime.textContent = timeDisplay.textContent;
        winMoves.textContent = moves;
        winScore.textContent = score;
        setTimeout(() => {
            winMessage.classList.add('show');
        }, 1000);
    }
    
    // Actualizar diseño del tablero según dificultad
    function updateBoardLayout() {
        board.style.gridTemplateColumns = `repeat(${difficultyLevels[currentDifficulty].columns}, 1fr)`;
    }
    
    // Cambiar entre modo oscuro y claro
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('light-mode');
        const themeIcon = themeBtn.querySelector('i');
        if (isDarkMode) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Claro';
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Oscuro';
        }
    }
    
    // Cambiar nivel de dificultad
    function changeDifficulty() {
        currentDifficulty = (currentDifficulty + 1) % difficultyLevels.length;
        initGame();
    }
    
    // Event listeners para botones
    resetBtn.addEventListener('click', initGame);
    themeBtn.addEventListener('click', toggleTheme);
    difficultyBtn.addEventListener('click', changeDifficulty);
    playAgainBtn.addEventListener('click', () => {
        winMessage.classList.remove('show');
        initGame();
    });
    
    // Inicializar el juego al cargar
    initGame();
});