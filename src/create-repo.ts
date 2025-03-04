import { GithubApi } from './api/github-api';
import { notifyDiscord } from './utils/discord';
import { getEnvVariable, getEnvVariableOrEmpty } from './utils/env';
import { RepoCheckers } from './utils/repo-checkers';
import { RepoUtils } from './utils/repo-utils';

const createRepo = async () => {
  const appId = getEnvVariable('GH_APP_ID');
  const installationId = getEnvVariable('GH_INSTALLATION_ID');
  const privateKey = getEnvVariable('GH_APP_PRIVATE_KEY');
  const githubApi = await GithubApi.initialize(appId, installationId, privateKey);
  const owner = getEnvVariable('GH_OWNER');
  const repoUtils = new RepoUtils(githubApi);
  const repo = getEnvVariable('GH_REPO_NAME').replace(/ /g, '-');
  const admin = getEnvVariable('GH_USER_CREATOR');
  const template = getEnvVariableOrEmpty('GH_TEMPLATE');
  const repoCheckers = new RepoCheckers(githubApi, owner, repo, template, admin);
  const discordWebhook = getEnvVariableOrEmpty('DISCORD_WEBHOOK');
  const projectCode = getEnvVariableOrEmpty('LINEAR_PROJECT_CODE');

  notifyDiscord(discordWebhook, `${admin} triggered repo creation: **${owner}/${repo}** 📦 `);

  try {
    if (template != '') {
      await repoUtils.createRepoFromTemplate(owner, repo, template);
      console.log('Waiting for repo to be created...');
      await new Promise((f) => setTimeout(f, 5000));
    } else {
      await repoUtils.createRepo(owner, repo, '');
    }

    // Check or create main branch
    await repoUtils.checkBranchExistsOrCreate(owner, repo, 'main');

    if (projectCode != '') {
      await repoUtils.addAutolink(owner, repo, projectCode);
      await repoUtils.addPrTemplate(owner, repo, projectCode);
    }
    await repoUtils.addCollaborator(owner, repo, admin, 'admin');
    await repoUtils.addTeamAccess(owner, repo, 'defi-wonderland/all', 'pull');
    await repoUtils.checkBranchExistsOrCreate(owner, repo, 'dev', 'main');
    await repoUtils.updateRepo(owner, repo, '');
    await repoUtils.updateBranchProtection(owner, repo, 'main', true);
    await repoUtils.requireSignature(owner, repo, 'main');
    await repoUtils.updateBranchProtection(owner, repo, 'dev', false);
    await repoUtils.requireSignature(owner, repo, 'dev');

    repoCheckers.runPostCreationChecks();

    console.log(`Link to the repo https://github.com/${owner}/${repo}`);
    notifyDiscord(discordWebhook, `Repo **${repo}** successfully created 🚀 \nLink to the repo https://github.com/${owner}/${repo}`);
  } catch (err) {
    await notifyDiscord(
      discordWebhook,
      `Repo **${repo}** creation failed ❌ please check the detailed logs at: https://github.com/defi-wonderland/repo-creatooor/actions/workflows/repo-creation.yml`
    );
    throw err;
  }
};

createRepo();
