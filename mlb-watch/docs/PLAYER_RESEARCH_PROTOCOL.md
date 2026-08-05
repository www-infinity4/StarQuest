# MLB Watch Player Research Protocol

## Purpose

MLB Watch creates a complete, source-linked player record from the beginning of a person's life through the latest available baseball statistics. The system is designed to investigate baseball comprehensively without converting rumor, AI output, or copied biography into fact.

## Record Layers

### 1. Official identity

Minimum fields:

- MLB person ID or another stable historical identifier
- Full professional name
- Birth date and place
- Position
- Bats and throws
- Height and weight, dated where possible
- Major League debut
- Active or historical status
- Current team when applicable

### 2. Early life

Potential fields:

- Parentage and family background when publicly documented and relevant
- Childhood location history
- First baseball participation
- Youth teams and leagues
- Influential coaches, relatives, teachers, and scouts
- Other sports and activities
- Economic, cultural, geographic, or historical context

Private addresses, private contact information, and non-public family details are excluded.

### 3. Education and development

Potential fields:

- Elementary, middle, and secondary schools when reliably documented
- High school graduation year
- College or university
- Military academy
- Baseball academy
- Junior college
- International club or school development
- Major or field of study when officially published
- Academic honors
- Transfers
- Degrees or completion status only when verified

Do not infer graduation or degree completion merely from attendance.

### 4. Amateur and entry path

- High school teams
- College seasons
- Summer leagues
- International competition
- Draft eligibility
- Draft year, round, pick, and club
- International signing
- Signing scout
- Signing bonus only from reliable public records
- Decision to sign or continue education

### 5. Professional career

- Minor League assignments
- Major League teams
- International professional teams
- Transactions
- Injured-list periods
- Position changes
- Awards
- Postseason participation
- Milestones
- Contracts when sourced
- Free agency, retirement, coaching, broadcasting, or later work

### 6. Statistics

Separate the following:

- Current season
- Career totals
- Year-by-year records
- Postseason
- Minor League
- Negro Leagues
- International leagues
- Advanced metrics
- Statcast
- Era-adjusted metrics
- Projections

Every statistic must identify its source, competition level, season, and retrieval date. Do not merge records from incompatible definitions without explaining the methodology.

## Source Priority

1. Official league, team, player, school, government, or archival record
2. Direct interview or autobiography
3. Contemporary newspaper or media guide
4. Peer-reviewed or editor-reviewed historical research, including SABR
5. Established statistical database
6. Reputable secondary reporting
7. Crowd-edited reference used only as a discovery lead
8. Social-media claim used only when posted by the subject or responsible institution and preserved with context

AI output is never a source.

## Claim Schema

Each researched claim should eventually use a record similar to:

```json
{
  "claimId": "player-592450-education-linden-2010",
  "playerId": 592450,
  "field": "education.highSchool",
  "value": "Linden High School",
  "startDate": null,
  "endDate": "2010",
  "status": "verified",
  "confidence": 1,
  "sourceIds": ["judge-mlb-bio"],
  "reviewedBy": "editor-id",
  "reviewedAt": "2026-08-05T00:00:00Z",
  "notes": "Official MLB biography states that Judge graduated in 2010."
}
```

## Status Values

- `verified` — directly supported by reliable evidence
- `supported` — multiple credible sources agree, but the original record has not been located
- `disputed` — reliable sources conflict
- `uncertain` — evidence is incomplete or ambiguous
- `research-pending` — a field is expected but not researched
- `not-public` — intentionally excluded or unavailable
- `corrected` — prior published value was changed with an editorial record

## Conflicting Sources

When reliable sources conflict:

1. Store each claim separately.
2. Record the exact difference.
3. Prefer contemporaneous or primary records where appropriate.
4. Explain why one value is displayed.
5. Keep the conflict visible to editors.
6. Do not allow AI to silently select a version.

## Editorial Safety

High-risk claims require human review before publication:

- Criminal allegations
- Discipline and gambling
- Performance-enhancing drugs
- Abuse or harassment
- Medical diagnoses
- Cause of death
- Financial distress
- Family conflict
- Immigration status
- Political or religious claims
- Sexual orientation or gender identity

The system should distinguish official findings, allegations, denials, legal outcomes, and unresolved reporting.

## Copyright and Licensing

MLB Watch stores factual summaries, citation metadata, and links. It does not copy full SABR biographies, media-guide chapters, news articles, photographs, video, team logos, or statistical datasets beyond allowed use.

Before commercial deployment:

- Review MLB data and trademark terms
- License photographs and video
- Confirm statistical database rights
- Review the product name
- Publish takedown and correction procedures
- Record the license for every reusable asset

## Automated Research Role

AI may:

- Suggest possible sources
- Extract candidate dates and institutions
- Compare source claims
- Detect duplicate identities
- Draft a neutral summary
- Flag outdated statistics
- Identify missing citations
- Generate research queues

AI may not independently publish a sensitive claim, overwrite a verified record, or treat its own generated text as evidence.

## Definition of a Complete Initial Dossier

A player reaches `complete-initial` status when the record contains:

- Stable identity
- Birth and debut information
- Education or a documented statement that education remains unknown
- Entry into professional baseball
- Team and transaction history
- Current or final career statistics
- At least five dated timeline events
- At least two biographical sources
- Statistical source
- Last review date
- Visible research gaps

A dossier is never considered permanently finished. Current players continue accumulating events, and historical records may be corrected by new research.
