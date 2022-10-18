title = "Avoid Them All";

description = `
[Hold]
 Stop

[Let Go]
 Run
`;

characters = [
  `
  l l
  l l
 lll
  l
 l ll
l    l
`,
  `
  l l
  l l
llllll
  l
 l l
 l l
`,
  `
  l l
l l l
 ll
  l  
 l lll
l    
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 100,
};

/**
 * @type {{
 * x: number, size: number, speed: number,
 * interval: number, intervalVariation: number, ticks: number
 * }[]}
 */
let objectSpawns;
let nextObjectSpawnDist;
/** @type {{pos: Vector, vy: number, size: number, speed: number}[]} */
let objects;
/** @type {{pos: Vector, vx: number, shotTicks: number}} */
let player;

let lx;
let multiplier;

function update() {
  if (!ticks) {
    objectSpawns = [];
    nextObjectSpawnDist = 0;
    objects = [];
    player = { pos: vec(10, 87), vx: 0, shotTicks: 0 };
    lx = 50;
    multiplier = 1;
  }
  let scr = difficulty * 0.1;
  if (player.pos.x > 30) {
    scr += (player.pos.x - 30) * 0.05;
  }
  lx = wrap(lx - scr, 0, 99);
  color("blue");
  rect(0, 90, 100, 10);
  player.shotTicks--;
  if (input.isPressed) {
    if (input.isJustPressed) {
      multiplier = 1;
      player.vx = 0;
    }
  } else if (input.isJustReleased) {
    play("select");
    player.vx = difficulty * 1.2;
  }
  player.pos.x += player.vx - scr;
  color("red");
  nextObjectSpawnDist -= scr;
  if (nextObjectSpawnDist < 0) {
    const size = rnd(5, 15);
    let interval = rnd(10, 50) / difficulty;
    const speed = (rnd(5, 10) / sqrt(size)) * sqrt(difficulty);
    interval /= sqrt(speed) / sqrt(size);
    objectSpawns.push({
      x: 200,
      size,
      speed,
      interval,
      intervalVariation: rnd(0.3, 0.9),
      ticks: rnd(interval),
    });
    nextObjectSpawnDist += rnd(50, 60);
  }
  remove(objectSpawns, (r) => {
    r.x -= scr;
    r.ticks--;
    if (r.ticks < 0) {
      objects.push({
        pos: vec(r.x, -r.size / 2),
        vy: 0,
        size: r.size,
        speed: r.speed,
      });
      r.ticks = r.interval * (1 + rnds(r.intervalVariation));
    }
    return r.x < 0;
  });
  color("yellow");
  remove(objects, (r) => {
    r.vy += r.speed * 0.01;
    r.pos.x -= scr;
    r.pos.y += r.vy;
    if (box(r.pos, r.size).isColliding.rect.red) {
      r.size *= 0.7;
      color("red");
      particle(r.pos, 5, 3, PI / 2, 0.5);
      color("yellow");
    }
    if (r.pos.y > 90 - r.size / 2) {
      particle(r.pos, r.size * 0.3, sqrt(r.size) * 0.3);
      return true;
    }
  });
  color("red");
  if (
    char(
      input.isPressed ? "b" : addWithCharCode("a", floor(ticks / 20) % 2),
      player.pos
    ).isColliding.rect.yellow ||
    player.pos.x < -2
  ) {
    play("explosion");
    end();
  }
}
