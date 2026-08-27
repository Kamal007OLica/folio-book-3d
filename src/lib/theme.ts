/**
 * Key used to persist an explicit theme choice.
 *
 * Versioned deliberately. The default flipped from dark to light, and a
 * stored choice beats the default -- so anyone who had toggled the theme
 * before that change would stay pinned to dark forever and never see the
 * new default. Bumping the key retires those old values: everyone starts
 * from light again, and choices made from now on persist under this key.
 *
 * Bump the suffix again if the default ever changes.
 */
export const THEME_STORAGE_KEY = "folio-theme-v2";

/** Key for saved bookmarks (an array of page indices). */
export const BOOKMARKS_STORAGE_KEY = "folio-bookmarks-v1";
