const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'p4h1qv',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
