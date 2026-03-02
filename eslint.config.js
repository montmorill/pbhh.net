import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['**/components/ui/**'],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
  },
})
