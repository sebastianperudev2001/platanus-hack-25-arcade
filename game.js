const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0f0f23',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    create: create,
    update: update
  }
};

new Phaser.Game(config);

let player;
let enemies = [];
let coins = [];
let score = 0;
let scoreText;
let gameOver = false;
let won = false;
let gameStarted = false;
let cursors;
let wasd;
let graphics;
let mazeGraphics;
let restartKey;
let spaceKey;
let startPopupElements = [];
let powerUp = null;
let powerUpActive = false;
let powerUpTimer = 0;
let paused = false;
let pauseElements = [];
let maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const tileSize = 26;
const offsetX = 10;
const offsetY = 10;

function create() {
  const scene = this;
  mazeGraphics = this.add.graphics();
  graphics = this.add.graphics();
  
  drawMaze();
  
  player = {
    x: 1,
    y: 1,
    speed: 3,
    moving: false,
    targetX: 1,
    targetY: 1,
    pixelX: offsetX + 1 * tileSize + tileSize / 2,
    pixelY: offsetY + 1 * tileSize + tileSize / 2,
    direction: null,
    nextDirection: null
  };
  
  enemies = [
    { x: 23, y: 1, name: 'YC', color: 0xff6600, dir: 0, targetX: 23, targetY: 1, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.9, mode: 'chase' },
    { x: 1, y: 19, name: 'SV', color: 0x00d084, dir: 1, targetX: 1, targetY: 19, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2.1, mode: 'ambush' },
    { x: 23, y: 19, name: 'PV', color: 0xffd700, dir: 2, targetX: 23, targetY: 19, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 1.7, mode: 'patrol' },
    { x: 12, y: 1, name: 'YC', color: 0xff6600, dir: 2, targetX: 12, targetY: 1, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.8, mode: 'chase' },
    { x: 12, y: 19, name: 'SV', color: 0x00d084, dir: 0, targetX: 12, targetY: 19, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2.0, mode: 'ambush' },
    { x: 1, y: 10, name: 'PV', color: 0xffd700, dir: 1, targetX: 1, targetY: 10, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.6, mode: 'patrol' },
    { x: 23, y: 10, name: 'YC', color: 0xff6600, dir: 3, targetX: 23, targetY: 10, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.9, mode: 'chase' },
    { x: 12, y: 10, name: 'PV', color: 0xffd700, dir: 1, targetX: 12, targetY: 10, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.7, mode: 'patrol' }
  ];
  
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const isEnemyPos = enemies.some(e => e.x === x && e.y === y);
      const isPlayerPos = x === 1 && y === 1;
      if (maze[y][x] === 0 && !isEnemyPos && !isPlayerPos) {
        coins.push({ x: x, y: y, collected: false });
      }
    }
  }
  
  const hudX = 720;
  
  this.add.text(hudX, 120, 'FUNDING', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffd700',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  scoreText = this.add.text(hudX, 150, '$0K', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#00ff88',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 230, 'CONTROLS', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#888888',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 265, 'ARROWS', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 285, 'or WASD', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 320, 'SPACE', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 340, 'Pause', {
    fontSize: '12px',
    fontFamily: 'Arial',
    color: '#888888'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 375, 'R', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 395, 'Restart', {
    fontSize: '12px',
    fontFamily: 'Arial',
    color: '#888888'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 460, 'POWER-UP', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#888888',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  const pyLogo = this.add.graphics();
  pyLogo.fillStyle(0x306998, 1);
  pyLogo.fillCircle(hudX, 495, 8);
  pyLogo.fillCircle(hudX, 501, 8);
  pyLogo.fillStyle(0xffd43b, 1);
  pyLogo.fillCircle(hudX - 3, 495, 4);
  pyLogo.fillCircle(hudX + 3, 501, 4);
  
  this.add.text(hudX, 525, 'Turn VCs into', {
    fontSize: '12px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 542, 'Stealth Startups', {
    fontSize: '12px',
    fontFamily: 'Arial',
    color: '#00ff88'
  }).setOrigin(0.5);
  
  this.add.text(hudX, 559, 'and acquire them!', {
    fontSize: '12px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  spawnPowerUp();
  
  showStartPopup(scene);
}

function update() {
  if (!gameStarted) {
    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
      gameStarted = true;
      for (let element of startPopupElements) {
        element.destroy();
      }
      startPopupElements = [];
    }
    return;
  }
  
  if (gameOver || won) {
    if (restartKey.isDown) {
      restartGame(this);
    }
    return;
  }
  
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    paused = !paused;
    if (paused) {
      showPauseMenu(this);
    } else {
      for (let element of pauseElements) {
        element.destroy();
      }
      pauseElements = [];
    }
  }
  
  if (paused) return;
  
  graphics.clear();
  
  if (cursors.left.isDown || wasd.left.isDown) {
    player.nextDirection = 'left';
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.nextDirection = 'right';
  } else if (cursors.up.isDown || wasd.up.isDown) {
    player.nextDirection = 'up';
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.nextDirection = 'down';
  }
  
  if (!player.moving) {
    if (player.nextDirection) {
      const dirs = {
        'left': { dx: -1, dy: 0 },
        'right': { dx: 1, dy: 0 },
        'up': { dx: 0, dy: -1 },
        'down': { dx: 0, dy: 1 }
      };
      
      const nextDir = dirs[player.nextDirection];
      const nextX = player.x + nextDir.dx;
      const nextY = player.y + nextDir.dy;
      
      if (maze[nextY] && maze[nextY][nextX] === 0) {
        player.direction = player.nextDirection;
        player.targetX = nextX;
        player.targetY = nextY;
        player.moving = true;
      }
    }
    
    if (!player.moving && player.direction) {
      const dirs = {
        'left': { dx: -1, dy: 0 },
        'right': { dx: 1, dy: 0 },
        'up': { dx: 0, dy: -1 },
        'down': { dx: 0, dy: 1 }
      };
      
      const dir = dirs[player.direction];
      const nextX = player.x + dir.dx;
      const nextY = player.y + dir.dy;
      
      if (maze[nextY] && maze[nextY][nextX] === 0) {
        player.targetX = nextX;
        player.targetY = nextY;
        player.moving = true;
      }
    }
  }
  
  if (player.moving) {
    const targetPixelX = offsetX + player.targetX * tileSize + tileSize / 2;
    const targetPixelY = offsetY + player.targetY * tileSize + tileSize / 2;
    
    const dx = targetPixelX - player.pixelX;
    const dy = targetPixelY - player.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < player.speed) {
      player.pixelX = targetPixelX;
      player.pixelY = targetPixelY;
      player.x = player.targetX;
      player.y = player.targetY;
      player.moving = false;
      
      for (let coin of coins) {
        if (!coin.collected && coin.x === player.x && coin.y === player.y) {
          coin.collected = true;
          score += 10;
          scoreText.setText('$' + score + 'K');
        }
      }
      
      if (powerUp && !powerUp.collected && powerUp.x === player.x && powerUp.y === player.y) {
        powerUp.collected = true;
        powerUpActive = true;
        powerUpTimer = 600;
        score += 50;
        scoreText.setText('$' + score + 'K');
      }
      
      let allCollected = true;
      for (let coin of coins) {
        if (!coin.collected) {
          allCollected = false;
          break;
        }
      }
      if (allCollected) {
        won = true;
        showWin(this);
      }
    } else {
      player.pixelX += (dx / dist) * player.speed;
      player.pixelY += (dy / dist) * player.speed;
    }
  }
  
  for (let enemy of enemies) {
    const targetPixelX = offsetX + enemy.targetX * tileSize + tileSize / 2;
    const targetPixelY = offsetY + enemy.targetY * tileSize + tileSize / 2;
    
    const dx = targetPixelX - enemy.pixelX;
    const dy = targetPixelY - enemy.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < enemy.speed) {
      enemy.pixelX = targetPixelX;
      enemy.pixelY = targetPixelY;
      enemy.x = enemy.targetX;
      enemy.y = enemy.targetY;
      
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 }
      ];
      
      let validDirs = [];
      for (let i = 0; i < dirs.length; i++) {
        const nx = enemy.x + dirs[i].dx;
        const ny = enemy.y + dirs[i].dy;
        if (maze[ny] && maze[ny][nx] === 0) {
          validDirs.push(i);
        }
      }
      
      if (validDirs.length > 0) {
        let bestDir = enemy.dir;
        let bestDist = 999999;
        
        if (enemy.mode === 'chase') {
          for (let i of validDirs) {
            const nx = enemy.x + dirs[i].dx;
            const ny = enemy.y + dirs[i].dy;
            const distToPlayer = Math.abs(nx - player.x) + Math.abs(ny - player.y);
            if (distToPlayer < bestDist) {
              bestDist = distToPlayer;
              bestDir = i;
            }
          }
        } else if (enemy.mode === 'ambush') {
          let targetX = player.x;
          let targetY = player.y;
          if (player.direction === 'up') targetY -= 4;
          else if (player.direction === 'down') targetY += 4;
          else if (player.direction === 'left') targetX -= 4;
          else if (player.direction === 'right') targetX += 4;
          
          for (let i of validDirs) {
            const nx = enemy.x + dirs[i].dx;
            const ny = enemy.y + dirs[i].dy;
            const distToTarget = Math.abs(nx - targetX) + Math.abs(ny - targetY);
            if (distToTarget < bestDist) {
              bestDist = distToTarget;
              bestDir = i;
            }
          }
        } else {
          bestDir = validDirs[Math.floor(Math.random() * validDirs.length)];
        }
        
        enemy.dir = bestDir;
      }
      
      const newX = enemy.x + dirs[enemy.dir].dx;
      const newY = enemy.y + dirs[enemy.dir].dy;
      
      if (maze[newY] && maze[newY][newX] === 0) {
        enemy.targetX = newX;
        enemy.targetY = newY;
      }
    } else {
      enemy.pixelX += (dx / dist) * enemy.speed;
      enemy.pixelY += (dy / dist) * enemy.speed;
    }
  }
  
  if (powerUpActive) {
    powerUpTimer--;
    if (powerUpTimer <= 0) {
      powerUpActive = false;
      spawnPowerUp();
    }
  }
  
  graphics.fillStyle(0xffd700, 1);
  for (let coin of coins) {
    if (!coin.collected) {
      graphics.fillCircle(offsetX + coin.x * tileSize + tileSize / 2, offsetY + coin.y * tileSize + tileSize / 2, 3);
    }
  }
  
  if (powerUp && !powerUp.collected) {
    drawPowerUp(powerUp.x, powerUp.y);
  }
  
  drawPlayer(player.pixelX, player.pixelY);
  
  for (let enemy of enemies) {
    drawEnemy(enemy, powerUpActive);
  }
  
  for (let enemy of enemies) {
    const dx = player.pixelX - enemy.pixelX;
    const dy = player.pixelY - enemy.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 18) {
      if (powerUpActive) {
        enemy.x = enemy.targetX = [23, 1, 23, 12, 12, 1, 23, 12][enemies.indexOf(enemy)];
        enemy.y = enemy.targetY = [1, 19, 19, 1, 19, 10, 10, 10][enemies.indexOf(enemy)];
        enemy.pixelX = offsetX + enemy.x * tileSize + tileSize / 2;
        enemy.pixelY = offsetY + enemy.y * tileSize + tileSize / 2;
        score += 100;
        scoreText.setText('$' + score + 'K');
      } else {
        gameOver = true;
        showGameOver(this);
        return;
      }
    }
  }
}

