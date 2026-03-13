import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['src/components/ui/**', 'server/drizzle/**'],
  rules: {
    'no-console': 'off',
    'style/no-mixed-operators': 'off',
    'style/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
    'vue/singleline-html-element-content-newline': 'off',
  },
})
