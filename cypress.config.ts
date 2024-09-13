import { defineConfig } from 'cypress';

export default defineConfig({
    video: true,
    videoCompression: true,
    retries: 2,
    reporter: 'junit',
    reporterOptions: {
        mochaFile: 'cypress/results/results.xml',
        toConsole: false,
    },
    e2e: {
        baseUrl: 'http://localhost:3000/',
        excludeSpecPattern: '**/ignoredTestFiles/*.js',
        specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
        experimentalRunAllSpecs: true,
    },
    env: {
        AAS_REPO_API_URL: 'http://localhost:5064/repo',
        SUBMODEL_REPO_API_URL: 'http://localhost:5064/repo',
        MNESTIX_BACKEND_API_URL: 'http://localhost:5064',
        AAS_DISCOVERY_API_URL: 'http://localhost:5064/discovery',
        MNESTIX_API_KEY: process.env.MNESTIX_BACKEND_API_KEY,
    },
});
