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
  const token = getEnvVariable('GH_TOKEN');
  const githubApi = new GithubApi(token);
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
    const checkers = new RepoCheckers(githubApi, owner, repo.name, '', '', false);
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
  let message = '💈💈💈 ***Hall of Shame*** 💈💈💈';
  const title = `***Found ${issues.length} repos with issues ***`;
  console.info(title);

  issues.forEach((issue) => {
    message = message + `\n\n🛡️ ***${issue.name}***:`;
    for (const assertion of issue.assertions) {
      if (assertion.condition == false) {
        message = message + `\n       • ${assertion.message}`;
      }
    }
  });

  if (issues.length > 0) {
    await notifyDiscord(discordWebhook, `${title}\n\n${message}`);
    console.log(message);
    throw new Error('Please fix the issues specified above');
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
