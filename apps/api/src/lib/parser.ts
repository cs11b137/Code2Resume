export type SignalType = 'feat' | 'perf' | 'fix' | 'security' | 'dx';

export type ParsedSignals = {
  byType: Record<SignalType, string[]>;
  rawLines: string[];
  extractedTech: string[];
  extractedMetricsHints: string[];
};

const TECH_KEYWORDS = [
  'vue',
  'vue3',
  'react',
  'next.js',
  'node',
  'fastify',
  'express',
  'typescript',
  'javascript',
  'tailwind',
  'vite',
  'pinia',
  'redis',
  'postgres',
  'mysql',
  'mongodb',
  'kafka',
  'grpc',
  'rest',
  'graphql',
  'docker',
  'kubernetes',
  'ci',
  'cd',
  'github actions',
  'jest',
  'vitest',
  'eslint',
  'prettier',
  'observability',
  'opentelemetry',
];

const METRIC_HINT_RE =
  /(\b\d+(\.\d+)?\s?(ms|s|%|x|倍|秒|毫秒|qps|rps|tps|kb|mb|gb)\b)|(\b(p95|p99|sla|slo|apdex)\b)/i;

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim();
}

function classifyLine(line: string): SignalType {
  const l = line.toLowerCase();
  if (/(cve|xss|csrf|sql injection|oauth|authz|authn|rbac|encrypt|encryption|security|compliance|gdpr|pci|sox|audit)/i.test(l)) {
    return 'security';
  }
  if (/(perf|performance|optimi[sz]e|latency|throughput|cache|memory|p95|p99|qps|rps|tps)/i.test(l)) {
    return 'perf';
  }
  if (/(fix|bug|hotfix|regress|issue|crash|null|exception|incorrect|typo)/i.test(l)) {
    return 'fix';
  }
  if (/(refactor|ci|cd|pipeline|lint|format|test|coverage|devex|dx|tooling|build|release|monorepo|rollup|webpack|vite|eslint|prettier|storybook)/i.test(l)) {
    return 'dx';
  }
  return 'feat';
}

export function parseMaterial(material: string): ParsedSignals {
  const rawLines = material
    .split(/\r?\n/g)
    .map(normalizeLine)
    .filter((l) => l.length > 0);

  const byType: ParsedSignals['byType'] = { feat: [], perf: [], fix: [], security: [], dx: [] };
  const extractedTech = new Set<string>();
  const extractedMetricsHints = new Set<string>();

  for (const line of rawLines) {
    const type = classifyLine(line);
    byType[type].push(line);

    const lower = line.toLowerCase();
    for (const k of TECH_KEYWORDS) {
      if (lower.includes(k)) extractedTech.add(k);
    }
    const match = line.match(METRIC_HINT_RE);
    if (match) extractedMetricsHints.add(match[0]);
  }

  return {
    byType,
    rawLines,
    extractedTech: [...extractedTech].map((x) => x.trim()).filter(Boolean),
    extractedMetricsHints: [...extractedMetricsHints].map((x) => x.trim()).filter(Boolean),
  };
}

