// Pong Game Tweaks
let BALL_SPEED = 5;
let BOT_SPEED = 1;
const WIN_SCORE = 11;

// Listen for input changes
window.addEventListener('DOMContentLoaded', () => {
	const ballSpeedInput = document.getElementById('ball-speed-input');
	const botSpeedInput = document.getElementById('bot-speed-input');
	if (ballSpeedInput) {
		ballSpeedInput.value = BALL_SPEED;
		ballSpeedInput.addEventListener('input', (e) => {
			BALL_SPEED = Math.max(1, Math.min(20, Number(e.target.value)));
		});
	}
	if (botSpeedInput) {
		botSpeedInput.value = BOT_SPEED;
		botSpeedInput.addEventListener('input', (e) => {
			BOT_SPEED = Math.max(1, Math.min(20, Number(e.target.value)));
		});
	}
});
const GAME_FPS = 120;


const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Start screen logic
let gameStarted = false;
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

// Game objects
const paddleWidth = 10,
	paddleHeight = 100;
const ballSize = 12;
let leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 0 };
let rightPaddle = {
	x: canvas.width - 20,
	y: canvas.height / 2 - paddleHeight / 2,
	dy: 0,
};
let ball = {
	x: canvas.width / 2 - ballSize / 2,
	y: canvas.height / 2 - ballSize / 2,
	dx: 5 * (Math.random() > 0.5 ? 1 : -1),
	dy: 4 * (Math.random() > 0.5 ? 1 : -1),
};

let leftScore = 0,
	rightScore = 0;

let winner = null;

let ballAtRest = true;
let ballOnPaddle = 'right'; // 'left' or 'right'

function setBallOnPaddle(paddle) {
	ballAtRest = true;
	ballOnPaddle = paddle;
	if (paddle === 'right') {
		// Center the ball on the right paddle
		ball.x = rightPaddle.x + paddleWidth / 2 - ballSize / 2;
		ball.y = rightPaddle.y + paddleHeight / 2 - ballSize / 2;
		ball.dx = 0;
		ball.dy = 0;
	} else {
		// Center the ball on the left paddle
		ball.x = leftPaddle.x + paddleWidth / 2 - ballSize / 2;
		ball.y = leftPaddle.y + paddleHeight / 2 - ballSize / 2;
		ball.dx = 0;
		ball.dy = 0;
	}
    draw();
}

function resetGame() {
	leftScore = 0;
	rightScore = 0;
	winner = null;
	resetBall();
	if (typeof startScreen !== 'undefined' && startScreen) {
		startScreen.style.display = "flex";
	}
	gameStarted = false;
	draw();
}

function showWinScreen() {
	const msg = winner === 'left' ? 'Bot Wins!' : 'Player Wins!';
	setTimeout(() => {
		alert(msg);
		resetGame();
	}, 100);
}

function drawRect(x, y, w, h, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
	ctx.fill();
}

function drawNet() {
	for (let i = 0; i < canvas.height; i += 30) {
		drawRect(canvas.width / 2 - 1, i, 2, 20, "#fff");
	}
}

function drawScore() {
	ctx.font = "32px Roboto";
	ctx.fillText(leftScore, canvas.width / 4, 50);
	ctx.fillText(rightScore, (3 * canvas.width) / 4, 50);
}

function resetBall() {
	// Place ball on the paddle of the player who will serve
	setBallOnPaddle(ballOnPaddle);
}

