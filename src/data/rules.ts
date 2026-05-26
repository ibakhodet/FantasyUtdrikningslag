import type { Rule } from '../types';

export const CATEGORIES = [
  { id: 'gruppe', label: 'Gruppeutfordringer', sub: 'Alle scorer når oppdraget løses' },
  { id: 'stian',  label: 'Stian-events',       sub: 'Ekstrapoeng for hva du gjør for brudgommen' },
  { id: 'pluss',  label: 'Pluss',              sub: 'God oppførsel og modige valg' },
  { id: 'minus',  label: 'Minus',              sub: 'Ikke gjør dette' },
  { id: 'egen',   label: 'Egne regler',        sub: 'Lagt til av Martin under turen' },
] as const;

export const RULES: Rule[] = [
  // Gruppeutfordringer (alle scorer)
  { id: 'gru-alle-syv',    label: 'Gruppeselfie med alle sju',                              pts: 5,  cat: 'gruppe', group: true },

  // Stian-events
  { id: 'stian-angre',     label: 'Få Stian til å gjøre noe han angrer på',                pts: 30, cat: 'stian', repeat: true, highlight: true },
  { id: 'stian-baere',     label: 'Bær Stian fra A til B',                                 pts: 25, cat: 'stian', repeat: true, highlight: true },

  // Pluss
  { id: 'pluss-ansvar',    label: 'Ta ansvar for gruppa',                                   pts: 10, cat: 'pluss', repeat: true },
  { id: 'pluss-finner',    label: 'Finn andres ting',                                       pts: 10, cat: 'pluss', repeat: true },
  { id: 'oslo-dukkert',    label: 'Ta en dukkert i Oslofjorden',                            pts: 30, cat: 'pluss', repeat: true },
  { id: 'oslo-korsen',     label: 'Spør osloværing om veien "korsen"',                      pts: 5,  cat: 'pluss', repeat: true },
  { id: 'sosial-runde',    label: 'Spander en runde til alle',                              pts: 30, cat: 'pluss', repeat: true, highlight: true },
  { id: 'sosial-pils',     label: 'Spander en pils til en',                                 pts: 10, cat: 'pluss', repeat: true },
  { id: 'sosial-alldans',  label: 'By opp til allsang eller alldans',                       pts: 25, cat: 'pluss', repeat: true },
  { id: 'mod-bestiller',   label: 'Bestill noe ingen andre tør',                            pts: 15, cat: 'pluss', repeat: true },
  { id: 'mod-drikker',     label: 'Drikk noe ukjent valgt av andre',                        pts: 20, cat: 'pluss', repeat: true },
  { id: 'mod-kastes-ut',   label: 'Bli kastet ut av utested',                               pts: 25, cat: 'pluss', repeat: true },

  // Minus
  { id: 'minus-flaua',     label: 'Flaua seg ut',                                           pts: -10, cat: 'minus', repeat: true },
  { id: 'minus-soler',     label: 'Søler drikke',                                           pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-samme',     label: 'Bestiller samme drikke to ganger på rad',                pts: -3,  cat: 'minus', repeat: true },
  { id: 'minus-klager',    label: 'Klager',                                                  pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-mister',    label: 'Mister noe (lommebok, telefon, verdighet)',               pts: -20, cat: 'minus', repeat: true },
  { id: 'minus-nei-shots', label: 'Sier nei til en runde shots',                            pts: -5,  cat: 'minus', repeat: true },
  { id: 'minus-osloneg',   label: 'Snakker stygt om Oslo',                                  pts: -10, cat: 'minus', repeat: true },
  { id: 'minus-dama',      label: 'Tok en lang samtale med dama si',                        pts: -10, cat: 'minus', repeat: true },
  { id: 'minus-packraft',  label: 'Falt utti under packrafting',                            pts: -10, cat: 'minus', repeat: true },
  { id: 'natt-sist',       label: 'Sist i seng',                                            pts: 10,  cat: 'minus' },
  { id: 'natt-forst',      label: 'Først i seng',                                           pts: -5,  cat: 'minus' },
];

export const RULES_BY_ID: Record<string, Rule> = Object.fromEntries(RULES.map((r) => [r.id, r]));
