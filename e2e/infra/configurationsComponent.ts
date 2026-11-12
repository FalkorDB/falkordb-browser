import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { type Page } from "@playwright/test";

const resolveModule = createRequire(path.resolve("package.json")).resolve;

// Keep React's hooks and rendering real; replace only the table/toast presentation
// and network boundary so these regressions need neither Next.js nor a database.
export async function mountConfigurations(page: Page, initialValue: string | number) {
    page.on("pageerror", error => { throw error; });
    const componentPath = path.resolve("app/settings/Configurations.tsx");
    const component = ts.transpileModule(readFileSync(componentPath, "utf8"), {
        fileName: componentPath,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.ReactJSX,
            inlineSourceMap: true,
            inlineSources: true,
            sourceRoot: path.dirname(componentPath),
        },
    }).outputText;
    const modules: Record<string, string> = {
        react: readFileSync(path.join(path.dirname(resolveModule("react")), "cjs/react.development.js"), "utf8"),
        "react/jsx-runtime": readFileSync(path.join(path.dirname(resolveModule("react")), "cjs/react-jsx-runtime.development.js"), "utf8"),
        "react-dom": readFileSync(path.join(path.dirname(resolveModule("react-dom")), "cjs/react-dom.development.js"), "utf8"),
        "react-dom/client": readFileSync(path.join(path.dirname(resolveModule("react-dom")), "cjs/react-dom-client.development.js"), "utf8"),
        scheduler: readFileSync(path.join(path.dirname(resolveModule("scheduler")), "cjs/scheduler.development.js"), "utf8"),
        "@/lib/utils": `
            exports.prepareArg = encodeURIComponent;
            exports.securedFetch = (url, options) => fetch('/' + url, options);
        `,
        "../components/provider": `
            const React = require('react');
            exports.IndicatorContext = React.createContext({ setIndicator() {} });
            exports.ConnectionContext = React.createContext({ activeConnectionId: 'first' });
        `,
        "@/components/ui/use-toast": `
            exports.useToast = () => ({ toast: window.showToast });
        `,
        "../components/ToastButton": `
            module.exports = ({onClick}) => require('react').createElement('button', {onClick}, 'Undo');
        `,
        "../components/TableComponent": `
            const React = require('react');
            module.exports = ({rows}) => React.createElement('div', null, rows.map(row =>
                row.cells[2].type === 'readonly'
                ? React.createElement('output', {key: row.name, 'aria-label': row.name}, row.cells[2].value)
                : React.createElement('form', {
                    key: row.name,
                    onSubmit: event => {
                        event.preventDefault();
                        row.cells[2].onChange(new FormData(event.currentTarget).get('value'));
                    }
                },
                    React.createElement('label', null, row.name,
                        React.createElement('input', {key: row.cells[2].value, name: 'value', defaultValue: row.cells[2].value})),
                    React.createElement('output', {'aria-label': 'Saved value'}, row.cells[2].value),
                    React.createElement('button', {type: 'submit'}, 'Save')
                )));
        `,
        configurations: "module.exports = window.configurationsExports;",
        entry: `
            const React = require('react');
            const {ConnectionContext} = require('../components/provider');
            const Configurations = require('configurations').default;
            function App() {
                const [connection, setConnection] = React.useState('first');
                const [toast, setToast] = React.useState(null);
                window.showToast = setToast;
                return React.createElement(ConnectionContext.Provider, {value: {activeConnectionId: connection}},
                    React.createElement('button', {onClick: () => setConnection('second')}, 'Switch connection'),
                    React.createElement(Configurations),
                    React.createElement('aside', {'aria-label': 'Notification'}, toast?.description, toast?.action));
            }
            require('react-dom/client').createRoot(document.getElementById('root'))
                .render(React.createElement(React.StrictMode, null, React.createElement(App)));
        `,
    };
    const scripts = Object.entries(modules).map(([name, source]) =>
        `factories[${JSON.stringify(name)}] = function(require, module, exports) {\n${source}\n};`).join("\n");
    await page.route("http://configurations.test/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname === "/api/graph/config") {
            await route.fulfill({ json: { configs: [["MAX_QUEUED_QUERIES", initialValue], ["THREAD_COUNT", 8]] } });
        } else if (url.pathname.startsWith("/api/graph/config/")) {
            await route.fulfill({ json: {} });
        } else if (url.pathname === "/_next/static/Configurations.js") {
            await route.fulfill({ contentType: "application/javascript", body: component });
        } else if (url.pathname === "/_next/static/configurations-fixture.js") {
            await route.fulfill({ contentType: "application/javascript", body: `
                const process = {env: {NODE_ENV: 'development'}};
                const factories = {}, cache = {};
                var exports = {};
                function require(name) {
                    if (!cache[name]) {
                        const module = {exports: {}};
                        cache[name] = module;
                        factories[name](require, module, module.exports);
                    }
                    return cache[name].exports;
                }
                ${scripts}
            ` });
        } else {
            await route.fulfill({ contentType: "text/html", body: `
                <div id="root"></div>
                <script src="/_next/static/configurations-fixture.js"></script>
                <script src="/_next/static/Configurations.js"></script>
                <script>window.configurationsExports = exports; require('entry');</script>
            ` });
        }
    });
    await page.goto("http://configurations.test/");
}
