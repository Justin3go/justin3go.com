import { createSidebar, MY_TAB } from "./createSidebar";

export interface IPost {
  text: string;
  link: string;
}

export function getRecentlyPost(tab: MY_TAB = MY_TAB.BLOG, recentlyPostNumber = 12) {
	const allSideBar = createSidebar();
	const curSideBar = allSideBar[tab];

	// 遍历找到所有items，如果items中没有包含子items，则将其text,link加入，达到5个就跳出循环
  const posts: IPost[] = []
	function findItems(items: typeof curSideBar){
    if(posts.length >= recentlyPostNumber) return;
    for(const item of items) {
      if(item["items"]) {
        findItems(item["items"])
      } else {
        posts.push({
          text: item.text,
          link: item.link,
        })
      }
      if(posts.length >= recentlyPostNumber) return;
    }
  }
  findItems(curSideBar);
  // 由于文章本来就是按顺序排列的，所以直接返回
  return posts;
}