function drawMaze() {
  mazeGraphics.clear();
  mazeGraphics.fillStyle(0x1e3a8a, 1);
  mazeGraphics.lineStyle(1, 0x3b82f6, 1);
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 1) {
        const px = offsetX + x * tileSize + 1;
        const py = offsetY + y * tileSize + 1;
        const size = tileSize - 2;
        mazeGraphics.fillRect(px, py, size, size);
        mazeGraphics.strokeRect(px, py, size, size);
      }
    }
  }
}

function drawPlayer(x, y) {
  graphics.fillStyle(0xffd4a3, 1);
  graphics.fillCircle(x, y, 11);
  
  graphics.fillStyle(0x000000, 1);
  graphics.fillRect(x - 7, y - 4, 4, 2);
  graphics.fillRect(x + 3, y - 4, 4, 2);
  
  graphics.fillStyle(0x000000, 1);
  graphics.fillRect(x - 4, y - 1, 2, 2);
  graphics.fillRect(x + 2, y - 1, 2, 2);
  
  graphics.fillStyle(0x8b4513, 1);
  graphics.fillRect(x - 9, y - 11, 4, 6);
  graphics.fillRect(x + 5, y - 11, 4, 6);
  graphics.fillRect(x - 5, y - 12, 10, 4);
}

