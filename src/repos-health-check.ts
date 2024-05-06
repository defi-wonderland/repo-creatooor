import { GithubApi } from './api/github-api';
import { notifyDiscord } from './utils/discord';
import { getEnvVariable, getEnvVariableOrEmpty } from './utils/env';
import { Assertion, RepoCheckers } from './utils/repo-checkers';
import { RepoUtils } from './utils/repo-utils';

type RepoDiagnostic = {
  name: string;
  assertions: Assertion[];
  hasIssues: boolean;
};

(async () => {
  const diagnoses: RepoDiagnostic[] = [];
  const appId = getEnvVariable('GH_APP_ID');
  const installationId = getEnvVariable('GH_INSTALLATION_ID');
  const privateKey = getEnvVariable('GH_APP_PRIVATE_KEY');
  const githubApi = await GithubApi.initialize(appId, installationId, privateKey);
  const owner = getEnvVariable('GH_OWNER');
  const repoUtils = new RepoUtils(githubApi);
  const allRepos = await repoUtils.listAllRepos(owner);
  const discordWebhook = getEnvVariableOrEmpty('DISCORD_WEBHOOK');
  const trigger = getEnvVariable('GH_USER_CREATOR');

  await notifyDiscord(
    discordWebhook,
    `***${trigger} triggered Wonderland github repos health check*** 🏥\nhttps://github.com/defi-wonderland/repo-creatooor/actions/workflows/health-check.yml`
  );

  console.info('Running health checks on all repos...');

  for (const repo of allRepos) {
    const checkers = new RepoCheckers(githubApi, owner, repo.name, '', '', true);
    const assertions = await checkers.runAllReposHealthChecks();
    const hasIssues: boolean = assertions.find((assertion) => assertion.condition == false) != undefined;
    const diagnosis: RepoDiagnostic = {
      name: repo.name,
      assertions: assertions,
      hasIssues: hasIssues,
    };
    diagnoses.push(diagnosis);
  }

  const issues = diagnoses.filter((diagnosis) => diagnosis.hasIssues);

  const title = `***Found ${issues.length} repos with issues ***`;
  if (issues.length > 0) {
    const message = `${title}\n💈💈💈 ***Hall of Shame*** 💈💈💈`;
    console.info(message);
    await notifyDiscord(discordWebhook, message);
  }

  let messageBuffer = '';
  for (const issue of issues) {
    let message = `\n\n🛡️ ***${issue.name}***:`;
    for (const assertion of issue.assertions) {
      if (assertion.condition == false) {
        message = message + `\n       • ${assertion.message}`;
      }
    }
    console.log(message);

    if (messageBuffer.length + message.length > 2000) {
      await notifyDiscord(discordWebhook, messageBuffer);
      messageBuffer = '';
    } else {
      messageBuffer = messageBuffer + message;
    }
    // Wait for 1 second to avoid hitting the rate limit
    await new Promise((f) => setTimeout(f, 1000));
  }

  if (messageBuffer.length > 0) {
    await notifyDiscord(discordWebhook, messageBuffer);
  }

  if (issues.length > 0) {
    const message = `\n\nPlease fix the issues! or run repo-doctor 👨‍⚕️🩺 to fix them automatically.`;
    await notifyDiscord(discordWebhook, message);
    throw new Error(message);
  } else {
    console.info('No issues found in any of the repositories! 🎉');
    await notifyDiscord(
      discordWebhook,
      `${title}

⛵  Sigh, at this rate the healthcare system will go bankrupt.

Consider introducing some bugs for Captain Hook 💸 🪝`
    );
  }
})();
