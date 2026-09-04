import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [
  { ignores: [".next/**", "node_modules/**", "public/**"] },
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {languageOptions: { globals: { ...globals.browser, ...globals.node } }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: { react: { version: "detect" } },
    rules: { "react/react-in-jsx-scope": "off" },
  },
  {
    files: ["src/**/*.{js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "formik",
              importNames: ["Formik"],
              message:
                "Use the shared ValidatedFormik wrapper so validation runs only after submit.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/elements/ui/forms/ValidatedFormik.jsx"],
    rules: { "no-restricted-imports": "off" },
  },
];
