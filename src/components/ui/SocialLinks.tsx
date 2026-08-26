"use client";

/**
 * Colophon-style contact cluster for the top-left corner.
 *
 * Deliberately echoes the book's own interior language: a mono uppercase
 * label with a hairline rule beneath it, exactly how the Contents spread
 * sets "CONTENTS VOL. 01". Bare icons (no chrome) keep it reading as
 * printed matter rather than app UI — the circular buttons stay on the
 * right for the live controls.
 */

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.1" stroke="currentColor" strokeWidth="1.9" />
      <path d="m3.4 7 8.6 6 8.6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINKS = [
  {
    href: "https://www.linkedin.com/in/kamalraaj07/",
    label: "LinkedIn — kamalraaj07",
    Icon: LinkedInIcon,
    external: true,
  },
  {
    href: "https://github.com/Kamal007OLica",
    label: "GitHub — Kamal007OLica",
    Icon: GitHubIcon,
    external: true,
  },
  {
    href: "mailto:kr07.work@gmail.com",
    label: "Email — kr07.work@gmail.com",
    Icon: MailIcon,
    external: false,
  },
];

export function SocialLinks() {
  return (
    <nav aria-label="Contact" className="flex items-center gap-4">
      {LINKS.map(({ href, label, Icon, external }) => (
        <a
          key={href}
          href={href}
          aria-label={label}
          title={label}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="pointer-events-auto text-paper/55 transition-colors duration-200 hover:text-ember-soft focus-visible:text-ember-soft focus-visible:outline-none"
        >
          <Icon />
        </a>
      ))}
    </nav>
  );
}
