import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as formatBs, r as todayBsIso, t as daysFromToday } from "./bs-DUlc0gqz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board.functions-BdV1kWkr.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UA = "GautamManirajVacancyDesk/1.0 (+https://gautammaniraj.com.np)";
var TTL_MS = 9e5;
var cache = null;
function vacancyStatus(kind, deadlineBs, doubleDeadlineBs, today) {
	if (kind === "notice" || !deadlineBs) return {
		status: "notice",
		daysLeft: deadlineBs ? daysFromToday(deadlineBs, today) : null
	};
	if (deadlineBs >= today) return {
		status: "open",
		daysLeft: daysFromToday(deadlineBs, today)
	};
	if (doubleDeadlineBs && doubleDeadlineBs >= today) return {
		status: "double",
		daysLeft: daysFromToday(doubleDeadlineBs, today)
	};
	return {
		status: "closed",
		daysLeft: daysFromToday(deadlineBs, today)
	};
}
function kindFromTitle(title) {
	return /विज्ञापन|भर्ना|vacancy|advertisement/i.test(title) ? "vacancy" : "notice";
}
function pscHref(item) {
	const slug = item.new_url ?? "";
	switch (item.urltype) {
		case "1": return `https://psc.gov.np/file/${slug}`;
		case "2": return `https://psc.gov.np/category/advertisement/${slug}`;
		case "3": return `https://psc.gov.np/category/exam_center/${slug}`;
		case "4": return `https://psc.gov.np/category/recommendation/${slug}`;
		case "5": return `https://psc.gov.np/category/written_result/${slug}`;
		default: return "https://psc.gov.np/";
	}
}
async function getText(url) {
	const response = await fetch(url, {
		headers: {
			Accept: "text/html,application/json",
			"User-Agent": UA
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return response.text();
}
async function getJson(url) {
	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest",
			"User-Agent": UA
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return await response.json();
}
function decodeHtml(value) {
	return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&/g, "&").replace(/"/g, "\"").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/\s+/g, " ").trim();
}
async function fetchPscAds(today) {
	const fiscalId = (await getJson("https://psc.gov.np/front/header")).data?.fiscalyear?.[0]?.id;
	if (!fiscalId) throw new Error("Fiscal year missing");
	const pageUrl = (page) => `https://psc.gov.np/front/branch-details/advertisement?branch_id=&fiscal_year_id=${fiscalId}&per_page=50&current_page=${page}`;
	const first = await getJson(pageUrl(0));
	const totalPages = Math.min(first.data?.data?.totalPages ?? 1, 4);
	const rows = [...first.data?.data?.content ?? []];
	if (totalPages > 1) {
		const rest = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) => getJson(pageUrl(index + 1))));
		for (const page of rest) rows.push(...page.data?.data?.content ?? []);
	}
	return rows.map((row, index) => {
		const deadlineBs = row.singlePaymentLastDate || void 0;
		const doubleDeadlineBs = row.doublePaymentLastDate || void 0;
		const title = row.post?.trim() || "Untitled post";
		const timing = vacancyStatus("vacancy", deadlineBs, doubleDeadlineBs, today);
		return {
			id: `psc-ad-${row.advertisementCode ?? index}-${index}`,
			sourceId: "psc",
			source: "Lok Sewa Aayog",
			title,
			organization: row.organizationName?.trim() || "Public Service Commission",
			post: title,
			level: row.className?.trim() || void 0,
			openings: typeof row.totalOpenings === "number" ? row.totalOpenings : void 0,
			code: row.advertisementCode?.trim() || void 0,
			applications: typeof row.paidApplications === "number" ? row.paidApplications : void 0,
			deadlineBs,
			doubleDeadlineBs,
			href: "https://psc.gov.np/category/advertisement/all",
			applyUrl: "https://psconline1.psc.gov.np",
			kind: "vacancy",
			status: timing.status,
			daysLeft: timing.daysLeft
		};
	});
}
async function fetchPscHighlights(today) {
	return ((await getJson("https://psc.gov.np/front/highlight")).data?.highlights ?? []).filter((item) => item.title_np || item.title).map((item, index) => {
		const title = (item.title_np || item.title || "Notice").trim();
		const kind = kindFromTitle(title);
		const timing = vacancyStatus(kind, void 0, void 0, today);
		return {
			id: `psc-hl-${item.new_url ?? index}`,
			sourceId: "psc",
			source: "Lok Sewa Aayog",
			title,
			organization: "Public Service Commission",
			publishedLabel: item.udate || void 0,
			href: pscHref(item),
			kind,
			status: timing.status,
			daysLeft: timing.daysLeft
		};
	});
}
function parseTscHtml(html) {
	const dated = /* @__PURE__ */ new Map();
	for (const match of html.matchAll(/<h3 class="card__title">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]{0,240}?<div class="date">([^<]+)<\/div>/g)) {
		const href = match[1].trim();
		const label = decodeHtml(match[3]);
		if (href && label) dated.set(href, label);
	}
	const cards = [];
	const seen = /* @__PURE__ */ new Set();
	const chunks = html.split("class=\"grid__card");
	for (const chunk of chunks) {
		const link = chunk.match(/<a href="([^"]+)" class="card__group">/);
		const titleMatch = chunk.match(/<h3 class="card__title"><span>([\s\S]*?)<\/span><\/h3>/);
		if (!link || !titleMatch) continue;
		const path = link[1].trim();
		if (!path.startsWith("/content/")) continue;
		const title = decodeHtml(titleMatch[1]);
		if (!title || seen.has(path)) continue;
		seen.add(path);
		const pdf = chunk.match(/href="(https:\/\/giwmscdnone\.gov\.np\/media\/[^"]+)"/);
		const label = dated.get(path);
		const kind = kindFromTitle(title);
		cards.push({
			id: `tsc-${path}`,
			sourceId: "tsc",
			source: "Teachers Service Commission",
			title,
			organization: "शिक्षक सेवा आयोग",
			publishedLabel: label || void 0,
			href: `https://tsc.gov.np${path}`,
			pdfUrl: pdf?.[1],
			kind,
			status: "notice",
			daysLeft: null
		});
	}
	for (const [path, label] of dated) {
		if (seen.has(path) || !path.startsWith("/content/")) continue;
		const titleMatch = html.match(new RegExp(`<a href="${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)<\\/a>`));
		const title = titleMatch ? decodeHtml(titleMatch[1]) : "Notice";
		const kind = kindFromTitle(title);
		cards.push({
			id: `tsc-${path}`,
			sourceId: "tsc",
			source: "Teachers Service Commission",
			title,
			organization: "शिक्षक सेवा आयोग",
			publishedLabel: label,
			href: path.startsWith("http") ? path : `https://tsc.gov.np${path}`,
			kind,
			status: "notice",
			daysLeft: null
		});
	}
	return cards;
}
async function fetchTsc() {
	const items = parseTscHtml(await getText("https://tsc.gov.np/"));
	if (items.length === 0) throw new Error("No notices found");
	return items;
}
function rank(item) {
	if (item.kind === "vacancy" && item.status === "open") return 0;
	if (item.kind === "vacancy" && item.status === "double") return 1;
	if (item.kind === "notice") return 2;
	return 3;
}
function sortItems(items) {
	return [...items].sort((a, b) => {
		const byRank = rank(a) - rank(b);
		if (byRank !== 0) return byRank;
		if (a.status === "open" || a.status === "double") return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
		const aDate = a.publishedLabel ?? a.deadlineBs ?? "";
		return (b.publishedLabel ?? b.deadlineBs ?? "").localeCompare(aDate);
	});
}
async function attempt(id, name, homepage, run) {
	try {
		const items = await run();
		return {
			health: {
				id,
				name,
				homepage,
				ok: true,
				count: items.length
			},
			items
		};
	} catch (error) {
		return {
			health: {
				id,
				name,
				homepage,
				ok: false,
				count: 0,
				error: error instanceof Error ? error.message : "Could not reach the site"
			},
			items: []
		};
	}
}
async function loadBoard(fresh) {
	if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
	const todayBs = todayBsIso();
	const [pscAds, pscNotes, tsc] = await Promise.all([
		attempt("psc", "Lok Sewa Aayog", "https://psc.gov.np", () => fetchPscAds(todayBs)),
		attempt("psc", "Lok Sewa Aayog", "https://psc.gov.np", () => fetchPscHighlights(todayBs)),
		attempt("tsc", "Teachers Service Commission", "https://tsc.gov.np", () => fetchTsc())
	]);
	const pscCount = pscAds.health.count + pscNotes.health.count;
	const pscOk = pscAds.health.ok || pscNotes.health.ok;
	const pscError = [pscAds.health.error, pscNotes.health.error].filter(Boolean).join("; ");
	const sources = [{
		id: "psc",
		name: "Lok Sewa Aayog",
		homepage: "https://psc.gov.np",
		ok: pscOk,
		count: pscCount,
		error: pscOk ? void 0 : pscError || "Could not reach psc.gov.np"
	}, tsc.health];
	const board = {
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		todayBs,
		todayLabel: formatBs(todayBs),
		sources,
		items: sortItems([
			...pscAds.items,
			...pscNotes.items,
			...tsc.items
		])
	};
	if (sources.some((source) => source.ok)) cache = {
		at: Date.now(),
		data: board
	};
	return board;
}
var getBoard_createServerFn_handler = createServerRpc({
	id: "76df0fc2e0cf7ed3817c2bebeea3b8730d5dc2c2f8f0b55367230f07128e65a6",
	name: "getBoard",
	filename: "src/lib/board.functions.ts"
}, (opts) => getBoard.__executeServer(opts));
var getBoard = createServerFn({ method: "GET" }).handler(getBoard_createServerFn_handler, async () => loadBoard(false));
var refreshBoard_createServerFn_handler = createServerRpc({
	id: "0de2eca7c67ff6190d8678bc0e68b238bc2589bc28ae30de5960c27899af08f4",
	name: "refreshBoard",
	filename: "src/lib/board.functions.ts"
}, (opts) => refreshBoard.__executeServer(opts));
var refreshBoard = createServerFn({ method: "POST" }).handler(refreshBoard_createServerFn_handler, async () => loadBoard(true));
//#endregion
export { getBoard_createServerFn_handler, refreshBoard_createServerFn_handler };
