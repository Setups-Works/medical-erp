# Folder structure

Every top-level folder has an `AGENTS.md` (or README) explaining its contents. Owners in brackets.

```
medical-ERP/  (repo: meno)
├── AGENTS.md                     Contract for humans + AI agents (read first)          [Nitheesh]
├── CLAUDE.md · GEMINI.md         Point agents to AGENTS.md
├── README.md · CONTRIBUTING.md
├── base-plan.md                  Original plan (superseded by docs/ where different)
├── .claude/agents/               Role sub-agents: backend, frontend, qa, devops, BA, reviewer
├── .cursor/rules/meno.mdc        Cursor rules → AGENTS.md
├── .github/
│   ├── CODEOWNERS                Path ownership (Nitheesh second reviewer everywhere)
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/           feature · bug · spike
│   ├── copilot-instructions.md
│   └── workflows/                CI/CD (P1)                                              [Jeeva]
│
├── apps/
│   ├── web/                      Next.js static SPA                                      [Meyyarivu + Prakalya]
│   │   ├── src/app/              Thin routes: (auth)/…, (app)/<area>/page.tsx
│   │   ├── src/components/       layout/ (shell), ui/ (app-specific wrappers)
│   │   ├── src/features/         21 feature folders, each: components/ queries.ts schema.ts utils.ts
│   │   │   ├── auth catalog purchase inventory pos returns wholesale pricing gst compliance → Meyyarivu
│   │   │   ├── parties                                                           → Prakalya
│   │   │   └── company branches users settings admin dashboard reports
│   │   │       accounting payments crm                                           → Nitheesh
│   │   ├── src/{hooks,lib,stores,types,config,styles}/
│   │   └── tests/{unit,e2e}/
│   ├── desktop/                  Electron                                                [Nitheesh + Jeeva]
│   │   ├── src/main/  src/preload/
│   │   ├── src/offline/{db/migrations,repositories,sync}/
│   │   ├── src/devices/{printer,scanner}/  src/updater/
│   │   └── resources/icons/  tests/
│   └── mobile/                   Deferred to P7 (README only)
│
├── backend/meno-api/             Spring Boot modular monolith                            [Kamesh + Nitheesh]
│   └── src/
│       ├── main/java/com/setupsworks/meno/
│       │   ├── config/ security/ tenancy/ integrations/{gst,whatsapp,sms,storage,tally}/
│       │   ├── common/{error,money,web,persistence,events}/
│       │   └── modules/          21 modules × {api,web,service,domain,repository,mapper} + AGENTS.md
│       │       auth tenancy identity subscription audit notification files sync
│       │       catalog party pricing purchase inventory sales returns compliance
│       │       payment accounting taxation reporting fieldsales
│       ├── main/resources/db/{migration,seed}/
│       └── test/java/com/setupsworks/meno/{architecture,support,modules/*,scenarios}/
│
├── packages/                     Shared TS (@meno/*)
│   ├── ui/                       Tokens + shadcn components                             [Meyyarivu]
│   ├── api-client/               Generated client                                       [Nitheesh]
│   ├── types/  validation/  billing-engine/  config/
│
├── project-management/        MENO Hub: team boards, tasks, comments, live (Next.js + MongoDB) [Nitheesh]
├── contracts/                    openapi/ · test-vectors/{gst,pricing,schemes}/ · sync/  [Nitheesh]
├── infrastructure/               docker/ nginx/ azure/ monitoring/ backup/ scripts/     [Jeeva]
├── scripts/                      design check, codegen, seed, scaffolding
└── docs/                         See docs/README.md
    ├── product/ architecture/ design/ database/ api/ security/ testing/
    ├── deployment/ runbooks/ compliance/ decisions/ workflows/
    ├── business-requirements/{brd,frs,user-stories,uat,templates}/
    ├── planning/                 PHASES · SPRINT_0 · CURRENT_STATE
    └── team/                     ownership · workflow · AI workflow · onboarding · conflict rules
        └── members/<name>/       README.md + PHASE_PLAN.md for each of the 6 members
```

Files that will appear in P1 (not created yet, because this phase is folders + docs only): `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `docker-compose.yml`, `.env.example`, `pom.xml`, `mvnw`, Dockerfiles, CI workflows.
