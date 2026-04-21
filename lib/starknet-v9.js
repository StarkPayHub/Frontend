// Re-export starknet v9 bundled inside starkzap. The concatenated path string
// defeats webpack's static require analysis so the bundler leaves this alone
// and Node resolves it at runtime.
const { createRequire } = require("module");
const req = createRequire(__filename);
const pkg = "starkzap" + "/node_modules/" + "starknet";
module.exports = req(pkg);
