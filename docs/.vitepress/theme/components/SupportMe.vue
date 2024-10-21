<template>
	<t-card :style="{ maxWidth: '520px', margin: 'auto', marginTop: '20px' }">
		<h3 align="center" style="border: 0">Support Me</h3>
		<div class="card-container">
			<t-card theme="poster2" :style="{ width: '200px' }">
				<template #cover>
					<img :src="weiXinPayUrl" alt="" />
				</template>
				<template #footer>
					<div align="center">
						{{ isEN ? "WeChat Pay" : "微信支付" }}
					</div></template
				>
			</t-card>
			<t-card theme="poster2" :style="{ width: '200px' }">
				<template #cover>
					<img :src="zhiFuBaoPayUrl" alt="" />
				</template>
				<template #footer>
					<div align="center">{{ isEN ? "Alipay" : "支付宝支付" }}</div>
				</template>
			</t-card>
		</div>
		<t-button theme="primary" block @click="handleClickKoFi">{{
			isEN ? "Buy Me a Coffee" : "给我买一杯咖啡"
		}}</t-button>
		<t-button
			href="mailto:just@justin3go.com"
			theme="primary"
			class="mt-10"
			block
			variant="dashed"
			>{{ isEN ? "Any Positive Feedback" : "任何正向的反馈" }}</t-button
		>
	</t-card>
	<div class="support-me hollow-text">Support Me</div>
	<div class="my-name hollow-text">I'm Justin3go</div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
const isEN = computed(() => route.path.startsWith("/en"));

const weiXinPayUrl = "https://oss.justin3go.com/blogs/justin3go_weixin_pay.jpg";
const zhiFuBaoPayUrl =
	"https://oss.justin3go.com/blogs/justin3go_zhifubao_pay.jpg";
const koFiUrl = "https://ko-fi.com/V7V6YU3UT";

const handleClickKoFi = () => {
	window.open(koFiUrl, "_blank");
};
</script>
<style lang="scss" scoped>
.card-container {
	display: flex;
	justify-content: space-between;
	margin: 25px 0 20px;
}

.support-me {
	position: fixed;
	margin: 0 auto;
	left: 0;
	right: 0;
	top: 100px;
	width: 725.05px;

	z-index: -1;
	opacity: 0.12;
	font-size: 120px;
	font-weight: 900;
}

.my-name {
	position: fixed;
	margin: 0 auto;
	left: 0;
	right: 0;
	bottom: 30px;
	width: 828.36px;

	z-index: -1;
	opacity: 0.12;
	font-size: 120px;
	font-weight: 900;
}

.mt-10 {
	margin-top: 10px;
}

.hollow-text {
	/* 设置文本颜色为透明 */
	color: var(--vp-c-bg);

	-webkit-text-stroke: 1px var(--vp-c-text-1);
}
</style>
