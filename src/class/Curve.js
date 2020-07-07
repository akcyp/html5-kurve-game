const Point = require('./Point');
const CurveSegment = require('./CurveSegment');

class Curve {
  /**
   * Curve class
   * @param {Point} pos
   * @param {number} weight
   */
  constructor(pos, weight) {
    this.pos = pos; // reference
    this._weight = weight;

    /** @type {CurveSegment[]} */
    this.segments = [];
    this.newSegment();
  }
  newSegment(weight = this._weight) {
    if (this.lastSegment) {
      this.lastSegment.closed = true;
    }

    const path = new Path2D();
    path.moveTo(this.pos.x, this.pos.y);

    const segment = new CurveSegment(path, weight);
    segment.addPoint(new Point(this.pos.x, this.pos.y));

    this.segments.push(segment);
  }
  /**
   * @returns {CurveSegment}
   */
  get lastSegment() {
    return this.segments[this.segments.length - 1];
  }
  get weight() {
    return this._weight;
  }
  set weight(val) {
    if (this.lastSegment.weight !== val) {
      this.newSegment(val);
    }
    this._weight = val;
  }
  updatePosition() {
    this.lastSegment.path.moveTo(this.pos.x, this.pos.y);
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color
   * @param {string} [shadow]
   */
  draw(ctx, color, shadow) {
    for (const segment of this.segments) {
      segment.draw(ctx, color, shadow);
    }
  }
  /**
   * @param {Point} point
   */
  update(point) {
    this.lastSegment.update(this.pos, point);
  }
  /**
   * Returns `true` if point colliding curve
   * @param {Point} point Point to check
   * @param {number} additionalDistance Additional spacing to point
   * @param {Boolean} [headException] Set to `false` is point not belongs to this curve
   */
  interfere(point, additionalDistance, headException = true) {
    for (let j = 0; j < this.segments.length; j++) {
      const segment = this.segments[j];
      for (let i = 0; i < segment.pointsHistory.length; i++) {
        const { x, y } = segment.pointsHistory[i];
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
        if ((distance > segment.weight / 2) && (distance < additionalDistance + segment.weight / 2)) {
          // console.log(distance, additionalDistance, this.weight / 2);
          const rest = [].concat.apply([], this.segments.slice(j + 1, this.segments.length).map(segm => segm.pointsHistory));
          if (!headException) return true;
          return segment.pointsHistory.slice(i, segment.pointsHistory.length).concat(rest).some((p) => {
            return Math.sqrt((point.x - p.x) ** 2 + (point.y - p.y) ** 2) > additionalDistance + segment.weight / 2
          });
        }
      }
    }
    return false;
  }
}

module.exports = Curve;
