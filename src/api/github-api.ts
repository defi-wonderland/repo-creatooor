import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  GetRefResponse,
  CreateRefPayload,
  RepoPayload,
  RepoResponse,
  UpdateBranchProtectionPayload,
  BranchProtectionResponse,
  RequireSignatureResponse,
  CreateRepoFromTemplatePayload,
  CreateRepoFromTemplateResponse,
  ListBranchesResponse,
  RenameBranchPayload,
  RenameBranchResponse,
  GetRepositoryResponse,
  CollaboratorsResponse,
  Repo,
  BranchResponse,
  UpdateRepoPayload,
} from '../types/github';

export class GithubApi {
  private readonly axios: AxiosInstance;

  constructor(accessToken: string) {
    this.axios = axios.create({
      baseURL: 'https://api.github.com',
    });
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  async createRepo(owner: string, createRepoPayload: RepoPayload): Promise<RepoResponse> {
    const { data } = await this.axios.post<RepoResponse>(`/orgs/${owner}/repos`, createRepoPayload);
    return data;
  }

  async updateRepo(owner: string, repo: string, updateRepoPayload: UpdateRepoPayload): Promise<RepoResponse> {
    const { data } = await this.axios.patch<RepoResponse>(`/repos/${owner}/${repo}`, updateRepoPayload);
    return data;
  }

  async updateBranchProtection(
    owner: string,
    repo: string,
    branch: string,
    updateBranchProtectionPayload: UpdateBranchProtectionPayload
  ): Promise<BranchProtectionResponse> {
    const { data } = await this.axios.put<BranchProtectionResponse>(
      `/repos/${owner}/${repo}/branches/${branch}/protection`,
      updateBranchProtectionPayload
    );
    return data;
  }

  async getRef(owner: string, repo: string, ref: string): Promise<GetRefResponse> {
    const { data } = await this.axios.get<GetRefResponse>(`/repos/${owner}/${repo}/git/refs/${ref}`);
    return data;
  }

  async createRef(owner: string, repo: string, createRefPayload: CreateRefPayload): Promise<GetRefResponse> {
    const { data } = await this.axios.post<GetRefResponse>(`/repos/${owner}/${repo}/git/refs`, createRefPayload);
    return data;
  }

  async requireSignature(owner: string, repo: string, branch: string): Promise<RequireSignatureResponse> {
    const { data } = await this.axios.post<RequireSignatureResponse>(
      `/repos/${owner}/${repo}/branches/${branch}/protection/required_signatures`,
      {}
    );
    return data;
  }

  async addCodeOwners(owner: string, repo: string, teamName: string): Promise<void> {
    const file = '.github/CODEOWNERS';
    const content: string = `* ${teamName}`;
    const b64Content: string = Buffer.from(content).toString('base64');
    const body: object = {
      message: 'Added CODEOWNERS to Repo',
      content: b64Content,
    };
    const { data } = await this.axios.put(`/repos/${owner}/${repo}/contents/${file}`, body);
    return data;
  }

  async addCollaborator(owner: string, repo: string, username: string, permissionValue: string): Promise<void> {
    const { data } = await this.axios.put(`/repos/${owner}/${repo}/collaborators/${username}`, { permission: permissionValue });
    return data;
  }

  async createRepoFromTemplate(
    template: string,
    createRepoFromTemplatePayload: CreateRepoFromTemplatePayload
  ): Promise<CreateRepoFromTemplateResponse> {
    const { data } = await this.axios.post<CreateRepoFromTemplateResponse>(`/repos/${template}/generate`, createRepoFromTemplatePayload);
    return data;
  }

  async listBranches(owner: string, repo: string): Promise<ListBranchesResponse> {
    const { data } = await this.axios.get<ListBranchesResponse>(`/repos/${owner}/${repo}/branches`);
    return data;
  }

  async renameBranch(owner: string, repo: string, oldBranch: string, renameBranchPayload: RenameBranchPayload): Promise<RenameBranchResponse> {
    const { data } = await this.axios.post<RenameBranchResponse>(`/repos/${owner}/${repo}/branches/${oldBranch}/rename`, renameBranchPayload);
    return data;
  }

  async getRepository(owner: string, repo: string): Promise<GetRepositoryResponse> {
    const { data } = await this.axios.get<GetRepositoryResponse>(`/repos/${owner}/${repo}`);
    return data;
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    const { data } = await this.axios.delete(`/repos/${owner}/${repo}`);
    return data;
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<BranchResponse> {
    const { data } = await this.axios.get<BranchResponse>(`/repos/${owner}/${repo}/branches/${branch}`);
    return data;
  }

  async getBranchProtection(owner: string, repo: string, branch: string): Promise<BranchProtectionResponse> {
    const { data } = await this.axios.get<BranchProtectionResponse>(`/repos/${owner}/${repo}/branches/${branch}/protection`);
    return data;
  }

  async getCommitSignatureProtection(owner: string, repo: string, branch: string): Promise<RequireSignatureResponse> {
    const { data } = await this.axios.get<RequireSignatureResponse>(`/repos/${owner}/${repo}/branches/${branch}/protection/required_signatures`);
    return data;
  }

  async getCollaborators(owner: string, repo: string): Promise<CollaboratorsResponse> {
    const { data } = await this.axios.get<CollaboratorsResponse>(`/repos/${owner}/${repo}/collaborators`);
    return data;
  }

  async listRepos(owner: string, page: number): Promise<AxiosResponse<Repo[]>> {
    const response: AxiosResponse<Repo[]> = await this.axios.get(`https://api.github.com/orgs/${owner}/repos`, {
      params: { per_page: 100, page: page, type: 'all' },
    });
    return response;
  }
}
