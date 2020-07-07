module.exports = {
  /**
   * Generates random integer from `min` to `max`
   * @param {number} min
   * @param {number} max
   */
  int(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);
    if (max < min) {
      [min, max] = [max, min];
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  color(min = 0, max = 16777214) {
    return '#' + module.exports.int(min, max).toString(16);
  },
  curveColor: () => {
    return module.exports.color(5592404, 11184809);
  }
}
