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

const healthCheck = async () => {
  const diagnoses: RepoDiagnostic[] = [];
  const token = getEnvVariable('GH_TOKEN');
  const githubApi = new GithubApi(token);
  const owner = getEnvVariable('GH_OWNER');
  const repoUtils = new RepoUtils(githubApi);
  const allRepos = await repoUtils.listAllRepos(owner);
  const discordWebhook = getEnvVariableOrEmpty('DISCORD_WEBHOOK');

  const trigger = getEnvVariable('GH_USER_CREATOR');
  await notifyDiscord(discordWebhook, `***${trigger} triggered Wonderland github repos health check*** 🏥`);

  console.log('Running health checks on all repos...');
  await Promise.all(
    allRepos.map(async (repo) => {
      const checkers = new RepoCheckers(githubApi, owner, repo.name, '', '', false);
      const assertions = await checkers.runAllReposHealthChecks();
      const hasIssues: boolean = assertions.find((assertion) => assertion.condition == false) != undefined;
      const diagnosis: RepoDiagnostic = {
        name: repo.name,
        assertions: assertions,
        hasIssues: hasIssues,
      };
      diagnoses.push(diagnosis);
    })
  );

  const issues = diagnoses.filter((diagnosis) => diagnosis.hasIssues);
  let message = '💈💈💈 ***Hall of Shame*** 💈💈💈';
  const title = `***Found ${issues.length} repos with issues ***`;
  console.log(title);

  issues.forEach((issue) => {
    const msg = `\n\n🛡️ ***${issue.name}***:`;
    message = message + msg;
    console.log(msg);
    for (const assertion of issue.assertions) {
      if (assertion.condition == false) {
        const msg = `\n       • ${assertion.message}`;
        message = message + msg;
        console.log(msg);
      }
    }
  });

  if (issues.length > 0) {
    await notifyDiscord(discordWebhook, `${title}\n\n${message}`);
    throw new Error('Please fix the issues specified above');
  } else {
    await notifyDiscord(
      discordWebhook,
      `${title}

⛵  Sigh, at this rate the healthcare system will go bankrupt.

Consider introducing some bugs for Captain Hook 💸 🪝`
    );
  }
};

healthCheck();
