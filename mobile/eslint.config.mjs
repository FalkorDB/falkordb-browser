import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // android/ and ios/ are generated native projects.
    { ignores: ["android/**", "ios/**", "dist/**", "node_modules/**"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    // ES modules throughout, so no CommonJS require/module/__dirname.
    { languageOptions: { globals: globals.nodeBuiltin } },
);
