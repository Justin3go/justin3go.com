<template></template>
<script setup lang="ts">
import { useRouter, useRoute } from "vitepress";

import { createSideBar} from "../utils/createSideBar";

const router = useRouter();
const route = useRoute();

const { path } = route;
const sideBar =  createSideBar();
const firstItemLink = sideBar['/笔记/'][0].items[0].link;

router.go(firstItemLink);
</script>
<style scoped></style>
