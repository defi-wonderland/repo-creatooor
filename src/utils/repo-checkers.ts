import { GithubApi } from '../api/github-api';
import { defaultBranchProtectionConfig, defaultRepoCreateConfig } from '../config/default';
import { RepoPayload, UpdateBranchProtectionPayload } from '../types/github';

type Assertion = { condition: boolean; message: string };

export class RepoCheckers {
  constructor(private githubApi: GithubApi, private owner: string, private repo: string, private template: string, private admin: string) {}

  assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertAll(assertions: Assertion[], fail: boolean = true) {
    const errorMessages: string[] = [];
    assertions.forEach((assertion) => {
      if (!assertion.condition) {
        errorMessages.push(assertion.message);
      }
    });
    if (fail && errorMessages.length > 0) {
      throw new Error(errorMessages.join('\n'));
    }
  }

  async checkRepo() {
    console.log('.........................................................');
    console.log(`Running checks for repo ${this.repo} in ${this.owner}...`);
    const config: RepoPayload = defaultRepoCreateConfig(this.repo, '');
    const repoData = await this.githubApi.getRepository(this.owner, this.repo);

    console.log(`Checking repo name: ${this.repo}`);
    this.assert(repoData.full_name == `${this.owner}/${this.repo}`, `Repo ${this.repo} does not exist in ${this.owner}`);

    console.log(`Checking repo has issues: ${config.has_issues}`);
    this.assert(repoData.has_issues, `Repo ${this.repo} does not have issues enabled`);

    if (this.template != '') {
      console.log(`Checking repo from template is ${this.template}`);
      this.assert(repoData.template_repository?.full_name == `${this.template}`, `Repo ${this.repo} is not a template`);
    }

    console.log(`Checking repo has homepage is ${config.homepage}`);
    this.assert(repoData.homepage == config.homepage, `Repo ${repoData.homepage} is not ${config.homepage}`);

    console.log(`Checking repo is private is ${config.private}...`);
    this.assert(repoData.private == config.private, `Repo ${this.repo} private is not ${config.private}`);

    console.log(`Checking allow squash merge is ${config.allow_squash_merge}...`);
    this.assert(
      repoData.allow_squash_merge == config.allow_squash_merge,
      `Repo ${this.repo} allow_squash_merge is not ${config.allow_squash_merge}`
    );

    console.log(`Checking allow merge commit is ${config.allow_merge_commit}...`);
    this.assert(
      repoData.allow_merge_commit == config.allow_merge_commit,
      `Repo ${this.repo} allow_merge_commit is not ${config.allow_merge_commit}`
    );

    console.log(`Checking allow rebase merge is ${config.allow_rebase_merge}...`);
    this.assert(
      repoData.allow_rebase_merge == config.allow_rebase_merge,
      `Repo ${this.repo} allow_rebase_merge is not ${config.allow_rebase_merge}`
    );

    console.log(`Checking allow auto merge is ${config.allow_auto_merge}...`);
    this.assert(repoData.allow_auto_merge == config.allow_auto_merge, `Repo ${this.repo} allow_auto_merge is not ${config.allow_auto_merge}`);

    console.log(`Checking delete branch on merge is ${config.delete_branch_on_merge}...`);
    this.assert(
      repoData.delete_branch_on_merge == config.delete_branch_on_merge,
      `Repo ${this.repo} delete_branch_on_merge is not ${config.delete_branch_on_merge}`
    );

    console.log(`Checking admin role for ${this.owner}...`);
    const collaborators = await this.githubApi.getCollaborators(this.owner, this.repo);
    this.assert(
      collaborators.find((c) => c.login == this.admin)?.permissions.admin == true,
      `Repo ${this.admin} does not have admin role for ${this.owner}`
    );
  }

