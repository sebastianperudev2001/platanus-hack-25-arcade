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
const tileSize = 28;
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
    pixelX: offsetX + tileSize / 2,
    pixelY: offsetY + tileSize / 2,
    direction: null,
    nextDirection: null
  };
  
  enemies = [
    { x: 23, y: 1, name: 'YC', color: 0xff6600, dir: 0, targetX: 23, targetY: 1, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.8 },
    { x: 1, y: 19, name: 'SV', color: 0x00d084, dir: 1, targetX: 1, targetY: 19, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2 },
    { x: 23, y: 19, name: 'PV', color: 0xffd700, dir: 2, targetX: 23, targetY: 19, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 1.6 }
  ];
  
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 0 && !(x === 1 && y === 1) && !(x === 23 && y === 1) && !(x === 1 && y === 19) && !(x === 23 && y === 19)) {
        coins.push({ x: x, y: y, collected: false });
      }
    }
  }
  
  scoreText = this.add.text(20, 10, 'Funding: $0K', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#00ff88',
    fontStyle: 'bold'
  });
  
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  showStartPopup(scene);
}

function update() {
  if (!gameStarted) {
    if (spaceKey.isDown) {
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
          scoreText.setText('Funding: $' + score + 'K');
        }
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
        enemy.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
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
  
  graphics.fillStyle(0xffd700, 1);
  for (let coin of coins) {
    if (!coin.collected) {
      graphics.fillCircle(offsetX + coin.x * tileSize + tileSize / 2, offsetY + coin.y * tileSize + tileSize / 2, 3);
    }
  }
  
  drawPlayer(player.pixelX, player.pixelY);
  
  for (let enemy of enemies) {
    drawEnemy(enemy);
  }
  
  for (let enemy of enemies) {
    const dx = player.pixelX - enemy.pixelX;
    const dy = player.pixelY - enemy.pixelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 18) {
      gameOver = true;
      showGameOver(this);
      return;
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

function drawEnemy(enemy) {
  const x = enemy.pixelX;
  const y = enemy.pixelY;
  
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
  
  const text1 = scene.add.text(400, 160, String.fromCharCode(0x1F680) + ' MISION ' + String.fromCharCode(0x1F680), {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff88'
  }).setOrigin(0.5);
  startPopupElements.push(text1);
  
  const text2 = scene.add.text(400, 220, 'Eres un fundador bootstrapped', {
    fontSize: '22px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  startPopupElements.push(text2);
  
  const text3 = scene.add.text(400, 255, 'tratando de llegar al Product-Market Fit!', {
    fontSize: '22px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  startPopupElements.push(text3);
  
  const text4 = scene.add.text(400, 310, String.fromCharCode(0x26A0) + ' PELIGRO ' + String.fromCharCode(0x26A0), {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ff4444'
  }).setOrigin(0.5);
  startPopupElements.push(text4);
  
  const text5 = scene.add.text(400, 360, 'Los VCs (Venture Capitalists) te persiguen', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffcccc'
  }).setOrigin(0.5);
  startPopupElements.push(text5);
  
  const text6 = scene.add.text(400, 390, 'para diluir tu equity! HUYE de ellos!', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffcccc'
  }).setOrigin(0.5);
  startPopupElements.push(text6);
  
  const text7 = scene.add.text(400, 440, String.fromCharCode(0x1F4B0) + ' Recolecta funding bootstrapping', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffd700'
  }).setOrigin(0.5);
  startPopupElements.push(text7);
  
  const text8 = scene.add.text(400, 470, 'sin perder el control de tu startup!', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffd700'
  }).setOrigin(0.5);
  startPopupElements.push(text8);
  
  const startText = scene.add.text(400, 540, 'PRESIONA ESPACIO PARA COMENZAR', {
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
  score = 0;
  
  player = {
    x: 1,
    y: 1,
    speed: 3,
    moving: false,
    targetX: 1,
    targetY: 1,
    pixelX: offsetX + tileSize / 2,
    pixelY: offsetY + tileSize / 2,
    direction: null,
    nextDirection: null
  };
  
  enemies = [
    { x: 23, y: 1, name: 'YC', color: 0xff6600, dir: 0, targetX: 23, targetY: 1, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + tileSize / 2, speed: 1.8 },
    { x: 1, y: 19, name: 'SV', color: 0x00d084, dir: 1, targetX: 1, targetY: 19, pixelX: offsetX + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 2 },
    { x: 23, y: 19, name: 'PV', color: 0xffd700, dir: 2, targetX: 23, targetY: 19, pixelX: offsetX + 23 * tileSize + tileSize / 2, pixelY: offsetY + 19 * tileSize + tileSize / 2, speed: 1.6 }
  ];
  
  coins = [];
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 0 && !(x === 1 && y === 1) && !(x === 23 && y === 1) && !(x === 1 && y === 19) && !(x === 23 && y === 19)) {
        coins.push({ x: x, y: y, collected: false });
      }
    }
  }
  
  scoreText.setText('Funding: $0K');
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
  
  scene.add.text(400, 380, 'Acquired by competition', {
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
