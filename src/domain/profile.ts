import { sequenceS } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import type { AvatarId, Locale, Profile, ProfileId } from "./types";

export type ProfileError =
  | { readonly _tag: "EmptyName" }
  | { readonly _tag: "NameTooLong"; readonly max: number }
  | { readonly _tag: "InvalidLocale"; readonly locale: string };

export const MAX_NAME_LENGTH = 20;
export const LOCALES: readonly Locale[] = ["id", "en", "ar"];

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export const normalizeName = (raw: string): string =>
  raw.trim().replace(/\s+/g, " ");

export const validateName = (
  raw: string,
): E.Either<ProfileError, string> => {
  const name = normalizeName(raw);
  if (name.length === 0) return E.left({ _tag: "EmptyName" });
  if (name.length > MAX_NAME_LENGTH) {
    return E.left({ _tag: "NameTooLong", max: MAX_NAME_LENGTH });
  }
  return E.right(name);
};

export const validateLocale = (
  value: string,
): E.Either<ProfileError, Locale> =>
  isLocale(value) ? E.right(value) : E.left({ _tag: "InvalidLocale", locale: value });

export interface CreateProfileInput {
  readonly id: ProfileId;
  readonly name: string;
  readonly avatarId: AvatarId;
  readonly locale: string;
  readonly createdAt: number;
}

export const createProfile = (
  input: CreateProfileInput,
): E.Either<ProfileError, Profile> =>
  pipe(
    sequenceS(E.Applicative)({
      name: validateName(input.name),
      locale: validateLocale(input.locale),
    }),
    E.map(
      ({ name, locale }): Profile => ({
        id: input.id,
        name,
        avatarId: input.avatarId,
        locale,
        createdAt: input.createdAt,
      }),
    ),
  );

export const profileErrorMessageKey = (error: ProfileError): string => {
  switch (error._tag) {
    case "EmptyName":
      return "profile.errors.emptyName";
    case "NameTooLong":
      return "profile.errors.nameTooLong";
    case "InvalidLocale":
      return "profile.errors.invalidLocale";
  }
};
