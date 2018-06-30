#!/usr/bin/env node
const argv = require('yargs').argv;
const fs = require('fs-extra');
const { join } = require('path');
const createProject = require('./scripts/createProject');
const copyPackages = require('./scripts/copyPackages');
const invoke = require('./scripts/invoke');
const run = require('./scripts/run');

(async () => {
  const projectName = 'tests-project';
  const projectPath = join(__dirname, `../../${projectName}`);

  // vue create
  if (!argv.quick) {
    await createProject(
      projectName,
      {
        plugins: {
          '@vue/cli-plugin-babel': {},
        },
      },
      process.cwd(),
    );

    // vue invoke
    await invoke(projectPath);
  }

  // ---/---

  // Copy mocks
  await fs.copy('tests/e2e/mocks', 'tests-project');

  // Use current sources to tests project
  await copyPackages(projectPath);

  if (argv.quick && argv.invoke) {
    // vue invoke
    await invoke(projectPath);
  }

  // Run server and start cypress
  await run(projectPath, argv.open ? 'open' : 'run');
})().catch(err => {
  console.error(err.stack || err.message || err);
});
