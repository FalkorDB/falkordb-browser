import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      ".next/**",
      "**/*.d.ts",
      "app/components/forceSimulationWorker.js",
      "components/ui/**",
      "coverage/**",
      "desktop/**",
      "eslint.config.mjs",
      "mobile/**",
      "next.config.js",
      "node_modules/**",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
      "no-restricted-imports": ["error", {
        paths: [{
          name: "next/navigation",
          importNames: ["useRouter"],
          message: "Use useAppRouter from @/lib/useAppRouter so deferred URL sync cannot cancel the navigation.",
        }],
      }],
    },
  },
  {
    files: ["lib/useAppRouter.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
];
