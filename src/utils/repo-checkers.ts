import { GithubApi } from '../api/github-api';
import { defaultBranchProtectionConfig, defaultRepoCreateConfig } from '../config/default';
import { RepoPayload, UpdateBranchProtectionPayload } from '../types/github';

export type Assertion = { condition: boolean; message: string };

export class RepoCheckers {
  constructor(
    private githubApi: GithubApi,
    private owner: string,
    private repo: string,
    private template: string = '',
    private admin: string,
    private logInfo: boolean = true
  ) {}

  log(logData: string) {
    if (this.logInfo) {
      console.info(logData);
    }
  }

  assertAll(assertions: Assertion[], fail: boolean = true) {
    const errorMessages: string[] = [];
    assertions.forEach((assertion) => {
      if (!assertion.condition) {
        errorMessages.push(assertion.message);
      }
    });

    if (errorMessages.length > 0) {
      this.log(`Assertions for repo ${this.repo} failed ❌:\n`);
      if (fail) {
        throw new Error(errorMessages.join('\n'));
      } else {
        this.log(errorMessages.join('\n'));
      }
    } else {
      this.log('Assertions passed ✅');
    }
  }

  async getRepoAssertions(newRepo: boolean = true): Promise<Assertion[]> {
    const repoAssertions: Assertion[] = [];
    this.log('.........................................................');
    this.log(`Running checks for repo ${this.repo} in ${this.owner} 📝 ...`);
    const config: RepoPayload = defaultRepoCreateConfig(this.owner, this.repo, '');
    const repoData = await this.githubApi.getRepository(this.owner, this.repo);

    this.log(`Checking repo name: ${this.repo}`);
    repoAssertions.push({
      condition: repoData.full_name == `${this.owner}/${this.repo}`,
      message: `Repo ${this.repo} does not exist in ${this.owner}`,
    });

    this.log(`Checking repo has issues: ${config.has_issues}`);
    repoAssertions.push({ condition: repoData.has_issues, message: `Repo ${this.repo} does not have issues enabled` });

    if (this.template != '') {
      this.log(`Checking repo from template is ${this.template}`);
      repoAssertions.push({
        condition: repoData.template_repository?.full_name == `${this.template}`,
        message: `Repo ${this.repo} is not a template`,
      });
    }

    this.log(`Checking repo has homepage is ${config.homepage}`);
    repoAssertions.push({
      condition: repoData.homepage == config.homepage,
      message: `Repo homepage ${repoData.homepage} is not ${config.homepage}`,
    });

    this.log(`Checking repo is private is ${config.private}...`);
    repoAssertions.push({ condition: repoData.private == config.private, message: `Repo ${this.repo} private is not ${config.private}` });

    this.log(`Checking allow squash merge is ${config.allow_squash_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_squash_merge == config.allow_squash_merge,
      message: `Repo ${this.repo} allow_squash_merge is not ${config.allow_squash_merge}`,
    });

    this.log(`Checking allow merge commit is ${config.allow_merge_commit}...`);
    repoAssertions.push({
      condition: repoData.allow_merge_commit == config.allow_merge_commit,
      message: `Repo ${this.repo} allow_merge_commit is not ${config.allow_merge_commit}`,
    });

    this.log(`Checking allow rebase merge is ${config.allow_rebase_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_rebase_merge == config.allow_rebase_merge,
      message: `Repo ${this.repo} allow_rebase_merge is not ${config.allow_rebase_merge}`,
    });

    this.log(`Checking allow auto merge is ${config.allow_auto_merge}...`);
    repoAssertions.push({
      condition: repoData.allow_auto_merge == config.allow_auto_merge,
      message: `Repo ${this.repo} allow_auto_merge is not ${config.allow_auto_merge}`,
    });

    this.log(`Checking delete branch on merge is ${config.delete_branch_on_merge}...`);
    repoAssertions.push({
      condition: repoData.delete_branch_on_merge == config.delete_branch_on_merge,
      message: `Repo ${this.repo} delete_branch_on_merge is not ${config.delete_branch_on_merge}`,
    });

    if (newRepo) {
      this.log(`Checking admin role for ${this.owner}...`);
      const collaborators = await this.githubApi.getCollaborators(this.owner, this.repo);
      repoAssertions.push({
        condition: collaborators.find((c) => c.login == this.admin)?.permissions.admin == true,
        message: `Repo ${this.admin} does not have admin role for ${this.owner}`,
      });
    }

    return repoAssertions;
  }

  async getBranchAssertions(branchName: string): Promise<Assertion[]> {
    const branchAssertions: Assertion[] = [];
    this.log('.........................................................');
    this.log(`Running checks for branch ${branchName}...`);

    const branches = await this.githubApi.listBranches(this.owner, this.repo);

    this.log(`Checking branch ${branchName} exists...`);
    if (!branches.find((b) => b.name == branchName)) {
      branchAssertions.push({ condition: false, message: `Branch ${branchName} does not exist` });
      return branchAssertions;
    }

    this.log(`Checking branch protection for ${branchName}...`);
    const branch = await this.githubApi.getBranch(this.owner, this.repo, branchName);

    if (!branch.protected) {
      branchAssertions.push({ condition: false, message: `Branch ${branchName} is not protected` });
      return branchAssertions;
    }

    const branchData = await this.githubApi.getBranchProtection(this.owner, this.repo, branchName);

    const config: UpdateBranchProtectionPayload = defaultBranchProtectionConfig(branchName == 'main');

    this.log(`Checking required reviews count is ${config.required_pull_request_reviews.required_approving_review_count}`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.required_approving_review_count ==
        config.required_pull_request_reviews.required_approving_review_count,
      message: `Repo ${this.repo} does not have required reviews count of ${config.required_pull_request_reviews.required_approving_review_count} for ${branchName} branch`,
    });

