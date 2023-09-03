<template>
	<div class="warning custom-block copyright" style="margin-bottom: 50px;" @click="handleClick">
		<p class="custom-block-title">
			<font style="vertical-align: inherit">
				<font style="vertical-align: inherit">版权声明(Creative Commons Attribution 4.0 International License)</font>
			</font>
		</p>
		<p>
			<font style="vertical-align: inherit">
				您可以自由地共享和演绎本(文)作品，但需遵循以下条件：(署名)您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否作出了修改。您可以用任何合理的方式来署名，但不得以任何方式暗示许可人为您或您的使用背书。 </font>
		</p>
	</div>
</template>
<script lang="ts" setup>
function handleClick() {
	window.open('https://creativecommons.org/licenses/by/4.0/legalcode.zh-Hans', "_blank")
}
</script>
<style>
.copyright {
	cursor: pointer;
}</style>
