import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: [
            // "node_modules/", "dist/", "**/*.d.ts"
            "**/node_modules/**",
            "**/dist/**",
            "**/*.d.ts",
        ],
    },
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // plugins: ["sql"],
        rules: {
            // Base ESLint rules
            "no-unused-vars": "off",
            "no-unused-expressions": "off",
            "no-console": "off",
            "prefer-const": "error",
            "no-undef": "error",

            // TypeScript rules
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-console": "off",
        },
    },
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];
