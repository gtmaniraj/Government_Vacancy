import { t as NepaliDate } from "../_libs/nepali-date-converter.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bs-DUlc0gqz.js
function todayInNepal() {
	const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Kathmandu",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date()).split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day, 6, 15));
}
function todayBsIso() {
	return new NepaliDate(todayInNepal()).format("YYYY-MM-DD");
}
function formatBs(iso) {
	try {
		return new NepaliDate(iso).format("DD MMMM YYYY");
	} catch {
		return iso;
	}
}
function daysFromToday(iso, todayIso) {
	try {
		const from = new NepaliDate(todayIso).toJsDate().getTime();
		const to = new NepaliDate(iso).toJsDate().getTime();
		return Math.round((to - from) / 864e5);
	} catch {
		return null;
	}
}
//#endregion
export { formatBs as n, todayBsIso as r, daysFromToday as t };
