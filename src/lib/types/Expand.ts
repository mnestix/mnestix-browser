/** A helper type that does some type expansions that structurally don't change the type at all. However,
 * the `T extends infer O` trick causes the TypeScript compiler and VS Code to describe types in
 * a more readable way. */
export type Expand<T> = T extends Record<string, unknown> ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;
