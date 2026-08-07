# 📈 Knowledge Spiral Lab — Growth Plan

> **Goal:** Build a thriving open-source community around the SECI × AI interactive simulator and graduate to the Claude for OSS program within 6 months.

---

## 1. Project Positioning — Why This Matters Right Now

### The moment
We're sitting at an inflection point in knowledge management. The 2026 insight from Chatterji, Rock & Talamàs identifies **tacit machine knowledge** — a third kind of knowledge that's portable at software speed. Nonaka & Takeuchi's SECI model, the canonical theory of organizational knowledge creation since 1995, has never been more relevant or more in need of a refresh.

### Our unique angle
**"The interactive reference implementation of the SECI × AI framework."**
- Not just theory — a working visual simulator you can tweak
- Not just code — grounded in a full research paper with 30+ sources
- Not just an app — a live lab for testing org design hypotheses

### Target audiences
| Audience | Why they care | Where to reach them |
|----------|--------------|-------------------|
| KM researchers & academics | SECI model evolution, tacit machine knowledge | Citation networks, Google Scholar, KMWorld |
| AI/ML engineers | Agentic knowledge systems, multi-agent orgs | GitHub, Hacker News, r/MachineLearning |
| Org design practitioners | Real levers for knowledge flow | LinkedIn, org design communities |
| MBA/PhD students | Interactive learning tool, paper reference | University networks, research gate |

### Positioning statement
```
The Knowledge Spiral Lab is the interactive, open-source reference implementation
of Nonaka & Takeuchi's SECI model, extended for the age of AI agents. Simulate,
visualize, and experiment with knowledge creation — then apply the insights to
your own organization.
```

---

## 2. Community Building Strategy — 0 → External Contributors

### Phase 1: Foundation (Month 1)

**CONTRIBUTING.md** — Create a clear first-issue guide with:
- "Good First Issue" tags for beginners
- Step-by-step local dev setup
- Expected code standards (TypeScript strict, canvas patterns)
- Link to Code of Conduct

**Issue Templates** — Add to `.github/ISSUE_TEMPLATE/`:
- `bug-report.yml` — browser info, preset used, expected vs actual
- `feature-request.yml` — use case, proposed behavior, alternatives
- `simulator-preset.yml` — template for submitting real-world SECI scenarios

**Community touchpoints:**
- GitHub Discussions for Q&A and preset sharing
- README badge showing "We Welcome Contributions"
- `welcome` workflow that auto-comments on first PR

### Phase 2: Outreach (Month 2-3)

**Academic channels:**
- Share the research paper (`results/`) on Google Scholar, ResearchGate
- Post to Knowledge Management listservs (KMPro, OKLC network)
- Tweet at KM academics who study Nonaka or AI/knowledge intersection
- Submit to KMWorld conference as a poster/tech demo

**Developer channels:**
- **Hacker News "Show HN"** — title: "Show HN: I built an interactive simulator of Nonaka's SECI knowledge-creation model, extended for AI agents"
- **r/MachineLearning** — share as "Playing with knowledge creation: SECI model meets agentic AI"
- **r/knowledgemanagement** — share for the KM crowd
- **Product Hunt** — launch as "The interactive SECI × AI lab"

**Outreach actions:**
| Action | Details | Est. reach |
|--------|---------|-----------|
| HN Show HN post | Title + live demo + repo link | 500-2000 views |
| r/MachineLearning post | Text post with simulator GIF | 200-1000 views |
| r/knowledgemanagement | Cross-post | 50-200 views |
| Academic Twitter thread | Paper highlights + simulator link | 100-500 views |
| LinkedIn post | Org design audience | 50-200 views |
| Product Hunt launch | If momentum builds | 500-3000 views |

### Phase 3: Growth (Month 3-4)

**Call for Presets:** Invite orgs/teams to submit real-world SECI scenarios:
- "Run your company's knowledge flow through our simulator"
- Contributed presets get credited in the app
- Creates a feedback loop: real orgs → real presets → more users

**Community events:**
- Monthly "Spiral Lab Office Hours" on Discord/GitHub Discussions
- Contributor showcase: highlight contributors in README
- Open issue-hunting sessions

**Partner integrations:**
- Submit to awesome-knowledge-management, awesome-ai-agents lists
- Cross-link with related OSS projects (KM tools, org simulators)
- Offer as a teaching tool in MBA/Org Behavior courses

