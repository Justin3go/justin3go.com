<template>
	<div class="video-container">
		<video class="logo-video" autoplay loop muted>
			<source src="https://oss.justin3go.com/blogs/justin3go.mp4" type="video/mp4" />
		</video>
		<div class="button-container-outer" @click="handleClick">
			<div class="container-button">
				<div class="hover bt-1"></div>
				<div class="hover bt-2"></div>
				<div class="hover bt-3"></div>
				<div class="hover bt-4"></div>
				<div class="hover bt-5"></div>
				<div class="hover bt-6"></div>
				<button></button>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
function handleClick() {
	console.log("handle click");

	// window.location.hash = "#recently-post";
  window.location.href = "/博客/"
}
</script>
<style scoped>
.video-container {
	height: 100vh;
  width: 100%;
	overflow: hidden;
  display: flex;
  justify-content: center;
}
/* 小于960px会增加return-top那一栏并且不会透明 */
@media (max-width: 960px) {
  .video-container {
    height: calc(100vh - var(--vp-nav-height) - 47px);
  }
}

.logo-video {
	mix-blend-mode: difference;
  height: 100%;
  min-width: 100%;
  object-fit: cover;
}

.button-container-outer {
	position: absolute;
	bottom: 8%;
	width: 100%;
	display: flex;
	justify-content: center;
}
.container-button {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"bt-1 bt-2 bt-3"
		"bt-4 bt-5 bt-6";
	position: relative;
	perspective: 800;
	padding: 0;
	width: 135px;
	height: 47px;
	transition: all 0.3s ease-in-out;
}

.container-button:active {
	transform: scale(0.95);
}

.hover {
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 200;
}

.bt-1 {
	grid-area: bt-1;
}

.bt-2 {
	grid-area: bt-2;
}

.bt-3 {
	grid-area: bt-3;
}

.bt-4 {
	grid-area: bt-4;
}

.bt-5 {
	grid-area: bt-5;
}

.bt-6 {
	grid-area: bt-6;
}

.bt-1:hover ~ button {
	transform: rotateX(15deg) rotateY(-15deg) rotateZ(0deg);
	box-shadow: -2px -2px #18181888;
}

.bt-1:hover ~ button::after {
	animation: shake 0.5s ease-in-out 0.3s;
	text-shadow: -2px -2px #18181888;
}

.bt-3:hover ~ button {
	transform: rotateX(15deg) rotateY(15deg) rotateZ(0deg);
	box-shadow: 2px -2px #18181888;
}

.bt-3:hover ~ button::after {
	animation: shake 0.5s ease-in-out 0.3s;
	text-shadow: 2px -2px #18181888;
}

.bt-4:hover ~ button {
	transform: rotateX(-15deg) rotateY(-15deg) rotateZ(0deg);
	box-shadow: -2px 2px #18181888;
}

.bt-4:hover ~ button::after {
	animation: shake 0.5s ease-in-out 0.3s;
	text-shadow: -2px 2px #18181888;
}

.bt-6:hover ~ button {
	transform: rotateX(-15deg) rotateY(15deg) rotateZ(0deg);
	box-shadow: 2px 2px #18181888;
}

.bt-6:hover ~ button::after {
	animation: shake 0.5s ease-in-out 0.3s;
	text-shadow: 2px 2px #18181888;
}

.hover:hover ~ button::before {
	background: transparent;
}

.hover:hover ~ button::after {
	content: "Click⏩";
	top: -150%;
	transform: translate(-50%, 0);
	font-size: 34px;
	color: #f19c2b;
}

button {
	position: absolute;
	padding: 0;
	width: 135px;
	height: 47px;
	background: transparent;
	font-size: 17px;
	font-weight: 900;
	border: 3px solid #f39923;
	border-radius: 12px;
	transition: all 0.3s ease-in-out;
}

button::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 135px;
	height: 47px;
	background-color: #f5ae51;
	border-radius: 12px;
	transition: all 0.3s ease-in-out;
	z-index: -1;
}

button::after {
	content: "开始";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 135px;
	height: 47px;
	background-color: transparent;
	font-size: 17px;
	font-weight: 900;
	line-height: 47px;
	color: #ffffff;
	border: none;
	border-radius: 12px;
	transition: all 0.3s ease-in-out;
	z-index: 2;
}

@keyframes shake {
	0% {
		left: 45%;
	}
	25% {
		left: 54%;
	}
	50% {
		left: 48%;
	}
	75% {
		left: 52%;
	}
	100% {
		left: 50%;
	}
}
</style>
