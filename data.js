/* ═════════════════════════════════════════════════════════
   NONONICK / data.js — case-study source of truth
   Shared by the work section previews and case-study.html
   ═════════════════════════════════════════════════════════ */
window.NN_DATA = {
  projects: [
    {
      id: 'nononick-ai', num: '01', title: 'NONONICK AI', cat: ['AI / WEB APPLICATION', 'INTERNAL PRODUCT'],
      year: '2026', client: 'NONONICK Studio', role: 'Direction · Architecture · Build', duration: '11 weeks',
      stack: ['Vanilla JS', 'Python inference API', 'Cloudflare Workers', 'Postgres + pgvector', 'SSE streaming'],
      summary: 'A conversational operations layer for the studio: briefs, proposals, content releases and site diagnostics in one streamed interface, grounded in our own corpus.',
      lede: 'We were answering the same questions twice a week. Six tools, four spreadsheets, one shared drive and a founder who remembered everything. NONONICK AI collapses that into a single surface that reads our documentation, our past scopes and our telemetry, then replies with citations.',
      cover: 'ai',
      challenge: [
        'Retrieval had to be verifiable. An assistant that guesses a price or a deadline is worse than no assistant at all, so every answer needed a traceable source and an explicit "not found" state.',
        'The interface had to stream without layout thrash. Token-by-token rendering normally detonates CLS; the answer container reserves its geometry before the first byte arrives.',
        'It had to run on the same infrastructure as our client builds — no separate cluster, no additional vendor, no data leaving the account.'
      ],
      approach: [
        ['01 · Workflow mapping', 'Two weeks shadowing the studio. 41 recurring questions reduced to 9 intents: scope, pricing, availability, diagnostics, content release, redirect, incident, reporting, onboarding.'],
        ['02 · Corpus & retrieval', 'Every brief, scope document, design system and post-mortem ingested into chunked embeddings with metadata. Hybrid search: vector recall filtered by structured facts (client, date, environment).'],
        ['03 · Streaming interface', 'Server-sent events into a pre-sized virtualised panel. Zero layout shift, cancellable mid-stream, keyboard-first, and a plain-text fallback for connections that drop.'],
        ['04 · Guardrails', 'Answers below a confidence threshold return the source documents instead of a synthesis. Pricing and contractual language are hard-gated behind human review — the model drafts, a partner signs.']
      ],
      outcome: 'Eleven weeks from first workshop to daily internal use. The assistant now writes the first draft of every proposal we send; a partner edits and signs. Diagnostics that used to take an afternoon of log-diving return in one query.',
      metrics: [
        { v: '−71%', l: 'time to first proposal draft' },
        { v: '1.4s', l: 'median stream start' },
        { v: '0.00', l: 'CLS during streaming' },
        { v: '9/9', l: 'intents covered at launch' }
      ],
      modules: ['Intent router', 'Hybrid retriever', 'Citation panel', 'Stream viewer', 'Diagnostics console', 'Review queue', 'Audit log', 'Role gates'],
      continues: 'Weekly evaluation set re-runs, corpus refresh on every delivered project, prompt regression tests inside CI, and a monthly accuracy readout reviewed with the partners.'
    },
    {
      id: 'digital-business', num: '02', title: 'DIGITAL BUSINESS', cat: ['WEB SYSTEM', 'B2B SERVICES GROUP'],
      year: '2025', client: 'Confidential · industrial services', role: 'Design system · Build · Management', duration: '14 weeks',
      stack: ['Astro', 'TypeScript', 'Node / Postgres', 'Cloudflare Workers', 'Headless CMS'],
      summary: 'A services group running on spreadsheets, forwarded inboxes and one very brave office manager. We replaced six tools with one system: public site, client portal, internal panel, automated reporting.',
      lede: 'The brief said "new website". The audit said something else: eleven landing pages duplicated across three domains, quotes built in Word, project status tracked in a shared sheet, and no way to answer "how many active clients do we have" without a phone call.',
      challenge: [
        'One codebase had to serve three audiences with very different needs — prospective clients, existing clients and staff — without tripling the maintenance surface.',
        'Content had to be editable by non-technical regional managers, in two languages, without breaking the design system they could not see.',
        'Legacy URLs carried five years of search equity. Nothing could 404.'
      ],
      approach: [
        ['01 · One content model', 'Six document types — service, case, region, person, resource, notice — composed into pages. Editors assemble; they do not style. Every block carries a design-token constraint.'],
        ['02 · Public layer', 'Static-rendered service and region pages, generated from the model at build time. 42 routes, 1.1s median LCP on 4G, no client framework beyond 9 KB of behaviour.'],
        ['03 · Client portal', 'Project status, documents, invoices, approvals and a single thread per engagement. Role-gated, audited, mobile-first — most supervisors live on phones.'],
        ['04 · Internal panel', 'Pipeline board, quote builder with rate cards, and automated weekly reporting that replaces a full day of manual assembly.'],
        ['05 · Migration', '318 legacy URLs mapped, redirected and verified. Search console monitored for 60 days post-launch; equity intact.']
      ],
      outcome: 'Launched in phases over fourteen weeks with zero downtime and no lost rankings. The office manager now runs the whole group from one panel and one phone app.',
      metrics: [
        { v: '+184%', l: 'qualified inbound enquiries' },
        { v: '0.9s', l: 'LCP, p75 field data' },
        { v: '6→1', l: 'tools replaced by one system' },
        { v: '−1 day', l: 'manual reporting removed weekly' }
      ],
      modules: ['Service library', 'Region generator', 'Client portal', 'Quote builder', 'Pipeline board', 'Reporting engine', 'Document vault', 'Role & audit'],
      continues: 'Managed plan: content releases within 48 hours, dependency patches weekly, quarterly information-architecture review, and a growing backlog of portal automation.'
    },
    {
      id: 'luxury-studio', num: '03', title: 'LUXURY STUDIO', cat: ['CREATIVE WEBSITE', 'ATELIER / RETAIL'],
      year: '2025', client: 'European atelier', role: 'Art direction · Build · Motion', duration: '9 weeks',
      stack: ['HTML5 / CSS3', 'Vanilla JS', 'Canvas 2D', 'Cloudflare Pages', 'Shopify headless'],
      summary: 'An atelier with a two-week collection window and a clientele that expects discretion. Cinematic pacing, metallic surfaces, and a private-client enquiry flow that never asks for an account password.',
      lede: 'Their previous site was a PDF gallery. The collection had to land in nine weeks, feel like the showroom, and still open in under a second for a client on a hotel Wi-Fi in another continent.',
      challenge: [
        'Atmosphere usually costs weight. Here the mood — metal, grain, depth — had to be produced with light and geometry instead of megabytes.',
        'Motion had to read as choreography, not decoration: scroll-paced, interruptible, and completely absent for people who ask it to be.',
        'Private clients do not register. Access had to work through signed links with expiring tokens.'
      ],
      approach: [
        ['01 · Material system', 'Surfaces built from layered gradients, hairline strokes and a noise pass — no bitmap textures. Metallic sheen is a conic gradient animated on the compositor, costing almost nothing.'],
        ['02 · Collection engine', 'Each piece is a generated plate: type, proportion, material swatch, edition number. Twelve items, twelve distinct compositions, one template.'],
        ['03 · Scroll choreography', 'A single rAF loop drives seven parallax layers with device-tier fallbacks. Below the tier threshold the site degrades to a static editorial layout — still beautiful, fully usable.'],
        ['04 · Private access', 'Signed, expiring URLs open a discreet enquiry flow: appointment, advisor, piece of interest. No accounts, no passwords, no third-party trackers.'],
        ['05 · Commerce bridge', 'Headless connection to the existing storefront for editions and availability, kept out of the critical path so a slow upstream never blocks first paint.']
      ],
      outcome: 'Shipped two days before the collection announcement. The site carried the launch traffic without a scaling event and became the atelier\u2019s primary screening tool for private appointments.',
      metrics: [
        { v: '0.9s', l: 'first paint on 4G' },
        { v: '+62%', l: 'average session duration' },
        { v: '+38%', l: 'private appointment enquiries' },
        { v: '178 KB', l: 'total transfer weight' }
      ],
      modules: ['Material system', 'Collection engine', 'Scroll choreography', 'Private access', 'Appointment flow', 'Headless commerce bridge', 'Tier fallbacks', 'Grain & light pass'],
      continues: 'Seasonal collection drops handled end-to-end by us — art direction, plate generation, release. Two per year, plus an archive rebuild in progress.'
    },
    {
      id: 'performance-engine', num: '04', title: 'PERFORMANCE ENGINE', cat: ['WEB INFRASTRUCTURE', 'INTERNAL PLATFORM'],
      year: '2024', client: 'NONONICK Studio · managed fleet', role: 'Architecture · Build · Operations', duration: 'Ongoing',
      stack: ['Cloudflare Workers', 'GitHub Actions', 'Lighthouse CI', 'D3-free SVG charts', 'Postgres'],
      summary: 'The machine behind every managed site: build pipeline, weight budgets, synthetic probes, field telemetry and a live dashboard that flags which of twenty properties is quietly drifting slow.',
      lede: 'Managing twenty websites by hand means noticing regressions in the client\u2019s support ticket. The engine notices first: it watches field data, enforces budgets at build time and opens its own incident when a page gets heavier.',
      challenge: [
        'Field data arrives late and sparse; a synthetic run lies confidently. Both were needed, reconciled per route rather than per site.',
        'Budgets had to be enforceable without blocking legitimate shipping — a red build that everyone learns to ignore is worse than no build gate.',
        'Every client needed a readable version of the same data, without access to the fleet view.'
      ],
      approach: [
        ['01 · Budget contract', 'Each repository carries a budget file: weight, request count, LCP, INP, CLS, image strategy. It is versioned, reviewed like code, and diffed on pull request.'],
        ['02 · Build gate', 'CI produces a real bundle report. Over budget, the PR gets an annotated diff naming the offender — a font, a widget, an unoptimised asset — not a generic failure.'],
        ['03 · Synthetic probes', 'Twelve geographic probes per site every 15 minutes on throttled 4G, cold cache. Errors, regressions and availability feed one event stream.'],
        ['04 · Field reconciliation', 'RUM events are matched against synthetic baselines per route. Divergence beyond tolerance raises an incident with a probable cause attached.'],
        ['05 · Client readout', 'Each property gets a white-label page: vitals trend, uptime, releases, content changes. Written for a marketing director, not an engineer.']
      ],
      outcome: 'The fleet now averages sub-second LCP with automated regression detection. Median time-to-detection for a performance incident dropped from weeks of client complaints to a single probe cycle.',
      metrics: [
        { v: '42ms', l: 'TTFB, p75 across fleet' },
        { v: '−68%', l: 'median transfer weight vs. baseline' },
        { v: '99.99%', l: 'measured availability, 12 months' },
        { v: '20', l: 'properties under budget watch' }
      ],
      modules: ['Budget contract', 'CI bundle report', 'Synthetic probes', 'RUM collector', 'Incident router', 'Client readout', 'Rollback runner', 'Certificate watch'],
      continues: 'Continuous. New managed sites onboard with a budget file and a probe set on day one; the engine is the reason our management retainer is a promise rather than a hope.'
    }
  ]
};