const Point = require('./Point');

class CurveSegment {
  /**
   * Fragment od the curve
   * @param {Path2D} path
   * @param {number} weight
   */
  constructor(path, weight) {
    this.path = path;
    this.weight = weight;
    this.closed = false;

    /** @type {Point[]} */
    this.pointsHistory = [];
  }
  /**
   * @param {Point} oldPos
   * @param {Point} newPos
   */
  update(oldPos, newPos) {
    this.path.quadraticCurveTo(oldPos.x, oldPos.y, (oldPos.x + newPos.x) / 2, (oldPos.y + newPos.y) / 2);
    this.addPoint(newPos);
  }
  /**
   * @param {Point} point
   */
  addPoint(point) {
    this.pointsHistory.push(point);
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color
   * @param {string} [shadow]
   */
  draw(ctx, color, shadow) {
    if (shadow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor =  shadow;
    }

    ctx.strokeStyle = color;
    ctx.lineCap = 'square';
    ctx.lineWidth = this.weight;
    ctx.stroke(this.path);
  }
}

module.exports = CurveSegment;
