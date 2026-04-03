const nextPlugin = require("@next/eslint-plugin-next");
const hooksPlugin = require("eslint-plugin-react-hooks");

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...hooksPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
];

module.exports = eslintConfig;
