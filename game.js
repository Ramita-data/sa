let dialogues = {};
fetch('dialogues.json').then(res => res.json()).then(data => dialogues = data);

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  parent: 'gameContainer',
  physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
  scene: { preload, create, update },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

let game = new Phaser.Game(config);
let player, cursors, monsters = [], backgroundMusic;
let speed = 300; // hero speed

function preload() {
  // Heroes: 4x4 frames, each 270x270
  for (let i = 1; i <= 4; i++)
    this.load.spritesheet(`hero${i}`, `hero${i}_spritesheet.png`, { frameWidth: 270, frameHeight: 270 });

  // Monsters: 4x4 frames, each 270x270
  for (let i = 1; i <= 4; i++)
    this.load.spritesheet(`monster${i}`, `monster${i}_spritesheet.png`, { frameWidth: 270, frameHeight: 270 });

  // Backgrounds
  ['forest','village','castle','mystic'].forEach(bg => this.load.image(bg, `${bg}.png`));

  // Sounds
  this.load.audio('bgm','background_music.mp3');
  this.load.audio('attack','attack.mp3');
  this.load.audio('build','build.mp3');
}

function create() {
  // Background
  let worldKey = localStorage.getItem('castle')==='unlocked'?'castle':
                 localStorage.getItem('mystic')==='unlocked'?'mystic':'village';
  this.add.image(960,540,worldKey).setDisplaySize(1920,1080);

  // Music
  backgroundMusic = this.sound.add('bgm',{ loop:true, volume:0.5 });
  backgroundMusic.play();

  // Hero selection
  let heroKey = localStorage.getItem('hero3')==='unlocked'?'hero3':
                localStorage.getItem('hero4')==='unlocked'?'hero4':'hero1';
  player = this.physics.add.sprite(400,300,heroKey).setScale(1.5);

  // Hero animations
  const createAnims = (key,flying=false)=>{
    this.anims.create({ key:`${key}_idle`, frames:this.anims.generateFrameNumbers(key,{ start:0,end:0 }), frameRate:1, repeat:-1 });
    this.anims.create({ key:`${key}_walk`, frames:this.anims.generateFrameNumbers(key,{ start:1,end:3 }), frameRate:8, repeat:-1 });
    if(flying) this.anims.create({ key:`${key}_fly`, frames:this.anims.generateFrameNumbers(key,{ start:4,end:6 }), frameRate:8, repeat:-1 });
  };
  createAnims('hero1'); createAnims('hero2'); createAnims('hero3'); createAnims('hero4',true);

  // Monsters
  const createMonster = (key,x,y,flying=false)=>{
    let m = this.physics.add.sprite(x,y,key).setScale(1.5);
    this.anims.create({ key:`${key}_idle`, frames:this.anims.generateFrameNumbers(key,{ start:0,end:3 }), frameRate:8, repeat:-1 });
    if(flying) this.anims.create({ key:`${key}_fly`, frames:this.anims.generateFrameNumbers(key,{ start:4,end:6 }), frameRate:8, repeat:-1 });
    m.anims.play(flying?`${key}_fly`:`${key}_idle`,true);
    monsters.push(m);
  };
  createMonster('monster1',1200,400);
  createMonster('monster2',1400,600);
  createMonster('monster3',1600,500,true);
  createMonster('monster4',1800,700);

  cursors = this.input.keyboard.createCursorKeys();

  // Mobile touch controls
  this.input.on('pointerdown', pointer => {
    if(pointer.x < this.sys.game.config.width/2) player.setVelocityX(-speed);
    else player.setVelocityX(speed);
  });
  this.input.on('pointerup', () => player.setVelocity(0));
}

function update() {
  if(!player) return;

  player.setVelocity(0);
  let heroKey = player.texture.key;

  if(cursors.left.isDown){
    player.setVelocityX(-speed); player.anims.play(`${heroKey}_walk`,true); player.flipX = true;
  } else if(cursors.right.isDown){
    player.setVelocityX(speed); player.anims.play(`${heroKey}_walk`,true); player.flipX = false;
  } else if(cursors.up.isDown || cursors.down.isDown){
    player.setVelocityY(cursors.up.isDown?-speed:speed); player.anims.play(`${heroKey}_walk`,true);
  } else if(heroKey==='hero4') player.anims.play(`${heroKey}_fly`,true);
  else player.anims.play(`${heroKey}_idle`,true);

  monsters.forEach(m => this.physics.moveToObject(m,player,60));
}
