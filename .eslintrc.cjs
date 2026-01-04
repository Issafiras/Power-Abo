module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'react/no-unknown-property': ['error', { ignore: ['jsx'] }],
    'no-unused-vars': 'off',
    'no-prototype-builtins': 'error',
  },
  overrides: [
    {
      files: ['scripts/**/*.js', 'src/utils/seedPlans.js'],
      env: {
        node: true,
      },
    },
  ],
}
