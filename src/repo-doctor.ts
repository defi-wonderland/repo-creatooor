import { GithubApi } from './api/github-api';
import { notifyDiscord } from './utils/discord';
import { getEnvVariable } from './utils/env';
import { RepoCheckers } from './utils/repo-checkers';
import { RepoUtils } from './utils/repo-utils';

(async () => {
  const token = getEnvVariable('GH_TOKEN');
  const githubApi = new GithubApi(token);
  const owner = getEnvVariable('GH_OWNER');
  const repoUtils = new RepoUtils(githubApi);
  const repo = getEnvVariable('GH_REPO_NAME');
  const trigger = getEnvVariable('GH_USER_CREATOR');
  const discordWebhook = getEnvVariable('DISCORD_WEBHOOK');
  let discordNotifications = [];

  const checkers = new RepoCheckers(githubApi, owner, repo, '', '', true);

  try {
    let message = `👨‍⚕️ _${trigger}_ triggered repo doctor for [**${owner}/${repo}**](https://github.com/${owner}/${repo})\n\n🩸🔬 Diagnosing **${repo}**...`;
    console.info(message);
    discordNotifications.push(message);

    const diagnosis = await checkers.runAllReposHealthChecks();
    const issues = diagnosis.filter((assertion) => assertion.condition == false);
    message = '';
    if (issues.length > 0) {
      message = `🦠 Found **${issues.length} issues**:`;

      issues.forEach((issue) => {
        message = message + `\n• ${issue.message}`;
      });
      message = message + `\n\n🛡️ Fixing **${repo}**...`;
      console.info(message);
      discordNotifications.push(message);

      const repoData = await githubApi.getRepository(owner, repo);
      // Check if the repo is public
      if (repoData.private == false || repoData.visibility == 'public') {
        const branches = await githubApi.listBranches(owner, repo);
        branches.forEach(async (branch) => {
          if (branch.name == 'main' || branch.name == 'dev') {
            await repoUtils.updatePublicBranchProtection(owner, repo, branch.name);
          }
        });
      } else {
        // Check or create main branch
        await repoUtils.checkBranchExistsOrCreate(owner, repo, 'main');

        // Check or create dev branch
        await repoUtils.checkBranchExistsOrCreate(owner, repo, 'dev', 'main');

        // Apply the security settings
        await repoUtils.updateRepo(owner, repo, '');
        await repoUtils.updateBranchProtection(owner, repo, 'main', true);
        await repoUtils.requireSignature(owner, repo, 'main');
        await repoUtils.updateBranchProtection(owner, repo, 'dev', false);
        await repoUtils.requireSignature(owner, repo, 'dev');
      }

      const issuesAfterFix = (await checkers.runAllReposHealthChecks()).filter((assertion) => assertion.condition == false);

      if (issuesAfterFix.length > 0) {
        message = `🤒 After running tests **${repo}** is still sick with the following issues:`;
        issuesAfterFix.forEach((issue) => {
          message = message + `\n• ${issue.message}`;
        });
        console.info(message);
        discordNotifications.push(message);
        checkers.assertAll(issuesAfterFix);
      } else {
        message = `🏥 After applying fixes 🛌💉💊 **${repo}** is now healthy`;
        console.info(message);
        discordNotifications.push(message);
      }
    } else {
      message = `🏥 After running tests **${repo}** is healthy`;
      console.info(message);
      discordNotifications.push(message);
    }
  } catch (err) {
    console.error(err);
    const message = `👨‍⚕️❌ Repo doctor failed to heal **${repo}**\nIt will need manual intervention, please check the detailed logs at: https://github.com/defi-wonderland/repo-creatooor/actions/workflows/repo-doctor.yml`;
    console.info(message);
    discordNotifications.push(message);
  } finally {
    notifyDiscord(discordWebhook, discordNotifications.join('\n\n'));
  }
})();
