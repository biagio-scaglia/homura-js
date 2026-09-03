---
name: Bug Report
about: Create a report to help us reproduce and fix an issue
title: '[BUG] '
labels: 'bug'
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**Affected Package(s)**
- [ ] `@homura-js/core`
- [ ] `@homura-js/vanilla`
- [ ] `@homura-js/react`
- [ ] `@homura-js/vue`
- [ ] `@homura-js/db`
- [ ] `@homura-js/devtools`
- [ ] WordPress Plugin (`homura-time-travel-form-recovery`)

**To Reproduce**
Steps or minimal reproduction code:
```ts
import { createHomura } from '@biagioscaglia/homurajs';

const homura = createHomura({ ... });
```

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**
- HomuraJS Version: [e.g. 1.4.0]
- OS: [e.g. Windows 11, macOS Sequoia, Ubuntu 24.04]
- Browser: [e.g. Chrome 130, Firefox 132, Safari 18]
- Node/Runtime Version: [e.g. Node 20.12, Bun 1.1]
