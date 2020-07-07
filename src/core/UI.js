const Renderer = require('./Renderer.js');
const User = require('./User');

const EventEmitter = require('../helpers/EventEmitter');
const InputController = require('../helpers/InputController');

class UI extends EventEmitter {
  /**
   * Graphic user interface
   * @param {HTMLElement} $app Element
   * @param {InputController} inputController
   */
  constructor($app, inputController) {
    super();
    this.$app = $app;
    this.inputController = inputController;

    this.width = 640;
    this.height = 480;

    this.canvas = document.createElement('canvas');
    this.$ui = document.createElement('div');
    this.$ui.className = 'ui';
    this.$uiElements = {};
    this.initUi();

    this.$app.appendChild(this.canvas);
    this.$app.appendChild(this.$ui);

    this.canvas.width = this.width - 150;
    this.canvas.height = this.height;
    this.$app.style.width = `${this.width}px`;
    this.$app.style.height = `${this.height}px`;
    this.setSize();

    this.render = new Renderer(this.canvas);

    this.initFpsCounter();

    this.playerList = [
      {color: 'red', name: 'Fred'},
      {color: 'lime', name: 'Greenlee'},
      {color: '#fd00fd', name: 'Pinkey'},
      {color: '#00fdfd', name: 'Bluebell'},
      {color: '#fd7e00', name: 'Willem'},
      {color: '#cacaca', name: 'Greydon'},
      {color: 'olive', name: 'Oliver'},
      {color: 'cyan', name: 'Cyarlie'},
    ];
    this.playerList.forEach((data, i) => this.initPlayer(i, data.color, data.name));

    inputController.on('keydown/32', () => {
      if (this.$uiElements.mainMenu.className.indexOf('choice') !== -1) return;
      this.emit('startGame');
    })
    window.addEventListener('resize', () => this.onResize());
  }
  setSize() {
    const scale = this.getAppScale();
    this.$app.style.transform = `scale(${scale})`;
  }
  getAppScale() {
    const scale = Math.min((window.innerHeight / this.height), (window.innerWidth / this.width));
    return Math.floor(scale * 95) / 100;
  }
  onResize() {
    this.setSize();
    this.render.clear();
    this.render.draw(0);
  }
  /**
   * @param {User[]} users
   */
  updateScore(users) {
    this.emptyTableScore();
    users.forEach(user => {
      const player = this.playerList.find(p => p.color === user.color);
      player.$score.innerHTML = user.points;
      this.$uiElements.tableScore.appendChild(player.$user)
    });
  }
  initFpsCounter() {
    this.fpsInterval = setInterval(() => {
      this.$uiElements.fps.innerHTML = `FPS: ${Math.floor(this.render.fps)}`;
    }, 500);
    this.$uiElements.fps = document.createElement('div');
    this.$uiElements.fps.className = 'fps';
    this.$ui.appendChild(this.$uiElements.fps);
  }
  initUi() {
    this.$ui.innerHTML = `
      <div class="main-menu">
        <div class="title">
          <span>Achtung, </span>
          <span>die Kurve!<span>
        </div>
        <div class="subtitle">
          akcyp remake
        </div>
        <div class="control-info">
          <span>left</span>
          <span>right</span>
        </div>
        <div class="start">Start</div>
        <div class="list"></div>
      </div>
      <div class="ingame">
        <div class="goalInfo">
          <p>goal</p>
          <div>10</div>
          <span>2 points diff</span>
        </div>
        <div class="tableScore"></div>
        <div class="navInfo">Space to continue</div>
      </div>
    `;
    this.$uiElements.mainMenu = this.$ui.querySelector('.main-menu');
    this.$uiElements.playerList = this.$ui.querySelector('.list');
    this.$uiElements.start = this.$ui.querySelector('.start');
    this.$uiElements.start.addEventListener('click', () => {
      if (this.$uiElements.mainMenu.className.indexOf('choice') !== -1) return;
      this.emit('startGame');
    });
    this.$uiElements.goal = this.$ui.querySelector('.goalInfo div');
    this.$uiElements.tableScore = this.$ui.querySelector('.tableScore');
  }
  /**
   * Add new element to player list
   * @param {number} index
   * @param {string} color
   * @param {string} name
   */
  initPlayer(index, color, name) {
    const $player = document.createElement('div');
    $player.className = 'player';
    $player.style.color = color;
    this.$uiElements.playerList.appendChild($player);

    const $counter = document.createElement('div');
    $counter.className = 'counter';
    $counter.innerHTML = `${index + 1}`;
    $player.appendChild($counter);

    const $color = document.createElement('div');
    $color.className = 'color';
    $color.innerHTML = name;
    $player.appendChild($color);

    const $leftKey = document.createElement('div');
    $leftKey.className = 'leftKey';
    $player.appendChild($leftKey);

    const $rightKey = document.createElement('div');
    $rightKey.className = 'rightKey';
    $player.appendChild($rightKey);

    // create logic
    $color.addEventListener('click', () => {
      if (this.$uiElements.mainMenu.className.indexOf('choice') !== -1) return;
      if (!this.playerList[index].leftKey || !this.playerList[index].rightKey) {
        this.$uiElements.mainMenu.classList.add('choice');
        $player.classList.add('active');

        $leftKey.classList.add('active');
        this.inputController.once('keydown', (e) => {
          if (e.keyCode === 32) return true;
          $leftKey.classList.remove('active');
          $leftKey.innerHTML = e.key.toUpperCase().replace('ARROW', '');
          this.playerList[index].leftKey = e.keyCode;

          $rightKey.classList.add('active');
          this.inputController.once('keydown', (e) => {
            if (e.keyCode === 32) return true;
            $rightKey.classList.remove('active');
            $rightKey.innerHTML = e.key.toUpperCase().replace('ARROW', '');
            this.playerList[index].rightKey = e.keyCode;

            this.emit('setUser', {
              color,
              name,
              controlsLeft: [this.playerList[index].leftKey],
              controlsRight: [this.playerList[index].rightKey]
            });
            this.$uiElements.mainMenu.classList.remove('choice');
          });
        })
      } else {
        $player.classList.remove('active');
        $leftKey.innerHTML = '';
        $rightKey.innerHTML = '';
        this.playerList[index].leftKey = undefined;
        this.playerList[index].rightKey = undefined;
        this.emit('delUser', color);
      }
    });

    // Ingame score
    const $user = document.createElement('div');
    $user.className = 'user';
    $user.style.color = color;

    const $name = document.createElement('div');
    $name.className = 'name';
    $name.innerHTML = name;
    $user.appendChild($name);

    const $score = document.createElement('div');
    $score.className = 'score';
    $user.appendChild($score);

    this.playerList[index].$user = $user;
    this.playerList[index].$score = $score;
  }
  emptyTableScore() {
    while (this.$uiElements.tableScore.firstChild) {
      this.$uiElements.tableScore.removeChild(this.$uiElements.tableScore.firstChild);
    }
  }
  clearTableScore() {
    this.emptyTableScore();
    this.playerList.forEach((playerInfo) => {
      playerInfo.$score.innerHTML = '0';
    })
  }
  /**
   * @param {User[]} users
   */
  prepareToGame(users) {
    this.$uiElements.goal.innerHTML = users.length * 5;
    this.clearTableScore();
    this.playerList.forEach((playerInfo) => {
      if (users.find(user => user.color === playerInfo.color)) {
        this.$uiElements.tableScore.appendChild(playerInfo.$user)
      }
    });
  }
  /**
   * @param {User[]} users
   */
  initGame(users) {
    this.$ui.classList.add('isGame');
    this.clearTableScore();
    this.prepareToGame(users);
  }
  finishGame() {
    this.$ui.classList.remove('isGame');
    this.clearTableScore();
  }
}

module.exports = UI;