  async checkBranch(branchName: string) {
    console.log('.........................................................');
    console.log(`Running checks for branch ${branchName}...`);
    const branchData = await this.githubApi.getBranchProtection(this.owner, this.repo, branchName);

    const config: UpdateBranchProtectionPayload = defaultBranchProtectionConfig(branchName == 'main');

    console.log(`Checking required reviews count is ${config.required_pull_request_reviews.required_approving_review_count}`);
    this.assert(
      branchData.required_pull_request_reviews.required_approving_review_count ==
        config.required_pull_request_reviews.required_approving_review_count,
      `Repo ${this.repo} does not have required reviews count of ${config.required_pull_request_reviews.required_approving_review_count} for ${branchName} branch`
    );

    console.log(`Checking require code owner reviews is ${config.required_pull_request_reviews.require_code_owner_reviews}...`);
    this.assert(
      branchData.required_pull_request_reviews.require_code_owner_reviews == config.required_pull_request_reviews.require_code_owner_reviews,
      `Repo ${this.repo} require code owner reviews is not ${config.required_pull_request_reviews.require_code_owner_reviews} for ${branchName} branch`
    );

    console.log(`Checking require last push approval is ${config.required_pull_request_reviews.require_last_push_approval}...`);
    this.assert(
      branchData.required_pull_request_reviews.require_last_push_approval == config.required_pull_request_reviews.require_last_push_approval,
      `Repo ${this.repo} require last push approval is not ${config.required_pull_request_reviews.require_last_push_approval} for ${branchName} branch`
    );

    console.log(`Checking dismiss stale reviews is ${config.required_pull_request_reviews.dismiss_stale_reviews}...`);
    this.assert(
      branchData.required_pull_request_reviews.dismiss_stale_reviews == config.required_pull_request_reviews.dismiss_stale_reviews,
      `Repo ${this.repo} dismiss stale reviews is not ${config.required_pull_request_reviews.dismiss_stale_reviews} for ${branchName} branch`
    );

    console.log(`Checking enforce_admins is ${config.enforce_admins}...`);
    this.assert(
      branchData.enforce_admins.enabled == config.enforce_admins,
      `Repo ${this.repo} enforce_admins is not ${config.enforce_admins} for ${branchName} branch`
    );

    console.log(`Checking require status checks is ${config.required_status_checks.strict}...`);
    this.assert(
      branchData.required_status_checks.strict == config.required_status_checks.strict,
      `Repo ${this.repo} require status checks is not ${config.required_status_checks.strict} for ${branchName} branch`
    );

    console.log(`Checking restrict push access is ${config.restrictions}...`);
    this.assert(
      branchData.restrictions == config.restrictions,
      `Repo ${this.repo} restrict push access is not ${config.restrictions} for ${branchName} branch`
    );

    console.log(`Checking allow force pushes is ${config.allow_force_pushes}...`);
    this.assert(
      branchData.allow_force_pushes.enabled == config.allow_force_pushes,
      `Repo ${this.repo} allow force pushes is not ${config.allow_force_pushes} for ${branchName} branch`
    );

    console.log(`Checking allow deletions is ${config.allow_deletions}...`);
    this.assert(
      branchData.allow_deletions.enabled == config.allow_deletions,
      `Repo ${this.repo} allow deletions is not ${config.allow_deletions} for ${branchName} branch`
    );

    console.log(`Checking lock branch is ${config.lock_branch}...`);
    this.assert(
      branchData.lock_branch.enabled == config.lock_branch,
      `Repo ${this.repo} lock branch is not ${config.lock_branch} for ${branchName} branch`
    );

    console.log(`Checking commit signature protection is enabled...`);
    const signatureProtection = await this.githubApi.getCommitSignatureProctection(this.owner, this.repo, branchName);

    this.assert(
      signatureProtection.enabled == true,
      `Repo ${this.repo} does not have commit signature protection enabled for ${branchName} branch`
    );
  }

  async checkAll() {
    console.log('Running checks');
    await this.checkRepo();
    await this.checkBranch('main');
    await this.checkBranch('dev');
    console.log('All checks passed!');
  }
}
