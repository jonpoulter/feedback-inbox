# {Feature Name} — Smoke Test Checklist

> Run against a **running** application (see [AGENTS.md](../../../AGENTS.md)).

## Environment

- [ ] App running: `{start command}`
- [ ] Config / feature flag: `{name}={value}`
- [ ] Test data: `{ids, fixtures, etc.}`

## Functional checks

| # | Steps | Expected | Pass |
|---|-------|----------|------|
| 1 | {user-visible steps} | {outcome} | ☐ |
| 2 | {regression check} | {no error in logs} | ☐ |

## API checks (if applicable)

```bash
# {curl or smoke command}
```

## UI checks (if applicable)

- [ ] Dev server URL confirmed (`finding-dev-server-url` if needed)
- [ ] Browser smoke: `{command or manual steps}`
- [ ] Screenshot attached to PR or smoke doc

## Evidence for reviewers

| Artifact | Location |
|----------|----------|
| Screenshots | {path or PR comment} |
| Test output | {command log} |
| Screen recording | {optional} |
