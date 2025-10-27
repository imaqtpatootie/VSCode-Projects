// ========================================
// BIRTHDAY WEBSITE INTERACTIVITY
// ========================================

// ===== CONFETTI ANIMATION =====
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');

let confettiPieces = [];
let animationId;
let isConfettiActive = false;

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Confetti piece class
class ConfettiPiece {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.color = this.getRandomColor();
        this.shape = Math.random() > 0.5 ? 'circle' : 'square';
    }

    getRandomColor() {
        const colors = [
            '#ff6b9d', // pink
            '#ffd93d', // yellow
            '#a8e6cf', // mint
            '#c77dff', // purple
            '#4cc9f0', // blue
            '#ff006e', // magenta
            '#06ffa5'  // green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Add some wobble
        this.speedX += Math.random() * 0.2 - 0.1;
        
        // Reset if off screen
        if (this.y > canvas.height) {
            this.y = -20;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}

// Create confetti
function createConfetti(count = 150) {
    confettiPieces = [];
    for (let i = 0; i < count; i++) {
        confettiPieces.push(new ConfettiPiece());
    }
}

// Animate confetti
function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach(piece => {
        piece.update();
        piece.draw();
    });

    if (isConfettiActive) {
        animationId = requestAnimationFrame(animateConfetti);
    }
}

// Start confetti
function startConfetti() {
    if (!isConfettiActive) {
        isConfettiActive = true;
        createConfetti(150);
        animateConfetti();
    }
}

// Stop confetti
function stopConfetti() {
    isConfettiActive = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===== CELEBRATE BUTTON =====
const celebrateBtn = document.getElementById('celebrateBtn');
let confettiTimeout;

celebrateBtn.addEventListener('click', () => {
    // Clear any existing timeout
    if (confettiTimeout) {
        clearTimeout(confettiTimeout);
    }

    // Start confetti
    startConfetti();

    // Play sound effect (if you want to add audio)
    // const audio = new Audio('celebration.mp3');
    // audio.play();

    // Button animation
    celebrateBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        celebrateBtn.style.transform = 'scale(1)';
    }, 100);

    // Stop confetti after 5 seconds
    confettiTimeout = setTimeout(() => {
        stopConfetti();
    }, 5000);
});

// ===== GIFT BOX INTERACTIONS =====
const giftBoxes = document.querySelectorAll('.gift-box');

giftBoxes.forEach(box => {
    // Add click event for mobile
    box.addEventListener('click', function() {
        this.classList.add('revealed');
        
        // Add a small confetti burst
        createConfetti(30);
        isConfettiActive = true;
        animateConfetti();
        
        setTimeout(() => {
            stopConfetti();
        }, 2000);
    });

    // Add hover sound effect (optional)
    box.addEventListener('mouseenter', () => {
        // You can add a hover sound here
        // const hoverSound = new Audio('hover.mp3');
        // hoverSound.play();
    });
});

// ===== SPARKLE CURSOR EFFECT =====
document.addEventListener('mousemove', (e) => {
    // Create sparkle element
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    sparkle.style.left = e.pageX + 'px';
    sparkle.style.top = e.pageY + 'px';
    sparkle.style.position = 'absolute';
    sparkle.style.width = '5px';
    sparkle.style.height = '5px';
    sparkle.style.borderRadius = '50%';
    sparkle.style.background = '#ffd93d';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9998';
    sparkle.style.animation = 'sparkleDisappear 0.8s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 800);
});

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleDisappear {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe gift containers
const giftContainers = document.querySelectorAll('.gift-container');
giftContainers.forEach(container => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(30px)';
    container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(container);
});

// ===== AUTO CONFETTI ON LOAD =====
window.addEventListener('load', () => {
    // Small confetti burst on page load
    setTimeout(() => {
        startConfetti();
        setTimeout(() => {
            stopConfetti();
        }, 3000);
    }, 500);
});

// ===== BIRTHDAY COUNTDOWN (Optional) =====
function updateCountdown() {
    const birthday = new Date('2025-01-03');
    const now = new Date();
    const diff = birthday - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`Time until birthday: ${days}d ${hours}h ${minutes}m`);
    }
}

// Update countdown every minute
setInterval(updateCountdown, 60000);

// ===== CONSOLE MESSAGE =====
console.log('%c🎉 Happy Birthday! 🎂', 'font-size: 24px; font-weight: bold; color: #ff6b9d;');
console.log('%cMade with love and confetti! ✨', 'font-size: 14px; color: #ffd93d;');