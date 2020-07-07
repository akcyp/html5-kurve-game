class EventEmitter {
  constructor() {
    this._events = {};
  }
  /**
   * Add listener
   * @param {string} key
   * @param {Function} listener
   */
  on(key, listener) {
    if(!this._events[key]){
      this._events[key] = [];
    }
    this._events[key].push(listener);
    return this;
  }
  /**
   * Remove listner
   * @param {string} key
   * @param {Function} [listener]
   */
  off(key, listener) {
    if(this._events[key]) {
      if(listener instanceof Function) {
        const idx = this._events[key].indexOf(listener);
        if(idx !== -1){
            this._events[key].splice(idx, 1);
        }
      } else {
        delete this._events[key];
      }
    }
    return this;
  }
  /**
   * Emit listener
   * @param {string} key
   * @param  {...any} args
   */
  emit(key, ...args) {
    if(this._events[key]) {
      const listeners = this._events[key].slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    return this;
  }
  /**
   * Listener for first emitted event
   * @param {string} key
   * @param {Function} listener
   */
  once(key, listener) {
    this.on(key, function x(){
      this.off(key, x);
      const ret = listener.apply(this, arguments);
      if(ret === true) this.once(key, listener);
    });
    return this;
  }
}

module.exports = EventEmitter;
