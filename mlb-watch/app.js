const MLB_API = 'https://statsapi.mlb.com/api/v1'
const CURRENT_SEASON = new Date().getFullYear()

const state = {
  researchProfiles: {},
  activePlayerId: null,
  activeResearch: null,
  activeMlbProfile: null,
  activeStats: null,
  playerIndex: null,
}

const els = {
  menuButton: document.querySelector('#menuButton'),
  primaryNav: document.querySelector('#primaryNav'),
  searchForm: document.querySelector('#playerSearch'),
  searchInput: document.querySelector('#playerSearchInput'),
  searchStatus: document.querySelector('#searchStatus'),
  searchResults: document.querySelector('#searchResults'),
  featuredPlayers: document.querySelectorAll('[data-player-id]'),
  dossierTitle: document.querySelector('#dossierTitle'),
  dataState: document.querySelector('#dataState'),
  dossierEmpty: document.querySelector('#dossierEmpty'),
  dossierApp: document.querySelector('#dossierApp'),
  identityMonogram: document.querySelector('#identityMonogram'),
  identityPosition: document.querySelector('#identityPosition'),
  identityStatus: document.querySelector('#identityStatus'),
  identityName: document.querySelector('#identityName'),
  identitySummary: document.querySelector('#identitySummary'),
  identityBorn: document.querySelector('#identityBorn'),
  identityDebut: document.querySelector('#identityDebut'),
  identityBatsThrows: document.querySelector('#identityBatsThrows'),
  identitySize: document.querySelector('#identitySize'),
  coverageScore: document.querySelector('#coverageScore'),
  coverageLabel: document.querySelector('#coverageLabel'),
  coverageMeter: document.querySelector('#coverageMeter'),
  educationCount: document.querySelector('#educationCount'),
  timelineCount: document.querySelector('#timelineCount'),
  sourceCount: document.querySelector('#sourceCount'),
  seasonBadge: document.querySelector('#seasonBadge'),
  currentStats: document.querySelector('#currentStats'),
  researchStatus: document.querySelector('#researchStatus'),
  educationList: document.querySelector('#educationList'),
  lifeResearchGap: document.querySelector('#lifeResearchGap'),
  careerTimeline: document.querySelector('#careerTimeline'),
  statsTables: document.querySelector('#statsTables'),
  sourceRegistry: document.querySelector('#sourceRegistry'),
  tabs: document.querySelectorAll('.dossier-tab'),
  panels: document.querySelectorAll('.tab-panel'),
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value, options = {}) {
  if (!value) return 'Not recorded'
  const date = new Date(`${value}${/^\d{4}-\d{2}-\d{2}$/.test(value) ? 'T12:00:00' : ''}`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: options.compact ? 'short' : 'long',
    day: /^\d{4}-\d{2}-\d{2}$/.test(value) ? 'numeric' : undefined,
  }).format(date)
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '--'
}

