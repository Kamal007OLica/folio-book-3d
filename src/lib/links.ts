/**
 * Live work that exists outside the book — a shipped app, a hosted essay, a
 * campaign microsite. The printed pages can only show stills of these, so the
 * contents panel carries the real URLs alongside the folio that covers them.
 *
 * `folio` is optional: it points at the spread that documents the link, and is
 * only set where the book actually has one.
 */
export interface LiveLink {
  href: string;
  label: string;
  /** One line of context, set in the same voice as the contents entries. */
  note: string;
  /** Printed folio documenting this work, if the book covers it. */
  folio?: number;
}

export const LIVE_LINKS: LiveLink[] = [
  {
    href: "https://kamal007olica.github.io/email-assets./build365/",
    label: "Build365",
    note: "Campaign microsite",
  },
  {
    href: "https://zenmodeos.com/story/index.html",
    label: "ZenMode · Unhooking theory",
    note: "The thesis behind the habit loops",
    folio: 56,
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.zenlauncher.zenmode&hl=en_IN",
    label: "ZenMode OS Launcher",
    note: "Live on Google Play",
    folio: 58,
  },
];
