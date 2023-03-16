export type GetRefResponse = {
  ref: string;
  node_id: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
};

export type CreateRefPayload = {
  ref: string;
  sha: string;
};

export type RepoPayload = {
  name: string;
  org: string;
  description: string;
  private: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  default_branch: string;
  auto_init: boolean;
  has_downloads: boolean;
  is_template: boolean;
  allow_squash_merge: boolean;
  allow_merge_commit: boolean;
  allow_rebase_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  use_squash_pr_title_as_default: boolean;
  squash_merge_commit_title: string;
  squash_merge_commit_message: string;
  merge_commit_title: string;
  merge_commit_message: string;
};

export type UpdateRepoPayload = {
  name: string;
  org: string;
  description: string;
  private: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  default_branch: string;
  has_downloads: boolean;
  allow_squash_merge: boolean;
  allow_merge_commit: boolean;
  allow_rebase_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  use_squash_pr_title_as_default: boolean;
  squash_merge_commit_title: string;
  squash_merge_commit_message: string;
  merge_commit_title: string;
  merge_commit_message: string;
};

export type RepoResponse = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token: string | null;
  network_count: number;
  subscribers_count: number;
};

export type UpdateBranchProtectionPayload = {
  required_status_checks?: {
    strict: boolean;
    contexts: string[];
  };
  enforce_admins: boolean;
  required_pull_request_reviews?: {
    dismiss_stale_reviews: boolean;
    require_code_owner_reviews: boolean;
    required_approving_review_count: number;
    require_last_push_approval: boolean;
  };
  restrictions: null;
  allow_force_pushes: boolean;
  allow_deletions: boolean;
  lock_branch: boolean;
};

export type BranchProtectionResponse = {
  url: string;
  required_status_checks?: {
    url: string;
    strict: boolean;
    contexts: string[];
    contexts_url: string;
    checks: {
      context: string;
      app_id: null | number;
    }[];
  };
  restrictions: {
    url: string;
    users_url: string;
    teams_url: string;
    apps_url: string;
    users: any[];
    teams: any[];
    apps: any[];
  };
  required_pull_request_reviews?: {
    url: string;
    dismiss_stale_reviews: boolean;
    require_code_owner_reviews: boolean;
    require_last_push_approval: boolean;
    required_approving_review_count: number;
  };
  required_signatures: {
    url: string;
    enabled: boolean;
  };
  enforce_admins: {
    url: string;
    enabled: boolean;
  };
  required_linear_history: {
    enabled: boolean;
  };
  allow_force_pushes: {
    enabled: boolean;
  };
  allow_deletions: {
    enabled: boolean;
  };
  block_creations: {
    enabled: boolean;
  };
  required_conversation_resolution: {
    enabled: boolean;
  };
  lock_branch: {
    enabled: boolean;
  };
  allow_fork_syncing: {
    enabled: boolean;
  };
};

export type RequireSingatureResponse = {
  url: string;
  enabled: boolean;
};

export type CreateRepoFromTemplatePayload = {
  owner: string;
  name: string;
  description: string;
  include_all_branches: boolean;
  private: boolean;
};

export type CreateRepoFromTemplateResponse = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
};

export type ListBranchesResponse = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}[];

export type RenameBranchPayload = {
  new_name: string;
};

export type RenameBranchResponse = {
  name: string;
  protected: boolean;
};

export type GetRepositoryResponse = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  description: string;
  fork: boolean;
  homepage: string;
  default_branch: string;
  visibility: string;
  has_issues: boolean;
  permissions: {
    pull: boolean;
    push: boolean;
    admin: boolean;
  };
  allow_rebase_merge: boolean;
  template_repository?: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
  };
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_merge_commit: boolean;
  allow_forking: boolean;
};

export type CollaboratorsResponse = {
  login: string;
  permissions: {
    pull: boolean;
    triage: boolean;
    push: boolean;
    maintain: boolean;
    admin: boolean;
  };
}[];

export type Repo = {
  id: number;
  name: string;
  full_name: string;
  visibility: string;
};

export type BranchResponse = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
};
