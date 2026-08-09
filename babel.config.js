/**
 * babel.config.js
 * ------------------------------------------------------------------
 * Babel configuration used by Jest to transform JSX and ES6+ during
 * tests. The Plasmo production build uses esbuild with Babel fallback
 * for TypeScript internals, so this file also includes the TypeScript
 * preset to correctly strip type annotations from Plasmo's generated
 * internal `.ts`/`.tsx` files during bundling.
 */
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript"
  ]
};

