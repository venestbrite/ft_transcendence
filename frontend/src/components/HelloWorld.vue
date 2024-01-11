<script setup lang="ts">

</script>

<script lang="ts">

export default {
  data() {
    return {
      canvas: null,
      centerX: null,
      centerY: null,
      MAX_LINE_WIDTH: 1,
      SIZE: 25,
      OFFSET: 25 / 5,
      ENEMY_RADIUS: 100,
      HEX_SIZE: 25 / 2,
      MAX_SIZE: 25 / 2 + 25 / 5,
      objs: [],
      spacingX: this.SIZE + this.OFFSET,
      spacingY: this.SIZE,
      enemyObj: {
        x: this.centerX,
        y: this.centerY,
        r: this.ENEMY_RADIUS
      },
      angle: 0,
      colors : ['#1565c0', '#0097a7', '#4527a0', '#7b1fa2', '#ad1457'],
      width : null,
      height: null,
      ctx: null,
    }
  },
  methods: {
    goToLogin() {
       window.location.href = this.$base_url + 'auth/api42';
    }
    },
  mounted() {
  },

}

</script>

<template>

<div>
  <div class="bg"></div>
  <div class="bg bg2"></div>
  <div class="bg bg3"></div>
  <div class="centered">
    <h1 class="neon" style="color: white;">Welcome to TRANSCENDENCE</h1>
    <a href="#" @click="goToLogin" style="color: white;"><p class="main-link">Go to Login →</p></a>
  </div>
</div>



</template>

<style>
html, body {
  /* width: 100%;
  height:100%; */
}
@font-face {
  font-family: myFirstFont;
  src: url('@/assets/fonts/ceciliaoctavia-regular.woff.otf');
}

h1 {
  font-family: myFirstFont !important;
  text-transform: uppercase;
}

a::before {
  content: "";
  position: absolute;
  display: block;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: rgb(228, 228, 228);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

a:hover::before {
  transform: scaleX(1);
}

.welcome {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.welcome p {
  text-align: center;
  color: white;
  font-size: 2rem;
}

.credits {
  font-size: 10px !important;
  text-align: center;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

body
{
  overflow: hidden;
  /* background-color: #4a148c !important; */
  background-color: black;
  font-family: "Montserrat";
}
			h1
			{
				font-size: 6rem;
				color: #fff;
				text-align: center;
			}
			h2
			{
				font-size: 2rem;
				color: beige;
				text-align: center;
			}
			h2 > a
			{
				color: rgb(221, 221, 221);
				font-weight: 500;
				text-decoration: none;
			}
			h2 > a:hover
			{
				color: crimson;
				border-bottom: 1px solid red;
				text-decoration: none;
				transition: cubic-bezier(0.075, 0.82, 0.165, 1);
			}
			p
			{
				text-align: center;
				color: white;
			}
			.centered
			{
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
.bg {
  animation:slide 3s ease-in-out infinite alternate;
  background-image: linear-gradient(-60deg, rgb(0, 0, 0) 50%, rgb(112, 112, 112) 50%);
  bottom:0;
  left:-50%;
  opacity:.5;
  position:fixed;
  right:-50%;
  top:0;
  z-index:-1;
}

.bg2 {
  animation-direction:alternate-reverse;
  animation-duration:4s;
}

.bg3 {
  animation-duration:5s;
}

.content {
  background-color:rgba(207, 207, 207, 0.8);
  border-radius:.25em;
  box-shadow:0 0 .25em rgba(0,0,0,.25);
  box-sizing:border-box;
  left:50%;
  padding:10vmin;
  position:fixed;
  text-align:center;
  top:50%;
  transform:translate(-50%, -50%);
}

@font-face {
  font-family: neon;
  src: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/707108/neon.ttf);
}


/* h1 {
  font-family:monospace;
} */

@keyframes slide {
  0% {
    transform:translateX(-25%);
  }
  100% {
    transform:translateX(25%);
  }
}
</style>
