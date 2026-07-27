type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.55c0-.92.26-1.55 1.58-1.55h1.69V3.14C16.47 3.1 15.44 3 14.24 3c-2.5 0-4.22 1.53-4.22 4.33v2.27H7.25v3.2h2.77V21h3.48Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 3h3.6l4 5.4L16.2 3H20l-6 7.6L20.4 21h-3.6l-4.4-5.9L7.4 21H4l6.4-8.1L4 3Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.6 7.4a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.4 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.6 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.6ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 3h-3.1v12.4a2.9 2.9 0 1 1-2.4-2.9v-3.1a6 6 0 1 0 5.5 6V9.3a7.4 7.4 0 0 0 4.3 1.4V7.6a4.3 4.3 0 0 1-4.3-4.3V3Z" />
    </svg>
  );
}