function drawEnemy(enemy, scared) {
  const x = enemy.pixelX;
  const y = enemy.pixelY;
  
  if (scared) {
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(x, y, 12);
    graphics.fillStyle(0x404040, 1);
    graphics.beginPath();
    graphics.moveTo(x, y - 8);
    graphics.lineTo(x - 6, y + 2);
    graphics.lineTo(x, y - 2);
    graphics.lineTo(x + 6, y + 2);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(x - 3, y + 4, 2, 4);
    graphics.fillRect(x + 1, y + 4, 2, 4);
    return;
  }
  
  if (enemy.name === 'YC') {
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(x, y, 12);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(x - 5, y - 6, 3, 4);
    graphics.fillRect(x + 2, y - 6, 3, 4);
    graphics.fillRect(x - 2, y - 1, 4, 5);
    
  } else if (enemy.name === 'SV') {
    graphics.fillStyle(0x00e676, 1);
    graphics.beginPath();
    graphics.moveTo(x, y - 10);
    graphics.lineTo(x - 10, y + 8);
    graphics.lineTo(x + 10, y + 8);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(x - 2, y + 2, 4, 6);
    
  } else if (enemy.name === 'PV') {
    graphics.fillStyle(0xffc107, 1);
    graphics.fillRect(x - 10, y - 10, 20, 20);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(x - 4, y - 6, 2, 12);
    graphics.fillRect(x - 1, y - 6, 2, 12);
    graphics.fillRect(x + 2, y - 6, 2, 12);
  }
}

