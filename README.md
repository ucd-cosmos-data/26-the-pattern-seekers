# The Pattern Seekers

## Development

Install the frontend build dependencies once, then use Hugo as usual:

```sh
npm install
npm run dev
```

Tailwind v4 scans the content, layouts, and asset scripts for `tw:`-prefixed utility classes during each `npm run build`. The stylesheet imports only Tailwind's theme and utilities layers, leaving the Stack theme responsible for base styling and preventing class-name collisions. Run `npm run dev:css` in a second terminal to rebuild Tailwind while editing utility classes.
