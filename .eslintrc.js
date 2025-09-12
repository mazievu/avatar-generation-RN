module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    'react-native/react-native': true,
  },
  rules: {
    // Allows us to use require statements for images and other assets
    '@typescript-eslint/no-var-requires': 'off',
    // React 17+ doesn't require React to be in scope
    'react/react-in-jsx-scope': 'off',
    // This project uses TypeScript, so prop-types are not needed
    'react/prop-types': 'off',
    // General rules
    'no-console': 'warn', // Warn about console.log statements
    'react-hooks/rules-of-hooks': 'error', // Enforce rules of hooks
    'react-hooks/exhaustive-deps': 'warn', // Check effect dependencies
    // React Native specific rules
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'off',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    // Typescript specific rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
