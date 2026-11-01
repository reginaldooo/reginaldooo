import { config } from './config.js';

const ENDPOINT = 'https://api.github.com/graphql';
/** GitHub caps a contributionsCollection window at one year. */
const WINDOW_DAYS = 364;
const DAY_MS = 86_400_000;

export interface RepoActivity {
  readonly owner: string;
  readonly name: string;
  readonly language: string | null;
  readonly commits: number;
}

export interface RawProfile {
  readonly id: string;
  readonly createdAt: string;
  readonly commits: number;
  readonly pullRequests: number;
  readonly issues: number;
  readonly calendar: readonly { readonly date: string; readonly count: number }[];
  readonly repos: readonly RepoActivity[];
  readonly commitTimes: readonly string[];
}

interface GraphQLResponse<T> {
  readonly data?: T;
  readonly errors?: readonly { readonly message: string }[];
}

async function graphql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-profile-cards',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status} ${res.statusText}. Check that the token is valid.`);
  }
  const body = (await res.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  if (!body.data) throw new Error('GitHub API returned no data.');
  return body.data;
}

const VIEWER_QUERY = `
query ($from: DateTime!, $to: DateTime!) {
  viewer {
    id
    createdAt
    contributionsCollection(from: $from, to: $to) {
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

interface ViewerResponse {
  readonly viewer: {
    readonly id: string;
    readonly createdAt: string;
    readonly contributionsCollection: {
      readonly totalPullRequestContributions: number;
      readonly totalIssueContributions: number;
      readonly contributionCalendar: {
        readonly weeks: readonly {
          readonly contributionDays: readonly { readonly date: string; readonly contributionCount: number }[];
        }[];
      };
    };
  };
}

/**
 * GitHub hides per-repo detail for private contributions, so repos are read
 * directly (the token owner has access) and commits counted by author.
 */
const REPOS_QUERY = `
query ($id: ID!, $since: GitTimestamp!, $after: String) {
  viewer {
    repositories(first: 50, after: $after, ownerAffiliations: [OWNER, COLLABORATOR], orderBy: { field: PUSHED_AT, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        owner { login }
        primaryLanguage { name }
        defaultBranchRef { target { ... on Commit {
          history(author: { id: $id }, since: $since, first: ${config.commitsPerRepo}) {
            totalCount
            nodes { committedDate }
          }
        } } }
      }
    }
  }
}`;

export interface RepoNode {
  readonly name: string;
  readonly owner: { readonly login: string };
  readonly primaryLanguage: { readonly name: string } | null;
  readonly defaultBranchRef: {
    readonly target: {
      readonly history?: {
        readonly totalCount: number;
        readonly nodes: readonly { readonly committedDate: string }[];
      };
    };
  } | null;
}

interface ReposResponse {
  readonly viewer: {
    readonly repositories: {
      readonly pageInfo: { readonly hasNextPage: boolean; readonly endCursor: string | null };
      readonly nodes: readonly (RepoNode | null)[];
    };
  };
}

export interface RepoWithTimes extends RepoActivity {
  readonly times: readonly string[];
}

/** Pure mapping from an API repo node; returns null when the user made no commits there. */
export function repoFromNode(node: RepoNode | null): RepoWithTimes | null {
  const history = node?.defaultBranchRef?.target.history;
  if (!node || !history || history.totalCount === 0) return null;
  return {
    owner: node.owner.login,
    name: node.name,
    language: node.primaryLanguage?.name ?? null,
    commits: history.totalCount,
    times: history.nodes.map((n) => n.committedDate),
  };
}

async function fetchRepos(token: string, userId: string, since: string): Promise<RepoWithTimes[]> {
  const collected: RepoWithTimes[] = [];
  let after: string | null = null;
  do {
    const data: ReposResponse = await graphql<ReposResponse>(token, REPOS_QUERY, { id: userId, since, after });
    const { nodes, pageInfo } = data.viewer.repositories;
    collected.push(...nodes.map(repoFromNode).filter((r): r is RepoWithTimes => r !== null));
    after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (after);
  return collected;
}

export async function fetchRawProfile(token: string, now: Date): Promise<RawProfile> {
  const from = new Date(now.getTime() - WINDOW_DAYS * DAY_MS).toISOString();
  const { viewer } = await graphql<ViewerResponse>(token, VIEWER_QUERY, { from, to: now.toISOString() });
  const collection = viewer.contributionsCollection;

  const found = await fetchRepos(token, viewer.id, from);
  const repos = [...found].sort((a, b) => b.commits - a.commits);

  return {
    id: viewer.id,
    createdAt: viewer.createdAt,
    commits: repos.reduce((n, r) => n + r.commits, 0),
    pullRequests: collection.totalPullRequestContributions,
    issues: collection.totalIssueContributions,
    calendar: collection.contributionCalendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
    repos: repos.map(({ owner, name, language, commits }) => ({ owner, name, language, commits })),
    commitTimes: repos.slice(0, config.timeSampleRepos).flatMap((r) => r.times),
  };
}
