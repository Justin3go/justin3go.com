<template></template>
<script setup lang="ts">
import { useRouter, useRoute } from "vitepress";

import { createSideBarZH, createSideBarEN } from "../utils/createSideBar";

const router = useRouter();
const route = useRoute();

const { path } = route;
const sideBar = path.startsWith('/en/') ? createSideBarEN() : createSideBarZH();

const prefix = path.startsWith('/en/') ? '/en/notes/' : '/notes/';
const firstItemLink = sideBar[prefix][0].items[0].link;

router.go(firstItemLink);
</script>
<style scoped></style>
