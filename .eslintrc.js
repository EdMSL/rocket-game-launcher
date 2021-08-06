/* eslint-disable quotes, @typescript-eslint/no-magic-numbers, max-len */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    project: './tsconfig.json',
    tsconfigRootDir: '.',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
  },
  extends: [
    'airbnb-typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'react',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts'],
      },
      webpack: {
        config: './config/webpack.base.config.js',
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
    'react': {
      version: 'detect',
    },
  },
  /* Стилистические правила переключены на выдачу предупреждения, а не ошибки, как это сделано в исходном конфиге */
  rules: {
    'arrow-parens': [1, 'always'],
    'arrow-spacing': [1, {
      before: true,
      after: true,
    }],
    'eol-last': 1,
    'indent': [1, 2, {
      SwitchCase: 1,
      offsetTernaryExpressions: true,
      flatTernaryExpressions: true,
      ignoredNodes: [
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild',
      ],
      ignoreComments: false,
    }],
    'key-spacing': [1, { beforeColon: false, afterColon: true }],
    'linebreak-style': 0,
    'max-len': [1, 100],
    'max-classes-per-file': 0,
    'no-else-return': [1, { allowElseIf: true }],
    'no-multi-spaces': [1, {
      ignoreEOLComments: false,
    }],
    'no-multiple-empty-lines': [1, { max: 1 }],
    'no-plusplus': [1, { 'allowForLoopAfterthoughts': true }],
    'no-trailing-spaces': 1,
    'quote-props': [1, 'as-needed', { unnecessary: false }],
    'object-curly-newline': [1, {
      minProperties: 3,
      multiline: true,
      consistent: true,
    }],
    'object-property-newline': [1, {
      allowAllPropertiesOnSameLine: true,
    }],
    'padded-blocks': [1, {
      blocks: 'never',
      classes: 'never',
      switches: 'never',
    }, {
      allowSingleLineBlocks: true,
    }],
    'semi-spacing': [1, {
      before: false,
      after: true,
    }],
    'space-in-parens': [1, 'never'],
    'spaced-comment': 0,

    'import/extensions': [2, 'always', {
      'js': 'never', 'ts': 'never', 'tsx': 'never',
    }],
    'import/no-cycle': [2, { ignoreExternal: true }],
    'import/no-extraneous-dependencies': 0,
    'import/order': [1, {
      groups: [
        [
          'builtin',
          'external',
          'internal',
        ],
      ],
      'newlines-between': 'always',
    }],
    'import/prefer-default-export': 0,

    'react/jsx-indent': 1,
    'react/jsx-fragments': [1, 'element'],
    'react/jsx-max-props-per-line': [2, {
      'maximum': 1,
      'when': 'always',
    }],
    'react/prefer-stateless-function': 0,
    'react/prop-types': 0,

    '@typescript-eslint/brace-style': [1, '1tbs', { 'allowSingleLine': true }],
    '@typescript-eslint/comma-dangle': [1, 'always-multiline'],
    '@typescript-eslint/comma-spacing': 1,
    '@typescript-eslint/consistent-type-definitions': [1, 'interface'],
    '@typescript-eslint/consistent-type-imports': [1, {
      prefer: 'no-type-imports',
      disallowTypeAnnotations: true,
    }],
    '@typescript-eslint/dot-notation': [1, { allowKeywords: true }],
    '@typescript-eslint/explicit-function-return-type': [1],
    '@typescript-eslint/func-call-spacing': [1, 'never'],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/keyword-spacing': [1],
    '@typescript-eslint/member-delimiter-style': [1, {
      multiline: {
        delimiter: 'comma',
        requireLast: true,
      },
      singleline: {
        delimiter: 'comma',
        requireLast: true,
      },
    }],
    '@typescript-eslint/naming-convention': [2, {
      'selector': 'interface',
      'format': ['PascalCase'],
      'custom': {
        'regex': '^I[A-Z]',
        'match': true,
      },
    },
    ],
    '@typescript-eslint/no-extra-parens': [1, 'all', {
      conditionalAssign: false,
      nestedBinaryExpressions: false,
      returnAssign: false,
      ignoreJSX: 'multi-line',
      enforceForArrowConditionals: false,
    }],
    '@typescript-eslint/no-extra-semi': 1,
    '@typescript-eslint/no-magic-numbers': [1, {
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
      enforceConst: false,
      detectObjects: false,
      ignoreNumericLiteralTypes: false,
      ignoreEnums: false,
    }],
    '@typescript-eslint/no-shadow': 1,
    '@typescript-eslint/no-unused-vars': [1],
    '@typescript-eslint/quotes': [1, 'single', { avoidEscape: true }],
    '@typescript-eslint/object-curly-spacing': [1, 'always'],
    '@typescript-eslint/semi': [1, 'always'],
    '@typescript-eslint/space-before-function-paren': 1,
    '@typescript-eslint/space-infix-ops': [1, { int32Hint: false }],
    '@typescript-eslint/type-annotation-spacing': [1, {
      before: false,
      after: true,
      overrides: { 'arrow': { before: true, after: true } },
    }],
  },
};
