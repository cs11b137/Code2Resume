export type ResumeSection =
  | { type: 'title'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'text'; text: string };

export function parseMarkdownToSections(md: string): ResumeSection[] {
  const lines = md.split(/\r?\n/g);
  const out: ResumeSection[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;

    if (line.startsWith('# ')) {
      out.push({ type: 'title', text: line.slice(2).trim() });
      continue;
    }
    if (line.startsWith('## ')) {
      out.push({ type: 'h2', text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith('### ')) {
      out.push({ type: 'h3', text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith('- ')) {
      out.push({ type: 'bullet', text: line.slice(2).trim() });
      continue;
    }
    if (line.startsWith('> ')) {
      out.push({ type: 'quote', text: line.slice(2).trim() });
      continue;
    }

    out.push({ type: 'text', text: line.trim() });
  }

  return out;
}

