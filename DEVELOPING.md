# Developing

Cards are generated from the GitHub GraphQL API and styled with the portfolio design tokens (`src/theme.ts`).

```bash
npm install
npm test                       # unit tests
npm run preview                # sample cards from tests/fixtures.ts into preview/
GH_TOKEN=$(gh auth token) npm run generate   # real cards into profile-output/
```

## Setup in the profile repo

1. Create a public repo named exactly like the username (`reginaldooo/reginaldooo`) and push this project.
2. Add a repo secret `GH_STATS_TOKEN`: a classic personal access token with `read:user` and `repo` scopes. It is only used to read counts; no repo names are written to the output.
3. Turn on **Include private contributions on my profile** (profile, contribution graph, Contribution settings). Without it GitHub's API hides private commits.
4. Run the `Update profile cards` workflow once (Actions, Run workflow). It then refreshes daily.

## Notes

- Fonts are inlined as base64 in each SVG because GitHub renders README images without loading external fonts.
- Productive time samples the latest 100 commits in each of the 20 busiest repos.
- Longest streak is measured inside the 12-month window the API allows.