### Phase 4: Momentum (Month 5-6)

**Metrics targets for Claude for OSS eligibility:**
| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| GitHub Stars | 0 | 20+ |
| GitHub Forks | 0 | 5+ |
| External contributors w/ merged PRs | 0 | 2+ |
| Dependent repos/packages | 0 | 1+ (used in a course or talk) |
| Monthly npm downloads (if published) | 0 | N/A (web app) |

---

## 3. Feature Roadmap

### Short-term (0-3 months) — Quick wins for contributors
- [ ] **Export/import simulator configurations** — JSON save/load so orgs can share their setups
- [ ] **Shareable simulation URLs** — encode state in URL params for easy sharing
- [ ] **Dark mode** — low-effort, high-visibility PR
- [ ] **Mobile responsiveness** — canvas needs touch support for phones
- [ ] **Timeline visualization** — show knowledge evolution over time (not just current state)
- [ ] **More presets** — contribute 5+ real org scenarios (NotCo, Pixar, Toyota, etc.)

### Medium-term (3-6 months) — Depth & engagement
- [ ] **User accounts** — save simulations, track history
- [ ] **Programmatic API** — simulate SECI flows via HTTP (for research)
- [ ] **Comparison mode** — side-by-side of different ba configurations
- [ ] **Japanese language support** — Nonaka was Japanese, his home audience matters
- [ ] **Localization framework** — i18n-ready for multi-language contributions
- [ ] **Guided tour / tutorial** — interactive onboarding for first-time visitors

### Long-term (6-12 months) — Stretch
- [ ] **Plugin system** — custom knowledge-carrier models, custom metrics
- [ ] **RL-based optimization** — let the simulator *learn* optimal ba conditions
- [ ] **KM tool integrations** — export findings to Notion, Confluence, Obsidian
- [ ] **Multi-agent simulation** — each agent has its own SECI cycle, interact with each other
- [ ] **Academic citation export** — BibTeX snippet for the research paper

---

## 4. Marketing & Visibility Plan

### GitHub optimization
**Topics to add (in repo settings):**
```
knowledge-management, seci-model, nonaka-takeuchi, ai-agents,
knowledge-creation, organizational-learning, tacit-knowledge,
simulation, interactive-simulation, agentic-ai
```

**README enhancements:**
- Animated GIF of the simulator in action
- "Try it now" badge linking to live demo
- CI/CD status badges
- Star history badge
- "Built with" tech stack badges

### Content marketing
| Piece | Format | Channel | Timeline |
|-------|--------|---------|----------|
| "Building the Knowledge Spiral" | 1500-word blog post | Dev.to, Medium, personal blog | Month 2 |
| Simulator demo reel | 30-60s screen recording | YouTube, Twitter, LinkedIn | Month 2 |
| "SECI × AI in 60 seconds" | Short video loop | TikTok, Instagram Reels, YouTube Shorts | Month 2 |
| "How I built an SECI simulator with AI in 2 weeks" | Technical blog | TheSequence, TLDR AI | Month 3 |
| Research paper announcement | Academic tweet thread | Twitter/X | Month 1 |

### Newsletter & curation submission
- **TLDR AI** — "Interactive SECI × AI Simulator" (1400+ word writeup)
- **TheSequence** — Weekly ML newsletter, knowledge management edition
- **Awesome Lists** — awesome-knowledge-management, awesome-ai-agents
- **Changelog Weekly** — OSS project spotlight
- **Open Source Weekly** — Project of the week

### Academic citation
Add a `CITATION.cff` file and "How to cite this work" section in README:
```bibtex
@software{knowledge_spiral_lab,
  title = {The Knowledge Spiral Lab: An Interactive SECI × AI Simulator},
  author = {Monsalud, Neil Vincent},
  year = {2026},
  url = {https://github.com/nvmmonsalud/nonaka-spiral-lab}
}
```

---

## 5. Governance & Sustainability

### Community standards
- [ ] **CODE_OF_CONDUCT.md** — Contributor Covenant v2.1
- [ ] **SECURITY.md** — How to report vulns, expected response time
- [ ] **CONTRIBUTING.md** — Full contributor guide
- [ ] **GitHub Project Board** — Public roadmap with swimlanes (Now, Next, Later)
- [ ] **Release process** — Monthly tagged releases with CHANGELOG.md

