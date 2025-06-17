class Game {
    constructor() {
        console.log('Initializing game...');
        this.astronaut = document.getElementById('astronaut');
        this.gameArea = document.querySelector('.game-area');
        this.scoreElement = document.getElementById('score');
        this.messageElement = document.getElementById('message');
        this.startButton = document.getElementById('startButton');
        this.bed = document.getElementById('bed');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.snoringSound = document.getElementById('snoringSound');
        this.musicToggle = document.getElementById('musicToggle');
        
        if (!this.astronaut || !this.gameArea || !this.scoreElement || !this.messageElement || 
            !this.startButton || !this.bed || !this.backgroundMusic || !this.snoringSound || !this.musicToggle) {
            console.error('Failed to find required elements');
            return;
        }
        
        // Set up music
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        
        // Try to play music immediately
        const playMusic = () => {
            this.backgroundMusic.play().catch(error => {
                console.log('Initial autoplay prevented:', error);
                // Add click event to document to start music
                document.addEventListener('click', () => {
                    this.backgroundMusic.play();
                    document.removeEventListener('click', playMusic);
                }, { once: true });
            });
        };
        
        // Try to play music immediately
        playMusic();

        // Set up music toggle
        this.musicToggle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent any default behavior
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play();
                this.musicToggle.textContent = '🔊';
                this.musicToggle.classList.remove('muted');
            } else {
                this.backgroundMusic.pause();
                this.musicToggle.textContent = '🔇';
                this.musicToggle.classList.add('muted');
            }
        });

        // Add touch event for music toggle
        this.musicToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play();
                this.musicToggle.textContent = '🔊';
                this.musicToggle.classList.remove('muted');
            } else {
                this.backgroundMusic.pause();
                this.musicToggle.textContent = '🔇';
                this.musicToggle.classList.add('muted');
            }
        });
        
        // Prevent space key from triggering when clicking the music toggle
        this.musicToggle.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        this.resetGameState();
        
        this.startButton.addEventListener('click', () => {
            console.log('Start button clicked');
            this.startGame();
        });

        // Add touch event for start button
        this.startButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('Start button touched');
            this.startGame();
        });

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Add touch event for jumping
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isJumping && !this.isGameOver) {
                this.jump();
            }
        });
        
        // Show start button initially
        this.startButton.style.display = 'block';
        this.startButton.textContent = 'Start Game';
        this.startButton.classList.add('start');
        console.log('Game initialized successfully');
    }

    resetGameState() {
        this.score = 0;
        this.cansCollected = 0;
        this.isJumping = false;
        this.isGameOver = false;
        this.gameSpeed = 5;
        this.clouds = [];
        this.cans = [];
        this.intervals = [];
        this.animationFrame = null;
        
        // Reset astronaut position and classes
        this.astronaut.style.left = '50px';
        this.astronaut.style.transition = 'none';
        this.astronaut.classList.remove('running', 'jumping', 'sleeping');
        
        // Reset bed with proper cleanup
        this.bed.style.display = 'none';
        this.bed.style.opacity = '0';
        this.bed.classList.remove('goal-bed');
        // Force a reflow to ensure styles are reset
        void this.bed.offsetWidth;
        
        // Reset UI elements
        this.scoreElement.textContent = '0';
        this.messageElement.style.display = 'none';
        this.startButton.style.display = 'none';
        this.startButton.classList.remove('play-again', 'try-again');
        this.startButton.classList.add('start');
        this.startButton.textContent = 'Start Game';

        // Stop snoring sound if it's playing
        this.snoringSound.pause();
        this.snoringSound.currentTime = 0;

        // Start background music
        this.backgroundMusic.play().catch(error => {
            console.log('Music autoplay prevented:', error);
        });
    }

    cleanup() {
        console.log('Cleaning up game...'); // Debug log
        
        // Clear all intervals
        this.intervals.forEach(interval => {
            clearInterval(interval);
            console.log('Interval cleared'); // Debug log
        });
        this.intervals = [];
        
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
            console.log('Animation frame cancelled'); // Debug log
        }
        
        // Remove all clouds and cans
        this.clouds.forEach(cloud => cloud.remove());
        this.cans.forEach(can => can.remove());
        this.clouds = [];
        this.cans = [];
        console.log('Clouds and cans removed'); // Debug log
        
        // Don't reset game state if we're winning
        if (!this.isGameOver) {
            this.isGameOver = false;
            this.isJumping = false;
            this.astronaut.classList.remove('running', 'jumping', 'sleeping');
        }
    }

    startGame() {
        console.log('Starting game...');
        // Clean up any existing game state
        this.cleanup();
        
        // Reset all game states
        this.resetGameState();
        
        // Hide start button
        this.startButton.style.display = 'none';
        
        // Start running animation
        this.astronaut.classList.add('running');
        console.log('Astronaut running animation started');
        
        // Ensure music is playing
        if (this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(error => {
                console.log('Music autoplay prevented:', error);
            });
        }
        
        // Start game loops
        this.gameLoop();
        this.spawnClouds();
        this.spawnCans();
        console.log('Game loops started');
    }

    handleKeyPress(e) {
        // Only handle space key if we're not clicking the music toggle
        if (e.code === 'Space' && !this.isJumping && !this.isGameOver && e.target !== this.musicToggle) {
            console.log('Jump triggered');
            this.jump();
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.astronaut.classList.remove('running');
            this.astronaut.classList.add('jumping', 'jump');
            console.log('Jump animation started');
            
            setTimeout(() => {
                this.astronaut.classList.remove('jump');
                this.isJumping = false;
                if (!this.isGameOver) {
                    this.astronaut.classList.remove('jumping');
                    this.astronaut.classList.add('running');
                }
                console.log('Jump animation ended');
            }, 800);
        }
    }

    spawnClouds() {
        console.log('Starting cloud spawning');
        const cloudInterval = setInterval(() => {
            if (this.isGameOver) return;
            
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            cloud.style.left = '800px';
            this.gameArea.appendChild(cloud);
            this.clouds.push(cloud);
            console.log('Cloud spawned');
        }, 2000);
        
        this.intervals.push(cloudInterval);
    }

    spawnCans() {
        console.log('Starting can spawning');
        const canInterval = setInterval(() => {
            if (this.isGameOver) return;
            
            const can = document.createElement('div');
            can.classList.add('can');
            can.style.left = '800px';
            can.style.bottom = Math.random() * 200 + 50 + 'px';
            this.gameArea.appendChild(can);
            this.cans.push(can);
            console.log('Can spawned');
        }, 3000);
        
        this.intervals.push(canInterval);
    }

    moveElements() {
        // Move clouds
        this.clouds.forEach((cloud, index) => {
            const currentLeft = parseInt(cloud.style.left);
            if (currentLeft < -80) {
                cloud.remove();
                this.clouds.splice(index, 1);
            } else {
                cloud.style.left = (currentLeft - this.gameSpeed) + 'px';
            }
        });

        // Move cans
        this.cans.forEach((can, index) => {
            const currentLeft = parseInt(can.style.left);
            if (currentLeft < -30) {
                can.remove();
                this.cans.splice(index, 1);
            } else {
                can.style.left = (currentLeft - this.gameSpeed) + 'px';
            }
        });
    }

    isColliding(rect1, rect2) {
        // Remove padding for more precise collisions
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    checkCollisions() {
        if (this.isGameOver) return; // Don't check collisions if game is over

        const astronautRect = this.astronaut.getBoundingClientRect();

        // Check can collisions with precise detection
        this.cans.forEach((can, index) => {
            const canRect = can.getBoundingClientRect();
            if (this.isColliding(astronautRect, canRect)) {
                console.log('Can collected!'); // Debug log
                can.remove();
                this.cans.splice(index, 1);
                this.score += 10;
                this.cansCollected++;
                this.scoreElement.textContent = this.score;
                
                console.log('Score:', this.score, 'Cans collected:', this.cansCollected); // Debug log
                
                if (this.cansCollected >= 5) {
                    console.log('WIN CONDITION TRIGGERED!'); // Debug log
                    this.winGame();
                    return; // Exit the function after winning
                }
            }
        });

        // Only check cloud collisions if we haven't won
        if (!this.isGameOver) {
            this.clouds.forEach((cloud) => {
                const cloudRect = cloud.getBoundingClientRect();
                const cloudPadding = 5;
                const paddedCloudRect = {
                    left: cloudRect.left + cloudPadding,
                    right: cloudRect.right - cloudPadding,
                    top: cloudRect.top + cloudPadding,
                    bottom: cloudRect.bottom - cloudPadding
                };
                
                if (this.isColliding(astronautRect, paddedCloudRect)) {
                    this.gameOver(false);
                }
            });
        }
    }

    winGame() {
        console.log('Starting win sequence...'); // Debug log
        this.isGameOver = true;
        
        // Stop all game loops and spawning
        this.cleanup();
        
        // Stop background music
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        
        // Show the bed with animation
        this.bed.style.display = 'block';
        // Force a reflow to ensure the animation starts
        void this.bed.offsetWidth;
        this.bed.classList.add('goal-bed');
        console.log('Bed displayed'); // Debug log
        
        // Move the astronaut to the bed
        this.astronaut.style.transition = 'all 1s ease-in-out';
        this.astronaut.style.left = '650px';
        this.astronaut.classList.remove('running', 'jumping');
        this.astronaut.classList.add('sleeping');
        console.log('Astronaut moved to bed'); // Debug log

        // Play snoring sound once
        this.snoringSound.volume = 0.7; // Set volume to 70%
        this.snoringSound.loop = false; // Don't loop
        this.snoringSound.play().catch(error => {
            console.log('Snoring sound autoplay prevented:', error);
        });
        
        // Show win message after a short delay
        setTimeout(() => {
            this.messageElement.style.display = 'block';
            this.messageElement.textContent = 'Congratulations! Take a NAP!';
            this.startButton.textContent = 'Play Again';
            this.startButton.classList.remove('try-again', 'start');
            this.startButton.classList.add('play-again');
            this.startButton.style.display = 'block';
            console.log('Win message displayed'); // Debug log
        }, 1000);
    }

    gameOver(success) {
        this.isGameOver = true;
        this.messageElement.style.display = 'block';
        if (success) {
            this.messageElement.textContent = 'Congratulations! Take a NAP!';
            this.astronaut.classList.add('sleeping');
            this.startButton.textContent = 'Play Again';
            this.startButton.classList.remove('try-again', 'start');
            this.startButton.classList.add('play-again');
        } else {
            this.messageElement.textContent = 'You failed! Try again!';
            this.startButton.textContent = 'Try Again';
            this.startButton.classList.remove('play-again', 'start');
            this.startButton.classList.add('try-again');
        }
        this.startButton.style.display = 'block';
        
        // Stop running animation
        this.astronaut.classList.remove('running', 'jumping');
        
        // Clean up game elements
        this.cleanup();
    }

    gameLoop() {
        if (!this.isGameOver) {
            this.moveElements();
            this.checkCollisions();
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log('Window loaded, creating game instance');
    new Game();
}); 