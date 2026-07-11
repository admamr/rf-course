/* Build-time config for generating a static, prebuilt Tailwind stylesheet.
   This replaces the render-blocking Tailwind Play CDN (which compiled classes
   in the browser on every load, ~1.6s of mobile main-thread work).

   Regenerate after changing any utility classes in the HTML:
     npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css \
       -o assets/css/tailwind.build.css --minify

   The output file is plain static CSS. No framework, no runtime dependency,
   and nothing here is loaded by the live pages. */
module.exports = {
  content: ['./*.html'],
  // Classes toggled only by assets/js/main.js (never present as static HTML
  // strings), so the purge step would otherwise drop them.
  safelist: [
    'opacity-0',
    'opacity-100',
    'translate-y-0',
    'translate-y-full',
    'pointer-events-none',
    'overflow-hidden',
  ],
  theme: {
    extend: {
      colors: {
        'rf-dark':   '#010f0a',
        'rf-green':  '#012b1a',
        'rf-gm':     '#023d26',
        'rf-gold':   '#bd8604',
        'rf-gl':     '#d4a017',
        'rf-bright': '#e8b53d',
        'rf-white':  '#f4f7f5',
        'rf-soft':   '#b6c6bf',
        'rf-muted':  '#7d8f88',
      },
      // Per-page font family is governed by [lang] rules in styles.css; this
      // stack just keeps the font-sans utility resolving to the brand fonts.
      fontFamily: { sans: ['Heebo', 'Cairo', 'IBM Plex Sans Arabic', 'sans-serif'] },
    },
  },
};
