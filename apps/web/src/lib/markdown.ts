import type { GenerateResponseBody } from '../types/api';

export function toMarkdown(projectName: string, out: GenerateResponseBody) {
  const lines: string[] = [];
  lines.push(`# ${projectName}`);
  lines.push('');
  lines.push('## Highlights');
  for (const b of out.bullets) lines.push(`- ${b}`);
  lines.push('');
  lines.push('## STAR');
  out.stars.forEach((s, idx) => {
    lines.push('');
    lines.push(`### STAR ${idx + 1}`);
    lines.push(`- Situation: ${s.situation}`);
    lines.push(`- Task: ${s.task}`);
    lines.push(`- Action: ${s.action}`);
    lines.push(`- Result: ${s.result}`);
  });
  lines.push('');
  lines.push('## Skills');
  lines.push(out.skills.length ? out.skills.map((x) => `- ${x}`).join('\n') : '- (none)');
  lines.push('');
  lines.push('## Metrics');
  lines.push(out.metrics.length ? out.metrics.map((x) => `- ${x}`).join('\n') : '- (none)');
  lines.push('');
  lines.push('## Risks');
  lines.push(out.risks.length ? out.risks.map((x) => `- ${x}`).join('\n') : '- (none)');
  lines.push('');
  lines.push('## Assumptions');
  lines.push(out.assumptions.length ? out.assumptions.map((x) => `- ${x}`).join('\n') : '- (none)');
  lines.push('');
  lines.push('## Missing Info Questions');
  lines.push(
    out.missing_info_questions.length
      ? out.missing_info_questions.map((x) => `- ${x}`).join('\n')
      : '- (none)',
  );
  lines.push('');
  lines.push(
    `> meta: language=${out.meta.language} style=${out.meta.style} model=${out.meta.model} mockMode=${String(out.meta.mockMode)}`,
  );
  lines.push('');
  return lines.join('\n');
}

