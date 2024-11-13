import nextJest from 'next/jest';
import { Config } from 'jest';

export {};
const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

const config: Config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['cypress'],
    testMatch: ['**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).tsx'],
};

module.exports = createJestConfig(config);