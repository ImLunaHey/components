# Repository instructions

## Commits and pull requests

- Every commit and PR title MUST use Conventional Commits: `type(scope): summary`
  or `type: summary`. Examples: `feat(select): add searchable options`,
  `fix(upload): release preview URLs`, `docs: clarify package installation`.
- Use an appropriate type such as `feat`, `fix`, `refactor`, `test`, `docs`,
  `build`, `ci`, `perf`, `style`, `revert`, or `chore`. Mark breaking changes with
  `!` and explain them in a `BREAKING CHANGE:` footer.
- Work on `luna/*` branches and deliver through PRs. Never push project changes
  directly to `main` or merge without the user's explicit instruction.
- Complete `.github/pull_request_template.md` with actual validation results.

## Components and apps

- Use pnpm and Turborepo. Apps live in `apps/*`; the reusable component package
  lives in `packages/components`.
- Use Oxlint and Oxfmt. Do not introduce ESLint.
- Native controls belong in `packages/components/src`; apps must use shared
  component APIs or template references. Never move app logic into that directory
  merely to bypass lint rules.
- Preserve the established visual design. Do not introduce a third-party UI kit.
- Use explicit package subpath exports; do not create handwritten barrel files.
- Edit authored templates and source, not generated `design/*.html`, bundled JS,
  or app/package `dist` output.
- The lint package is maintained in the separate `ImLunaHey/oxlint-config` repo.
  Update its versioned bootstrap archive as a dependency; do not fork rules here.

## Validation

Run `pnpm format:check` and `pnpm check` before delivery. The latter includes
Oxlint, HTML boundary checks, TypeScript declaration checks, Turbo builds,
interaction tests, package installation tests, and HTTP smoke tests for all demos.
Report any checks that could not run. For UI changes, verify both themes,
responsive layouts, keyboard behavior and accessibility; include before/after
screenshots in the PR.
