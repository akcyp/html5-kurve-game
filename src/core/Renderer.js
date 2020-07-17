class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false
    });
    /** @type {any} */
    this.list = [];
    this.framerate = 60;

    this.fps = this.framerate;

    this.lastFrame = Date.now();
    this.nextFrame(0);
  }
  /**
   * Add new drawable object
   * @param {*} object Instance with `draw` method
   */
  push(object) {
    this.list.push(object);
  }
  /**
   * Remove drawable object from list
   * @param {*} object Instance already stored in list
   */
  remove(object) {
    this.list.splice(this.list.indexOf(object), 1);
  }
  /** @param {number} ts */
  nextFrame(ts) {
    const refreshFrameTime = Date.now() - this.lastFrame;
    this.lastFrame = Date.now();
    this.fps = 1000 / refreshFrameTime;
    // Clear and draw
    this.clear();
    this.draw(refreshFrameTime / 1000);
    setTimeout(() => {
      window.requestAnimationFrame((ts) => this.nextFrame(ts));
    }, Math.max(0, 1000 / this.framerate - refreshFrameTime));
  }
  /** @param {number} diff */
  draw(diff) {
    for (let drawable of this.list) {
      this.ctx.save();
      drawable.draw(this.ctx, diff, {
        w: this.canvas.width,
        h: this.canvas.height
      });
      this.ctx.restore();
    }
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

module.exports = Renderer;
