<template>
  <div class="doc-footer-before">
    <div class="share-container">
      <share />
    </div>
    <copyright />
    <t-back-top size="small" style="position: fixed; right: 20px; bottom: 40px"></t-back-top>
  </div>
</template>
<script setup lang="ts">
import copyright from "./copyright.vue"
import share from "./share.vue"
</script>
<style scoped>
.share-container {
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
}

/* 仅在侧边栏不显示时显示这部分 */
@media (min-width: 1280px) {
  .share-container {
    display: none;
  }
}
</style>
