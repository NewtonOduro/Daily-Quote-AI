/**
 * styleMock.js
 * ------------------------------------------------------------------
 * Jest moduleNameMapper target for CSS/CSS-module imports. Returns a
 * Proxy that maps class names to themselves so className lookups in
 * tests resolve to a string.
 */
const styleProxy = new Proxy(
  {},
  {
    get: (_, prop) => (typeof prop === "string" ? `_${prop}` : prop),
    has: () => true
  }
);

export default styleProxy;
