export {};
module.exports = {
    // transform: {
    //     '^.+\\.ts?$': ['ts-jest', { isolatedModules: true }],
    // },
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
