/**
 * Live work that exists outside the book — a shipped app, a hosted essay, a
 * campaign microsite. The printed pages can only show stills of these, so the
 * HUD carries the real URLs in the corner opposite the colophon.
 *
 * `label` is what the corner prints, so it stays short enough to sit in a
 * narrow column; `note` is the hover title that gives it context.
 */
export interface LiveLink {
  href: string;
  label: string;
  note: string;
}

export const LIVE_LINKS: LiveLink[] = [
  {
    href: "https://kamal007olica.github.io/email-assets./build365/",
    label: "Build365",
    note: "Build365 — campaign microsite",
  },
  {
    href: "https://zenmodeos.com/story/index.html",
    label: "Unhooking Theory",
    note: "ZenMode — the thesis behind the habit loops",
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.zenlauncher.zenmode&hl=en_IN",
    label: "ZenMode OS Launcher",
    note: "ZenMode OS Launcher — live on Google Play",
  },
];
