# The Pattern Seekers

## Setup

### Install pnpm

For macOS, use Homebrew to install pnpm:

```sh
brew install pnpm
```

## Development

Install the frontend build dependencies once, then use Hugo as usual:

```sh
pnpm install
pnpm dev
```

Tailwind CSS v4 scans the content, layouts, and asset scripts for `tw:`-prefixed utility classes during each `pnpm dev`. The shared design tokens and site components live in `assets/css/tailwind.css`; Stack continues to provide Hugo's base asset pipeline and KaTeX integration. Run `pnpm dev:css` in a second terminal to rebuild Tailwind while editing utility classes.
