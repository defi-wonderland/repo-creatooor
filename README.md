# Repo Creatooor

The repository creator workflow allows users to create new repositories with all the Wonderland securities configurations.

## How to use it?

1. Click on the **Actions** button and then click on the "Repo creation" action.
2. Click on **Run Workflow**.
3. Fill in the mandatory field **Repository name**.
4. If needed fill in the codeowners field, if not the codeowners will be **@defi-wonderland/default-codeowner**.
5. If you are creating the repo from a template fill in the template field (eg. defi-wonderland/solidity-hardhat-boilerplate), if not leave it empty.
6. Click on **Run Workflow**.
7. After some seconds, you will find your new repository on the organization's home page.

## Keep in mind

- The user that ran the workflow will have admin access to the repository. When adding more roles, **always prioritize adding teams** instead of individual collaborators.

## Repository Settings

- [✓] Disable "Allow rebase merging"
- [✓] Enable "Automatically delete head branches"
- [✓] Enable "Always suggest updating pull request branches"
- [✓] Disable Issues
- [✓] Disable Wiki
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
