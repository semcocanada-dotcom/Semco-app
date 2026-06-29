module.exports = {
  root: true,
  extends: 'expo',
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'supabase/functions/'],
  overrides: [
    {
      files: ['*.config.js', '.eslintrc.js', 'jest.config.js'],
      env: { node: true },
    },
  ],
};
