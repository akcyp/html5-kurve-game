const UI = require('./UI');
const Game = require('./Game.js');
const User = require('./User');

const InputController = require('../helpers/inputController');

class Main {
  /**
   * Main class
   * @param {HTMLElement} $app
   */
  constructor($app) {
    $app.setAttribute('tabindex', '1');
    this.inputController = new InputController($app);
    this.ui = new UI($app, this.inputController);
    this.game = new Game(this.ui.render, this.inputController, {
      width: this.ui.width - 150,
      height: this.ui.height
    });
    this.gameStarted = false;


    this.ui.on('setUser',
      /**
       * @param {{color: string, name: string, controlsLeft: number[], controlsRight: number[]}} config
       */
      (config) => {
        let user = this.game.users.find(user => user.color === config.color);
        if (!user) {
          const user = new User(config.color, config.name, this.inputController);
          user.setControls(config.controlsLeft, config.controlsRight);
          this.game.newUser(user);
        } else {
          if (config.color) {
            user.color = config.color;
          }
          if (config.controlsLeft && config.controlsRight) {
            user.setControls(config.controlsLeft, config.controlsRight);
          }
        }
      });
    this.ui.on('delUser',
    /**
     * @param {string} color
     */
      (color) => {
          const idx = this.game.users.findIndex(user => user.color === color);
          this.game.users[idx].destroy();
          this.game.users.splice(idx, 1);
      }
    )

    this.ui.on('startGame', () => {
      this.startGame();
    });

    this.game.on('scoreUpdate',
      /**
       * @param {User[]} users
       */
      (users) => {
        this.ui.updateScore(users);
      }
    );

    this.game.on('finish',
      /**
       * @param {User[]} users
       */
      (users) => {
        this.gameStarted = false;
        this.game.rounds = [];
        this.game.users.forEach(user => user.points = 0);
        this.ui.finishGame();
      })
  }
  startGame() {
    if (this.gameStarted) return;
    if (this.game.users.length < 2) return;

    this.gameStarted = true;
    this.ui.initGame(this.game.users);
    this.game.startGame();
  }
}

module.exports = Main;
