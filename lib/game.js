const Astronaut = require("./astronaut");
const Asteroid = require("./asteroid");
const Util = require("./util");

class Game {
  constructor(stage, canvasEl) {
    this.stage = stage;
    this.canvasEl = canvasEl;
    this.highScore = 0;

    this.setup();
    this.run();
    this.renderAsteroids();
  }

  setup() {
    this.gameOver = false;
    this.difficulty = 8;
    this.asteroids = [];
    this.asteroidScore = 10;
    this.score = 0;
    this.row = 550;
    this.jump = 1;

    this.setupModal();
    this.updateScore();
    this.addAstronaut();
    for (let i = 0; i < 6; i++) {
      this.addAsteroid();
    }
    this.setDifficulty();
  }

  setDifficulty() {
    const easyMode = $(".easy-mode")[0];

    easyMode.onclick = () => {
      if (easyMode.checked) {
        this.difficulty = 1;
      } else {
        this.difficulty = 8;
      }
    };
  }

  setupModal() {
    $("#btn-start").click(() => {
      $(".modal-start").css("display","none");
    });
  }

  run() {
    createjs.Ticker.setFPS(Game.FPS); // Sets game fps
    createjs.Ticker.on("tick", event => ( this.stage.update()));

    createjs.Ticker.addEventListener("tick", event => {
      let difX = this.stage.mouseX - this.astronaut.x - 24; // Astronaut follows mouse
      this.astronaut.x += difX/this.difficulty;

      this.checkCollisions();
      this.fillAsteroids();
      this.cleanUpAsteroids();
      this.isGameOver();
    });
  }

  isGameOver() {
    if (this.astronaut.y > 550) {
      createjs.Ticker.removeAllEventListeners();

      this.astronaut.y = 550;
      clearInterval(this.intervalMoveOne);
      clearInterval(this.intervalDecOne);
      clearInterval(this.intervalMoveTwo);
      clearInterval(this.intervalDecTwo);

      // function getCookie(cname) {
      //     var name = cname + "=";
      //     var ca = document.cookie.split(';');
      //     for(var i = 0; i < ca.length; i++) {
      //         var c = ca[i];
      //         while (c.charAt(0) == ' ') {
      //             c = c.substring(1);
      //         }
      //         if (c.indexOf(name) == 0) {
      //             return c.substring(name.length, c.length);
      //         }
      //     }
      //     return "";
      // }
      //
      // if (document.cookie === "") {
      //   highScore = this.score;
      // } else {
      //   const prevHighScore = parseInt(getCookie("highScore"));
      //   highScore = Math.max(prevHighScore, this.score);
      // }
      // document.cookie = `highScore=${highScore};`;

      this.highScore = Math.max(this.highScore, this.score);

      $("#high-score").html(this.highScore);
      $("#score").html(this.score);

      $(".modal-over").css("display", "block");
      $("#btn-again").click(() => {
        this.restart();
        $(".modal-over").css("display","none");
      });
    }
  }

  restart() {
    $("#canvas").off("click");
    this.stage.removeAllChildren();

    this.setup();
    this.run();
    this.renderAsteroids();
  }

  updateScore() {
    this.stage.removeChild(this.displayScore);
    this.displayScore = new createjs.Text(`Score: ${this.score}`, "16px Audiowide", Util.randomColor());
    this.displayScore.x = 20;
    this.displayScore.y = 15;
    this.stage.addChild(this.displayScore);
  }

  addAstronaut() {
    let astronaut = new Astronaut();  // Create astronaut
    this.stage.addChild(astronaut);

    $("#canvas").click(() => {
      this.jumpOne();
      $("#canvas").off("click");
    });

    this.astronaut = astronaut;
  }

  addAsteroid() {
    this.row -= Math.floor(80 + 10 * this.deviation());
    let asteroid = new Asteroid(
      (Math.floor(Math.random() * (Game.DIM_X - 80) + 40)),
      this.row
    );

    this.stage.addChild(asteroid);
    this.asteroids.push(asteroid);
  }

  deviation() {
    let pseudoRandom = Math.random();
    if (pseudoRandom > 0.5) {
      pseudoRandom -= 0.5;
    }
    return pseudoRandom;
  }

  removeAsteroid(asteroid) {
    this.stage.removeChild(asteroid);
    this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
  }

