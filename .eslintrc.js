module.exports = {
  root: true,
  parserOptions: {
    ecmaFeatures: { js: true },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    'react-native/no-inline-styles': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/react-in-jsx-scope': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
  },
};
