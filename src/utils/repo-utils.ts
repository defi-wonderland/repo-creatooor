import { GithubApi } from '../api/github-api';
import {
  defaultBranchProtectionConfig,
  defaultBranchProtectionPublicConfig,
  defaultCreateRepoFromTemplateConfig,
  defaultRepoCreateConfig,
  defaultRepoUpdateConfig,
} from '../config/default';
import {
  RepoPayload,
  UpdateBranchProtectionPayload,
  CreateRefPayload,
  CreateRepoFromTemplatePayload,
  ListBranchesResponse,
  Repo,
  UpdateRepoPayload,
} from '../types/github';

export class RepoUtils {
  constructor(private githubApi: GithubApi) {}

  async createRepo(owner: string, repoName: string, repoDescription: string): Promise<void> {
    console.log('........................................');
    console.log(`Creating repo ${repoName} in ${owner} 📦...`);
    const createRepoPayload: RepoPayload = defaultRepoCreateConfig(owner, repoName, repoDescription);

    const data = await this.githubApi.createRepo(owner, createRepoPayload);
    console.log(`Repo ${data.name} created!`);
  }

  async updateRepo(owner: string, repoName: string, repoDescription: string): Promise<void> {
    console.log('........................................');
    console.log(`Updating repo ${repoName}...`);

    const updateRepoPayload: UpdateRepoPayload = defaultRepoUpdateConfig(owner, repoName, repoDescription);

    const data = await this.githubApi.updateRepo(owner, repoName, updateRepoPayload);
    console.log(`Repo ${data.name} updated!`);
  }

  async updateBranchProtection(owner: string, repoName: string, branchName: string, isMainBranch: boolean): Promise<void> {
    console.log('Updating branch protection...');
    const updateBranchProtectionPayload: UpdateBranchProtectionPayload = defaultBranchProtectionConfig(isMainBranch);
    await this.githubApi.updateBranchProtection(owner, repoName, branchName, updateBranchProtectionPayload);
    console.log(`Branch protection updated!`);
  }

  async updatePublicBranchProtection(owner: string, repoName: string, branchName: string): Promise<void> {
    console.log('Updating public branch protection...');
    const updateBranchProtectionPayload: UpdateBranchProtectionPayload = defaultBranchProtectionPublicConfig();
    await this.githubApi.updateBranchProtection(owner, repoName, branchName, updateBranchProtectionPayload);
    console.log(`Branch protection updated!`);
  }

  async getBranchRef(owner: string, repoName: string, branchName: string): Promise<string> {
    console.log(`Getting ${branchName} branch ref...`);
    const data = await this.githubApi.getRef(owner, repoName, `heads/${branchName}`);
    console.log(`Successfully got ${branchName} branch ref!`);
    return data.object.sha;
  }

  async createBranch(owner: string, repoName: string, branchName: string, sha: string): Promise<void> {
    console.log(`Creating branch ${branchName}...`);
    const createRefPayload: CreateRefPayload = {
      ref: `refs/heads/${branchName}`,
      sha: sha,
    };
    await this.githubApi.createRef(owner, repoName, createRefPayload);
    console.log(`Branch ${branchName} created!`);
  }

  async checkBranchExistsOrCreate(owner: string, repoName: string, branchName: string, fromBranch: string | null = null): Promise<void> {
    if ((await this.checkBranchExists(owner, repoName, branchName)) == false) {
      console.log(`${branchName} branch does not exist!, creating...`);
      // If fromBranch is not provided, use the default branch
      if (fromBranch == null) {
        fromBranch = (await this.githubApi.getRepository(owner, repoName)).default_branch;
      }

      const sha = await this.getBranchRef(owner, repoName, fromBranch);
      await this.createBranch(owner, repoName, branchName, sha);
    }
  }

  async checkBranchExists(owner: string, repoName: string, branchName: string): Promise<boolean> {
    console.log(`Checking if ${branchName} branch exists...`);
    const branches = await this.githubApi.listBranches(owner, repoName);
    const hasBranch = branches.find((branch) => branch.name == branchName) != undefined;
    return hasBranch;
  }

  async requireSignature(owner: string, repoName: string, branchName: string): Promise<void> {
    console.log(`Enabling signature requirement for ${branchName} branch...`);
    await this.githubApi.requireSignature(owner, repoName, branchName);
    console.log(`Signature requirement for ${branchName} branch enabled!`);
  }

  async addAutolink(owner: string, repoName: string, projectCode: string): Promise<void> {
    console.log(`Adding autolink for ${projectCode}...`);
    await this.githubApi.addAutolink(owner, repoName, projectCode);
    console.log(`Autolink for ${projectCode} added!`);
  }

  async addPrTemplate(owner: string, repoName: string, projectCode: string): Promise<void> {
    console.log(`Checking for a PR template in ${projectCode}...`);
    const path = '.github/pull_request_template.md';
    const templateExists = await this.githubApi.fileExists(owner, repoName, path);

    if (templateExists) {
      console.log('PR template already exists');
    } else {
      console.log(`Adding PR template for ${projectCode}...`);
      await this.githubApi.addPrTemplate(owner, repoName, projectCode);
      console.log(`PR template for ${projectCode} added!`);
    }
  }

  async addCollaborator(owner: string, repoName: string, username: string, adminLevel: string): Promise<void> {
    console.log(`Adding ${username} as a collaborator with ${adminLevel} permission...`);
    await this.githubApi.addCollaborator(owner, repoName, username, adminLevel);
    console.log(`${username} added as a ${adminLevel} collaborator!`);
  }

  async createRepoFromTemplate(owner: string, repo: string, template: string): Promise<void> {
    console.log(`Creating ${repo} from ${template} template...`);
    const createRepoFromTemplatePayload: CreateRepoFromTemplatePayload = defaultCreateRepoFromTemplateConfig(owner, repo);

    await this.githubApi.createRepoFromTemplate(template, createRepoFromTemplatePayload);
    console.log(`${repo} created from ${template} template!`);
  }

  async listBranches(owner: string, repo: string): Promise<ListBranchesResponse> {
    console.log(`Listing branches of ${repo}...`);
    const branches = await this.githubApi.listBranches(owner, repo);
    console.log(`Branches of ${repo} listed!`);
    return branches;
  }

  async renameBranch(owner: string, repo: string, oldBranchName: string, newBranchName: string): Promise<void> {
    console.log(`Renaming branch ${oldBranchName} to ${newBranchName}...`);
    await this.githubApi.renameBranch(owner, repo, oldBranchName, { new_name: newBranchName });
    console.log(`Branch ${oldBranchName} renamed to ${newBranchName}!`);
  }

  async listAllRepos(owner: string): Promise<Repo[]> {
    console.log('Getting all repos...');

    let allRepos: Repo[] = [];
    let page = 1;

    let nextPage = true;

    do {
      console.log(`Getting page ${page} of repos...`);
      const response = await this.githubApi.listRepos(owner, page);
      allRepos.push(...response.data);

      const linkHeader = response.headers.link;

      if (linkHeader) {
        nextPage = linkHeader.includes('rel="next"');
      }
      page++;
      if (response.data == null || response.data.length == 0) break;
    } while (nextPage);

    console.log(`Found ${allRepos.length} repos!`);
    console.log('Successfully got all repos!');
    return allRepos;
  }
}
