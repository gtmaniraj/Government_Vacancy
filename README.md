# Gautam Maniraj — Government vacancy desk

One page of open posts and notices from Lok Sewa Aayog, the Teachers Service Commission, Nepal’s A-class commercial banks, Nepal Telecom, and Nepal Electricity Authority.

The site does not take applications. Every row links to the office that published the notice. Apply only on that official site.

Live address after GitHub Pages is turned on: [https://gtmaniraj.github.io/Government_Vacancy/](https://gtmaniraj.github.io/Government_Vacancy/)

## Deploy on GitHub Pages

GitHub Pages can only serve files. It cannot run the live Lok Sewa and Teachers Commission fetch, so the workflow builds a static copy and saves the board into that copy.

The workflow is [`.github/workflows/static.yml`](.github/workflows/static.yml). It runs on every push to `main`, every day at 01:15 UTC (7:00am Nepal time), and whenever you start it by hand from the Actions tab.

### 1. Put this project on GitHub

1. Create a repository named `Government_Vacancy` under the account `gtmaniraj` (or use the repository you already have).
2. Push this folder to the `main` branch.
3. Do not commit `node_modules/` or the `pages/` folder. Both are already in [`.gitignore`](.gitignore). GitHub Actions builds `pages/` itself.

### 2. Turn Pages on

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Leave the old “Deploy from a branch” option off. This site is not a plain HTML folder in the repo; the action has to build it.

### 3. Publish

1. Open the **Actions** tab.
2. Choose **Deploy to GitHub Pages**.
3. If it has not started, click **Run workflow** on `main`.

When the **deploy** job is green, the site is at:

`https://<your-user>.github.io/Government_Vacancy/`

For this repository that is [https://gtmaniraj.github.io/Government_Vacancy/](https://gtmaniraj.github.io/Government_Vacancy/).

The first run installs dependencies, reads Lok Sewa and the Teachers Commission, saves `src/data/board.snapshot.json` and `public/board.json`, builds the static site, and uploads the `pages/` folder. Later runs do the same, so deadlines move forward without a manual edit.

### 4. Custom domain

The default build expects the project address above. Styles and scripts start with `/Government_Vacancy/`.

If you attach a custom domain such as `gautammaniraj.com.np`, Pages serves the site from `/`, not from the repository name. Do both of these, then run the workflow again:

1. In the repository, open **Settings → Secrets and variables → Actions → Variables**.
2. Add a variable named `PAGES_BASE` with the value `/`.
3. In **Settings → Pages → Custom domain**, enter the domain and wait until the DNS check is green.

Do not set `PAGES_BASE` while the site still lives at `github.io/Government_Vacancy`. The page would load with no styles.

To go back to the project address, delete the `PAGES_BASE` variable and run the workflow again.

## Using the website

Dates on the deadline line are Bikram Sambat, the same calendar the notices use. “Today” in the header is Nepal time.

1. Open the site. The first tab is **Open posts**: advertisements whose regular deadline, or double-fee deadline, is still ahead.
2. **Notices** is updates plus each A-class bank’s career page. **Everything** also includes posts that have already closed.
3. Use the office menu to keep one source: Lok Sewa Aayog, Teachers Service Commission, A-class banks, Nepal Telecom, or Nepal Electricity Authority.
4. Search by post, office, or advertisement number.
5. **Official notice** opens the publisher’s page.
6. **Apply on official site** appears only when that notice has an application form. It never submits anything on this site.
7. **Download PDF** appears when the Teachers Commission page linked a file.
8. **Show more** loads the next rows. Eight are shown at a time.

On a copy that can reach the offices (local `npm run dev`, or the Vercel server), **Refresh from source** reads Lok Sewa and the Teachers Commission again. On GitHub Pages the same button says **Saved at build**. That copy was frozen when Actions last succeeded. It updates on the next daily run or the next push to `main`.

A red note under the filters means one office did not answer. The other offices stay listed.

### What is listed

Checked 8 Mangsir 2083 (24 November 2026). Open the site for the current deadlines; this table is the hand-kept list, not a live feed.

| Office | What you will see |
| --- | --- |
| Nepal Telecom | Notice 06/2083-84. 14 advertisements, 80 posts. Regular fee ended 4 Mangsir 2083. Double fee runs until 10 Mangsir 2083. Apply at [recruit.ntc.net.np](https://recruit.ntc.net.np/). |
| Nepal Electricity Authority | Open competition for permanent officer and assistant posts. Regular deadline 10 Mangsir 2083, double fee until 17 Mangsir 2083. Apply at [career.nea.org.np](https://career.nea.org.np/). Seat totals disagree across reposts, so the row does not invent one. Internal promotion is a notice for current staff only. |
| A-class banks | Customer Relationship Officer (Junior Officer), deadline 16 Mangsir 2083 (2 December 2026, 17:00). The notice does not name the bank. Apply on the [NBI vacancy page](https://vacancy.nbi.com.np/jobs/customer-relationship-officer-junior-officer-level). Each of the 20 class-A banks also has a career-page row under Notices. |
| Lok Sewa and the Teachers Service Commission | Read from psc.gov.np and tsc.gov.np when the build can reach them. The Pages copy uses whatever those sites returned at the last successful build. |

## Add or correct a vacancy

Lok Sewa and the Teachers Commission do not need a hand-written row. They are fetched in [`src/lib/board.functions.ts`](src/lib/board.functions.ts).

Nepal Telecom, NEA, and the banks are typed in [`src/data/openings.ts`](src/data/openings.ts).

- A real advertisement is `kind: "vacancy"`. Set `deadlineBs` to `YYYY-MM-DD` in Bikram Sambat. Add `doubleDeadlineBs` when the notice allows a late fee.
- A career page, or an update that is not an open application, is `kind: "notice"`.
- `sourceId` is `"banks"`, `"ntc"`, or `"nea"`.
- `href` is the official notice. `applyUrl` is the form, and only when there is one.
- Do not type a seat count unless it is printed on one notice and you are copying that figure.

After editing, push to `main`. Actions rebuilds and publishes. To check the board without publishing, run `npm run board`. That rewrites `src/data/board.snapshot.json` and `public/board.json`.

## Run it on your computer

```bash
npm install
npm run dev
```

The dev server uses the live Lok Sewa and Teachers Commission feeds plus the notices in `src/data/openings.ts`. **Refresh from source** works here. It does not work on the GitHub Pages copy.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local site with live Lok Sewa and TSC. |
| `npm run board` | Save a board snapshot without building the site. |
| `npm run build` | Production build used by the Vercel deploy. |
| `npm run build:pages` | Static build for GitHub Pages. Output is the `pages/` folder. This is what Actions runs. |

`build:pages` sets `GITHUB_PAGES=true` and `VITE_STATIC_BOARD=true`, then [`scripts/finalize-pages.mjs`](scripts/finalize-pages.mjs) copies the built `index.html` to `404.html` and writes `.nojekyll` so GitHub does not drop files that start with an underscore.

## If the published site looks wrong

| What you see | What to change |
| --- | --- |
| Page with no styles, or a blank screen | The base path does not match the address. For `github.io/Government_Vacancy` leave `PAGES_BASE` unset. For a custom domain set `PAGES_BASE` to `/`, then rerun the workflow. |
| Actions never starts | **Settings → Pages → Source** must be **GitHub Actions**, and the workflow file must be on `main`. |
| Deploy job fails on permissions | The workflow already asks for `pages: write` and `id-token: write`. In **Settings → Actions → General**, allow GitHub Actions to create and approve pull requests is not required; Pages just needs the Actions source selected once. |
| **Saved at build** and an old deadline | Open Actions and run **Deploy to GitHub Pages**, or wait for the 7:00am Nepal run. Editing the site in the browser does not update GitHub Pages. |
| One office says it did not respond | That office was down at build time. Other rows are still valid. Run the workflow again later. |
