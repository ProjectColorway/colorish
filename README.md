<h1 style="display: flex; gap: .5rem;">
  <img src="colorish_64x64.png" width="32" /> Colorish
</h1>

The official manager for Project Colorway-compatible apps.

<br />

## Features
* Simple and intuitive UI and UX
* Global Search, to easily find colorways, sources, etc (v2)
* 3 Color themes (Light, Dark, Black) (v2)
* Global management of colorways and sources for all compatible apps
* Supports all Manager Complications (App Summon, Manager Role, Complication Sources)
* App Store: Install/modify new and existing apps to add colorway support (????????)

## Installing

* Grab the [latest release](https://github.com/ProjectColorway/colorish/releases/latest) of Colorish, then run it
* You're set. Any compatible apps will now pass colorway management to Colorish

## Supported Apps:
* Discord (Vencord/Vesktop only for now): DiscordColorways

## Building
## Requirements
* The latest node.js version
* pnpm
### Instructions
* Clone the repo:
```bash
git clone https://github.com/ProjectColorway/colorish.git
```
* Go inside the `colorish` directory:
```bash
cd colorish
```
* Install all the packages:
```bash
pnpm i
```
* To run in dev mode:
```bash
pnpm dev
```
* To build full app:
```bash
pnpm build
```
* To build UI only:
```bash
pnpm build:svelte
```
* To build electron
```bash
pnpm build:electron
```
* To build and publish
```bash
pnpm build:p
```
