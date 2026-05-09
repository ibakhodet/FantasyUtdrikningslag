import type { Rule } from '../types';

export const CATEGORIES = [
  { id: 'gruppe', label: 'Gruppeutfordringer', sub: 'Alle scorer når oppdraget løses' },
  { id: 'stian',  label: 'Stian-events',       sub: 'Ekstrapoeng for hva du gjør for brudgommen' },
  { id: 'pluss',  label: 'Pluss',              sub: 'Bra oppførsel' },
  { id: 'sosial', label: 'Sosialt',            sub: 'Bli kjent med Oslo' },
  { id: 'mod',    label: 'Modige sjeler',      sub: 'Tør du?' },
  { id: 'oslo',   label: 'Oslo-knebøy',        sub: 'Bare i hovedstaden' },
  { id: 'natt',   label: 'Natt',               sub: 'Sengetid' },
  { id: 'minus',  label: 'Minus',              sub: 'Ikke gjør dette' },
] as const;

export const RULES: Rule[] = [
  // Gruppeutfordringer (alle scorer)
  { id: 'gru-trikkbilde',  label: 'Alle syv på ett bilde med en trikk i bevegelse i bakgrunnen', pts: 5,  cat: 'gruppe', group: true },
  { id: 'gru-bartender',   label: 'Få en bartender til å ta en shot med gruppa',                  pts: 20, cat: 'gruppe', group: true, repeat: true },
  { id: 'gru-karaoke',     label: 'Karaoke en hel sang på norsk',                                 pts: 15, cat: 'gruppe', group: true, repeat: true },

  // Stian-events
  { id: 'stian-angre',     label: 'Får Stian til å gjøre noe han angrer på', pts: 30, cat: 'stian', repeat: true, highlight: true },
  { id: 'stian-baere',     label: 'Bærer Stian fra A til B',                  pts: 25, cat: 'stian', repeat: true, highlight: true },

  // Pluss
  { id: 'pluss-finner',    label: 'Finner andres ting',                      pts: 10, cat: 'pluss', repeat: true },
  { id: 'pluss-ansvar',    label: 'Tar ansvar for gruppa',                   pts: 10, cat: 'pluss', repeat: true },

  // Sosialt
  { id: 'sosial-runde',    label: 'Spanderer en runde til alle',             pts: 30, cat: 'sosial', repeat: true, highlight: true },
  { id: 'sosial-pils',     label: 'Spanderer en pils til en',                pts: 10, cat: 'sosial', repeat: true },
  { id: 'sosial-alldans',  label: 'Byr opp til alldans',                     pts: 25, cat: 'sosial', repeat: true },
  { id: 'sosial-allsang',  label: 'Byr opp til allsang',                     pts: 25, cat: 'sosial', repeat: true },

  // Modige sjeler
  { id: 'mod-bestiller',   label: 'Bestiller noe ingen andre tør',           pts: 15, cat: 'mod',   repeat: true },
  { id: 'mod-drikker',     label: 'Drikker noe ukjent valgt av andre',       pts: 20, cat: 'mod',   repeat: true },
  { id: 'mod-kastes-ut',   label: 'Kastes ut av utested',                    pts: 25, cat: 'mod',   repeat: true },

  // Oslo-knebøy
  { id: 'oslo-dukkert',    label: 'Tar en dukkert i Oslofjorden',            pts: 30, cat: 'oslo',  repeat: true },
  { id: 'oslo-korsen',     label: 'Spør osloværing om veien "korsen"',       pts: 5,  cat: 'oslo',  repeat: true },

  // Natt
  { id: 'natt-sist',       label: 'Sist i seng',                             pts: 10, cat: 'natt' },
  { id: 'natt-forst',      label: 'Først i seng',                            pts: -5, cat: 'natt' },

  // Minus
  { id: 'minus-flaua',     label: 'Flaua seg ut',                            pts: -10, cat: 'minus', repeat: true },
  { id: 'minus-sovner',    label: 'Sovne før midnatt',                       pts: -15, cat: 'minus', repeat: true },
  { id: 'minus-soler',     label: 'Søle drikke',                             pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-samme',     label: 'Bestille samme drikke to ganger på rad',  pts: -3,  cat: 'minus', repeat: true },
  { id: 'minus-klager',    label: 'Klager',                                  pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-mister',    label: 'Mister noe (lommebok, telefon, verdighet)', pts: -20, cat: 'minus', repeat: true },
  { id: 'minus-nei-shots', label: 'Sier nei til en runde shots',             pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-osloneg',   label: 'Snakker stygt om Oslo',                   pts: -10, cat: 'minus', repeat: true },
];

export const RULES_BY_ID: Record<string, Rule> = Object.fromEntries(RULES.map((r) => [r.id, r]));
