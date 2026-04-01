# Obsidian Community Plugins Submission

This file contains the entry to add to `community-plugins.json` in the
`obsidianmd/obsidian-releases` repository. Submit as a PR when ready.

## Steps

1. Fork https://github.com/obsidianmd/obsidian-releases
2. Edit `community-plugins.json` — add the entry below to the array (alphabetical by id)
3. Open a PR titled: "Add plugin: Arcadia Connect"
4. Wait for review (typically 1–4 weeks)

The plugin must have:
- [x] `manifest.json` at repo root
- [x] A release tagged `v{version}` with `main.js`, `manifest.json`, `styles.css` attached
- [x] README with description and usage instructions
- [x] No `main.js` hardcoded in the repo root required — release assets serve as the source

## community-plugins.json Entry

```json
{
  "id": "arcadia-connect",
  "name": "Arcadia Connect",
  "author": "Arcadia Studio",
  "description": "Personal CRM for Obsidian: @-mention people across notes, log interactions, visualize a deal pipeline, get AI-powered follow-up suggestions.",
  "repo": "Arcadia-Studio/obsidian-arcadia-connect"
}
```

Add this entry into the array in `community-plugins.json`, maintaining alphabetical order by `id`.

## PR Template

**Title:** Add plugin: Arcadia Connect

**Body:**
```
## Plugin submission: Arcadia Connect

**Plugin ID:** arcadia-connect
**Name:** Arcadia Connect
**Author:** Arcadia Studio
**Repo:** Arcadia-Studio/obsidian-arcadia-connect

### Description
Personal CRM layer for Obsidian. Link people across notes with @-mentions, log interactions,
visualize a deal pipeline, and get AI-powered follow-up suggestions — without leaving your vault.

### Checklist
- [x] I have read the plugin developer guidelines
- [x] manifest.json is at the repo root
- [x] A release exists with main.js, manifest.json, and styles.css attached
- [x] The plugin does not use eval() or other prohibited APIs
- [x] The plugin does not phone home (AI calls go directly from user's Obsidian to their chosen AI provider using their own API key)
```