    this.log(`Checking require code owner reviews is ${config.required_pull_request_reviews.require_code_owner_reviews}...`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.require_code_owner_reviews == config.required_pull_request_reviews.require_code_owner_reviews,
      message: `Repo ${this.repo} require code owner reviews is not ${config.required_pull_request_reviews.require_code_owner_reviews} for ${branchName} branch`,
    });

    this.log(`Checking require last push approval is ${config.required_pull_request_reviews.require_last_push_approval}...`);
    branchAssertions.push({
      condition:
        branchData.required_pull_request_reviews.require_last_push_approval == config.required_pull_request_reviews.require_last_push_approval,
      message: `Repo ${this.repo} require last push approval is not ${config.required_pull_request_reviews.require_last_push_approval} for ${branchName} branch`,
    });

    this.log(`Checking dismiss stale reviews is ${config.required_pull_request_reviews.dismiss_stale_reviews}...`);
    branchAssertions.push({
      condition: branchData.required_pull_request_reviews.dismiss_stale_reviews == config.required_pull_request_reviews.dismiss_stale_reviews,
      message: `Repo ${this.repo} dismiss stale reviews is not ${config.required_pull_request_reviews.dismiss_stale_reviews} for ${branchName} branch`,
    });

    this.log(`Checking enforce_admins is ${config.enforce_admins}...`);
    branchAssertions.push({
      condition: branchData.enforce_admins.enabled == config.enforce_admins,
      message: `Repo ${this.repo} enforce_admins is not ${config.enforce_admins} for ${branchName} branch`,
    });

    this.log(`Checking require status checks is ${config.required_status_checks.strict}...`);
    branchAssertions.push({
      condition: branchData.required_status_checks.strict == config.required_status_checks.strict,
      message: `Repo ${this.repo} require status checks is not ${config.required_status_checks.strict} for ${branchName} branch`,
    });

    this.log(`Checking restrict push access is ${config.restrictions}...`);
    branchAssertions.push({
      condition: branchData.restrictions == config.restrictions,
      message: `Repo ${this.repo} restrict push access is not ${config.restrictions} for ${branchName} branch`,
    });

    this.log(`Checking allow force pushes is ${config.allow_force_pushes}...`);
    branchAssertions.push({
      condition: branchData.allow_force_pushes.enabled == config.allow_force_pushes,
      message: `Repo ${this.repo} allow force pushes is not ${config.allow_force_pushes} for ${branchName} branch`,
    });

    this.log(`Checking allow deletions is ${config.allow_deletions}...`);
    branchAssertions.push({
      condition: branchData.allow_deletions.enabled == config.allow_deletions,
      message: `Repo ${this.repo} allow deletions is not ${config.allow_deletions} for ${branchName} branch`,
    });

    this.log(`Checking lock branch is ${config.lock_branch}...`);
    branchAssertions.push({
      condition: branchData.lock_branch.enabled == config.lock_branch,
      message: `Repo ${this.repo} lock branch is not ${config.lock_branch} for ${branchName} branch`,
    });

    this.log(`Checking commit signature protection is enabled...`);
    const signatureProtection = await this.githubApi.getCommitSignatureProctection(this.owner, this.repo, branchName);

    branchAssertions.push({
      condition: signatureProtection.enabled == true,
      message: `Repo ${this.repo} does not have commit signature protection enabled for ${branchName} branch`,
    });

    return branchAssertions;
  }

  async getPublicRepoBranchAssertions(branchName: string): Promise<Assertion[]> {
    const branchAssertions: Assertion[] = [];

    this.log('.........................................................');
    this.log(`Running checks for branch ${branchName}...`);

    const branches = await this.githubApi.listBranches(this.owner, this.repo);

    this.log(`Checking branch ${branchName} exists...`);
    if (!branches.find((b) => b.name == branchName)) {
      branchAssertions.push({ condition: false, message: `Branch ${branchName} does not exist` });
      return branchAssertions;
    }

    this.log(`Checking branch protection for ${branchName}...`);
    const branch = await this.githubApi.getBranch(this.owner, this.repo, branchName);

    if (!branch.protected) {
      branchAssertions.push({ condition: false, message: `Branch ${branchName} is not protected` });
      return branchAssertions;
    }

    const branchData = await this.githubApi.getBranchProtection(this.owner, this.repo, branchName);
    branchAssertions.push({ condition: branchData.lock_branch.enabled, message: `Branch ${branchName} is not locked` });

    return branchAssertions;
  }

  async runPostCreationChecks(fail: boolean = true) {
    this.log('Running checks');
    const assertions: Assertion[] = [
      ...(await this.getRepoAssertions()),
      ...(await this.getBranchAssertions('main')),
      ...(await this.getBranchAssertions('dev')),
    ];
    this.assertAll(assertions, fail);
    this.log('All checks passed!');
  }

  async runAllReposHealthChecks(): Promise<Assertion[]> {
    let assertions: Assertion[] = [];

    const repoData = await this.githubApi.getRepository(this.owner, this.repo);

    if (repoData.private == false || repoData.visibility == 'public') {
      // Checks that all branches of the public repo are locked
      const branches = await this.githubApi.listBranches(this.owner, this.repo);
      branches.forEach(async (branch) => {
        assertions.push(...((await this.getPublicRepoBranchAssertions(branch.name)) as Assertion[]));
      });
    } else {
      assertions = [
        ...(await this.getRepoAssertions(false)),
        ...(await this.getBranchAssertions('main')),
        ...(await this.getBranchAssertions('dev')),
      ];
    }

    return assertions;
  }
}
