let player;
let cursors;
let trashGroup;
let bins = {};
let score = 0;
let scoreText;
let carryingTrash = null;

const trashTypes = [
    { name: 'paper', type: 'paper', points: 5 },
    { name: 'glass', type: 'glass', points: 5 },
    { name: 'banana', type: 'organic', points: 5 },
    { name: 'soda', type: 'metal', points: 5 },
    { name: 'pet', type: 'plastic', points: 5 },
    { name: 'apple', type: 'organic', points: 5 },
    { name: 'notebook', type: 'paper', points: 5 },
    { name: 'juice', type: 'paper', points: 5 },
    { name: 'pen', type: 'plastic', points: 5 },
    { name: 'clip', type: 'metal', points: 5 }
];

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('playerdown', 'assets/playerdown.png');
    this.load.image('campus', 'assets/campus.png');
    this.load.image('paper', 'assets/paper.png');
    this.load.image('glass', 'assets/glass.png');
    this.load.image('banana', 'assets/banana.png');
    this.load.image('soda', 'assets/soda.png');
    this.load.image('pet', 'assets/pet.png');
    this.load.image('apple', 'assets/apple.png');
    this.load.image('notebook', 'assets/notebook.png');
    this.load.image('juice', 'assets/juice.png');
    this.load.image('pen', 'assets/pen.png');
    this.load.image('clip', 'assets/clip.png');
    this.load.image('bin_blue', 'assets/bin_blue.png');
    this.load.image('bin_brown', 'assets/bin_brown.png');
    this.load.image('bin_green', 'assets/bin_green.png');
    this.load.image('bin_red', 'assets/bin_red.png');
    this.load.image('bin_yellow', 'assets/bin_yellow.png');
}

function create() {
    const campus = this.add.image(400, 300, 'campus');
    campus.setDisplaySize(800, 600); // Redimensiona a imagem para caber no cenário

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.displayHeight = 75; // Altura reduzida pela metade (150 / 2)
    player.scaleX = player.scaleY; // Mantém a proporção

    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', handlePickUpOrDrop, this);

    trashGroup = this.physics.add.group();
    generateTrash(this, 10); // Gera 10 lixos inicialmente

    createBins(this);

    scoreText = this.add.text(650, 16, 'Pontos: 0', { fontSize: '16px', fill: '#000' });
    scoreText.setDepth(1); // Garante que o placar fique acima do fundo
    player.setDepth(2); // Garante que o jogador fique acima de todos os objetos

    // Gera novos lixos a cada 20 segundos
    this.time.addEvent({
        delay: 20000,
        callback: () => generateTrash(this, 5),
        callbackScope: this,
        loop: true
    });
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    }

    if (carryingTrash) {
        carryingTrash.x = player.x;
        carryingTrash.y = player.y;
    }
}

function generateTrash(scene, count) {
    // Define a área das lixeiras para evitar gerar lixos nela
    const binAreaXStart = 50;
    const binAreaXEnd = 550;
    const binAreaYEnd = 100;

    for (let i = 0; i < count; i++) {
        const typeIndex = Phaser.Math.Between(0, trashTypes.length - 1);
        const trashType = trashTypes[typeIndex];

        let x, y;
        let overlap;
        do {
            x = Phaser.Math.Between(50, 750);
            y = Phaser.Math.Between(150, 550);

            overlap = trashGroup.getChildren().some(trash => {
                return Phaser.Math.Distance.Between(x, y, trash.x, trash.y) < 30;
            });
        } while ((x > binAreaXStart && x < binAreaXEnd && y < binAreaYEnd) || overlap);

        const trash = trashGroup.create(x, y, trashType.name);
        trash.setData('type', trashType.type);
        trash.setData('points', trashType.points);
        trash.displayHeight = 27.5; // Altura reduzida pela metade (55 / 2)
        trash.scaleX = trash.scaleY; // Mantém a proporção
    }
}

function createBins(scene) {
    const binTypes = [
        { name: 'paper', color: 'bin_blue', x: 100, y: 50 },
        { name: 'glass', color: 'bin_green', x: 200, y: 50 },
        { name: 'organic', color: 'bin_brown', x: 300, y: 50 },
        { name: 'metal', color: 'bin_yellow', x: 400, y: 50 },
        { name: 'plastic', color: 'bin_red', x: 500, y: 50 }
    ];

    for (let i = 0; i < binTypes.length; i++) {
        const bin = scene.add.image(binTypes[i].x, binTypes[i].y, binTypes[i].color);
        bin.displayWidth = 43.5; // Largura reduzida pela metade (87 / 2)
        bin.displayHeight = 43.5; // Altura reduzida pela metade (87 / 2)
        bins [binTypes[i].name] = bin;
}
}

function handlePickUpOrDrop() {
if (carryingTrash) {
// Tentativa de soltar o lixo na lixeira correta
if (player.x > 50 && player.x < 550 && player.y < 100) {
for (const [type, bin] of Object.entries(bins)) {
if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), bin.getBounds())) {
if (type === carryingTrash.getData(‘type’)) {
score += carryingTrash.getData(‘points’);
} else {
score -= 10;
}
carryingTrash.destroy();
carryingTrash = null;
player.setTexture(‘player’); // Volta a textura normal
updateScore();
checkGameOver();
return;
}
}
}
} else {
// Tentativa de pegar o lixo
trashGroup.getChildren().forEach(trash => {
if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), trash.getBounds())) {
carryingTrash = trash;
trash.setVisible(false); // O lixo desaparece quando é pego
trash.body.enable = false; // Desativa a física do lixo
player.setTexture(‘playerdown’); // Altera a textura para a imagem segurando lixo
}
});
}
}

function updateScore() {
scoreText.setText(’Pontos: ’ + score);
}

function checkGameOver() {
if (score <= -50) {
alert(‘Você perdeu!’);
location.reload();
} else if (score >= 100) {
alert(‘Você ganhou!’);
location.reload();
}
}
