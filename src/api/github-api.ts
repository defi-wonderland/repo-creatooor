import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as jwt from 'jsonwebtoken';
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
  AccessPermission,
} from '../types/github';

export class GithubApi {
  private readonly axios: AxiosInstance;

  constructor(accessToken: string) {
    this.axios = axios.create({
      baseURL: 'https://api.github.com',
    });
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  static async initialize(appId: string, installationId: string, privateKey: string, expirationDurationInSeconds: number = 600) {
    const jwt = this.generateJWT(appId, privateKey, expirationDurationInSeconds);
    const accessToken = await this.getInstallationAccessToken(jwt, installationId);
    return new GithubApi(accessToken);
  }

  private static generateJWT(appId: string, privateKey: string, expirationDurationInSeconds: number) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + expirationDurationInSeconds,
      iss: appId,
    };
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  }

  private static async getInstallationAccessToken(jwt: any, installationId: string) {
    const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${jwt}`,
      'User-Agent': 'My-Github-App',
    };

    const response = await axios.post(url, {}, { headers });
    return response.data.token; // This is your installation access token
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

  async addAutolink(owner: string, repo: string, projectCode: string): Promise<void> {
    const body: object = {
      key_prefix: projectCode,
      url_template: `https://linear.app/defi-wonderland/issue/${projectCode}-<num>`,
    };
    const { data } = await this.axios.post(`/repos/${owner}/${repo}/autolinks`, body);

    return data;
  }

  async addPrTemplate(owner: string, repo: string, projectCode: string): Promise<void> {
    const file = '.github/pull_request_template.md';
    const content: string = `# 🤖 Linear\n\nCloses ${projectCode}-XXX\n`;
    const b64Content: string = Buffer.from(content).toString('base64');
    const body: object = {
      message: 'Added PR template to Repo',
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

  async fileExists(owner: string, repo: string, path: string): Promise<boolean> {
    // The response can only be successful if the file is present
    // For this reason, we're discarding the response data and are looking only at the status
    try {
      await this.axios.get(`/repos/${owner}/${repo}/contents/${path}`);
      return true;
    } catch (err) {
      console.log(`Checking if ${path} exists: ${err}`);
      return false;
    }
  }

  async addTeamAccess(owner: string, repo: string, teamSlug: string, permission: AccessPermission): Promise<void> {
    await this.axios.put(`/orgs/${owner}/teams/${teamSlug}/repos/${owner}/${repo}`, {
      permission: permission,
    });
  }
}
