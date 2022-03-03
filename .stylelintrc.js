module.exports = {
  extends: [
    "stylelint-config-recommended",
  ],
  plugins: [
    "stylelint-scss",
    "stylelint-at-rule-no-children",
    "stylelint-declaration-use-variable",
  ],
  ignoreFiles: [
    "app/build/**/*"
  ],
  rules: {
    "at-rule-no-unknown": [true, {
      ignoreAtRules: [
        /mixin/,
        /include/,
        /function/,
        /return/,
      ],
    }],
    "at-rule-no-vendor-prefix": true,
    "block-no-empty": [true, {
      "message": "No empty rule blocks.",
    }],
    "color-function-notation": "legacy",
    "declaration-block-no-duplicate-properties": true,
    "declaration-no-important": true,
    "font-family-name-quotes": "always-unless-keyword",
    "font-weight-notation": "numeric",
    "function-url-no-scheme-relative": true,
    "function-url-quotes": "always",
    "max-line-length": 80,
    "media-feature-name-no-vendor-prefix": true,
    "number-max-precision": [0, {
      "ignoreUnits": /^(?!px).*$/,
      "message": "Value in px mast be integer number.",
    }],
    "no-extra-semicolons": null,

    "no-unknown-animations": true,
    "time-min-milliseconds": [300, {
      "message": "No very fast animation",
      "ignore": ["delay"],
    }],
    "value-no-vendor-prefix": [true, {
      "message": "Not needed with autoprefixer",
    }],
    "selector-class-pattern": /^([a-z][a-z0-9]*)([_-]{1,2}[a-z0-9]+)*$/,
    "selector-max-compound-selectors": 2,
    "selector-max-universal": 1,
    "selector-pseudo-class-no-unknown": [true, {
      ignorePseudoClasses: ["global"],
    }],
    "aditayvm/at-rule-no-children": true,
    "sh-waqar/declaration-use-variable": [[
      "color",
      "background-color",
      {
        ignoreValues: [
          "transparent",
          "/transparentize/",
          "inherit",
          "/lighten/",
          "/darken/",
          "/-func/",
        ],
      },
    ]],
    "scss/at-function-pattern": /.+-func/,
    "scss/no-duplicate-dollar-variables": true,
    "scss/media-feature-value-dollar-variable": "always",
  },
}
