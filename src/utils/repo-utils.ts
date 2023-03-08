import { GithubApi } from '../api/github-api';
import {
  defaultBranchProtectionConfig,
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
} from '../types/github';

export class RepoUtils {
  constructor(private githubApi: GithubApi) {}

  async createRepo(owner: string, repoName: string, repoDescription: string): Promise<void> {
    console.log('........................................');
    console.log('Creating repo...');
    const createRepoPayload: RepoPayload = defaultRepoCreateConfig(repoName, repoDescription);

    const data = await this.githubApi.createRepo(owner, createRepoPayload);
    console.log(`Repo ${data.name} created!`);
  }

  async updateRepo(owner: string, repoName: string, repoDescription: string): Promise<void> {
    console.log('........................................');
    console.log(`Updating repo ${repoName}...`);
    const updateRepoPayload: RepoPayload = defaultRepoUpdateConfig(repoName, repoDescription);

    const data = await this.githubApi.updateRepo(owner, repoName, updateRepoPayload);
    console.log(`Repo ${data.name} updated!`);
  }

  async updateBranchProtection(owner: string, repoName: string, branchName: string, isMainBranch: boolean): Promise<void> {
    console.log('Updating branch protection...');
    const updateBranchProtectionPayload: UpdateBranchProtectionPayload = defaultBranchProtectionConfig(isMainBranch);
    await this.githubApi.updateBranchProtection(owner, repoName, branchName, updateBranchProtectionPayload);
    console.log(`Branch protection updated!`);
  }

  async getMainBrancRef(owner: string, repoName: string): Promise<string> {
    console.log('Getting main branch ref...');
    const data = await this.githubApi.getRef(owner, repoName, 'heads/main');
    console.log('Successfuly got main branch ref!');
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

  async requireSignature(owner: string, repoName: string, branchName: string): Promise<void> {
    console.log(`Enabling signature requirement for ${branchName} branch...`);
    await this.githubApi.requireSignature(owner, repoName, branchName);
    console.log(`Signature requirement for ${branchName} branch enabled!`);
  }

  async addCodeowners(owner: string, repoName: string, teamName: string): Promise<void> {
    console.log(`Adding codeowners for ${teamName}...`);
    await this.githubApi.addCodeOwners(owner, repoName, teamName);
    console.log(`Codeowners for ${teamName} added!`);
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
}
