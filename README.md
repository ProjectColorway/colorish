<h1 style="display: flex; gap: .5rem;">
  <img src="colorish_64x64.png" width="32" /> Colorish
</h1>

The official manager for Project Colorway-compatible apps.

<br />

## Features
* Simple and intuitive UI and UX
* Global Search, to easily find colorways, sources, etc
* 3 Color themes (Light, Dark, Black)
* Global management of colorways and sources for all compatible apps
* Supports all Manager Complications (App Summon, Manager Role, Complication Sources)

## Installing

* Grab the [latest release](https://github.com/ProjectColorway/colorish/releases/latest) of Colorish, then run it
* You're set. Any compatible apps will now pass colorway management to Colorish

## Supported Apps:
* Discord (Vencord/Vesktop only for now): DiscordColorways

## Building
## Requirements
* The latest node.js version
* pnpm

### Preparation
* Clone the repo:
```bash
$ git clone https://github.com/ProjectColorway/colorish
```
* Install all deps
```bash
$ pnpm i
```

### Development

```bash
$ pnpm dev
```

### Build
* To run in dev mode:
```bash
$ pnpm dev
```
* To build React:
```bash
$ pnpm build
```
* To build for any platform:
```bash
$ pnpm build:win

$ pnpm build:linux

$ pnpm build:mac
```
* To publish, create a draft release with the same version as the one specified in `package.json`, then run:
```bash
$ pnpm build:publish
```