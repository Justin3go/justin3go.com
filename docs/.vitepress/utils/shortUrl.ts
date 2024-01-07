import { MY_TAB, createSidebar } from "./createSidebar";
import md5 from "blueimp-md5";

export interface IShortUrlMap {
	[key: string]: string;
}

export function createShortUrlMap() {
	const allSideBar = createSidebar();
	const tabs = Object.keys(allSideBar) as MY_TAB[];
	const long2short: IShortUrlMap = {};
	const short2long: IShortUrlMap = {};
	function findItems(items: (typeof allSideBar)[MY_TAB.BLOG]) {
		for (const item of items) {
			if (item["items"]) {
				findItems(item["items"]);
			} else {
				const link = item.link;
				if(!link) continue;
				const shortUrl = md5(link).slice(0, 11);
				long2short[link] = shortUrl;
				short2long[shortUrl] = link;
			}
		}
	}
	tabs.forEach((tab) => {
		findItems(allSideBar[tab]);
	});

	return [long2short, short2long];
}

export const [long2short, short2long] = createShortUrlMap();
