module.exports = {
  extends: ['eslint:recommended', 'standard', 'plugin:react/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      jsx: true,
      es6: true,
      modules: true
    }
  },
  settings: {
    react: {
      createClass: 'createReactClass', // Regex for Component Factory to use,
      // default to 'createReactClass'
      pragma: 'React', // Pragma to use, default to 'React'
      version: 'detect'
    },
    propWrapperFunctions: ['forbidExtraProps'] // The names of any functions used to wrap the
    // propTypes object, e.g. `forbidExtraProps`.
    // If this isn't set, any propTypes wrapped in
    // a function will be skipped.
  },
  plugins: ['react', 'standard'],
  rules: {
    // enable additional rules
    indent: ['error', 4, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    'react/no-string-refs': 0,
    'react/prop-types': 0,
    'comma-dangle': 0,
    'no-console': 0
  }
};
