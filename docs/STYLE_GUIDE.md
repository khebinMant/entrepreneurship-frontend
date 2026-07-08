# Style Guide

## Color Tokens

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `#4f46e5` (Indigo-600) | `#818cf8` |
| `--color-primary-light` | `#eef2ff` | `#1e1b4b` |
| `--color-primary-dark` | `#4338ca` | `#6366f1` |
| `--color-secondary` | `#0d9488` (Teal-600) | `#2dd4bf` |
| `--color-accent` | `#f59e0b` (Amber-500) | `#fbbf24` |
| `--color-surface` | `#ffffff` | `#1e293b` |
| `--color-background` | `#f8fafc` | `#0f172a` |
| `--color-border` | `#e2e8f0` | `#334155` |
| `--color-text-primary` | `#0f172a` | `#f1f5f9` |
| `--color-text-secondary` | `#475569` | `#94a3b8` |
| `--color-text-muted` | `#94a3b8` | `#64748b` |

## Typography

- **Font**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Scale: `xs(12)`, `sm(14)`, `md(16)`, `lg(18)`, `xl(20)`, `xxl(24)`, `xxxl(32)`

## Component Patterns

- BEM naming: `.block__element--modifier`
- Standalone components with inline templates (or separate `.html` for complex layouts)
- SCSS with CSS custom properties (no hardcoded colors in components)
- `styleUrl` (not `styleUrls`) for single stylesheet

## Dark Theme

Toggled via `ThemeService` which sets `document.documentElement.dataset.theme = 'dark'|'light'`. Styles in `_themes.scss` override CSS custom properties under `[data-theme='dark']`.

## Spacing

`xs(4px)`, `sm(8px)`, `md(16px)`, `lg(24px)`, `xl(32px)`, `xxl(48px)`

## Shadows

`sm`, `md`, `lg` — defined as CSS custom properties with dark-mode variants.
