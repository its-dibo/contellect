# Contellect

A monorepo that hosts multiple workspaces (apps and packages).

## technical features

- SOLID principals are applied
- each function is well-documented as jsDocs
- each route is documented and has full description details
- the code is checked for quality and vulnerabilities via EsLint Rules
- the code is automatically formatted when pushed to the upstream

## technology used

- NestJs (for the backend)
- Angular (for UI)
- Tailwind and material design (for styling)
- jest (for unit testing)
- esbuild (for bundling)
- swagger (for documenting APIs)
- PWA (progress web app) is enabled
- Dockker for containerizing

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
