// Canvas Fireworks Animation
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let fireworks = [];
let particles = [];

// Color palette for fireworks
const colors = [
    '#ffe066', // Gold/Yellow
    '#f59e0b', // Amber
    '#e11d48', // Rose/Red
    '#c084fc', // Purple/Violet
    '#38bdf8', // Blue
    '#4ade80'  // Green
];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Random angle and speed
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.gravity = 0.08;
        this.friction = 0.95;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Add glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.restore();
    }
}

// Firework Class
class Firework {
    constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetX = Math.random() * width;
        this.targetY = Math.random() * (height * 0.5); // Explode in top half
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Calculate angle and velocity
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.random() * 4 + 8;
        
        this.vx = (dx / distance) * speed;
        this.vy = (dy / distance) * speed;
        
        this.trail = [];
        this.maxTrail = 10;
        this.exploded = false;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // Check if reached target height or moving downward
        if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
            this.explode();
        }
    }

    explode() {
        const count = Math.floor(Math.random() * 40) + 40;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    draw() {
        if (this.trail.length === 0) return;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Trail glowing effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.stroke();
        ctx.restore();
    }
}

// Animation Loop
function loop() {
    // Semi-transparent background clear for trail fade effect
    ctx.fillStyle = 'rgba(9, 0, 20, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // Launch new fireworks occasionally
    if (Math.random() < 0.04 && fireworks.length < 8) {
        fireworks.push(new Firework());
    }

    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        if (fireworks[i].exploded) {
            fireworks.splice(i, 1);
        } else {
            fireworks[i].draw();
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }

    requestAnimationFrame(loop);
}

// Start fireworks
loop();

// Button Navigation Handlers
document.getElementById('btn-fullcode').addEventListener('click', () => {
    // Redirect with query parameter for 행사 풀코드 완주상
    window.location.href = 'draw.html?award=fullcode';
});

document.getElementById('btn-attendance').addEventListener('click', () => {
    // Redirect with query parameter for 개근보다 빛난 만남상
    window.location.href = 'draw.html?award=attendance';
});
