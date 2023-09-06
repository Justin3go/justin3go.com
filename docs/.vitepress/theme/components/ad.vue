<template>
    <div id="google-ads">
        <ins class="adsbygoogle" style="display:inline-block;width:200px;height:200px"
            data-ad-client="ca-pub-9529899862680155" data-ad-slot="9677859750"></ins>
    </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from 'vue';

onMounted(() => {
    nextTick(() => {
        const script = document.createElement('script');
        script.innerHTML = `(adsbygoogle = window.adsbygoogle || []).push({});`
        document.getElementById('google-ads')?.appendChild(script)
    })
})
</script>
<style scoped>
#google-ads {
    padding: 12px;
    border-left: 1px solid var(--vp-c-divider);
}
</style>
