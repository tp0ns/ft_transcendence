<template>
  <div>
    <canvas
      tabindex="0"
      @mousemove="mouseMove"
      v-on:keypress.enter="moveBall()"
      v-on:keypress.space="gameFunctions('resetBall')"
      v-on:keypress.w="move('up')"
      v-on:keypress.s="move('down')"
      ref="game"
      width="640"
      height="480"
      style="border: 1px solid black; background-color: #0d1117"
    >
    </canvas>
    <p style="display: flex; justify-content: center">
      <button v-on:click="moveBall()">Start</button>
      <button v-on:click="gameFunctions('resetBall')">Reset Ball</button>
    </p>
  </div>
</template>

<script>
import io from "socket.io-client";
export default {
  name: "BlockGame",
  data() {
    return {
      socket: {},
      context: {},
      ballPosition: {
        x: 0,
        y: 0,
        radius: 10,
        startAngle: 0,
        speedx: 5,
        speedy: 0,
        goRight: 0, //direction that the ball will have
      },
      leftPadPosition: {
        x: 0,
        y: 50,
        w: 20,
        h: 100,
        speed: 5,
      },
      rightPadPosition: {
        x: 620,
        y: 400,
        w: 20,
        h: 100,
        speed: 20,
      },
    };
  },
  created() {
    this.socket = io("http://localhost:3000");
  },
  mounted() {
    this.context = this.$refs.game.getContext("2d");
    this.socket.on("setPosition", (leftPos, rightPos, ballPos) => {
      this.leftPadPosition = leftPos;
      this.rightPadPosition = rightPos;
      this.context.clearRect(
        0,
        0,
        this.$refs.game.width,
        this.$refs.game.height
      );

      //  draw the ball
      this.ballPosition = ballPos;
      this.context.arc(5, 5, 5, 0, 2 * Math.PI);
      this.context.beginPath();
      this.context.arc(
        this.ballPosition.x,
        this.ballPosition.y,
        this.ballPosition.radius,
        this.ballPosition.startAngle,
        2 * Math.PI
      );
      this.context.lineWidth = 1;
      this.context.fillStyle = "#FF67E7";
      this.context.fill();

      //draw left pad
      this.context.fillStyle = "#9254C8";
      this.context.fillRect(
        this.leftPadPosition.x,
        this.leftPadPosition.y - 50,
        this.leftPadPosition.w,
        this.leftPadPosition.h
      );
      //draw right pad
      this.context.fillRect(
        this.rightPadPosition.x,
        this.rightPadPosition.y - 50,
        this.rightPadPosition.w,
        this.rightPadPosition.h
      );
    });
  },
  methods: {
    move(direction) {
      this.socket.emit("move", direction);
    },
    gameFunctions(func) {
      this.socket.emit("gameFunctions", func);
    },
    mouseMove() {
      this.socket.emit("mouseMove", event.clientY, this.ballPosition);
    },
    moveBall() {
      if (this.ballPosition.goRight == 0) {
        if (
          this.ballPosition.y + this.ballPosition.speedy <= 10 ||
          this.ballPosition.y + this.ballPosition.speedy >= 470
        ) {
          this.ballPosition.speedy = -this.ballPosition.speedy;
        }
        if (this.ballPosition.x + this.ballPosition.speedx >= 630) {
          // collision with left wall. 630 = point of contact in px
          this.ballPosition.x = 630;
          //end of the round - need to add score management
          this.gameFunctions("resetBall");
          return;
        } else {
          this.ballPosition.x += this.ballPosition.speedx;
          this.ballPosition.y += this.ballPosition.speedy;
        }
        // collisions with the right pad
        if (
          this.rightPadPosition.y - this.rightPadPosition.h / 2 <=
            this.ballPosition.y &&
          this.ballPosition.y <=
            this.rightPadPosition.y + this.rightPadPosition.h / 2 &&
          this.ballPosition.x >=
            this.rightPadPosition.x - this.rightPadPosition.w
        ) {
          var impact =
            this.ballPosition.y -
            this.rightPadPosition.y +
            this.rightPadPosition.h / 2;
          var ratio = 100 / (this.rightPadPosition.h / 2);
          var angle = Math.round((impact * ratio) / 10);
          if (angle >= 10) {
            angle -= 10;
            angle = -angle;
          }
          this.ballPosition.speedy = angle;
          this.ballPosition.goRight = 1;
        }
      } else {
        if (
          this.ballPosition.y + this.ballPosition.speedy <= 0 ||
          this.ballPosition.y + this.ballPosition.speedy >= 470
        ) {
          this.ballPosition.speedy = -this.ballPosition.speedy;
        }
        if (this.ballPosition.x - this.ballPosition.speedx <= 10) {
          // collision with left wall. 10 = point of contact in px
          this.ballPosition.x = 10;
          //end of the round - need to add score management
          this.gameFunctions("resetBall");
          return;
        } else {
          this.ballPosition.x -= this.ballPosition.speedx;
          this.ballPosition.y += this.ballPosition.speedy;
        }
        // collisions with the left pad
        if (
          this.leftPadPosition.y - this.leftPadPosition.h / 2 <=
            this.ballPosition.y &&
          this.ballPosition.y <=
            this.leftPadPosition.y + this.leftPadPosition.h / 2 &&
          this.ballPosition.x <= this.leftPadPosition.x + this.leftPadPosition.w
        ) {
          impact =
            this.ballPosition.y -
            this.leftPadPosition.y +
            this.leftPadPosition.h / 2;
          ratio = 100 / (this.leftPadPosition.h / 2);
          angle = Math.round((impact * ratio) / 10);
          if (angle >= 10) {
            angle -= 10;
            angle = -angle;
          }
          this.ballPosition.speedy = angle;
          this.ballPosition.goRight = 0;
        }
      }
      if (this.ballPosition.x != 10 && this.ballPosition.x != 630) {
        // animation until the ball touches the wall
        requestAnimationFrame(this.moveBall);
      }
      this.socket.emit("ballMovement", this.ballPosition);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
