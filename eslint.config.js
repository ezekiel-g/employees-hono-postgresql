import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': ['off'],
    'max-len': ['error', 80],
    'antfu/no-top-level-await': ['off'],
    'antfu/top-level-function': ['off'],
    'node/prefer-global/process': ['off'],
    'node/prefer-node-protocol': ['off'],
  },
})