  renderAsteroids() {
    this.asteroids.forEach((asteroid) => {
      this.stage.addChild(asteroid);
      this.stage.update();
    });
  }

  checkCollisions() {
    const allAsteroids = this.asteroids;

    for (let i = 0; i < allAsteroids.length; i++) {
      const asteroid = allAsteroids[i];

      if (Util.isCollidedWith(this.astronaut,asteroid)) {
        this.handleCollision(asteroid);
      }
    }
  }

  handleCollision(asteroid) {
    this.newCollision = true;
    this.score += this.asteroidScore;
    this.asteroidScore += 10;

    this.updateScore(Util.randomColor());
    this.removeAsteroid(asteroid);
    this.explode(this.astronaut.x,this.astronaut.y);
    this.shiftAsteroids();

    if (this.jump === 1) {
      this.jump = 2;
      this.jumpTwo();
    } else {
      this.jump = 1;
      this.jumpOne();
    }
  }

  jumpOne() {
    clearInterval(this.intervalMoveTwo);
    clearInterval(this.intervalDecTwo);

    const oldYOne = this.astronaut.y;
    const acc = 0.15;
    let vel = -4;

    // To have the astronaut jump to a set height:
    // let vel = 2*(100-oldYOne)/(16/0.15); // From: s = (1/2)(v+u)t AND v = u + at

    this.intervalMoveOne = setInterval(moveOne.bind(this), 10);
    this.intervalDecOne = setInterval(decellerateOne.bind(this), 10);

    function moveOne() {
      this.astronaut.y += vel;
    }

    function decellerateOne() {
      if (this.astronaut.y < 350) {
        vel += acc;
      }
    }
  }

  jumpTwo() {
    clearInterval(this.intervalMoveOne);
    clearInterval(this.intervalDecOne);

    const oldYTwo = this.astronaut.y;
    const acc = 0.15;
    let vel = -4;

    this.intervalMoveTwo = setInterval(moveTwo.bind(this), 10);
    this.intervalDecTwo = setInterval(decellerateTwo.bind(this), 10);

    function moveTwo() {
      this.astronaut.y += vel;
    }

    function decellerateTwo() {
      if (this.astronaut.y < 350) {
        vel += acc;
      }
    }
  }

  shiftAsteroids() {
    this.asteroids.forEach(asteroid => {
      const acc = -0.15;
      let vel = 6;
      const intervalMove = setInterval(move.bind(this), 10);
      const intervalDec = setInterval(decellerate.bind(this), 10);

      function move() {
        asteroid.y += vel;

        if (vel <= 0) {
          clearInterval(intervalMove);
          clearInterval(intervalDec);
        }
      }

      function decellerate() {
        vel += acc;
      }
    });

    this.row += 120; // Used: a = (u-v)/t AND s = (u)(t) + (1/2)(a)(t)^2
  }

  fillAsteroids() {
    if (this.asteroids.length < 12) {
      this.addAsteroid();
    }
  }

  cleanUpAsteroids() {
    this.asteroids.forEach(asteroid => {
      if (asteroid.y >= 600) {
        this.removeAsteroid(asteroid);
        this.addAsteroid();
      }
    });
  }

  explode(x,y) {
    var particles = 20,
    // place explosion container on body
    explosion = $('<div class="explosion"></div>');
    $('body').append(explosion);

    const stageX = ($(document).width() - 800)/2;
    const stageY = ($(document).height() - 550)/2;

    // position the container to be centered on click
    explosion.css('left', stageX + x - explosion.width() / 2);
    explosion.css('top', stageY + y - explosion.height() / 2);

    for (var i = 0; i < particles; i++) {
      var x = (explosion.width() / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
        y = (explosion.height() / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
        color = Util.randomExplosionColor(),
        elm = $('<div class="particle" style="' +
          'background-color: ' + color + ' ;' +
          'top: ' + y + 'px; ' +
          'left: ' + x + 'px"></div>');

      if (i == 0) {
        elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          explosion.remove(); // remove this explosion container when animation ends
        });
      }
      explosion.append(elm);
    }
    // get random number between min and max value
    function rand(min, max) {
      return Math.floor(Math.random() * (max + 1)) + min;
    }
  }

}

Game.BG_COLOR = "#111";
Game.DIM_X = 800;
Game.DIM_Y = 550;
Game.FPS = 60;

module.exports = Game;
