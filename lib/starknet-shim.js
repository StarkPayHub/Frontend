// Shim: re-export starknet v6 + add missing exports that starkzap v2 needs
const starknet = require(require.resolve("starknet", { paths: [__dirname + "/.."] }));

// CairoFelt252 was added in starknet v7 — stub it for starkzap compatibility
if (!starknet.CairoFelt252) {
  starknet.CairoFelt252 = class CairoFelt252 {
    constructor(v) { this.value = BigInt(v ?? 0); }
    toString() { return "0x" + this.value.toString(16); }
    toBigInt() { return this.value; }
  };
}

module.exports = starknet;
