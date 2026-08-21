import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import pluginPrettier from "eslint-plugin-prettier";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
      react.configs.flat["jsx-runtime"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
    },
    plugins: {
      react,
      prettier: pluginPrettier,
    },
    rules: {
      // "prettier/prettier": "error",
      // "react/prefer-stateless-function": "error",
      // "react/button-has-type": "error",
      // "react/no-unused-prop-types": "error",
      // "react/jsx-pascal-case": "error",
      // "react/jsx-no-script-url": "error",
      // "react/no-children-prop": "error",
      // "react/no-danger": "error",
      // "react/no-danger-with-children": "error",
      // "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      // "react/jsx-fragments": "error",
      // "react/destructuring-assignment": [
      //   "error",
      //   "always",
      //   { destructureInSignature: "always" },
      // ],
      // "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
      // "react/jsx-max-depth": ["error", { max: 5 }],
      // "react/function-component-definition": [
      //   "warn",
      //   { namedComponents: "arrow-function" },
      // ],
      // "react/jsx-key": [
      //   "error",
      //   {
      //     checkFragmentShorthand: true,
      //     checkKeyMustBeforeSpread: true,
      //     warnOnDuplicates: true,
      //   },
      // ],
      // "react/jsx-no-useless-fragment": "warn",
      // "react/jsx-curly-brace-presence": "warn",
      // "react/no-typos": "warn",
      // "react/display-name": "warn",
      // "react/self-closing-comp": "warn",
      // "react/jsx-sort-props": "warn",
      // "react/react-in-jsx-scope": "off",
      // "react/jsx-one-expression-per-line": "off",
      // "react/prop-types": "off",
      // "react/prefer-read-only-props": "warn",
      // "react/no-array-index-key": "warn",
      // "react-refresh/only-export-components": "warn",
      // "@typescript-eslint/naming-convention": [
      //   "warn",
      //   {
      //     selector: "default",
      //     format: ["camelCase"],
      //     leadingUnderscore: "allow",
      //   },
      //   {
      //     selector: "variable",
      //     // Specify PascalCase for React components
      //     format: ["PascalCase", "camelCase"],
      //     leadingUnderscore: "allow",
      //   },
      //   {
      //     selector: "parameter",
      //     format: ["camelCase"],
      //     leadingUnderscore: "allow",
      //   },
      //   {
      //     selector: "property",
      //     format: null,
      //     leadingUnderscore: "allow",
      //   },
      //   {
      //     selector: "typeLike",
      //     format: ["PascalCase"],
      //   },
      // ],
      // /* plugins eslint-plugin-import, eslint-plugin-filename-rules */
      // // "filename-rules/match": [2, { ".ts": "camelcase", ".tsx": "pascalcase" }],
      // // "import/no-default-export": "error",
      /* NO JSDOC installed */
      // // "jsdoc/require-throws": "error",
      // // "jsdoc/check-indentation": "warn",
      // // "jsdoc/no-blank-blocks": "warn",
      // // "jsdoc/require-asterisk-prefix": "warn",
      // // "jsdoc/require-description": "warn",
      // // "jsdoc/sort-tags": "warn",
      // // "jsdoc/check-syntax": "warn",
      // // "jsdoc/tag-lines": ["warn", "never", { startLines: 1 }],
      // // "jsdoc/require-param": ["warn", { checkDestructuredRoots: false }],
      // // "jsdoc/require-jsdoc": [
      // //   "warn",
      // //   {
      // //     publicOnly: true,
      // //     require: {
      // //       FunctionDeclaration: true,
      // //       FunctionExpression: true,
      // //       ArrowFunctionExpression: true,
      // //       ClassDeclaration: true,
      // //       ClassExpression: true,
      // //       MethodDefinition: true,
      // //     },
      // //     contexts: [
      // //       "VariableDeclaration",
      // //       "TSTypeAliasDeclaration",
      // //       // Encourage documenting React prop types
      // //       "TSPropertySignature",
      // //     ],
      // //     enableFixer: true,
      // //   },
      // // ],
      // // // tsdoc checks this syntax instead
      // // "jsdoc/require-hyphen-before-param-description": "off",
      // // "jsdoc/require-returns": "off",

      // // "tsdoc/syntax": "warn",
      // /* plugin eslint-plugin-prefer-arrow-functions */
      // // "prefer-arrow-functions/prefer-arrow-functions": [
      // //   "warn",
      // //   {
      // //     classPropertiesAllowed: true,
      // //     disallowPrototype: true,
      // //     returnStyle: "unchanged",
      // //   },
      // // ],
      // "arrow-body-style": "warn",
      // "prefer-arrow-callback": [
      //   "warn",
      //   {
      //     allowNamedFunctions: true,
      //   },
      // ],
    },
  },
]);