function spawnPowerUp() {
  const emptySpaces = [];
  for (let y = 1; y < maze.length - 1; y++) {
    for (let x = 1; x < maze[y].length - 1; x++) {
      if (maze[y][x] === 0) {
        const isEnemyPos = enemies.some(e => e.x === x && e.y === y);
        const isPlayerPos = x === 1 && y === 1;
        if (!isEnemyPos && !isPlayerPos) {
          emptySpaces.push({ x, y });
        }
      }
    }
  }
  if (emptySpaces.length > 0) {
    const pos = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    powerUp = { x: pos.x, y: pos.y, collected: false };
  }
}

function drawPowerUp(x, y) {
  const px = offsetX + x * tileSize + tileSize / 2;
  const py = offsetY + y * tileSize + tileSize / 2;
  
  graphics.fillStyle(0x306998, 1);
  graphics.fillCircle(px, py - 3, 8);
  graphics.fillCircle(px, py + 3, 8);
  
  graphics.fillStyle(0xffd43b, 1);
  graphics.fillCircle(px - 3, py - 3, 4);
  graphics.fillCircle(px + 3, py + 3, 4);
  
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(px - 3, py - 4, 1.5);
  graphics.fillCircle(px + 3, py + 2, 1.5);
}

function showPauseMenu(scene) {
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.85);
  overlay.fillRect(0, 0, 800, 600);
  pauseElements.push(overlay);
  
  const title = scene.add.text(400, 200, 'PIVOTING...', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  pauseElements.push(title);
  
  const text1 = scene.add.text(400, 300, 'Analyzing market fit', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#00ff88'
  }).setOrigin(0.5);
  pauseElements.push(text1);
  
  const text2 = scene.add.text(400, 350, 'Reviewing burn rate', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  pauseElements.push(text2);
  
  const text3 = scene.add.text(400, 390, 'Strategizing next move', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  pauseElements.push(text3);
  
  const resumeText = scene.add.text(400, 480, 'Press SPACE to resume', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffd700',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  pauseElements.push(resumeText);
  
  scene.tweens.add({
    targets: title,
    scale: { from: 1, to: 1.05 },
    duration: 800,
    yoyo: true,
    repeat: -1
  });
  
  scene.tweens.add({
    targets: resumeText,
    alpha: { from: 1, to: 0.4 },
    duration: 700,
    yoyo: true,
    repeat: -1
  });
}

function showStartPopup(scene) {
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.95);
  overlay.fillRect(0, 0, 800, 600);
  startPopupElements.push(overlay);
  
  const title = scene.add.text(400, 80, 'PACFOUNDER', {
    fontSize: '56px',
    fontFamily: 'Arial',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  startPopupElements.push(title);
  
  const text1 = scene.add.text(400, 160, String.fromCharCode(0x1F680) + ' MISSION ' + String.fromCharCode(0x1F680), {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff88'
  }).setOrigin(0.5);
  startPopupElements.push(text1);
  
  const text2 = scene.add.text(400, 220, 'You are a bootstrapped founder', {
    fontSize: '22px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  startPopupElements.push(text2);
  
  const text3 = scene.add.text(400, 255, 'trying to reach Product-Market Fit!', {
    fontSize: '22px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  startPopupElements.push(text3);
  
  const text4 = scene.add.text(400, 310, String.fromCharCode(0x26A0) + ' DANGER ' + String.fromCharCode(0x26A0), {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ff4444'
  }).setOrigin(0.5);
  startPopupElements.push(text4);
  
  const text5 = scene.add.text(400, 360, 'VCs (Venture Capitalists) are chasing you', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffcccc'
  }).setOrigin(0.5);
  startPopupElements.push(text5);
  
  const text6 = scene.add.text(400, 390, 'to dilute your equity! RUN from them!', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffcccc'
  }).setOrigin(0.5);
  startPopupElements.push(text6);
  
  const text7 = scene.add.text(400, 440, String.fromCharCode(0x1F4B0) + ' Collect bootstrapping funding', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffd700'
  }).setOrigin(0.5);
  startPopupElements.push(text7);
  
  const text8 = scene.add.text(400, 470, 'without losing control of your startup!', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffd700'
  }).setOrigin(0.5);
  startPopupElements.push(text8);
  
  const startText = scene.add.text(400, 540, 'PRESS SPACE TO START', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff88',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  startPopupElements.push(startText);
  
  scene.tweens.add({
    targets: title,
    scale: { from: 1, to: 1.1 },
    duration: 600,
    yoyo: true,
    repeat: -1
  });
  
  scene.tweens.add({
    targets: startText,
    alpha: { from: 1, to: 0.3 },
    duration: 700,
    yoyo: true,
    repeat: -1
  });
}

function restartGame(scene) {
  gameOver = false;
  won = false;
  gameStarted = false;
  paused = false;
  powerUpActive = false;
  powerUpTimer = 0;
  score = 0;
  
  for (let element of pauseElements) {
    element.destroy();
  }
  pauseElements = [];
  
  spawnPowerUp();
  
  player = {
    x: 1,
    y: 1,
    speed: 3,
    moving: false,
    targetX: 1,
    targetY: 1,
    pixelX: offsetX + 1 * tileSize + tileSize / 2,
    pixelY: offsetY + 1 * tileSize + tileSize / 2,
    direction: null,
    nextDirection: null
  };
  
  enemies = [
    { x: 23, y: 1, name: 'YC', color: 0xff6600, dir: 0, targetX: 23, targetY: 1, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.9, mode: 'chase' },
    { x: 1, y: 19, name: 'SV', color: 0x00d084, dir: 1, targetX: 1, targetY: 19, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2.1, mode: 'ambush' },
    { x: 23, y: 19, name: 'PV', color: 0xffd700, dir: 2, targetX: 23, targetY: 19, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 1.7, mode: 'patrol' },
    { x: 12, y: 1, name: 'YC', color: 0xff6600, dir: 2, targetX: 12, targetY: 1, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.8, mode: 'chase' },
    { x: 12, y: 19, name: 'SV', color: 0x00d084, dir: 0, targetX: 12, targetY: 19, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2.0, mode: 'ambush' },
    { x: 1, y: 10, name: 'PV', color: 0xffd700, dir: 1, targetX: 1, targetY: 10, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.6, mode: 'patrol' },
    { x: 23, y: 10, name: 'YC', color: 0xff6600, dir: 3, targetX: 23, targetY: 10, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.9, mode: 'chase' },
    { x: 12, y: 10, name: 'PV', color: 0xffd700, dir: 1, targetX: 12, targetY: 10, pixelX: offsetX + 12 * tileSize + tileSize / 2, pixelY: offsetY + 10 * tileSize + tileSize / 2, speed: 1.7, mode: 'patrol' }
  ];
  
  coins = [];
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const isEnemyPos = enemies.some(e => e.x === x && e.y === y);
      const isPlayerPos = x === 1 && y === 1;
      if (maze[y][x] === 0 && !isEnemyPos && !isPlayerPos) {
        coins.push({ x: x, y: y, collected: false });
      }
    }
  }
  
  scoreText.setText('$0K');
  scene.scene.restart();
}

function showGameOver(scene) {
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.9);
  overlay.fillRect(0, 0, 800, 600);
  
  const text = scene.add.text(400, 220, 'STARTUP FAILED', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ff4444',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  scene.add.text(400, 320, 'Funding: $' + score + 'K', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#00ff88'
  }).setOrigin(0.5);
  
  scene.add.text(400, 380, 'Acquired by greedy VC :(', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#888888'
  }).setOrigin(0.5);
  
  const restartText = scene.add.text(400, 480, 'Press R to Restart', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  scene.tweens.add({
    targets: text,
    scale: { from: 1, to: 1.05 },
    duration: 600,
    yoyo: true,
    repeat: -1
  });
  
  scene.tweens.add({
    targets: restartText,
    alpha: { from: 1, to: 0.4 },
    duration: 800,
    yoyo: true,
    repeat: -1
  });
}

function showWin(scene) {
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.9);
  overlay.fillRect(0, 0, 800, 600);
  
  const text = scene.add.text(400, 200, 'EXIT ACHIEVED', {
    fontSize: '72px',
    fontFamily: 'Arial',
    color: '#00ff88',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  scene.add.text(400, 300, String.fromCharCode(0x1F680), {
    fontSize: '80px'
  }).setOrigin(0.5);
  
  scene.add.text(400, 400, 'Total Funding: $' + score + 'K', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#ffd700'
  }).setOrigin(0.5);
  
  scene.add.text(400, 460, 'Unicorn Status Unlocked!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ff88ff'
  }).setOrigin(0.5);
  
  const restartText = scene.add.text(400, 530, 'Press R to Play Again', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  scene.tweens.add({
    targets: text,
    scale: { from: 1, to: 1.1 },
    duration: 800,
    yoyo: true,
    repeat: -1
  });
  
  scene.tweens.add({
    targets: restartText,
    alpha: { from: 1, to: 0.4 },
    duration: 800,
    yoyo: true,
    repeat: -1
  });
}
