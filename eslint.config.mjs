import snytemConfig from '@sny1411/eslint-config';

export default [
    ...snytemConfig,
    {
        ignores: [`dist/`],
    },
    {
        files: [`**/*.ts`, `**/*.tsx`],
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: { // TODO : mettre cette règle dans @sny1411/eslint-config
            '@stylistic/quotes': [`error`, `backtick`],
        },
    },
];