import js from "@eslint/js";
import globals from "globals";

export default [
    // server/ is a copy of the web build, dist/ is electron-builder's output.
    { ignores: ["server/**", "dist/**", "node_modules/**"] },
    js.configs.recommended,
    {
        files: ["**/*.cjs"],
        languageOptions: { sourceType: "commonjs", globals: globals.node },
    },
    {
        files: ["**/*.mjs"],
        languageOptions: { sourceType: "module", globals: globals.node },
    },
];
