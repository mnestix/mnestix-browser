export {};
module.exports = {
    moduleDirectories: ['node_modules', 'src'],
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