### Maintainer workload
| Area | Current | Target (6 months) |
|------|---------|-------------------|
| Issue triage | 1 person | 1 maintainer + 1-2 triagers |
| Code review | 1 person | 1-2 regular reviewers |
| Release management | 1 person | Monthly automated |
| Community management | None | 1 maintainer, 30 min/week |

### Sustainability model
- **100% open source, MIT license** — always free
- **No monetization** — this is a portfolio/community project
- **Accepting donations** via GitHub Sponsors (optional)
- **Contributor recognition** — CONTRIBUTORS.md, README shoutouts, preset credits

---

## 6. Claude for OSS Readiness Checklist

### When to apply
Target: **3–6 months after the open-source launch**

### Entry criteria met when:
- [ ] **10+ GitHub stars** (organic, not from friends)
- [ ] **5+ forks** (shows people want to build on this)
- [ ] **1+ external contributor with merged PR** (proves community engagement)
- [ ] **1+ academic/social mention** (paper cited, blog post written, conference demo)
- [ ] **Active in last 30 days** (commits, issue responses, PR merges)
- [ ] **CI/CD green** (builds, tests, deploys passing)

### Application narrative draft
> **The Knowledge Spiral Lab** is an open-source interactive simulator of Nonaka & Takeuchi's SECI knowledge-creation model, extended for the age of AI agents. It combines a working web application (Next.js canvas simulation) with a full research paper (6,000+ words, 30 sources, 7 cases) to create a living lab for understanding how organizations create knowledge when half the "employees" are AI agents.
>
> The project sits at the intersection of knowledge management theory and practical AI engineering — a reference implementation that academics cite, developers build on, and practitioners use to design better organizations. Claude Max would accelerate our community growth, help us review external contributions faster, and enable the advanced features (plugin system, RL optimization) that attract the most skilled contributors.

### What Claude Max would give this project
- **6 months of free Claude Max 20x** for AI-assisted code review, issue triage, PR collaboration
- **Faster review cycles** — maintainer can review 3× more PRs per week
- **Better docs** — Claude-assisted documentation generation for contributor guides and API references
- **Stronger application** — if we grow successfully during those 6 months, renewal or graduation to a paid plan is the goal

---

## Progress Tracker

| Area | Status | Target | Notes |
|------|--------|--------|-------|
| GROWTH-PLAN.md | ✅ Done | This file | Comprehensive growth strategy |
| LICENSE (MIT) | ✅ Done | Month 1 | Committed 2026-08 |
| CONTRIBUTING.md | ✅ Done | Month 1 | First-time contributor guide — committed 2026-08 |
| CODE_OF_CONDUCT.md | ✅ Done | Month 1 | Contributor Covenant — committed |
| SECURITY.md | ✅ Done | Month 1 | Private vulnerability reporting — committed 2026-08 |
| Issue templates | ✅ Done | Month 1 | Bug + feature + preset templates — committed |
| Issue chooser config | ✅ Done | Month 1 | Links Discussions + security policy — committed 2026-08 |
| PR template | ✅ Done | Month 1 | Committed 2026-08 |
| PR CI (lint/typecheck/build) | ✅ Done | Month 1 | `.github/workflows/ci.yml` — committed 2026-08 |
| Dependabot | ✅ Done | Month 1 | npm + GitHub Actions, weekly grouped — committed 2026-08 |
| DEPLOYMENT.md | ✅ Done | Month 1 | Vercel button, fork deploy, static export — committed 2026-08 |
| Good-first-issue backlog | ⬜ Pending | Month 1 | Seed from short-term roadmap after launch |
| GitHub Discussions enabled | ⬜ Pending | Month 1 | Repo settings |
| GH Project Board | ⬜ Pending | Month 1 | Public roadmap |
| HN Show HN post | ⬜ Pending | Month 2 | Title drafted above |
| Blog post | ⬜ Pending | Month 2 | "Building the Knowledge Spiral" |
| Demo video | ⬜ Pending | Month 2 | 30-60s screen recording |
| Academic citation | ✅ Done | Month 1 | CITATION.cff — committed |
| Topic tags added | ⬜ Pending | Month 1 | Add via GitHub repo settings |
| CHANGELOG.md + tagged releases | ⬜ Pending | First release | Start at v1.0 tag, not before |

---

*Build the spiral, not the answer. 🌊*
