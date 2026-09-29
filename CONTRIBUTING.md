# Contributing

Thanks for helping improve PTForge.

## Setup

You need Node.js 18 or newer for the tests. Packet Tracer is only needed to try changes for real.

```
git clone https://github.com/r4chan842/PTForge.git
cd PTForge
npm test
```

## Layout

| Path | Content |
|------|---------|
| `src/data` | Model, module, link and type tables |
| `src/lib` | Pure helpers: IPv4 math, colors, text |
| `src/core` | Runtime context, layers, runner, window, entry point |
| `src/api` | Public functions, one folder per area |
| `src/ui` | Editor window, `catalog.js` is generated from `docs/api` |
| `release` | Single file bundle built from `src` |
| `tests/unit` | Pure function tests |
| `tests/integration` | Full extension against a mock Packet Tracer |
| `tests/helpers` | Loader and the Packet Tracer mock |
| `tools` | Load order, bundler, reference generator |
| `examples` | Complete labs, run by the test suite |
| `templates` | Starting points for new labs, run by the test suite |
| `assets` | Logo, banner, screenshots |
| `docs` | Guides, API reference, recipes, tables |

## Rules

The test suite enforces most of these.

- ES5 only in `src` and `examples`, because that is what Packet Tracer runs
- No comments in source files. Names should explain the code
- Every public function is documented in `docs/api` as a table row starting with `` | `name( ``
- Internal helpers are listed in `tools/internal-functions.txt`
- New files go into `tools/load-order.json` before any file that uses them
- IOS helpers come in pairs: `buildX` returns lines, `x` sends them with `configureIosDevice`
- Packet Tracer API calls must match the official IPC documentation. Link the class page in your pull request
- Wrong names, ports and options throw. Commands rejected by IOS are returned

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. Every release gets a `vX.Y.Z` tag.

## Before opening a pull request

```
npm run check
```

That regenerates `src/ui/catalog.js`, rebuilds `release/ptforge.js`, checks its syntax and runs every test. Commit the rebuilt bundle.

## Adding a function

1. Write it in the right file in `src/api`
2. Add tests in `tests/integration`
3. Document it in `docs/api`
4. Optionally add an example in `examples`
5. Add an entry under `Unreleased` in `CHANGELOG.md`

## Continuous integration

`tools/ci/ci.yml` is a GitHub Actions workflow that runs `npm run check` on Node 18, 20 and 22 and checks that generated files are committed. It lives in `.github/workflows/ci.yml`; `tools/ci/ci.yml` is the reference copy.
