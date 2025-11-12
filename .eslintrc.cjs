// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    // Uwaga: celowo bez "plugin:@typescript-eslint/recommended-requiring-type-checking"
    // żeby nie włączać reguł wymagających type-checkera
    'plugin:@typescript-eslint/recommended'
  ],
  settings: { react: { version: 'detect' } },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: null, // brak typed-lintingu dla TS/TSX
        sourceType: 'module'
      },
      rules: {
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/ban-ts-comment': 'off'
      }
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      parser: 'espree',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.config.cjs',
    '.eslintrc.cjs'
  ]
};
