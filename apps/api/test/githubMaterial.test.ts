import { describe, expect, it } from 'vitest';
import { buildMaterialFromGitHubData, normalizeRepoSlug } from '../src/lib/github.js';

describe('github material builder', () => {
  it('normalizes repo slug from URL', () => {
    const r = normalizeRepoSlug('https://github.com/openai/openai-node/');
    expect(r.slug).toBe('openai/openai-node');
  });

  it('builds stable material text', () => {
    const material = buildMaterialFromGitHubData({
      repo: 'owner/name',
      commits: [
        { sha: 'a', html_url: 'x', commit: { message: 'feat: add api\n\nbody' } },
        { sha: 'b', html_url: 'y', commit: { message: 'fix: crash on null' } },
      ],
      pulls: [
        {
          number: 12,
          title: 'perf: cache parser',
          body: 'This improves latency.\n\nDetails...',
          html_url: 'z',
          state: 'closed',
          merged_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    expect(material).toContain('GitHub Repo: owner/name');
    expect(material).toContain('commit log:');
    expect(material).toContain('- feat: add api');
    expect(material).toContain('PRs:');
    expect(material).toContain('- #12 [merged] perf: cache parser');
    expect(material).toContain('body: This improves latency.');
  });
});

