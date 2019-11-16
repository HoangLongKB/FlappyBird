// SELECT CANVAS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");


// GAME VAR AND  CONSTS
const DEGREE = Math.PI / 180;
let frames = 0;
let period = 10;
const sprite = new Image();
sprite.src = "./img/sprite.png"

// LOAD AUDIO
const SCROE_S = new Audio();
SCROE_S.src = './audio/sfx_point.wav';

const FLAP = new Audio();
FLAP.src = './audio/sfx_flap.wav';

const HIT = new Audio();
HIT.src = './audio/sfx_hit.wav';

const SWHOOSHING = new Audio();
SWHOOSHING.src = './audio/sfx_swooshing.wav';

const DIE = new Audio();
DIE.src = './audio/sfx_die.wav';

//GAME STATE
const state = {
    current: 0,
    ready:0,
    game: 1,
    over: 2
}

// GAME SCORE
const score = {
    best: parseInt(localStorage.getItem('best')) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';

        if(state.current === state.game) {
            ctx.lineWidth = 2;
            ctx.font = '35px Teko';
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
        }else if(state.current === state.over) {
            // SCORE VALUE
            ctx.fillText(this.value, 225, 189);
            ctx.strokeText(this.value, 225, 189);
            // BEST SCORE
            ctx.fillText(this.best, 225, 231);
            ctx.strokeText(this.best, 225, 231);
        }
    },
    reset: function() {
        this.value = 0;
    }
}

// GAME BACKGROUND
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y:cvs.height - 226,
    d: 2,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

// GAME FOREGROUND 
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    dX: 2,
    y:cvs.height - 112,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    update: function() {
        if(state.current !== state.over) {
            this.x = (this.x - this.dX) % (this.w / 2)
        }else {
            this.x = 0;
        }
    }
}

// PIPES
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYpos = p.y + this.h + this.gap;
            // TOP PIPE
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            // BOTTOM PIPE
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYpos, this.w, this.h);
            
        }
    },
    update: function() {
        if(state.current === state.game) {
            if(frames % 100 === 0) {
                this.position.push({
                    x: cvs.width,
                    y: this.maxYPos * (Math.random() + 1)
                });
            }
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                let bottomPipeYPos = p.y + this.h + this.gap;
                // TOP PIPE
                if(bird.x + bird.radius > p.x
                    && bird.x - bird.radius < p.x + this.w
                    && bird.y + bird.radius > p.y
                    && bird.y - bird.radius < p.y + this.h) {
                        HIT.play();
                        state.current = state.over;
                }
                // BOTTOM PIPE
                if(bird.x + bird.radius > p.x
                    && bird.x - bird.radius < p.x + this.w
                    && bird.y + bird.radius > bottomPipeYPos
                    && bird.y - bird.radius < bottomPipeYPos + this.h) {
                        HIT.play();
                        state.current = state.over;
                }

                p.x -= this.dx;
                // CHECK IF PIPE GO OVER CANVAS
                if(p.x + this.w <= 0) {
                    this.position.shift();

                    score.value += 1;
                    SCROE_S.play();
                    score.best = Math.max(score.value, score.best);
                    localStorage.setItem('best', score.best);
                }
            }
        } else if(state.current === state.ready) {
            // TODO
        }
        
    },
    reset: function() {
        this.position = [];
    }
}

// BIRD
const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    radius: 12,
    frame: 0,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,
    draw: function() {
        let bird = this.animation[this.frame];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);
        ctx.restore();
    },
    resetFrame: function() {
        this.frame = 0;
    },
    updateAnimation: function() {
        // CHANGE ANIMATION FRAME
        if( this.frame === 3 ){
            this.resetFrame();        
        }else{
            this.frame++;
        }
    },
    update: function(){
        // MOVEMENT LOGIC OF THE BIRD
        if(state.current === state.ready) {
            // TODO
        }else {
            // BIRD FALL DOWN
            this.speed += this.gravity;
            this.y += this.speed;
            // BIRD TOUCH THE GROUND
            if(this.y + (this.h / 2) >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - (this.h / 2);
                this.frame = 1;
                DIE.play();
                state.current = state.over;
            }
            // ROTATE THE BIRD IF IT FALLING DOWN
            if(this.speed >= this.jump) {
                this.frame = 1;
                this.rotation = 90 * DEGREE;
            }
        }
    },
    flap: function() {
        this.speed = -this.jump;
        this.rotation = -25 * DEGREE;
        FLAP.play();
    },
    reset: function() {
        this.y = 150;
        this.speed = 0;
        this.rotation = 0 * DEGREE;
    }
}

// GET READY IMAGE
const getReady = {
    sX:0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,

    draw: function() {
        if(state.current === state.ready) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// GAME OVER IMAGE
const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width/2 - 225/2,
    y: 90,

    draw: function() {
        if(state.current === state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// START BUTTON
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

// DRAW
const draw = () => {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// CONTROL THE GAME
cvs.addEventListener('click', function(evt) {
    switch(state.current) {
        case state.ready:
            state.current = state.game;
            SWHOOSHING.play();
            break;
        case state.game:
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w
                && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                    bird.reset();
                    pipes.reset()
                    score.reset();
                    state.current = state.ready;
            }

            break;
    }
});

// UPDATE
const update = () => {
    period = state.current === state.game ? 5 : 10;
    if(frames % period === 0) {
        bird.updateAnimation();
    }
    pipes.update();
    fg.update();
    if(bird.y + (bird.h / 2) !== cvs.height - fg.h) {
        bird.update();
    }
}

//LOOP
const loop = () => {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

loop();