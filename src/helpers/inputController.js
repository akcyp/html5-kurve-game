const EventEmitter = require('./EventEmitter');

class InputController extends EventEmitter {
  /**
   * @param {HTMLElement} $el
   */
  constructor($el) {
    super();
    $el.addEventListener('keydown', (e) => {
      e.preventDefault();
      this.emit('keydown', e);
      this.emit(`keydown/${e.keyCode}`, e);
    }, false);
    $el.addEventListener('keyup', (e) => {
      e.preventDefault();
      this.emit('keyup', e);
      this.emit(`keyup/${e.keyCode}`, e);
    }, false);
  }
}

module.exports = InputController;
