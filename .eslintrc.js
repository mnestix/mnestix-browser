module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        amd: true,
        node: true,
        'cypress/globals': true,
    },
    plugins: ['@typescript-eslint', 'formatjs', 'cypress'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react/jsx-runtime',
        'plugin:@next/next/recommended',
    ],
    rules: {
        'no-console': [1, { allow: ['warn', 'error'] }],
        quotes: [2, 'single'],
        'object-curly-spacing': [1, 'always'],
        'formatjs/no-id': 1,
        'react-hooks/exhaustive-deps': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
            },
        ],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
