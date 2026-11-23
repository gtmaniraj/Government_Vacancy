import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as formatBs } from "./bs-DUlc0gqz.mjs";
import { i as ExternalLink, n as Search, r as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as Route, r as refreshBoard } from "./router-CYmSEy5d.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BdzbPSgQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VIEWS = [
	{
		id: "all",
		label: "Everything"
	},
	{
		id: "open",
		label: "Open posts"
	},
	{
		id: "notices",
		label: "Notices"
	}
];
function statusLabel(item) {
	if (item.status === "open") {
		if (item.daysLeft === 0) return "Closes today";
		if (item.daysLeft === 1) return "1 day left";
		if (item.daysLeft != null && item.daysLeft > 0) return `${item.daysLeft} days left`;
		return "Open";
	}
	if (item.status === "double") return "Double fee window";
	if (item.status === "closed") return "Closed";
	if (item.kind === "vacancy") return "Advertisement";
	return "Notice";
}
function statusTone(status, kind) {
	if (status === "open" || status === "double") return "bg-crimson text-card";
	if (status === "closed") return "bg-line text-muted";
	if (kind === "vacancy") return "bg-ink text-card";
	return "bg-line text-ink";
}
function whenFetched(iso) {
	try {
		return new Intl.DateTimeFormat("en-GB", {
			timeZone: "Asia/Kathmandu",
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit"
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}
function VacancyBoard({ initial }) {
	const [board, setBoard] = (0, import_react.useState)(initial);
	const [view, setView] = (0, import_react.useState)("open");
	const [source, setSource] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [refreshError, setRefreshError] = (0, import_react.useState)("");
	const [visible, setVisible] = (0, import_react.useState)(8);
	const counts = (0, import_react.useMemo)(() => {
		const open = board.items.filter((item) => item.status === "open" || item.status === "double");
		const soon = open.filter((item) => item.daysLeft != null && item.daysLeft <= 7);
		const notices = board.items.filter((item) => item.status === "notice");
		return {
			open: open.length,
			soon: soon.length,
			notices: notices.length
		};
	}, [board.items]);
	const shown = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return board.items.filter((item) => {
			if (source !== "all" && item.sourceId !== source) return false;
			if (view === "open" && item.status !== "open" && item.status !== "double") return false;
			if (view === "notices" && item.status !== "notice") return false;
			if (!needle) return true;
			return [
				item.title,
				item.organization,
				item.post,
				item.level,
				item.code,
				item.source
			].filter(Boolean).join(" ").toLowerCase().includes(needle);
		});
	}, [
		board.items,
		query,
		source,
		view
	]);
	const page = shown.slice(0, visible);
	async function onRefresh() {
		setPending(true);
		setRefreshError("");
		try {
			setBoard(await refreshBoard());
		} catch {
			setRefreshError("Could not refresh. Still showing the last copy.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-crimson" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-crimson",
							children: "gautammaniraj.com.np"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl leading-tight",
							children: "Gautam Maniraj"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Government vacancy desk"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["Today ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-ink",
							children: board.todayLabel
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "max-w-3xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl leading-tight",
							children: "Open government posts, read from the offices that publish them."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-2xl text-base leading-relaxed text-muted",
							children: "Lok Sewa advertisements come from psc.gov.np. Teacher notices come from tsc.gov.np. Apply only on the official site linked from each row."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Open or in double fee",
								value: counts.open
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Closing within 7 days",
								value: counts.soon
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Notices and updates",
								value: counts.notices
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8 flex flex-col gap-3",
						id: "board",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									role: "tablist",
									"aria-label": "What to show",
									children: VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "tab",
										"aria-selected": view === item.id,
										onClick: () => {
											setView(item.id);
											setVisible(8);
										},
										className: view === item.id ? "min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-card" : "min-h-11 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink",
										children: item.label
									}, item.id))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: onRefresh,
									disabled: pending,
									className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
										className: pending ? "size-4 animate-spin" : "size-4",
										"aria-hidden": "true"
									}), pending ? "Updating" : "Refresh from source"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "relative min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: "Search posts and notices"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
											className: "pointer-events-none absolute top-3.5 left-3 size-4 text-muted",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: query,
											onChange: (event) => {
												setQuery(event.target.value);
												setVisible(8);
											},
											placeholder: "Search post, office, or advertisement number",
											className: "min-h-11 w-full rounded-2xl border border-line bg-card pr-4 pl-10 text-base text-ink outline-none focus:border-crimson"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "min-h-11 sm:w-64",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sr-only",
										children: "Source"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: source,
										onChange: (event) => {
											setSource(event.target.value);
											setVisible(8);
										},
										className: "min-h-11 w-full rounded-2xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-crimson",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All offices"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "psc",
												children: "Lok Sewa Aayog"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "tsc",
												children: "Teachers Service Commission"
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									shown.length,
									" shown · read ",
									whenFetched(board.fetchedAt),
									" NPT",
									refreshError ? ` · ${refreshError}` : ""
								]
							})
						]
					}),
					board.sources.some((item) => !item.ok) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: board.sources.filter((item) => !item.ok).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-2xl border border-line bg-card px-4 py-3 text-sm text-ink",
							children: [
								item.name,
								" did not respond (",
								item.error,
								"). Other offices are still listed."
							]
						}, item.id))
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-3",
						children: shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-2xl border border-line bg-card px-5 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl",
								children: "Nothing matches"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Try another office, or switch to Everything to see closed posts and notices."
							})]
						}) : page.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { item }, item.id))
					}),
					shown.length > page.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setVisible((count) => count + 8),
						className: "mt-4 min-h-11 w-full rounded-full border border-line bg-card text-sm font-medium text-ink",
						children: [
							"Show more (",
							shown.length - page.length,
							" left)"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mt-12 border-t border-line py-8 text-sm leading-relaxed text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Sources:",
							" ",
							board.sources.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								index > 0 ? " · " : "",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "font-medium text-crimson underline-offset-2 hover:underline",
									href: item.homepage,
									children: item.name
								}),
								" ",
								"(",
								item.ok ? `${item.count} items` : "unavailable",
								")"
							] }, item.id))
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2",
							children: "Deadlines are the Bikram Sambat dates published by Lok Sewa. This desk does not take applications."
						})]
					})
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-card px-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl leading-none",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: label
		})]
	});
}
function Row({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-2xl border border-line bg-card px-4 py-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status, item.kind)}`,
						children: statusLabel(item)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted",
						children: item.source
					}),
					item.level ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: item.level
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-xl leading-snug",
				children: item.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: item.organization
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm",
				children: [
					typeof item.openings === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Openings "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: item.openings
					})] }) : null,
					item.code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Ad no. "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: item.code
					})] }) : null,
					item.deadlineBs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Deadline "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: formatBs(item.deadlineBs)
					})] }) : null,
					item.doubleDeadlineBs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Double fee until "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: formatBs(item.doubleDeadlineBs)
					})] }) : null,
					item.publishedLabel && !item.deadlineBs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Published "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: item.publishedLabel
					})] }) : null,
					typeof item.applications === "number" && item.applications > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "inline text-muted",
						children: "Paid forms "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "inline font-medium",
						children: item.applications
					})] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: item.href,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-crimson px-4 text-sm font-medium text-card",
						children: ["Official notice", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
							className: "size-3.5",
							"aria-hidden": "true"
						})]
					}),
					item.applyUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: item.applyUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium text-ink",
						children: "Apply on PSC portal"
					}) : null,
					item.pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: item.pdfUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium text-ink",
						children: "Download PDF"
					}) : null
				]
			})
		]
	});
}
function Home() {
	const board = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VacancyBoard, { initial: board });
}
//#endregion
export { Home as component };
