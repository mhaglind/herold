module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Line wrapping
  printWidth: 100,

  // JSX specific
  jsxSingleQuote: false,

  // Other formatting options
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // File type overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
  ],
};