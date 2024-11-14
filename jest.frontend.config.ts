import nextJest from 'next/jest';
import { Config } from 'jest';

export {};
const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

const config: Config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['cypress'],
    moduleNameMapper: {
        '^.+\\.(svg)$': '<rootDir>/__mocks__/svg.tsx',
    },
    testMatch: ['**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).tsx'],
};

// @ts-expect-error test
const jestConfigWithOverrides = async (...args) => {
    const fn = createJestConfig(config);
    // @ts-expect-error test
    const res = await fn(...args);

    // @ts-expect-error test
    res.transformIgnorePatterns = res.transformIgnorePatterns.map((pattern) => {
        if (pattern === '/node_modules/') {
            return '/node_modules(?!/flat)/';
        }
        return pattern;
    });

    return res;
};

module.exports = jestConfigWithOverrides;
