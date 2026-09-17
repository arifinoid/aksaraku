export type Route =
  | { readonly name: "profiles" }
  | { readonly name: "home" }
  | { readonly name: "play" }
  | { readonly name: "games" }
  | { readonly name: "collection" }
  | { readonly name: "avatar" }
  | { readonly name: "parent" }
  | { readonly name: "preview" };

export const routes = {
  profiles: { name: "profiles" },
  home: { name: "home" },
  play: { name: "play" },
  games: { name: "games" },
  collection: { name: "collection" },
  avatar: { name: "avatar" },
  parent: { name: "parent" },
  preview: { name: "preview" },
} satisfies Record<string, Route>;
