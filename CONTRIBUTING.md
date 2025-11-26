# Contributing to Hive MCP

Thanks for helping improve the Hive MCP server. This project now runs on the modern `@hiveio/wax` client and a consolidated set of ~22 action-based tools, so contributions should follow the current architecture and naming.

## Quick Start

1. Fork and clone your copy of the repo.
2. Install dependencies: `npm ci`
3. Build once before running the inspector: `npm run build`
4. Exercise your changes with the MCP Inspector: `npm run inspector`
5. Run tests: `npm test` (or a focused target like `npm run test:account`)
6. Open a PR from a feature branch with a clear description of the behavior change.

## Development Guidelines

- **TypeScript + WAX first**: All blockchain interactions should go through `@hiveio/wax` helpers in `src/utils/api.ts` / `src/utils/hive-engine-api.ts`. Avoid reintroducing legacy `dhive` patterns.
- **Consolidated tools**: Prefer adding actions to existing consolidated tools before creating new standalone ones, and update the corresponding Zod schemas in `src/schemas`.
- **Validation & errors**: Every tool input is validated with Zod; use `adaptHandler` helpers and return friendly, actionable error messages.
- **Docs & naming**: Keep tool/action names consistent with `src/tools/index.ts` and update docs (e.g., `docs/TOOLS.md`, `README.md`) when behavior changes.
- **Security**: Never commit keys. Authenticated flows rely on `HIVE_POSTING_KEY`/`HIVE_ACTIVE_KEY` environment variables; validate keys with the provided helpers.

## Pull Requests

- Keep scope tight and explain user-facing impact.
- Note any new env vars or required config.
- Include tests or manual steps that verify the change (inspector commands are fine).
- Follow Conventional Commit styling for commit messages when possible (e.g., `feat: add vote weight validation`).

## License

By contributing, you agree your contributions are licensed under the ISC license.