async function fetchJson(url, timeout = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function loadResearchProfiles() {
  const data = await fetchJson('./data/research-profiles.json')
  state.researchProfiles = data.profiles || {}
}

function setBusy(message) {
  els.dataState.textContent = message
  els.currentStats.innerHTML = '<p class="loading-copy">Loading official statistics…</p>'
}

async function fetchPerson(personId) {
  const url = `${MLB_API}/people/${personId}?hydrate=currentTeam`
  const data = await fetchJson(url)
  return data.people?.[0] || null
}

async function fetchStatBlock(personId, stats, group) {
  try {
    const url = `${MLB_API}/people/${personId}/stats?stats=${encodeURIComponent(stats)}&group=${encodeURIComponent(group)}`
    const data = await fetchJson(url)
    return data.stats?.[0]?.splits || []
  } catch (error) {
    console.warn(`Unable to load ${stats} ${group}:`, error)
    return []
  }
}

async function fetchAllStats(personId) {
  const [
    seasonHitting,
    seasonPitching,
    careerHitting,
    careerPitching,
    yearByYearHitting,
    yearByYearPitching,
  ] = await Promise.all([
    fetchStatBlock(personId, 'season', 'hitting'),
    fetchStatBlock(personId, 'season', 'pitching'),
    fetchStatBlock(personId, 'career', 'hitting'),
    fetchStatBlock(personId, 'career', 'pitching'),
    fetchStatBlock(personId, 'yearByYear', 'hitting'),
    fetchStatBlock(personId, 'yearByYear', 'pitching'),
  ])

  return {
    seasonHitting,
    seasonPitching,
    careerHitting,
    careerPitching,
    yearByYearHitting,
    yearByYearPitching,
  }
}

function renderIdentity(person, research) {
  const team = person.currentTeam?.name
  const position = person.primaryPosition?.name || 'Baseball player'
  els.identityMonogram.textContent = getInitials(person.fullName)
  els.identityPosition.textContent = team ? `${position} · ${team}` : position
  els.identityStatus.textContent = person.active ? 'Active' : 'Historical'
  els.identityName.textContent = person.fullName
  els.identitySummary.textContent = research?.summary ||
    `${person.fullName} has an official MLB identity and statistical record. A full sourced life-history dossier has not yet been completed in MLB Watch.`
  els.identityBorn.textContent = [formatDate(person.birthDate), person.birthCity, person.birthStateProvince, person.birthCountry]
    .filter(Boolean)
    .join(' · ')
  els.identityDebut.textContent = formatDate(person.mlbDebutDate)
  els.identityBatsThrows.textContent = `${person.batSide?.code || '—'} / ${person.pitchHand?.code || '—'}`
  els.identitySize.textContent = `${person.height || '—'} / ${person.weight ? `${person.weight} lb` : '—'}`
  els.dossierTitle.textContent = `${person.fullName} — full player record`
}

function calculateCoverage(person, research, stats) {
  let points = 0
  if (person?.fullName && person?.birthDate) points += 20
  if (stats?.seasonHitting?.length || stats?.seasonPitching?.length || stats?.yearByYearHitting?.length || stats?.yearByYearPitching?.length) points += 20
  if (research?.education?.length) points += 20
  if (research?.timeline?.length >= 4) points += 20
  if (research?.sources?.length >= 2) points += 20
  return points
}

function renderCoverage(person, research, stats) {
  const score = calculateCoverage(person, research, stats)
  const educationCount = research?.education?.length || 0
  const timelineCount = research?.timeline?.length || 0
  const sourceCount = (research?.sources?.length || 0) + 2

  els.coverageScore.textContent = `${score}%`
  els.coverageLabel.textContent = score >= 80 ? 'Strong initial dossier' : score >= 40 ? 'Partial research dossier' : 'Official data only'
  els.coverageMeter.style.width = `${score}%`
  els.educationCount.textContent = educationCount
  els.timelineCount.textContent = timelineCount
  els.sourceCount.textContent = sourceCount

  const statuses = [
    ['Official MLB identity', Boolean(person?.fullName), 'Birth, position, physical profile, handedness, and debut'],
    ['Live and historical statistics', Boolean(stats?.seasonHitting?.length || stats?.seasonPitching?.length || stats?.yearByYearHitting?.length || stats?.yearByYearPitching?.length), 'Current and year-by-year data retrieved at viewing time'],
    ['Education record', Boolean(educationCount), educationCount ? `${educationCount} verified institution record${educationCount === 1 ? '' : 's'}` : 'Research has not yet been completed'],
    ['Full-life research', Boolean(research?.timeline?.length >= 4), research?.timeline?.length ? `${research.timeline.length} sourced events` : 'Research has not yet been completed'],
    ['Source review', Boolean(research?.sources?.length >= 2), research?.sources?.length ? `${research.sources.length} biographical evidence links` : 'Awaiting research editor'],
  ]

  els.researchStatus.innerHTML = statuses.map(([title, complete, detail]) => `
    <div class="research-status-item ${complete ? '' : 'pending'}">
      <i aria-hidden="true"></i>
      <div><b>${escapeHtml(title)}</b><span>${escapeHtml(detail)}</span></div>
    </div>
  `).join('')
}

function statValue(stat, keys, fallback = '—') {
  for (const key of keys) {
    if (stat?.[key] !== undefined && stat?.[key] !== null && stat?.[key] !== '') return stat[key]
  }
  return fallback
}

function renderCurrentStats(stats) {
  const hitting = stats.seasonHitting?.[0]?.stat
  const pitching = stats.seasonPitching?.[0]?.stat
  const groups = []

  if (hitting) {
    groups.push({ label: 'AVG', value: statValue(hitting, ['avg']) })
    groups.push({ label: 'HR', value: statValue(hitting, ['homeRuns']) })
    groups.push({ label: 'RBI', value: statValue(hitting, ['rbi']) })
    groups.push({ label: 'OPS', value: statValue(hitting, ['ops']) })
    groups.push({ label: 'SB', value: statValue(hitting, ['stolenBases']) })
  }

  if (pitching) {
    groups.push({ label: 'ERA', value: statValue(pitching, ['era']) })
    groups.push({ label: 'W', value: statValue(pitching, ['wins']) })
    groups.push({ label: 'SO', value: statValue(pitching, ['strikeOuts']) })
    groups.push({ label: 'WHIP', value: statValue(pitching, ['whip']) })
    groups.push({ label: 'SV', value: statValue(pitching, ['saves']) })
  }

  els.seasonBadge.textContent = CURRENT_SEASON
  els.currentStats.innerHTML = groups.length
    ? groups.map(item => `<div class="stat-item"><b>${escapeHtml(item.value)}</b><span>${escapeHtml(item.label)}</span></div>`).join('')
    : '<p class="loading-copy">No current-season statistical split was returned for this player.</p>'
}

function sourceById(research, sourceId) {
  return research?.sources?.find(source => source.id === sourceId)
}

function renderEducation(research) {
  const education = research?.education || []
  if (!education.length) {
    els.educationList.innerHTML = ''
    els.lifeResearchGap.innerHTML = '<strong>Research gap:</strong> MLB Watch has not yet verified this player’s schooling, amateur development, or early-life record. The absence of a record is not evidence that no education occurred.'
    return
  }

  els.educationList.innerHTML = education.map(item => {
    const source = sourceById(research, item.sourceId)
    return `
      <article class="education-card">
        <small>${escapeHtml(item.level)} · ${escapeHtml(item.years)}</small>
        <h4>${escapeHtml(item.institution)}</h4>
        <p>${escapeHtml(item.location)}<br>${escapeHtml(item.details)}</p>
        <footer>Source: ${escapeHtml(source?.publisher || 'Research source')}</footer>
      </article>
    `
  }).join('')

  els.lifeResearchGap.innerHTML = '<strong>Next research layer:</strong> family background, first baseball experience, coaches and scouts, community involvement, off-field work, injuries, personal foundations, and post-career activity should be added only from reliable public sources.'
}

function renderTimeline(research, person) {
  const events = [...(research?.timeline || [])]
  if (!events.some(event => event.label === 'Major League debut') && person?.mlbDebutDate) {
    events.push({
      date: person.mlbDebutDate,
      label: 'Major League debut',
      details: `Official MLB debut date for ${person.fullName}.`,
      category: 'career',
      sourceId: 'mlb-api',
    })
  }

  events.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  els.careerTimeline.innerHTML = events.length
    ? events.map(event => `
        <article class="timeline-event">
          <time datetime="${escapeHtml(event.date)}">${escapeHtml(formatDate(event.date, { compact: true }))}</time>
          <div class="timeline-rail" aria-hidden="true"></div>
          <div class="timeline-card">
            <small>${escapeHtml(event.category || 'record')}</small>
            <h4>${escapeHtml(event.label)}</h4>
            <p>${escapeHtml(event.details)}</p>
          </div>
        </article>
      `).join('')
    : '<div class="research-gap"><strong>Timeline pending:</strong> MLB Watch has official identity data but no completed biographical chronology for this player.</div>'
}

const hittingColumns = [
  ['season', 'Year'], ['team', 'Team'], ['gamesPlayed', 'G'], ['atBats', 'AB'], ['runs', 'R'], ['hits', 'H'],
  ['doubles', '2B'], ['triples', '3B'], ['homeRuns', 'HR'], ['rbi', 'RBI'], ['stolenBases', 'SB'], ['avg', 'AVG'], ['obp', 'OBP'], ['slg', 'SLG'], ['ops', 'OPS'],
]
const pitchingColumns = [
  ['season', 'Year'], ['team', 'Team'], ['gamesPlayed', 'G'], ['gamesStarted', 'GS'], ['wins', 'W'], ['losses', 'L'],
  ['era', 'ERA'], ['inningsPitched', 'IP'], ['strikeOuts', 'SO'], ['baseOnBalls', 'BB'], ['whip', 'WHIP'], ['saves', 'SV'],
]

function tableForSplits(title, splits, columns) {
  if (!splits?.length) return ''
  const rows = splits
    .slice()
    .sort((a, b) => String(b.season || '').localeCompare(String(a.season || '')))
    .map(split => {
      const data = { ...split.stat, season: split.season, team: split.team?.name || split.team?.abbreviation || '—' }
      return `<tr>${columns.map(([key]) => `<td>${escapeHtml(data[key] ?? '—')}</td>`).join('')}</tr>`
    }).join('')

  return `
    <article class="stats-table-card">
      <h4>${escapeHtml(title)}</h4>
      <div class="table-scroll">
        <table>
          <thead><tr>${columns.map(([, label]) => `<th scope="col">${escapeHtml(label)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `
}

function renderStatsTables(stats) {
  const tables = [
    tableForSplits('Year-by-year hitting', stats.yearByYearHitting, hittingColumns),
    tableForSplits('Year-by-year pitching', stats.yearByYearPitching, pitchingColumns),
  ].filter(Boolean)

  els.statsTables.innerHTML = tables.length
    ? tables.join('')
    : '<div class="research-gap"><strong>Statistics unavailable:</strong> MLB’s data service did not return a year-by-year hitting or pitching record for this person.</div>'
}

function renderSources(research, personId) {
  const fixedSources = [
    {
      title: 'MLB Stats API player identity record',
      publisher: 'MLB Advanced Media',
      url: `${MLB_API}/people/${personId}`,
      type: 'live data',
      note: 'Identity, birth information, position, handedness, physical profile, and debut date.',
    },
    {
      title: 'MLB statistics glossary',
      publisher: 'Major League Baseball',
      url: 'https://www.mlb.com/glossary',
      type: 'definitions',
      note: 'Official definitions for standard, advanced, Statcast, transaction, and rule terminology.',
    },
    ...(research?.sources || []).map(source => ({ ...source, note: 'Biographical or education evidence used in the local research dossier.' })),
    {
      title: 'SABR Baseball Biography Project',
      publisher: 'Society for American Baseball Research',
      url: 'https://sabr.org/bioproject/',
      type: 'historical research',
      note: 'Peer-reviewed full-life biographies where a completed player biography is available.',
    },
  ]

  els.sourceRegistry.innerHTML = fixedSources.map(source => `
    <article class="source-card">
      <span class="source-type">${escapeHtml(source.type)}</span>
      <h4>${escapeHtml(source.title)}</h4>
      <p>${escapeHtml(source.publisher)}<br>${escapeHtml(source.note)}</p>
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source ↗</a>
    </article>
  `).join('')
}

async function loadPlayer(personId) {
  state.activePlayerId = String(personId)
  state.activeResearch = state.researchProfiles[String(personId)] || null
  setBusy('Retrieving MLB record')
  els.dossierEmpty.hidden = true
  els.dossierApp.hidden = false
  els.dossierApp.setAttribute('aria-busy', 'true')

  try {
    const [person, stats] = await Promise.all([
      fetchPerson(personId),
      fetchAllStats(personId),
    ])

    if (!person) throw new Error('Player record not found')
    state.activeMlbProfile = person
    state.activeStats = stats

    renderIdentity(person, state.activeResearch)
    renderCoverage(person, state.activeResearch, stats)
    renderCurrentStats(stats)
    renderEducation(state.activeResearch)
    renderTimeline(state.activeResearch, person)
    renderStatsTables(stats)
    renderSources(state.activeResearch, personId)

    els.dataState.textContent = `Live data loaded · ${CURRENT_SEASON}`
    els.dossierApp.removeAttribute('aria-busy')
    document.querySelector('#profile').scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (error) {
    console.error(error)
    els.dataState.textContent = 'Player data unavailable'
    els.currentStats.innerHTML = `<p class="loading-copy">${escapeHtml(error.message)}</p>`
  }
}

async function getSearchCandidates(query) {
  const local = Object.values(state.researchProfiles)
    .filter(profile => profile.slug.replaceAll('-', ' ').includes(query.toLowerCase()))
    .map(profile => ({ id: profile.mlbId, fullName: profile.slug.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(' '), source: 'researched' }))

  try {
    const data = await fetchJson(`${MLB_API}/people/search?names=${encodeURIComponent(query)}`)
    const people = (data.people || []).map(person => ({
      id: person.id,
      fullName: person.fullName,
      source: state.researchProfiles[String(person.id)] ? 'researched' : 'official data',
      detail: [person.primaryPosition?.name, person.birthDate ? `born ${person.birthDate}` : ''].filter(Boolean).join(' · '),
    }))
    const merged = [...local, ...people]
    return [...new Map(merged.map(item => [item.id, item])).values()].slice(0, 12)
  } catch (searchError) {
    console.warn('Direct player search failed; trying current player index.', searchError)
  }

  if (!state.playerIndex) {
    try {
      const data = await fetchJson(`${MLB_API}/sports/1/players?season=${CURRENT_SEASON}`)
      state.playerIndex = data.people || []
    } catch (indexError) {
      console.warn('Current player index unavailable.', indexError)
      state.playerIndex = []
    }
  }

  const currentMatches = state.playerIndex
    .filter(person => person.fullName?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12)
    .map(person => ({ id: person.id, fullName: person.fullName, source: 'current roster index', detail: person.primaryPosition?.name }))

  const merged = [...local, ...currentMatches]
  return [...new Map(merged.map(item => [item.id, item])).values()].slice(0, 12)
}

function renderSearchResults(results) {
  if (!results.length) {
    els.searchResults.hidden = false
    els.searchResults.innerHTML = '<div class="research-gap">No matching record was returned. Try a full name, surname, or a featured profile.</div>'
    return
  }

  els.searchResults.hidden = false
  els.searchResults.innerHTML = results.map(person => `
    <button type="button" class="search-result" data-search-player-id="${escapeHtml(person.id)}">
      <strong>${escapeHtml(person.fullName)}</strong>
      <span>${escapeHtml([person.detail, person.source].filter(Boolean).join(' · '))}</span>
    </button>
  `).join('')

  els.searchResults.querySelectorAll('[data-search-player-id]').forEach(button => {
    button.addEventListener('click', () => {
      els.searchResults.hidden = true
      loadPlayer(button.dataset.searchPlayerId)
    })
  })
}

function activateTab(tabName) {
  els.tabs.forEach(tab => {
    const active = tab.dataset.tab === tabName
    tab.classList.toggle('active', active)
    tab.setAttribute('aria-selected', String(active))
  })
  els.panels.forEach(panel => {
    const active = panel.dataset.panel === tabName
    panel.classList.toggle('active', active)
    panel.hidden = !active
  })
}

function bindEvents() {
  els.menuButton.addEventListener('click', () => {
    const open = els.primaryNav.classList.toggle('open')
    els.menuButton.setAttribute('aria-expanded', String(open))
  })

  els.featuredPlayers.forEach(button => {
    button.addEventListener('click', () => loadPlayer(button.dataset.playerId))
  })

  els.searchForm.addEventListener('submit', async event => {
    event.preventDefault()
    const query = els.searchInput.value.trim()
    if (query.length < 2) {
      els.searchStatus.textContent = 'Enter at least two letters of a player name.'
      return
    }

    els.searchStatus.textContent = `Searching baseball records for “${query}”…`
    els.searchResults.hidden = true
    try {
      const results = await getSearchCandidates(query)
      renderSearchResults(results)
      els.searchStatus.textContent = `${results.length} possible record${results.length === 1 ? '' : 's'} found.`
    } catch (error) {
      els.searchStatus.textContent = `Search unavailable: ${error.message}`
    }
  })

  els.tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab.dataset.tab)))
}

async function initialize() {
  bindEvents()
  try {
    await loadResearchProfiles()
    els.searchStatus.textContent = 'Research profiles loaded. Live MLB data will be requested only when you open a player.'
    await loadPlayer(592450)
  } catch (error) {
    console.error(error)
    els.searchStatus.textContent = `Research index unavailable: ${error.message}`
  }
}

initialize()
