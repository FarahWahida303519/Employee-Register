const { defineConfig } = require("cypress");

module.exports = defineConfig({
    projectId: 'fr29j7',
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'cypress/reports',
        overwrite: false,
        html: true,
        json: true,
        charts: true,
        reportPageTitle: 'Assignment 1 - Cypress Test Report'
    },
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