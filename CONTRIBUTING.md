# Contributing to HomuraJS ⏳

Thank you for your interest in contributing to **HomuraJS**! We welcome contributions of all kinds, including bug reports, feature requests, documentation improvements, and pull requests.

---

## 🏗️ Monorepo Structure

HomuraJS uses `pnpm` workspaces:

```text
homura/
├── packages/
│   ├── core/        # @homura-js/core (DAG engine, diffs, snapshots, persistence)
│   ├── devtools/    # @homura-js/devtools (Modern DevTools UI & Bridge)
│   ├── react/       # @homura-js/react (React 18+ useHomura hooks)
│   ├── vue/         # @homura-js/vue (Vue 3 useHomura hook & plugin)
│   └── vanilla/     # @homura-js/vanilla (Vanilla DOM helpers)
├── examples/
│   ├── rpg-inventory/ # Full showcase RPG Inventory demo
│   ├── react/         # React example
│   ├── vue/           # Vue example
│   └── vanilla/       # Vanilla example
├── playground/      # Interactive all-in-one sandbox
└── tests/           # Integration & unit test suites
```

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 9.0.0` (Recommended: `pnpm@11`)

### 1. Clone the repository

```bash
git clone https://github.com/biagio-scaglia/homura-js.git
cd homura-js
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run the test suite

```bash
pnpm test
```

### 4. Build all packages

```bash
pnpm build
```

### 5. Launch the development demo

```bash
pnpm --filter "@homura-js/example-rpg-inventory" run dev
```

---

## 📜 Development Workflow & Guidelines

1. **Strict TypeScript**: Keep code strictly typed with 0 `any` annotations unless unavoidable.
2. **Framework Agnostic Core**: `@homura-js/core` must never depend on any UI framework or DOM environment.
3. **Performance First**: Avoid deep cloning when structural sharing or draft proxies can be used.
4. **Test Everything**: Write unit tests in Vitest for every new method, edge case, and error condition.
5. **Linting & Code Style**: Run `pnpm typecheck` before committing.

---

## 🔀 Git Branch & Commit Conventions

- Use descriptive branch names:
  - `feat/feature-name`
  - `fix/bug-description`
  - `docs/update-readme`
  - `refactor/component-name`

- Use Conventional Commits:
  - `feat(core): add auto branch divergence option`
  - `fix(diff): resolve nested array splice tracking`
  - `docs(readme): add React 18 integration snippet`

---

## 🚀 Submitting a Pull Request

1. Fork the repository on GitHub.
2. Create your feature branch (`git checkout -b feat/my-new-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing time-travel feature'`).
4. Ensure all tests pass (`pnpm test` and `pnpm typecheck`).
5. Push to your branch (`git push origin feat/my-new-feature`).
6. Open a Pull Request on GitHub.

---

## 📄 License

By contributing to HomuraJS, you agree that your contributions will be licensed under the [MIT License](LICENSE).
