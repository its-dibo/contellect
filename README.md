# Contellect

A monorepo that hosts multiple workspaces (apps and packages).

## workspace structure

- **packages:**

  contains the independent packages, libraries and plugins.

- **apps:**

  contains the applications.

## install

- install nodejs and pnpm (the app is tested on node v20),
  check `engines` prop to see the supported versions
- install pnpm globally by running `npm i -g pnpm`
- run `pnpm install`

## run apps

- read README file for each app separately

## unit testing

- run `pnpm run test` to perform a full unit test

- run `test:changed` to test the changed files

- run `test:fails` to rerun the failed tests
