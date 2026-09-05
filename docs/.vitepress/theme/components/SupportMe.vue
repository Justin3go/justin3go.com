<template>
  <section class="support-panel" aria-labelledby="support-title">
    <header class="support-heading">
      <span class="support-eyebrow">THANK YOU FOR YOUR SUPPORT</span>
      <h1 id="support-title">{{ isEN ? 'Support my work' : '支持我的创作' }}</h1>
    </header>

    <div class="payment-options">
      <figure class="payment-option">
        <div class="payment-code">
          <img :src="weiXinPayUrl" :alt="isEN ? 'WeChat Pay QR code' : '微信收款码'" width="200" height="200" />
        </div>
        <figcaption>{{ isEN ? 'WeChat Pay' : '微信支付' }}</figcaption>
      </figure>
      <figure class="payment-option">
        <div class="payment-code">
          <img :src="zhiFuBaoPayUrl" :alt="isEN ? 'Alipay QR code' : '支付宝收款码'" width="200" height="200" />
        </div>
        <figcaption>{{ isEN ? 'Alipay' : '支付宝' }}</figcaption>
      </figure>
    </div>

    <div class="support-actions">
      <a :href="koFiUrl" target="_blank" rel="noopener noreferrer">
        {{ isEN ? 'Buy me a coffee' : '请我喝杯咖啡' }}
      </a>
      <a href="mailto:just@justin3go.com">
        {{ isEN ? 'Send some kind words' : '给我一些鼓励' }}
      </a>
    </div>
  </section>
  <div class="support-me hollow-text source-han-serif" aria-hidden="true">Support Me</div>
  <div class="my-name hollow-text source-han-serif" aria-hidden="true">I'm Justin3go</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vitepress';

const route = useRoute();
const isEN = computed(() => route.path.startsWith('/en/'));
const weiXinPayUrl = 'https://oss.justin3go.com/blogs/justin3go_weixin_pay.jpg';
const zhiFuBaoPayUrl = 'https://oss.justin3go.com/blogs/justin3go_zhifubao_pay.jpg';
const koFiUrl = 'https://ko-fi.com/V7V6YU3UT';
</script>

<style scoped>
.support-panel {
  max-width: 560px;
  margin: 20px auto 28px;
  padding: 36px 32px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
.support-heading { text-align: center; }
.support-eyebrow {
  color: var(--vp-c-text-3);
  font: 10px / 1.6 var(--vp-font-family-mono);
  letter-spacing: .12em;
}
.support-heading h1 {
  margin: 10px 0 0;
  font-size: 26px;
  line-height: 1.4;
  letter-spacing: -.02em;
}
.payment-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  margin: 30px 0;
}
.payment-option { min-width: 0; margin: 0; text-align: center; }
.payment-code {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  padding: 10px;
  border-radius: 8px;
  background: #fff;
}
.payment-code img { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: contain; }
.payment-option figcaption { margin-top: 12px; font-size: 13px; color: var(--vp-c-text-2); }
.support-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 28px;
  padding-top: 18px;
  border-top: 1px solid var(--vp-c-divider);
}
.support-actions a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.support-actions a:hover { color: var(--vp-c-brand-1); text-decoration: underline; text-underline-offset: 4px; }
.support-actions a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; border-radius: 2px; }
@media (max-width: 480px) {
  .support-panel { margin-top: 8px; padding: 28px 18px 20px; }
  .support-heading h1 { font-size: 24px; }
  .payment-options { gap: 12px; margin: 24px 0; }
  .payment-code { padding: 6px; }
  .support-actions { gap: 8px 20px; }
}
@media (max-width: 359px) {
  .payment-options { grid-template-columns: minmax(0, 200px); justify-content: center; gap: 22px; }
}
.support-me {
	position: fixed;
	margin: 0 auto;
	left: 0;
	right: 0;
	top: 100px;
	width: 680px;

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
	width: 770px;

	z-index: -1;
	opacity: 0.12;
	font-size: 120px;
	font-weight: 900;
}
.hollow-text {
	/* 设置文本颜色为透明 */
	color: var(--vp-c-bg);

	-webkit-text-stroke: 1px var(--vp-c-text-1);
}
</style>
