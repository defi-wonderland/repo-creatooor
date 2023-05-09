// DO NOT EDIT THIS FILE DIRECTLY

export const defaultRepoCreateConfig = (owner: string, name: string, description: string) => ({
  org: owner,
  name: name,
  description: description,
  private: true,
  has_issues: false,
  has_projects: true,
  has_wiki: false,
  default_branch: 'main',
  auto_init: true,
  has_downloads: true,
  is_template: false,
  allow_squash_merge: true,
  allow_merge_commit: true,
  allow_rebase_merge: false,
  allow_auto_merge: false,
  delete_branch_on_merge: true,
  allow_update_branch: true,
  use_squash_pr_title_as_default: true,
  squash_merge_commit_title: 'PR_TITLE',
  squash_merge_commit_message: 'PR_BODY',
  merge_commit_title: 'PR_TITLE',
  merge_commit_message: 'PR_BODY',
});

export const defaultRepoUpdateConfig = (owner: string, name: string, description: string) => ({
  ...defaultRepoCreateConfig(owner, name, description),
  default_branch: 'dev',
});

export const defaultBranchProtectionConfig = (isMainBranch: boolean) => ({
  required_status_checks: {
    strict: true,
    contexts: [],
  },
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: isMainBranch,
    required_approving_review_count: isMainBranch ? 2 : 1,
    require_last_push_approval: true,
  },
  enforce_admins: true,
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
  lock_branch: false,
});

export const defaultBranchProtectionPublicConfig = () => ({
  required_status_checks: {
    strict: true,
    contexts: [],
  },
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: true,
    required_approving_review_count: 2,
    require_last_push_approval: true,
  },
  enforce_admins: true,
  restrictions: null,
  allow_force_pushes: false,
  allow_deletions: false,
  lock_branch: true,
});

export const defaultCreateRepoFromTemplateConfig = (owner: string, repo: string) => ({
  owner: owner,
  name: repo,
  description: '',
  include_all_branches: false,
  private: true,
});
