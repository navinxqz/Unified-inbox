# Frontend Working Rules

These rules apply to every change in this Next.js frontend.

1. Do not modify application code, configuration, dependencies, or assets unless the user explicitly requests it.
2. Make only the smallest change required for the requested task. Do not add unrelated improvements, refactors, packages, components, or features.
3. Before coding, search the project for existing components, UI primitives, hooks, utilities, API clients, schemas, types, styles, and patterns that can be reused.
4. Reuse or extend an appropriate existing implementation when possible. Do not duplicate components, API calls, validation, state logic, types, constants, or styles.
5. Prefer the existing shared components, especially those under `components/` and `components/ui/`, before creating a new component.
6. Do not remove, rename, or rewrite existing internal code unless the request specifically requires it.
7. Preserve current behavior, responsive layouts, permissions, and project conventions. Check consumers before changing shared code.
8. Do not expose or commit credentials, tokens, passwords, or environment values.
9. Verify changes with the narrowest relevant lint, type-check, or build command. Do not fix unrelated failures without approval.
10. After every approved change, update `context.md` with what changed, relevant decisions, verification performed, and any remaining issue.
11. Finally find all the implicit state machines in my project. Make the best decision that will elevate all three: the user experience (UX), developer experience (DX), and agent experience (AX) always, without breaking anything.
12. Use the necessary skills that is available to ensure security, bugs, error of the project.