function update() {
	// Left paddle is a bot: follow the ball's y position
	if (ballAtRest && ballOnPaddle === 'left') {
		// Bot will serve: move paddle to random y, then launch
		let targetY = Math.random() * (canvas.height - paddleHeight);
		if (Math.abs(leftPaddle.y - targetY) > 10) {
			if (leftPaddle.y < targetY) leftPaddle.y += BOT_SPEED;
			else leftPaddle.y -= BOT_SPEED;
		} else {
			// Launch ball with random forward thrust
			ballAtRest = false;
			// Random horizontal thrust between -BALL_SPEED/1.5 and BALL_SPEED/1.5
			ball.dx = 0.5 * BALL_SPEED;
			ball.dy = BALL_SPEED;
		}
		leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
		// Ball follows paddle (centered)
		ball.x = leftPaddle.x + paddleWidth / 2 - ballSize / 2;
		ball.y = leftPaddle.y + paddleHeight / 2 - ballSize / 2;
	} else {
		if (ball.y + ballSize / 2 < leftPaddle.y + paddleHeight / 2 - 4) {
			leftPaddle.y -= BOT_SPEED;
		} else if (ball.y + ballSize / 2 > leftPaddle.y + paddleHeight / 2 + 4) {
			leftPaddle.y += BOT_SPEED;
		}
		leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
	}
	rightPaddle.y += rightPaddle.dy;
	rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

	// Ball launch on paddle move (player serve)
	if (ballAtRest && ballOnPaddle === 'right' && rightPaddle.dy !== 0) {
		ballAtRest = false;
		// Random horizontal thrust between -BALL_SPEED/1.5 and BALL_SPEED/1.5
		ball.dx = 0.5 * BALL_SPEED;
		ball.dy = -BALL_SPEED;
	}
	// Ball follows paddle if at rest
	if (ballAtRest && ballOnPaddle === 'right') {
		ball.x = rightPaddle.x + paddleWidth / 2 - ballSize / 2;
		ball.y = rightPaddle.y + paddleHeight / 2 - ballSize / 2;
	}

	if (!ballAtRest) {
		ball.x += ball.dx;
		ball.y += ball.dy;
	}

	// Top and bottom collision
	if (ball.y <= 0 || ball.y + ballSize >= canvas.height) {
		ball.dy *= -1;
	}

	// Left paddle collision
	if (
		ball.x <= leftPaddle.x + paddleWidth &&
		ball.y + ballSize >= leftPaddle.y &&
		ball.y <= leftPaddle.y + paddleHeight
	) {
		ball.dx *= -1;
		ball.x = leftPaddle.x + paddleWidth; // Prevent sticking
	}
	// Right paddle collision
	if (
		ball.x + ballSize >= rightPaddle.x &&
		ball.y + ballSize >= rightPaddle.y &&
		ball.y <= rightPaddle.y + paddleHeight
	) {
		ball.dx *= -1;
		ball.x = rightPaddle.x - ballSize; // Prevent sticking
	}

	// Score
	if (ball.x < 0) {
		rightScore++;
		ballOnPaddle = 'right';
		setBallOnPaddle('right');
	} else if (ball.x + ballSize > canvas.width) {
		leftScore++;
		ballOnPaddle = 'left';
		setBallOnPaddle('left');
	}

	// Win condition
	if (leftScore >= WIN_SCORE) {
		winner = 'left';
		gameStarted = false;
		showWinScreen();
	} else if (rightScore >= WIN_SCORE) {
		winner = 'right';
		gameStarted = false;
		showWinScreen();
	}
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// No drawNet();
	drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, "#fff");
	drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, "#fff");
	drawBall(ball.x, ball.y, ballSize, "#fff");
	drawScore();
}


function gameLoop() {
	if (!gameStarted) return;
	update();
	draw();
}

let gameLoopInterval = null;
function startGameLoop() {
	if (gameLoopInterval) clearInterval(gameLoopInterval);
	gameLoopInterval = setInterval(() => {
		if (gameStarted) {
			gameLoop();
		}
	}, 1000 / GAME_FPS);
}

// Controls (right paddle only)
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            rightPaddle.dy = -7;
            break;
        case "ArrowDown":
        case "s":
        case "S":
            rightPaddle.dy = 7;
            break;
    }
});

document.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
            rightPaddle.dy = 0;
            break;
    }
});

if (startScreen && startBtn) {
	startBtn.addEventListener("click", () => {
		startScreen.style.display = "none";
		gameStarted = true;
		startGameLoop();
	});
}
