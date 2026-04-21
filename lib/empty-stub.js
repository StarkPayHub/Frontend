// Proxy stub — any property access returns another proxy, so starkzap's
// load-time access like `AvnuDcaOrderStatus.INDEXING` doesn't crash. Calls
// throw; runtime use of these modules is not expected.
const handler = {
  get(target, prop) {
    if (prop === "__esModule") return true;
    if (prop === Symbol.toPrimitive) return () => "";
    if (prop === "default") return new Proxy(function () {}, handler);
    return new Proxy(function () {}, handler);
  },
  apply() {
    return new Proxy(function () {}, handler);
  },
  construct() {
    return new Proxy({}, handler);
  },
};

module.exports = new Proxy(function () {}, handler);
