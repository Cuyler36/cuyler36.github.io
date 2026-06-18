# cuyler36.github.io

[![Jekyll site CI](https://github.com/cuyler36/cuyler36.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/cuyler36/cuyler36.github.io/actions/workflows/jekyll.yml)

Personal site and project hub for [Cuyler](https://github.com/cuyler36): blog posts, notes, and browser tools related to Animal Crossing reverse engineering and modding.

**Live site:** [https://cuyler36.github.io](https://cuyler36.github.io)

## What's here

### Blog

Technical write-ups about GameCube-era Animal Crossing internals, custom code, and NES emulator patching:

- [Implementing a Custom Item Name Routine](https://cuyler36.github.io/2017/10/31/creating-a-custom-name-routine.html)
- [Creating a NES Patch Loader](https://cuyler36.github.io/2018/07/14/creating-a-nes-patch-loader.html)

### Tools and reference pages

| Page | URL | Description |
|------|-----|-------------|
| Animal Forest e+ Bingo | [/bingo/](https://cuyler36.github.io/bingo/) | Seeded bingo card generator for speedrun races |
| NES Tags | [/nestags/](https://cuyler36.github.io/nestags/) | Reference for NES emulator command tags used in AC |
| Password Generator | [/passwordgen/](https://cuyler36.github.io/passwordgen/) | Secret password generator/decoder for Animal Crossing, Doubutsu no Mori+, and Doubutsu no Mori e+ |
| Object Delivery Center | [/objcenter/](https://cuyler36.github.io/objcenter/) | Interactive canvas tool (hidden from main nav) |

The home page also includes search and tag indexes via the [Type on Strap](https://github.com/sylhare/Type-on-Strap) theme.

## Local development

Requirements:

- Ruby **3.0+**
- Bundler **2.x**

```bash
git clone https://github.com/cuyler36/cuyler36.github.io.git
cd cuyler36.github.io
bundle install
bundle exec jekyll serve
```

Then open [http://localhost:4000](http://localhost:4000).

To produce a production build locally:

```bash
bundle exec jekyll build
```

Output is written to `_site/`.

## Project layout

```text
├── _posts/              # Blog posts
├── _layouts/            # Page layouts (blog, tools, etc.)
├── _includes/           # Shared HTML partials
├── _sass/               # Stylesheets
├── pages/               # Standalone site pages (bingo, nestags, ...)
├── assets/              # JS, CSS, images, fonts
├── _config.yml          # Site configuration
├── Gemfile              # Ruby dependencies (via type-on-strap.gemspec)
└── .github/workflows/   # CI build on push/PR to master
```

## CI and deployment

- **CI:** GitHub Actions runs `bundle exec jekyll build` on pushes and pull requests to `master`.
- **Deployment:** GitHub Pages publishes the site from this repository when changes land on `master`. CI verifies the build; Pages handles the live deploy separately.

## Theme and license

The site is built with [Jekyll](https://jekyllrb.com) and based on the [Type on Strap](https://github.com/sylhare/Type-on-Strap) theme (MIT). See [LICENSE](LICENSE) for theme licensing; blog content and custom tools are authored for this site.
