/**
 * Skill (04 §5). Grouped by proficiency, using Muhammed's own framing from
 * Discovery ("Strong / Good / Learning / Interested in") rather than an
 * invented percentage or star rating — a five-bar "85% Angular" graphic is
 * exactly the unverifiable claim brand doc §9 Rule 4 rules out.
 *
 * Records, not a hardcoded list: the brief itself flags this belongs in the
 * dashboard (brief §11).
 */
export type SkillCategory =
  | 'language'
  | 'framework'
  | 'state-data'
  | 'data-viz'
  | 'practice'
  | 'tooling';

export type SkillLevel = 'strong' | 'good' | 'learning' | 'interested';

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategory;
  readonly level: SkillLevel;
}
