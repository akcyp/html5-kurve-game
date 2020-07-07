const Point = require('../class/Point');
const Curve = require('../class/Curve');

const EventEmiiter = require('../helpers/EventEmitter');

const { int } = require('../helpers/random');

class Player extends EventEmiiter {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{x: number, y: number, color: string, angle: number}} options
   */
  constructor(ctx, options) {
    super();
    this.ctx = ctx;

    this.position = new Point(options.x, options.y);

    /** @type {Curve} */
    this.curve = new Curve(this.position, 5);

    // Engine
    this.stop = true; // move or not?
    this.speed = 80; // pixels per second
    this.agility = 1; // ability to turn
    this.active = true; // draw line?
    this.immune = false; // dead on collision?

    // Controllers
    this.angle = options.angle;
    this.vector = 0;

    // Stats
    this.distanceTraveled = 0;
    this.crashed = false;

    // Design
    this.color = options.color;

    // Draw a bit of body
    const movement = this.getMovement(.1);
    const newPos = new Point(this.position.x + movement.vx, this.position.y + movement.vy);
    this.curve.update(newPos);
    this.position.x = newPos.x;
    this.position.y = newPos.y;

    initBonuses(this);
  }
  /**
   * @param {number} angle
   */
  setAngle(angle) {
    this.angle = angle;
  }
  /**
   * @param {number} va
   */
  addAngle(va) {
    this.angle -= (va * 3.6) * this.agility;
  }
  /** @param {number} diff */
  getMovement(diff) {
    const radians = this.angle * (Math.PI / 180);
    const movement = this.speed * diff;
    const vx = movement * Math.sin(radians);
    const vy = movement * Math.cos(radians);
    return {
      vx,
      vy,
      movement
    };
  }
  /** @param {number} diff */
  update(diff) {
    if (this.stop) {
      return;
    }
    this.emit('pre/update');
    // If controller active
    if (this.vector) {
      this.addAngle(this.vector);
    }

    // Displacement
    const {
      vx,
      vy,
      movement
    } = this.getMovement(diff);
    this.distanceTraveled += movement;

    const newPos = new Point(this.position.x + vx, this.position.y + vy);

    this.position.x = newPos.x;
    this.position.y = newPos.y;

    if (this.active) {
      this.curve.update(newPos);
    }
    this.emit('update');
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} diff
   */
  draw(ctx, diff) {
    this.emit('pre/draw');
    this.update(diff);
    this.curve.draw(this.ctx, this.color);

    // Draw head
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.curve.weight / 2, 0, 2 * Math.PI);
    ctx.fill();

    this.emit('draw');
  }
  destroy() {
    this.emit('destroy');
    this._events = {};
  }
}

/**
 * Init bonuses and specials
 * @param {Player} player
 */
function initBonuses(player) {
  const data = {
    distanceTraveled: 0,
    distance: 0,
    pause: false,
    pauseDistance: 0
  };
  let limits = [int(200, 400), 4];
  player.on('pre/update', () => {
    const movement = player.distanceTraveled - data.distanceTraveled;
    data.distanceTraveled = player.distanceTraveled;

    if (data.pause) {
      data.pauseDistance += movement;
      if (data.pauseDistance > player.curve.weight * limits[1]) {
        data.pauseDistance = 0;
        data.pause = false;
        player.immune = false;
        player.active = true;
        player.curve.updatePosition();
        limits[0] = int(200, 400);
      }
    } else {
      data.distance += movement;
      if (data.distance > limits[0]) {
        data.distance = 0;
        data.pause = true;
        player.immune = true;
        player.active = false;
      }
    }
  })

  // const speed = player.speed;
  // const agility = player.agility;
  // setInterval(() => {
  //   player.speed = player.speed === speed ? 2 * speed : speed;
  //   player.agility = player.agility === agility ? 2 * agility : agility;
  // }, 2000);
}

module.exports = Player;
