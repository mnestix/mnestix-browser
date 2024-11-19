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
    // mock all svg files
    moduleNameMapper: {
        '^.+\\.(svg)$': '<rootDir>/__mocks__/svg.tsx',
    },
    testMatch: ['**/__tests__/**/*.tsx', '**/?(*.)+(spec|test).tsx'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

// @ts-expect-error We don't know the type
const jestConfigWithOverrides = async (...args) => {
    const fn = createJestConfig(config);
    // @ts-expect-error We don't know the type
    const res = await fn(...args);

    // Don't ignore specific node_modules during transformation. This is needed if a node_module doesn't return valid JavaScript files.
    res.transformIgnorePatterns = res.transformIgnorePatterns!.map((pattern) => {
        if (pattern === '/node_modules/') {
            return '/node_modules/(?!flat|jose|ol|color-space|color-rgba|color-parse|color-name|jose|quick-lru)';
        }
        return pattern;
    });

    return res;
};

module.exports = jestConfigWithOverrides;
