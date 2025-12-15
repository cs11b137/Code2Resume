import type { GenerateRequest, GenerateResponse } from './schema.js';
import type { ParsedSignals, SignalType } from './parser.js';

function stableHash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, count: number) {
  if (arr.length === 0) return [];
  const out: T[] = [];
  let x = seed;
  for (let i = 0; i < count; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    out.push(arr[x % arr.length]!);
  }
  return out;
}

function uniq<T>(arr: T[]) {
  return [...new Set(arr)];
}

function zhVerb(style: GenerateRequest['style']) {
  if (style === 'aggressive') return ['主导', '推动', '落地', '重构', '打造', '端到端实现'];
  if (style === 'conservative') return ['参与', '协助', '支持', '实现', '优化', '维护'];
  return ['负责', '实现', '优化', '落地', '改造', '完善'];
}

function enVerb(style: GenerateRequest['style']) {
  if (style === 'aggressive') return ['Led', 'Drove', 'Delivered', 'Re-architected', 'Built', 'Implemented end-to-end'];
  if (style === 'conservative') return ['Contributed to', 'Assisted with', 'Supported', 'Implemented', 'Improved', 'Maintained'];
  return ['Owned', 'Implemented', 'Optimized', 'Delivered', 'Refactored', 'Improved'];
}

function buildBulletZh(
  verb: string,
  projectName: string,
  tech: string[],
  type: SignalType,
  evidence: string | undefined,
) {
  const techPart = tech.length ? `（${tech.slice(0, 4).join('/')}）` : '';
  const typePart =
    type === 'feat'
      ? '核心功能交付'
      : type === 'perf'
        ? '性能优化'
        : type === 'fix'
          ? '缺陷修复与稳定性'
          : type === 'security'
            ? '安全合规'
            : '工程化与协作流程';

  const evidencePart = evidence ? `；基于材料：${evidence.slice(0, 80)}` : '';
  const metricPart =
    type === 'perf'
      ? '，在缺少精确指标的前提下，预期带来可感知的响应速度与资源占用改善'
      : '';
  return `${verb}${projectName}${typePart}${techPart}${metricPart}${evidencePart}`;
}

function buildBulletEn(
  verb: string,
  projectName: string,
  tech: string[],
  type: SignalType,
  evidence: string | undefined,
) {
  const techPart = tech.length ? ` (${tech.slice(0, 4).join('/')})` : '';
  const typePart =
    type === 'feat'
      ? 'key feature delivery'
      : type === 'perf'
        ? 'performance optimization'
        : type === 'fix'
          ? 'bug fixes & reliability'
          : type === 'security'
            ? 'security/compliance'
            : 'developer experience & engineering';

  const evidencePart = evidence ? `; evidence: ${evidence.slice(0, 100)}` : '';
  const metricPart =
    type === 'perf'
      ? ', with conservative wording due to missing precise metrics'
      : '';
  return `${verb} ${projectName} ${typePart}${techPart}${metricPart}${evidencePart}`.replace(/\s+/g, ' ');
}

export function generateMock(input: GenerateRequest, parsed: ParsedSignals, model: string): GenerateResponse {
  const seed = stableHash(`${input.projectName}|${input.techStack}|${input.material}|${input.count}|${input.style}|${input.language}`);

  const tech = uniq(
    [input.techStack || '', ...parsed.extractedTech]
      .join(',')
      .split(/[,\n/| ]+/g)
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const types: SignalType[] = ['feat', 'perf', 'fix', 'dx', 'security'];
  const pickedTypes = pick(types, seed, input.count);

  const verbs = input.language === 'en' ? enVerb(input.style) : zhVerb(input.style);
  const bullets = pickedTypes.map((t, idx) => {
    const verb = verbs[idx % verbs.length]!;
    const evidence = parsed.byType[t][idx % Math.max(1, parsed.byType[t].length)];
    return input.language === 'en'
      ? buildBulletEn(verb, input.projectName, tech, t, evidence)
      : buildBulletZh(verb, input.projectName, tech, t, evidence);
  });

  const stars = bullets.map((b, i) => {
    if (input.language === 'en') {
      return {
        situation: `In ${input.projectName}, the team needed to turn repository changes into resume-ready highlights quickly.`,
        task: `Summarize the work into a STAR-format statement (#${i + 1}) aligned with actual engineering signals.`,
        action: `Parsed materials into feat/perf/fix/security/dx signals and generated structured bullets with tech stack coverage.`,
        result: `Produced an interview-ready highlight: ${b}`,
      };
    }
    return {
      situation: `在 ${input.projectName} 项目中，需要将提交/PR/发布说明等材料快速沉淀为可用于简历的项目亮点。`,
      task: `将工程信号抽取并组织为 STAR 风格表达（第 ${i + 1} 条），同时确保技术栈命中。`,
      action: `对材料进行信号分类（feat/perf/fix/security/dx），结构化提取要点并生成动词开头的项目亮点。`,
      result: `形成可面试表达的亮点：${b}`,
    };
  });

  const metrics = uniq([
    ...parsed.extractedMetricsHints.map((m) => (input.language === 'en' ? `Mentioned metric hint: ${m}` : `材料中出现指标线索：${m}`)),
    ...(parsed.byType.perf.length > 0
      ? [input.language === 'en' ? 'Latency / throughput improvement (needs exact numbers)' : '延迟/吞吐优化（需要补充精确数字）']
      : []),
  ]).slice(0, 8);

  const skills = uniq(
    [
      ...tech.map((t) => t.replace(/^./, (c) => c.toUpperCase())),
      ...(parsed.byType.dx.length ? ['CI/CD', 'Testing', 'Linting'] : []),
      ...(parsed.byType.security.length ? ['Security', 'Compliance'] : []),
    ].filter(Boolean),
  ).slice(0, 12);

  const assumptions: string[] = [];
  const missing_info_questions: string[] = [];

  if (parsed.byType.perf.length > 0 && parsed.extractedMetricsHints.length === 0) {
    assumptions.push(
      input.language === 'en'
        ? 'Assumption: performance improvements were user-noticeable, but exact p95/p99 metrics are unavailable.'
        : '假设：存在用户可感知的性能改善，但缺少 p95/p99 等精确指标。',
    );
    missing_info_questions.push(
      input.language === 'en'
        ? 'What were the before/after latency or throughput numbers (p95/p99, QPS/RPS)?'
        : '性能优化前后有哪些量化数据（如 p95/p99、QPS/RPS）？',
    );
  }

  if (parsed.byType.security.length > 0) {
    missing_info_questions.push(
      input.language === 'en'
        ? 'Which compliance/security standard was targeted (e.g., GDPR/SOC2), and what audit artifacts were produced?'
        : '安全合规具体对齐了哪些标准（如等保/GDPR/SOC2），产出了哪些审计材料？',
    );
  }

  const risks = uniq([
    input.language === 'en'
      ? 'Risk: overstating impact without verified metrics; keep wording conservative until numbers are confirmed.'
      : '风险：缺少可验证指标时容易夸大收益，需要保持保守表述并补齐数据来源。',
    ...(parsed.byType.dx.length
      ? [input.language === 'en' ? 'Risk: process changes may require team adoption and documentation.' : '风险：流程/工程化变更需要团队共识与配套文档。']
      : []),
  ]).slice(0, 6);

  return {
    bullets,
    stars,
    skills,
    metrics,
    risks,
    assumptions,
    missing_info_questions,
    meta: {
      language: input.language,
      style: input.style,
      createdAt: new Date().toISOString(),
      model,
      mockMode: true,
    },
  };
}

