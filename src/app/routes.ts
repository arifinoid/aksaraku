export type Route =
  | { readonly name: "profiles" }
  | { readonly name: "home" }
  | { readonly name: "play" }
  | { readonly name: "parent" }
  | { readonly name: "preview" };

export const routes = {
  profiles: { name: "profiles" },
  home: { name: "home" },
  play: { name: "play" },
  parent: { name: "parent" },
  preview: { name: "preview" },
} satisfies Record<string, Route>;
