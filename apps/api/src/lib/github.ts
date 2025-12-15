import { z } from 'zod';
import { fetchMaterialRequestSchema } from './schema.js';

export type FetchMaterialRequest = z.infer<typeof fetchMaterialRequestSchema>;

type GitHubCommitListItem = {
  sha: string;
  commit: { message: string };
  html_url: string;
};

type GitHubPullListItem = {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  merged_at: string | null;
};

export function normalizeRepoSlug(repo: string): { owner: string; name: string; slug: string } {
  const trimmed = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
  const m = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!m) throw new Error('Invalid repo. Expected "owner/name" (or a GitHub repo URL).');
  const owner = m[1]!;
  const name = m[2]!;
  return { owner, name, slug: `${owner}/${name}` };
}

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'code2resume',
  };
  if (token && token.trim()) headers.authorization = `Bearer ${token.trim()}`;
  return headers;
}

function truncateBody(text: string, maxLen: number) {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

export function buildMaterialFromGitHubData(args: {
  repo: string;
  commits: GitHubCommitListItem[];
  pulls: GitHubPullListItem[];
}) {
  const lines: string[] = [];
  lines.push(`GitHub Repo: ${args.repo}`);
  lines.push('');

  lines.push('commit log:');
  if (args.commits.length === 0) {
    lines.push('- (none)');
  } else {
    for (const c of args.commits) {
      const msg = c.commit?.message ? c.commit.message.split('\n')[0]!.trim() : '(no message)';
      lines.push(`- ${msg}`);
    }
  }

  lines.push('');
  lines.push('PRs:');
  if (args.pulls.length === 0) {
    lines.push('- (none)');
  } else {
    for (const pr of args.pulls) {
      const state =
        pr.merged_at ? 'merged' : pr.state === 'closed' ? 'closed' : pr.state === 'open' ? 'open' : pr.state;
      lines.push(`- #${pr.number} [${state}] ${pr.title}`);
      if (pr.body && pr.body.trim()) {
        lines.push(`  body: ${truncateBody(pr.body, 800)}`);
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

async function ghGetJson<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders(token) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = `GitHub API error: ${res.status} ${res.statusText} ${text}`.trim();
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function fetchGitHubMaterial(input: FetchMaterialRequest) {
  const { owner, name, slug: repoSlug } = normalizeRepoSlug(input.repo);
  const base = 'https://api.github.com';

  const commitUrl = `${base}/repos/${owner}/${name}/commits?per_page=${input.commitCount}`;
  const pullUrl = `${base}/repos/${owner}/${name}/pulls?state=all&per_page=${input.prCount}&sort=updated&direction=desc`;

  const [commits, pulls] = await Promise.all([
    ghGetJson<GitHubCommitListItem[]>(commitUrl, input.token),
    ghGetJson<GitHubPullListItem[]>(pullUrl, input.token),
  ]);

  const material = buildMaterialFromGitHubData({
    repo: repoSlug,
    commits: commits ?? [],
    pulls: pulls ?? [],
  });

  return {
    repo: repoSlug,
    material,
    counts: {
      commits: (commits ?? []).length,
      prs: (pulls ?? []).length,
    },
    createdAt: new Date().toISOString(),
  };
}
