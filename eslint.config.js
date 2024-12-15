import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node
    },
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      quotes: ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'computed-property-spacing': ['error', 'never'],
    },
  },
  pluginJs.configs.recommended,
];
