<template>
	<Giscus
		id="comments"
		term="Welcome to @giscus/vue component!"
		:repo="gitcusConfig.repo"
		:repoId="gitcusConfig.repoId"
		:category="gitcusConfig.category"
		:categoryId="gitcusConfig.categoryId"
		:mapping="gitcusConfig.mapping"
		:reactionsEnabled="gitcusConfig.reactionsEnabled"
		:emitMetadata="gitcusConfig.emitMetadata"
		:inputPosition="gitcusConfig.inputPosition"
		:theme="gitcusConfig.theme"
		:lang="gitcusConfig.lang"
		:loading="gitcusConfig.loading"
	/>
</template>
<script lang="ts" setup>
import Giscus, { BooleanString, InputPosition, Loading, Mapping, Repo, Theme } from "@giscus/vue";
import { reactive } from "vue";

interface IGitcusConfig {
	repo: Repo;
	repoId: string;
	category?: string | undefined;
	categoryId?: string | undefined;
	mapping: Mapping;
	reactionsEnabled: BooleanString | undefined;
	emitMetadata: BooleanString | undefined;
	inputPosition: InputPosition | undefined;
	theme?: Theme | undefined;
	lang: "zh-CN";
	loading: Loading | undefined;
}

// params generate in https://giscus.app/zh-CN
const gitcusConfig: IGitcusConfig = reactive({
	repo: "justin3go/justin3go.github.io",
	repoId: "R_kgDOJq6kjw",
	category: "Announcements",
	categoryId: "DIC_kwDOJq6kj84CW7-L",
	mapping: "title",
	reactionsEnabled: "1",
	emitMetadata: "0",
	inputPosition: "top",
	theme: "light",
	lang: "zh-CN",
	loading: "eager",
});
</script>
