# vitepress中引入tdesign并全局增加大图预览

## 前言

最近遇到一个以前处理过的问题，自己在看自己以前的文章的时候，欸？发现其中图片不能点击预览，当时是右击在新建标签页中查看的，于是就来给自己的博客增加一个大图预览的功能吧，像这样：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230928172100.png)

## 引入大图预览组件

这里根据自己的习惯随便选择一个常用的UI组件库就可以，比如element-plus，笔者这里选用的是[tdesign](https://tdesign.tencent.com/vue-next/components/table)，基本上根据其[官方安装文档](https://tdesign.tencent.com/vue-next/getting-started#%E9%80%9A%E8%BF%87%E6%8F%92%E4%BB%B6%E6%8C%89%E9%9C%80%E5%BC%95%E7%94%A8%E4%BD%BF%E7%94%A8)进入配置就可以了，值得注意的是：

vitepress的vite配置是在config.ts中进行配置，你可以参考[这个vitepress文档链接](https://vitepress.dev/reference/site-config#vite)，笔者的配置代码在[这里](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/config.ts#L113)

## tdesign结合vitepress进行深色/浅色模式切换

[tdesign中](https://tdesign.tencent.com/vue-next/dark-mode)要求如下:

```ts
// 设置暗色模式
document.documentElement.setAttribute('theme-mode', 'dark');
// 重置为浅色模式
document.documentElement.removeAttribute('theme-mode');
```

基本思路如下：

1. 监听vitepress暴露出的`isDark`响应式变量
2. 当`isDark`变化为`true`时，通过上述代码设置为暗色模式
3. 当`isDark`变化为`false`时，通过上述代码重置为浅色模式

[点击查看代码位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/tdesignDark.vue)

```html
<template></template>
<script setup lang="ts">
import { useData } from "vitepress";
import { watch } from "vue";

const { isDark } = useData();

// tdesign暗色切换 https://tdesign.tencent.com/vue-next/dark-mode
watch(
	isDark,
	() => {
    if(isDark.value) {
      document.documentElement.setAttribute('theme-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('theme-mode');
    }
	},
	{
		immediate: true,
	}
);

</script>
```

然后你在哪里使用了tdesign的组件，就在哪里导入这个组件并放置在[任意位置](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/imageViewer.vue#L6)就可以了

## 结合vitepress为所有图片绑定该组件

这里的基本思路如下：

1. 找到页面中的所有图片
2. 监听对于图片的点击事件
3. 为该点击事件绑定图片预览效果

代码如下，[具体位置点击查看](https://github.com/Justin3go/justin3go.github.io/blob/master/docs/.vitepress/theme/components/imageViewer.vue)，这部分代码参考这个[链接的写法](https://github.com/ATQQ/sugar-blog/blob/master/packages/theme/src/components/BlogImagePreview.vue)，如果你是使用的element-plus，可以直接复制该链接的代码

```ts
<template>
  <div class="image-viewer">
    <t-image-viewer v-model:visible="show" :images="previewImageInfo.list" :default-index="previewImageInfo.idx"
      :key="previewImageInfo.idx" @close="show = false">
    </t-image-viewer>
    <tdesign-dark></tdesign-dark>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import tdesignDark from './tdesignDark.vue';

const show = ref(false)
const previewImageInfo = reactive<{ url: string; list: string[]; idx: number }>(
  {
    url: '',
    list: [],
    idx: 0
  }
)
function previewImage(e: Event) {
  const target = e.target as HTMLElement
  const currentTarget = e.currentTarget as HTMLElement
  if (target.tagName.toLowerCase() === 'img') {
    const imgs = currentTarget.querySelectorAll<HTMLImageElement>(
      '.content-container .main img'
    )
    const idx = Array.from(imgs).findIndex(el => el === target)
    const urls = Array.from(imgs).map(el => el.src)

    const url = target.getAttribute('src')
    previewImageInfo.url = url!
    previewImageInfo.list = urls
    previewImageInfo.idx = idx

    // 兼容点击main之外的图片
    if (idx === -1 && url) {
      previewImageInfo.list.push(url)
      previewImageInfo.idx = previewImageInfo.list.length - 1
    }
    show.value = true
  }
}
onMounted(() => {
  const docDomContainer = document.querySelector('#VPContent')
  docDomContainer?.addEventListener('click', previewImage)
})

onUnmounted(() => {
  const docDomContainer = document.querySelector('#VPContent')
  docDomContainer?.removeEventListener('click', previewImage)
})
</script>
<style>
/* 不提供下载功能，隐藏下载按钮，tdesign下载有问题 */
.t-image-viewer__modal-icon:nth-child(7) {
  display: none !important;
}
</style>

```

## 最后

一入博客深似海啊，不由自主地就想折腾一下
