export type Route =
  | { readonly name: "profiles" }
  | { readonly name: "home" }
  | { readonly name: "play" }
  | { readonly name: "parent" };

export const routes = {
  profiles: { name: "profiles" },
  home: { name: "home" },
  play: { name: "play" },
  parent: { name: "parent" },
} satisfies Record<string, Route>;
