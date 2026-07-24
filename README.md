# AniStream Companion Extension

Adds an **Open in AniStream** button to anime pages on [AniList](https://anilist.co) and [MyAnimeList](https://myanimelist.net). Click it and the anime opens straight in your running [AniStream](https://github.com/Flex936/anistream) app — no searching by title.

## How it works

The button sends the page's AniList/MAL id to a small local server the AniStream app listens on at `127.0.0.1:53211`. Same-device only — nothing leaves your machine.

## Requirements

- [AniStream](https://github.com/Flex936/anistream) running on the **same device** as your browser
- Chrome, Edge, or Brave

## Install

1. Clone or download this repo
2. `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the folder
3. Open any anime page on AniList or MyAnimeList — the button appears automatically

*Port taken? Change `PORT` in `background.js` to match the app.*
