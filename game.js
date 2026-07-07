const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const speedLevelEl = document.getElementById("speedLevel");
const messageEl = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const GRID_SIZE = 20;
const TILE_COUNT = 20;
const CANVAS_SIZE = 360;
const TILE_SIZE = CANVAS_SIZE / TILE_COUNT;

let snake;
let food;
let direction;
let nextDirection;

let score = 0;
let bestScore = Number(localStorage.getItem("snakeBestScore") || 0);
let speedLevel = 1;

let gameTimer = null;
let gameSpeed = 150;

let isRunning = false;
let isPaused = false;
let isGameOver = false;

let touchStartX = 0;
let touchStartY = 0;

bestScoreEl.textContent = bestScore;

function initGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  speedLevel = 1;
  gameSpeed = 150;

  isRunning = true;
  isPaused = false;
  isGameOver = false;

  createFood();
  updateInfo();
  hideMessage();
  drawGame();

  startLoop();
}

function startLoop() {
  stopLoop();

  gameTimer = setInterval(() => {
    if (!isRunning || isPaused || isGameOver) return;

    updateGame();
    drawGame();
  }, gameSpeed);
}

function stopLoop() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function startGame() {
  if (!isRunning || isGameOver) {
    initGame();
    return;
  }

  if (isPaused) {
    togglePause();
  }
}

function togglePause() {
  if (!isRunning || isGameOver) return;

  isPaused = !isPaused;

  if (isPaused) {
    showMessage("일시정지");
  } else {
    hideMessage();
  }
}

function restartGame() {
  initGame();
}

function updateGame() {
  direction = nextDirection;

  const head = { ...snake[0] };
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };

  if (checkWallCollision(newHead) || checkSelfCollision(newHead)) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    updateSpeed();
    createFood();
  } else {
    snake.pop();
  }

  updateInfo();
}

function updateSpeed() {
  const newSpeedLevel = Math.floor(score / 50) + 1;

  if (newSpeedLevel !== speedLevel) {
    speedLevel = newSpeedLevel;
    gameSpeed = Math.max(70, 150 - (speedLevel - 1) * 10);
    startLoop();
  }
}

function endGame() {
  isGameOver = true;
  isRunning = false;
  stopLoop();

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", String(bestScore));
  }

  updateInfo();
  showMessage(`게임 오버<br>점수: ${score}`);
}

function updateInfo() {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
  speedLevelEl.textContent = speedLevel;
}

function showMessage(text) {
  messageEl.innerHTML = text;
  messageEl.classList.add("show");
}

function hideMessage() {
  messageEl.classList.remove("show");
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));

  food = newFood;
}

function checkWallCollision(position) {
  return (
    position.x < 0 ||
    position.x >= TILE_COUNT ||
    position.y < 0 ||
    position.y >= TILE_COUNT
  );
}

function checkSelfCollision(position) {
  return snake.some(part => part.x === position.x && part.y === position.y);
}

function drawGame() {
  drawBackground();
  drawFood();
  drawSnake();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.11)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= TILE_COUNT; i++) {
    const pos = i * TILE_SIZE;

    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, CANVAS_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(CANVAS_SIZE, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    const isHead = index === 0;

    ctx.fillStyle = isHead ? "#22c55e" : "#16a34a";
    ctx.fillRect(
      part.x * TILE_SIZE + 2,
      part.y * TILE_SIZE + 2,
      TILE_SIZE - 4,
      TILE_SIZE - 4
    );

    ctx.strokeStyle = "#052e16";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      part.x * TILE_SIZE + 2,
      part.y * TILE_SIZE + 2,
      TILE_SIZE - 4,
      TILE_SIZE - 4
    );

    if (isHead) {
      drawEyes(part);
    }
  });
}

function drawEyes(head) {
  ctx.fillStyle = "#ffffff";

  const eyeSize = 3;
  const baseX = head.x * TILE_SIZE;
  const baseY = head.y * TILE_SIZE;

  let eye1 = { x: baseX + 6, y: baseY + 6 };
  let eye2 = { x: baseX + 12, y: baseY + 6 };

  if (direction.x === 1) {
    eye1 = { x: baseX + 12, y: baseY + 5 };
    eye2 = { x: baseX + 12, y: baseY + 12 };
  } else if (direction.x === -1) {
    eye1 = { x: baseX + 5, y: baseY + 5 };
    eye2 = { x: baseX + 5, y: baseY + 12 };
  } else if (direction.y === 1) {
    eye1 = { x: baseX + 6, y: baseY + 12 };
    eye2 = { x: baseX + 12, y: baseY + 12 };
  }

  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
  ctx.fill();
}

function drawFood() {
  const centerX = food.x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = food.y * TILE_SIZE + TILE_SIZE / 2;

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function changeDirection(newDirection) {
  if (!isRunning || isPaused || isGameOver) return;

  const goingUp = direction.y === -1;
  const goingDown = direction.y === 1;
  const goingLeft = direction.x === -1;
  const goingRight = direction.x === 1;

  if (newDirection === "up" && !goingDown) {
    nextDirection = { x: 0, y: -1 };
  } else if (newDirection === "down" && !goingUp) {
    nextDirection = { x: 0, y: 1 };
  } else if (newDirection === "left" && !goingRight) {
    nextDirection = { x: -1, y: 0 };
  } else if (newDirection === "right" && !goingLeft) {
    nextDirection = { x: 1, y: 0 };
  }
}

document.addEventListener("keydown", event => {
  if (
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === " "
  ) {
    event.preventDefault();
  }

  if (event.key === "ArrowUp") {
    changeDirection("up");
  } else if (event.key === "ArrowDown") {
    changeDirection("down");
  } else if (event.key === "ArrowLeft") {
    changeDirection("left");
  } else if (event.key === "ArrowRight") {
    changeDirection("right");
  } else if (event.key === " ") {
    togglePause();
  } else if (event.key === "Enter") {
    startGame();
  }
});

document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    changeDirection(button.dataset.direction);
  });
});

canvas.addEventListener("touchstart", event => {
  event.preventDefault();

  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: false });

canvas.addEventListener("touchend", event => {
  event.preventDefault();

  const touch = event.changedTouches[0];
  const diffX = touch.clientX - touchStartX;
  const diffY = touch.clientY - touchStartY;

  const minSwipeDistance = 24;

  if (Math.abs(diffX) < minSwipeDistance && Math.abs(diffY) < minSwipeDistance) {
    return;
  }

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      changeDirection("right");
    } else {
      changeDirection("left");
    }
  } else {
    if (diffY > 0) {
      changeDirection("down");
    } else {
      changeDirection("up");
    }
  }
}, { passive: false });

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);

snake = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 }
];

direction = { x: 1, y: 0 };
nextDirection = { x: 1, y: 0 };

createFood();
drawGame();
updateInfo();
showMessage("시작 버튼을 눌러주세요");
