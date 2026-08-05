# StarQuest

StarQuest is the people, production, media, recognition, rights, and audience-connection side of the Infinity platform.

The first working StarQuest experience in this repository is **MLB Watch**: an independent baseball intelligence and biography platform that connects the complete human history of a player with current and historical performance data.

> MLB Watch is an independent research prototype. It is not affiliated with or endorsed by Major League Baseball. Names, marks, statistics, and source materials remain subject to their respective owners' terms.

---

## MLB Watch

Open the static application at:

```text
mlb-watch/index.html
```

The site requires no paid AI service. It runs as HTML, CSS, and JavaScript and requests current player identity and statistical records from MLB's public-facing data service at viewing time.

### What the first build does

- Searches current and historical player records by name
- Loads official identity information
- Loads current-season hitting and pitching statistics
- Loads career and year-by-year statistics
- Separates life research from statistical data
- Shows verified high school, college, military-academy, or international development
- Builds a chronological life and career timeline
- Displays fact-level source links
- Marks missing information as a research gap
- Includes responsive phone and desktop layouts
- Starts with researched profiles for Aaron Judge, Shohei Ohtani, and Paul Skenes

### Player dossier sections

| Section | Contents |
|---|---|
| Overview | Official identity, current performance, research coverage, and known/pending evidence |
| Life & Education | Schools, colleges, academies, international training, and verified early development |
| Career Timeline | Birth, education, amateur play, draft/signing, debut, milestones, and recognition |
| Statistics | Current and season-by-season hitting and pitching records |
| Sources | MLB data, official team/player biographies, school records, media guides, SABR, and other reviewed evidence |

---

## Architecture

```text
StarQuest/
├── README.md
└── mlb-watch/
    ├── index.html                       # Complete responsive research interface
    ├── styles.css                       # MLB Watch visual system
    ├── app.js                           # Search, API loading, dossier rendering
    ├── data/
    │   └── research-profiles.json       # Curated, sourced life-history records
    └── docs/
        └── PLAYER_RESEARCH_PROTOCOL.md  # Evidence, privacy, and editorial rules
```

### Data flow

```text
Player search
      │
      ├── MLB identity and statistics
      │     ├── player record
      │     ├── current season
      │     ├── career totals
      │     └── year-by-year splits
      │
      └── MLB Watch research record
            ├── early life
            ├── education
            ├── amateur development
            ├── career events
            └── source registry
                    │
                    ▼
             Player 360° dossier
```

The live data and the research layer remain separate. A biography error can be corrected without changing the statistical engine, and an API change can be repaired without destroying the researched timeline.

---

## No Paid AI Requirement

The core application does not depend on ChatGPT, OpenAI, Gemini, Copilot, or another paid model.

It uses:

- Browser JavaScript
- Static JSON research records
- MLB identity and statistics endpoints
- Deterministic rendering and coverage rules
- Human-reviewed source summaries

AI can later assist editors by identifying possible sources, comparing conflicting claims, drafting summaries, or flagging outdated records. AI-generated text must never become a permanent biographical fact without a source and review record.

---

## Research Coverage

MLB Watch is intended to grow from player profiles into a full investigation of baseball:

### People

- Major League, Minor League, Negro League, international, and historical players
- Managers and coaches
- Scouts and player-development staff
- Umpires
- Owners and executives
- Broadcasters, writers, photographers, and historians
- Doctors, trainers, equipment designers, and groundskeepers

### Player history

- Birth and hometown context
- Family background when reliably public and relevant
- First involvement with baseball
- High school and youth teams
- College, military academy, independent league, academy, or international development
- Drafts and international signings
- Minor League progression
- Transactions and team history
- Injuries and recoveries
- Awards and milestones
- Community work and foundations
- Post-playing career and later life

### Baseball system

- Team histories
- Ballparks
- Rules and equipment
- Draft and signing systems
- Labor relations and collective bargaining
- Integration and the Negro Leagues
- International player pipelines
- Medical and training history
- Broadcasting and media
- Economics, attendance, salaries, and public financing
- Baseball cards, memorabilia, and collecting history

---

## Research Rules

1. **Every durable biographical claim needs a source.**
2. **Unknown is a valid result.** The system does not guess childhood, education, family, or health information.
3. **Summarize rather than copy.** MLB Watch links to biographies but does not reproduce them.
4. **Prefer original records.** Official player pages, team media guides, school biographies, archives, interviews, and public records come before derivative summaries.
5. **Use SABR for full-life historical research.** SABR biographies are peer-reviewed but remain attributed works.
6. **Separate facts from interpretation.** Statistical comparisons and historical conclusions must show methodology.
7. **Respect personal boundaries.** No home addresses, private contact details, non-public family data, or invasive speculation.
8. **Record conflicts.** When sources disagree, show the competing claims and review status.
9. **Keep live data dated.** Current statistics identify the season and retrieval time.
10. **Retain corrections.** Major factual corrections should have an editorial history.

---

## Local Use

From the repository root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/mlb-watch/
```

A local server is required because browsers commonly block JavaScript from loading the JSON research file through a direct `file://` URL.

---

## Deployment

MLB Watch is a static site and can be published from the repository through GitHub Pages or another static host. A custom StarQuest or Infinity domain can point to the deployment so visitors do not need to see a `github.io` address.

Future private features—accounts, paid memberships, licensed datasets, contributor tools, correction workflows, or saved collections—should operate through the Infinity backend rather than placing secrets in browser JavaScript.

---

## Next Development Stages

- [ ] Add all active MLB players to a generated search index
- [ ] Add historical player lookup and aliases
- [ ] Add team, roster, transaction, award, and injury panels
- [ ] Add Minor League and international history
- [ ] Add a player comparison workspace
- [ ] Add career graphs and era context
- [ ] Add correction submissions and editor review
- [ ] Add source conflict tracking
- [ ] Add SABR biography discovery without copying article text
- [ ] Add Negro Leagues and pre-modern baseball research layers
- [ ] Add StarQuest follows, collections, and Shining Stars recognition
- [ ] Add deployment manifest and Infinity Crown registration

---

## Naming and Rights Notice

`MLB Watch` is currently a working project title. Before commercial launch, the name should receive trademark review because `MLB` is associated with Major League Baseball. The production name may need to become a clearly independent title such as **Baseball Watch**, **Diamond Watch**, or **StarQuest Baseball**, while keeping MLB as a factual league filter inside the application.
