// Preset avatars for the profile picture picker. Each is a small inline
// SVG turned into a data URI — no external image hosting or file storage
// needed, and they're cheap enough to store directly on the User document
// alongside uploaded photos (see avatarUrl in schema.prisma).
//
// encodeURIComponent rather than btoa: this module can be evaluated during
// SSR (Next.js still server-renders 'use client' components on first
// load), where `window`/`btoa` don't exist. encodeURIComponent is a plain
// JS global available in both Node and the browser.
function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function gradientAvatar(id: string, from: string, to: string): string {
  return svgToDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100" height="100" fill="url(#${id})"/></svg>`,
  );
}

export const PRESET_AVATARS: { id: string; dataUri: string }[] = [
  { id: 'sunset', dataUri: gradientAvatar('g1', '#a855f7', '#fb923c') },
  { id: 'ocean', dataUri: gradientAvatar('g2', '#3b82f6', '#2dd4bf') },
  { id: 'ember', dataUri: gradientAvatar('g3', '#f43f5e', '#fbbf24') },
  { id: 'forest', dataUri: gradientAvatar('g4', '#10b981', '#22d3ee') },
  { id: 'dusk', dataUri: gradientAvatar('g5', '#6366f1', '#ec4899') },
  {
    id: 'pyramid',
    dataUri: svgToDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#18181b"/><path d="M50 22 L74 76 L26 76 Z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 22 L38 76" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`,
    ),
  },
  {
    id: 'dots',
    dataUri: svgToDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#d97706"/><circle cx="30" cy="30" r="5" fill="#fff"/><circle cx="70" cy="30" r="5" fill="#fff"/><circle cx="30" cy="70" r="5" fill="#fff"/><circle cx="70" cy="70" r="5" fill="#fff"/><circle cx="50" cy="50" r="5" fill="#fff"/></svg>`,
    ),
  },
  {
    id: 'rings',
    dataUri: svgToDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#059669"/><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="14" fill="#fff"/></svg>`,
    ),
  },
  {
    id: 'split',
    dataUri: svgToDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#18181b"/><path d="M0 100 L100 0 L100 100 Z" fill="#e11d48"/></svg>`,
    ),
  },
];
