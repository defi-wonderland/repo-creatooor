import { GithubApi } from '../api/github-api';
import { defaultBranchProtectionConfig, defaultRepoCreateConfig } from '../config/default';
import { RepoPayload, UpdateBranchProtectionPayload } from '../types/github';

type Assertion = { condition: boolean; message: string };

export class RepoCheckers {
  constructor(private githubApi: GithubApi, private owner: string, private repo: string, private template: string, private admin: string) {}

  assertAll(assertions: Assertion[], fail: boolean = true) {
    const errorMessages: string[] = [];
    assertions.forEach((assertion) => {
      if (!assertion.condition) {
        errorMessages.push(assertion.message);
      }
    });
    if (fail && errorMessages.length > 0) {
      console.log('Assertions failed ❌:\n');
      throw new Error(errorMessages.join('\n'));
    } else {
      console.log('Assertions passed ✅');
    }
  }

  async getRepoAssertions(): Promise<Assertion[]> {
    const repoAssertions: Assertion[] = [];
    console.log('.........................................................');
    console.log(`Running checks for repo ${this.repo} in ${this.owner} 📝 ...`);
    const config: RepoPayload = defaultRepoCreateConfig(this.owner, this.repo, '');
    const repoData = await this.githubApi.getRepository(this.owner, this.repo);

    console.log(`Checking repo name: ${this.repo}`);
    repoAssertions.push({
      condition: repoData.full_name == `${this.owner}/${this.repo}`,
      message: `Repo ${this.repo} does not exist in ${this.owner}`,
    });

    console.log(`Checking repo has issues: ${config.has_issues}`);
    repoAssertions.push({ condition: repoData.has_issues, message: `Repo ${this.repo} does not have issues enabled` });

    if (this.template != '') {
      console.log(`Checking repo from template is ${this.template}`);
      repoAssertions.push({
        condition: repoData.template_repository?.full_name == `${this.template}`,
        message: `Repo ${this.repo} is not a template`,
      });
    }

    console.log(`Checking repo has homepage is ${config.homepage}`);
    repoAssertions.push({ condition: repoData.homepage == config.homepage, message: `Repo ${repoData.homepage} is not ${config.homepage}` });

    console.log(`Checking repo is private is ${config.private}...`);
    repoAssertions.push({ condition: repoData.private == config.private, message: `Repo ${this.repo} private is not ${config.private}` });

    console.log(`Checking allow squash merge is ${config.allow_squash_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_squash_merge == config.allow_squash_merge,
      message: `Repo ${this.repo} allow_squash_merge is not ${config.allow_squash_merge}`,
    });

    console.log(`Checking allow merge commit is ${config.allow_merge_commit}...`);
    repoAssertions.push({
      condition: repoData.allow_merge_commit == config.allow_merge_commit,
      message: `Repo ${this.repo} allow_merge_commit is not ${config.allow_merge_commit}`,
    });

    console.log(`Checking allow rebase merge is ${config.allow_rebase_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_rebase_merge == config.allow_rebase_merge,
      message: `Repo ${this.repo} allow_rebase_merge is not ${config.allow_rebase_merge}`,
    });

    console.log(`Checking allow auto merge is ${config.allow_auto_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_auto_merge == config.allow_auto_merge,
      message: `Repo ${this.repo} allow_auto_merge is not ${config.allow_auto_merge}`,
    });

    console.log(`Checking delete branch on merge is ${config.delete_branch_on_merge}...`);
    repoAssertions.push({
      condition: repoData.delete_branch_on_merge == config.delete_branch_on_merge,
      message: `Repo ${this.repo} delete_branch_on_merge is not ${config.delete_branch_on_merge}`,
    });

    console.log(`Checking admin role for ${this.owner}...`);
    const collaborators = await this.githubApi.getCollaborators(this.owner, this.repo);
    repoAssertions.push({
      condition: collaborators.find((c) => c.login == this.admin)?.permissions.admin == true,
      message: `Repo ${this.admin} does not have admin role for ${this.owner}`,
    });

    return repoAssertions;
  }

  async getBranchAssertions(branchName: string): Promise<Assertion[]> {
    const branchAssertions: Assertion[] = [];
    console.log('.........................................................');
    console.log(`Running checks for branch ${branchName}...`);
    const branchData = await this.githubApi.getBranchProtection(this.owner, this.repo, branchName);

    const config: UpdateBranchProtectionPayload = defaultBranchProtectionConfig(branchName == 'main');

    console.log(`Checking required reviews count is ${config.required_pull_request_reviews.required_approving_review_count}`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.required_approving_review_count ==
        config.required_pull_request_reviews.required_approving_review_count,
      message: `Repo ${this.repo} does not have required reviews count of ${config.required_pull_request_reviews.required_approving_review_count} for ${branchName} branch`,
    });

    console.log(`Checking require code owner reviews is ${config.required_pull_request_reviews.require_code_owner_reviews}...`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.require_code_owner_reviews == config.required_pull_request_reviews.require_code_owner_reviews,
      message: `Repo ${this.repo} require code owner reviews is not ${config.required_pull_request_reviews.require_code_owner_reviews} for ${branchName} branch`,
    });

    console.log(`Checking require last push approval is ${config.required_pull_request_reviews.require_last_push_approval}...`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.require_last_push_approval == config.required_pull_request_reviews.require_last_push_approval,
      message: `Repo ${this.repo} require last push approval is not ${config.required_pull_request_reviews.require_last_push_approval} for ${branchName} branch`,
    });

    console.log(`Checking dismiss stale reviews is ${config.required_pull_request_reviews.dismiss_stale_reviews}...`);
    branchAssertions.push({
      condition: branchData.required_pull_request_reviews.dismiss_stale_reviews == config.required_pull_request_reviews.dismiss_stale_reviews,
      message: `Repo ${this.repo} dismiss stale reviews is not ${config.required_pull_request_reviews.dismiss_stale_reviews} for ${branchName} branch`,
    });

    console.log(`Checking enforce_admins is ${config.enforce_admins}...`);
    branchAssertions.push({
      condition: branchData.enforce_admins.enabled == config.enforce_admins,
      message: `Repo ${this.repo} enforce_admins is not ${config.enforce_admins} for ${branchName} branch`,
    });

    console.log(`Checking require status checks is ${config.required_status_checks.strict}...`);
    branchAssertions.push({
      condition: branchData.required_status_checks.strict == config.required_status_checks.strict,
      message: `Repo ${this.repo} require status checks is not ${config.required_status_checks.strict} for ${branchName} branch`,
    });

    console.log(`Checking restrict push access is ${config.restrictions}...`);
    branchAssertions.push({
      condition: branchData.restrictions == config.restrictions,
      message: `Repo ${this.repo} restrict push access is not ${config.restrictions} for ${branchName} branch`,
    });

    console.log(`Checking allow force pushes is ${config.allow_force_pushes}...`);
    branchAssertions.push({
      condition: branchData.allow_force_pushes.enabled == config.allow_force_pushes,
      message: `Repo ${this.repo} allow force pushes is not ${config.allow_force_pushes} for ${branchName} branch`,
    });

    console.log(`Checking allow deletions is ${config.allow_deletions}...`);
    branchAssertions.push({
      condition: branchData.allow_deletions.enabled == config.allow_deletions,
      message: `Repo ${this.repo} allow deletions is not ${config.allow_deletions} for ${branchName} branch`,
    });

    console.log(`Checking lock branch is ${config.lock_branch}...`);
    branchAssertions.push({
      condition: branchData.lock_branch.enabled == config.lock_branch,
      message: `Repo ${this.repo} lock branch is not ${config.lock_branch} for ${branchName} branch`,
    });

    console.log(`Checking commit signature protection is enabled...`);
    const signatureProtection = await this.githubApi.getCommitSignatureProctection(this.owner, this.repo, branchName);

    branchAssertions.push({
      condition: signatureProtection.enabled == true,
      message: `Repo ${this.repo} does not have commit signature protection enabled for ${branchName} branch`,
    });

    return branchAssertions;
  }

  async checkAll() {
    console.log('Running checks');
    const assertions: Assertion[] = [
      ...(await this.getRepoAssertions()),
      ...(await this.getBranchAssertions('main')),
      ...(await this.getBranchAssertions('dev')),
    ];
    this.assertAll(assertions);
    console.log('All checks passed!');
  }
}
