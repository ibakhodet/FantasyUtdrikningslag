import type { Rule } from '../types';

export const CATEGORIES = [
  { id: 'stian',    label: 'Ting med Stian', sub: 'Ekstrapoeng for hva du får brudgommen til å gjøre' },
  { id: 'drikking', label: 'Drikking',       sub: 'Øl, shots, søl og spandering' },
  { id: 'mot',      label: 'Mot & galskap',  sub: 'Modige og ville påfunn' },
  { id: 'oslo',     label: 'Oslo',           sub: 'By-temaet' },
  { id: 'diverse',  label: 'Diverse',        sub: 'Resten' },
  { id: 'egen',     label: 'Egne regler',    sub: 'Lagt til av Martin under turen' },
] as const;

export const RULES: Rule[] = [
  // Ting med Stian
  { id: 'stian-angre',     label: 'Få Stian til å gjøre noe han angrer på',  pts: 30, cat: 'stian', highlight: true },
  { id: 'stian-baere',     label: 'Bære Stian fra pub til pub',              pts: 25, cat: 'stian', highlight: true },
  { id: 'stian-bord',      label: 'Stian danser på bordet',                  pts: 25, cat: 'stian' },

  // Drikking
  { id: 'sosial-runde',    label: 'Spander en runde til alle',               pts: 30, cat: 'drikking', highlight: true },
  { id: 'drikk-tale',      label: 'Skål-tale for Stian',                     pts: 15, cat: 'drikking' },
  { id: 'sosial-pils',     label: 'Spander en pils til en',                  pts: 10, cat: 'drikking' },
  { id: 'drikk-lek',       label: 'Vinn en drikkelek',                       pts: 10, cat: 'drikking' },
  { id: 'minus-soler',     label: 'Søler drikke',                            pts: -5, cat: 'drikking' },
  { id: 'minus-nei-shots', label: 'Sier nei til en runde shots',             pts: -5, cat: 'drikking' },

  // Mot & galskap
  { id: 'mod-kastes-ut',   label: 'Bli kastet ut av utested',                pts: 25, cat: 'mot' },
  { id: 'sosial-alldans',  label: 'By opp til allsang eller alldans',        pts: 25, cat: 'mot' },
  { id: 'mod-bestiller',   label: 'Bestill noe ingen andre tør',             pts: 15, cat: 'mot' },

  // Oslo
  { id: 'oslo-dukkert',    label: 'Ta en dukkert i Oslofjorden',             pts: 10, cat: 'oslo' },
  { id: 'minus-osloneg',   label: 'Snakker stygt om Oslo',                   pts: -10, cat: 'oslo' },

  // Diverse
  { id: 'natt-sist',       label: 'Sist i seng',                             pts: 10,  cat: 'diverse' },
  { id: 'minus-klager',    label: 'Klager høylydt',                          pts: -5,  cat: 'diverse' },
  { id: 'minus-flaua',     label: 'Flaua seg ut',                            pts: -10, cat: 'diverse' },
  { id: 'minus-dama',      label: 'Snakker lenge med dama si',               pts: -10, cat: 'diverse' },
  { id: 'div-jobbmail',    label: 'Sjekker jobbmail på byen',                pts: -10, cat: 'diverse' },
  { id: 'div-sovner',      label: 'Sovner på utested',                       pts: -15, cat: 'diverse' },
  { id: 'minus-mister',    label: 'Mister noe (lommebok, telefon, verdighet)', pts: -20, cat: 'diverse' },
  { id: 'natt-forst',      label: 'Først i seng',                            pts: -5,  cat: 'diverse' },
];

export const RULES_BY_ID: Record<string, Rule> = Object.fromEntries(RULES.map((r) => [r.id, r]));
