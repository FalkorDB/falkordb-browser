// What the server's utility process runs in place of server.js (prepare-server
// copies it next to server.js). It tells the shell once the server itself holds
// its port. Answering on that port proves nothing, since another local process
// could have taken it after the shell found it free, and the window would then
// load that process's page as the app.

const net = require("node:net");
const path = require("node:path");

const port = Number(process.env.PORT);
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
    this.once("listening", () => {
        const address = this.address();
        if (address && typeof address === "object" && address.port === port) {
            process.parentPort.postMessage({ type: "listening", port });
        }
    });
    return listen.apply(this, args);
};

require(path.join(__dirname, "server.js"));
