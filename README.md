# Repo Creatooor

The repository creator workflow allows users to create new repositories with all the Wonderland securities configurations.

## How to use it?

1. Click on the **actions** button and then click on the "Repo creation" action.
   ![alt text](https://github.com/defi-wonderland/repo-creatooor/blob/main/blob/step_1.png?raw=true)
   ![alt text](https://github.com/defi-wonderland/repo-creatooor/blob/main/blob/step_2.png?raw=true)
2. Click on **Run Workflow**.
   ![alt text](https://github.com/defi-wonderland/repo-creatooor/blob/main/blob/step_3.png?raw=true)
3. Fill in the mandatory field **Repository name**.
4. If needed fill the codeowners field, if not the codeowners will be **@defi-wonderland/default-codeowner**.
5. If you are creating the repo from a template fill the template field (eg. defi-wonderland/solidity-hardhat-boilerplate), if not leave it empty.
6. Click on **Run Workflow**.
   ![alt text](https://github.com/defi-wonderland/repo-creatooor/blob/main/blob/step_4.png?raw=true)
7. After some seconds, you will find your new repository in the organization home page.

## Good practices

- **Always add teams instead of individual collaborators and prioritize teams**.

## The repository created will have two branches, `main` (default) and `dev` with the following setup:

**Critical**

- Signed commits
- 1-2 minimum approvals for a PR to be merged
- Lock main/master branch and dev branch, you should only use side branches
- Only merge to main from dev
- Codeowners for the main branch
- Require conversation resolution before merging

**Repository Settings**

- [✓] Disable "Allow rebase merging"
- [✓] Enable "Automatically delete head branches"
- [✓] Main branch protection
  - [✓] Enable "Require a pull request before merging"
  - [✓] Change "Require approvals" to 2
  - [✓] Enable "Dismiss stale pull request approvals when new commits are pushed"
  - [✓] Enable "Require review from Code Owners"
  - [✓] Enable "Require status checks to pass before merging"
  - [✓] Enable "Require branches to be up to date before merging"
  - [✓] Enable "Require signed commits"
- [✓] Dev branch protection
  - [✓] Enable "Require a pull request before merging"
  - [✓] Change "Require approvals" to 1
  - [✓] Enable "Dismiss stale pull request approvals when new commits are pushed"
  - [✓] Enable "Require status checks to pass before merging"
  - [✓] Enable "Require branches to be up to date before merging"
  - [✓] Enable "Require signed commits"
