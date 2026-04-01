"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ArcadiaConnectPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  peopleFolder: "People/",
  triggerChar: "@",
  showHoverCard: true,
  autoCreatePerson: true,
  licenseKey: "",
  licenseStatus: null,
  isPro: false,
  aiProvider: "anthropic",
  anthropicApiKey: "",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini"
};
var VIEW_TYPE_PEOPLE = "arcadia-connect-people";
var VIEW_TYPE_TIMELINE = "arcadia-connect-timeline";
var VIEW_TYPE_PIPELINE = "arcadia-connect-pipeline";
var PERSON_NOTE_TEMPLATE = `---
file-role: crm-contact
type: person
name: "{{name}}"
email: ""
phone: ""
organization: ""
role: ""
birthday: ""
relationship-type: ""
last-contact: ""
next-follow-up: ""
follow-up-status: pending
deal-stage: ""
deal-value: 0
tags:
  - type/crm-contact
---

# {{name}}

## About

## Interaction Log

`;
var INTERACTION_TYPES = {
  call: "\u{1F4DE} Call",
  email: "\u{1F4E7} Email",
  meeting: "\u{1F91D} Meeting",
  note: "\u{1F4DD} Note",
  other: "\u{1F4AC} Other"
};
var DEAL_STAGE_LABELS = {
  lead: "Lead",
  prospect: "Prospect",
  proposal: "Proposal",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
  nurture: "Nurture"
};
var DEAL_STAGE_ORDER = [
  "lead",
  "prospect",
  "proposal",
  "negotiation",
  "closed-won",
  "closed-lost",
  "nurture"
];

// src/settings.ts
var import_obsidian = require("obsidian");

// src/license.ts
var LICENSE_CACHE_DURATION = 24 * 60 * 60 * 1e3;
async function validateLicense(licenseKey, instanceName = "obsidian") {
  var _a, _b, _c;
  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ license_key: licenseKey, instance_name: instanceName })
    });
    const data = await response.json();
    if (data.valid) {
      return {
        valid: true,
        instanceId: (_a = data.instance) == null ? void 0 : _a.id,
        customerEmail: (_b = data.meta) == null ? void 0 : _b.customer_email,
        expiresAt: (_c = data.license_key) == null ? void 0 : _c.expires_at,
        lastChecked: Date.now()
      };
    }
    return { valid: false, lastChecked: Date.now() };
  } catch (e) {
    return { valid: false, lastChecked: Date.now() };
  }
}

// src/settings.ts
var ArcadiaConnectSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Arcadia Connect Settings" });
    new import_obsidian.Setting(containerEl).setName("People folder").setDesc("Folder where person notes are stored (relative to vault root).").addText((text) => text.setPlaceholder("People/").setValue(this.plugin.settings.peopleFolder).onChange(async (value) => {
      this.plugin.settings.peopleFolder = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Trigger character").setDesc("Character that triggers the @-mention autocomplete.").addText((text) => text.setPlaceholder("@").setValue(this.plugin.settings.triggerChar).onChange(async (value) => {
      this.plugin.settings.triggerChar = value || "@";
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Show hover card").setDesc("Show a mini profile card when hovering over @-mentions.").addToggle((toggle) => toggle.setValue(this.plugin.settings.showHoverCard).onChange(async (value) => {
      this.plugin.settings.showHoverCard = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Auto-create person note").setDesc("Automatically create a person note when mentioning someone new.").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoCreatePerson).onChange(async (value) => {
      this.plugin.settings.autoCreatePerson = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "License" });
    const licenseStatus = this.plugin.settings.licenseStatus;
    const isPro = this.plugin.settings.isPro && (licenseStatus == null ? void 0 : licenseStatus.valid);
    const statusDesc = isPro ? `Active${(licenseStatus == null ? void 0 : licenseStatus.customerEmail) ? ` (${licenseStatus.customerEmail})` : ""}${(licenseStatus == null ? void 0 : licenseStatus.expiresAt) ? ` - expires ${licenseStatus.expiresAt}` : ""}` : "No active license. Enter your license key and click Validate.";
    const licenseStatusEl = containerEl.createEl("p", {
      text: `License status: ${statusDesc}`,
      cls: isPro ? "mod-success" : "mod-warning"
    });
    let keyInputEl = null;
    new import_obsidian.Setting(containerEl).setName("License key").setDesc("Enter your Arcadia Connect Premium license key from Lemon Squeezy.").addText((text) => {
      keyInputEl = text.inputEl;
      text.setPlaceholder("XXXX-XXXX-XXXX-XXXX").setValue(this.plugin.settings.licenseKey).onChange(async (value) => {
        this.plugin.settings.licenseKey = value.trim();
        await this.plugin.saveSettings();
      });
    }).addButton(
      (btn) => btn.setButtonText("Validate").setCta().onClick(async () => {
        const key = this.plugin.settings.licenseKey.trim();
        if (!key)
          return;
        btn.setButtonText("Checking...").setDisabled(true);
        const status = await validateLicense(key);
        this.plugin.settings.licenseStatus = status;
        this.plugin.settings.isPro = status.valid;
        await this.plugin.saveSettings();
        btn.setButtonText("Validate").setDisabled(false);
        if (status.valid) {
          licenseStatusEl.textContent = `License status: Active${status.customerEmail ? ` (${status.customerEmail})` : ""}`;
          licenseStatusEl.className = "mod-success";
        } else {
          licenseStatusEl.textContent = "License status: Invalid or expired. Check your key and try again.";
          licenseStatusEl.className = "mod-warning";
        }
      })
    );
    new import_obsidian.Setting(containerEl).addButton(
      (btn) => btn.setButtonText("Get Arcadia Connect Premium").onClick(() => {
        window.open("https://arcadia-studio.lemonsqueezy.com", "_blank");
      })
    );
    containerEl.createEl("h3", { text: "AI Enrichment (BYOK)" });
    containerEl.createEl("p", {
      text: "Bring your own API key to unlock AI-powered follow-up suggestions. Keys are stored locally in your vault settings and never sent to Arcadia servers.",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(containerEl).setName("AI provider").addDropdown(
      (dd) => dd.addOption("anthropic", "Anthropic (Claude)").addOption("openai", "OpenAI").setValue(this.plugin.settings.aiProvider).onChange(async (value) => {
        this.plugin.settings.aiProvider = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    if (this.plugin.settings.aiProvider === "anthropic") {
      new import_obsidian.Setting(containerEl).setName("Anthropic API key").setDesc("Your key from console.anthropic.com").addText(
        (text) => text.setPlaceholder("sk-ant-...").setValue(this.plugin.settings.anthropicApiKey).onChange(async (value) => {
          this.plugin.settings.anthropicApiKey = value.trim();
          await this.plugin.saveSettings();
        })
      );
    } else {
      new import_obsidian.Setting(containerEl).setName("OpenAI API key").setDesc("Your key from platform.openai.com").addText(
        (text) => text.setPlaceholder("sk-...").setValue(this.plugin.settings.openaiApiKey).onChange(async (value) => {
          this.plugin.settings.openaiApiKey = value.trim();
          await this.plugin.saveSettings();
        })
      );
      new import_obsidian.Setting(containerEl).setName("OpenAI model").addDropdown(
        (dd) => dd.addOption("gpt-4o-mini", "GPT-4o mini (fast, cheap)").addOption("gpt-4o", "GPT-4o (best quality)").addOption("gpt-4-turbo", "GPT-4 Turbo").setValue(this.plugin.settings.openaiModel).onChange(async (value) => {
          this.plugin.settings.openaiModel = value;
          await this.plugin.saveSettings();
        })
      );
    }
  }
};

// src/person-manager.ts
var import_obsidian2 = require("obsidian");
var PersonManager = class {
  constructor(app, peopleFolder) {
    this.people = /* @__PURE__ */ new Map();
    this.app = app;
    this.peopleFolder = peopleFolder;
  }
  setPeopleFolder(folder) {
    this.peopleFolder = folder;
  }
  async initialize() {
    await this.scanPeopleFolder();
  }
  async scanPeopleFolder() {
    this.people.clear();
    const folderPath = (0, import_obsidian2.normalizePath)(this.peopleFolder);
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder || !(folder instanceof import_obsidian2.TFolder)) {
      return;
    }
    const files = folder.children.filter(
      (f) => f instanceof import_obsidian2.TFile && f.extension === "md"
    );
    for (const file of files) {
      const person = this.parsePersonFile(file);
      if (person) {
        this.people.set(person.name.toLowerCase(), person);
      }
    }
  }
  parsePersonFile(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    if (!(cache == null ? void 0 : cache.frontmatter)) {
      return null;
    }
    const fm = cache.frontmatter;
    if (fm.type !== "person" && fm["file-role"] !== "crm-contact") {
      return null;
    }
    const name = fm.name || file.basename;
    if (!name) {
      return null;
    }
    return {
      file,
      name: String(name),
      email: fm.email ? String(fm.email) : void 0,
      phone: fm.phone ? String(fm.phone) : void 0,
      organization: fm.organization ? String(fm.organization) : void 0,
      role: fm.role ? String(fm.role) : void 0,
      birthday: fm.birthday ? String(fm.birthday) : void 0,
      relationshipType: fm["relationship-type"] ? String(fm["relationship-type"]) : void 0,
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : void 0,
      photo: fm.photo ? String(fm.photo) : void 0,
      // CRM fields
      lastContact: fm["last-contact"] ? String(fm["last-contact"]) : void 0,
      nextFollowUp: fm["next-follow-up"] ? String(fm["next-follow-up"]) : void 0,
      followUpStatus: (_a = fm["follow-up-status"]) != null ? _a : "pending",
      dealStage: fm["deal-stage"] ? fm["deal-stage"] : void 0,
      dealValue: fm["deal-value"] ? Number(fm["deal-value"]) : void 0
    };
  }
  getAllPeople() {
    return Array.from(this.people.values());
  }
  getPersonByName(name) {
    return this.people.get(name.toLowerCase());
  }
  searchPeople(query) {
    if (!query) {
      return this.getAllPeople();
    }
    const lower = query.toLowerCase();
    return this.getAllPeople().filter((p) => {
      return p.name.toLowerCase().includes(lower) || p.organization && p.organization.toLowerCase().includes(lower) || p.tags && p.tags.some((t) => t.toLowerCase().includes(lower)) || p.dealStage && p.dealStage.toLowerCase().includes(lower);
    });
  }
  fuzzyMatch(query) {
    if (!query) {
      return this.getAllPeople();
    }
    const lower = query.toLowerCase();
    return this.getAllPeople().map((p) => ({
      person: p,
      score: this.fuzzyScore(p.name.toLowerCase(), lower)
    })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.person);
  }
  fuzzyScore(target, query) {
    let score2 = 0;
    let qi = 0;
    let consecutive = 0;
    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
      if (target[ti] === query[qi]) {
        score2 += 1 + consecutive;
        consecutive++;
        qi++;
      } else {
        consecutive = 0;
      }
    }
    if (qi < query.length) {
      return 0;
    }
    if (target.startsWith(query)) {
      score2 += 10;
    }
    return score2;
  }
  getOverdueFollowUps(now = new Date()) {
    const today = now.toISOString().split("T")[0];
    return this.getAllPeople().filter((p) => {
      if (!p.nextFollowUp)
        return false;
      if (p.followUpStatus === "done")
        return false;
      return p.nextFollowUp < today;
    });
  }
  getDueToday(now = new Date()) {
    const today = now.toISOString().split("T")[0];
    return this.getAllPeople().filter((p) => {
      if (!p.nextFollowUp)
        return false;
      if (p.followUpStatus === "done")
        return false;
      return p.nextFollowUp === today;
    });
  }
  async updateFollowUpStatus(file, status) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm["follow-up-status"] = status;
    });
  }
  async logInteraction(person, type, summary, date) {
    await this.app.fileManager.processFrontMatter(person.file, (fm) => {
      fm["last-contact"] = date;
      if (fm["follow-up-status"] === "pending" && fm["next-follow-up"] && fm["next-follow-up"] <= date) {
        fm["follow-up-status"] = "done";
      }
    });
    const content = await this.app.vault.read(person.file);
    const interactionLine = `- ${date} \u2014 **${type}**: ${summary}`;
    let updatedContent;
    const logHeader = "## Interaction Log";
    if (content.includes(logHeader)) {
      updatedContent = content.replace(
        logHeader + "\n",
        logHeader + "\n" + interactionLine + "\n"
      );
    } else {
      updatedContent = content + "\n" + logHeader + "\n" + interactionLine + "\n";
    }
    await this.app.vault.modify(person.file, updatedContent);
    this.updatePerson(person.file);
  }
  async createPersonNote(name) {
    const folderPath = (0, import_obsidian2.normalizePath)(this.peopleFolder);
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }
    const content = PERSON_NOTE_TEMPLATE.replace(/\{\{name\}\}/g, name);
    const filePath = (0, import_obsidian2.normalizePath)(`${this.peopleFolder}/${name}.md`);
    const file = await this.app.vault.create(filePath, content);
    const person = {
      file,
      name,
      followUpStatus: "pending"
    };
    this.people.set(name.toLowerCase(), person);
    return file;
  }
  updatePerson(file) {
    const person = this.parsePersonFile(file);
    if (person) {
      this.people.set(person.name.toLowerCase(), person);
    }
  }
  removePerson(file) {
    for (const [key, person] of this.people.entries()) {
      if (person.file.path === file.path) {
        this.people.delete(key);
        break;
      }
    }
  }
  isInPeopleFolder(file) {
    const folderPath = (0, import_obsidian2.normalizePath)(this.peopleFolder);
    return file.path.startsWith(folderPath);
  }
};

// src/mention-scanner.ts
var import_obsidian3 = require("obsidian");
var MentionScanner = class {
  constructor(app, peopleFolder) {
    this.mentionIndex = /* @__PURE__ */ new Map();
    this.app = app;
    this.peopleFolder = peopleFolder;
  }
  setPeopleFolder(folder) {
    this.peopleFolder = folder;
  }
  async buildIndex() {
    this.mentionIndex.clear();
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      if (this.isInPeopleFolder(file))
        continue;
      await this.scanFile(file);
    }
  }
  async scanFile(file) {
    this.removeFileFromIndex(file);
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache)
      return;
    const peoplePath = (0, import_obsidian3.normalizePath)(this.peopleFolder);
    if (cache.links) {
      for (const link of cache.links) {
        const resolved = this.app.metadataCache.getFirstLinkpathDest(
          link.link,
          file.path
        );
        if (resolved && resolved.path.startsWith(peoplePath)) {
          this.addMention(resolved.basename, file, link.position.start.line);
        }
      }
    }
    if (cache.embeds) {
      for (const embed of cache.embeds) {
        const resolved = this.app.metadataCache.getFirstLinkpathDest(
          embed.link,
          file.path
        );
        if (resolved && resolved.path.startsWith(peoplePath)) {
          this.addMention(resolved.basename, file, embed.position.start.line);
        }
      }
    }
  }
  addMention(personName, noteFile, line) {
    const key = personName.toLowerCase();
    if (!this.mentionIndex.has(key)) {
      this.mentionIndex.set(key, []);
    }
    const fileDate = this.extractDateFromFile(noteFile);
    this.mentionIndex.get(key).push({
      personName,
      noteFile,
      noteName: noteFile.basename,
      line,
      date: fileDate
    });
  }
  extractDateFromFile(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    if ((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.date) {
      return String(cache.frontmatter.date);
    }
    const dateMatch = file.basename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }
    return new Date(file.stat.mtime).toISOString().slice(0, 10);
  }
  removeFileFromIndex(file) {
    for (const [key, mentions] of this.mentionIndex.entries()) {
      const filtered = mentions.filter((m) => m.noteFile.path !== file.path);
      if (filtered.length === 0) {
        this.mentionIndex.delete(key);
      } else {
        this.mentionIndex.set(key, filtered);
      }
    }
  }
  getMentionsForPerson(personName) {
    const key = personName.toLowerCase();
    return this.mentionIndex.get(key) || [];
  }
  getRecentMentions(personName, limit = 10) {
    const mentions = this.getMentionsForPerson(personName);
    return mentions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }
  getMentionCount(personName) {
    return this.getMentionsForPerson(personName).length;
  }
  getLastMentionDate(personName) {
    const mentions = this.getMentionsForPerson(personName);
    if (mentions.length === 0)
      return null;
    return mentions.map((m) => m.date).sort().reverse()[0];
  }
  isInPeopleFolder(file) {
    const folderPath = (0, import_obsidian3.normalizePath)(this.peopleFolder);
    return file.path.startsWith(folderPath);
  }
  onFileChange(file) {
    if (!this.isInPeopleFolder(file)) {
      this.scanFile(file);
    }
  }
  onFileDelete(file) {
    this.removeFileFromIndex(file);
  }
};

// src/mention-postprocessor.ts
var MentionPostProcessor = class {
  constructor(app, personManager, settings, profileCard) {
    this.app = app;
    this.personManager = personManager;
    this.settings = settings;
    this.profileCard = profileCard;
  }
  getProcessor() {
    return (el, ctx) => {
      this.processElement(el);
    };
  }
  processElement(el) {
    const trigger = this.settings.triggerChar || "@";
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node2) => {
          const parent = node2.parentElement;
          if (!parent)
            return NodeFilter.FILTER_REJECT;
          if (parent.tagName === "A" || parent.closest("a") || parent.classList.contains("arcadia-connect-mention")) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node2.textContent && node2.textContent.includes(trigger)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    for (const textNode of textNodes) {
      this.processMentionsInText(textNode, trigger);
    }
  }
  processMentionsInText(textNode, trigger) {
    const text = textNode.textContent;
    if (!text)
      return;
    const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?:^|(?<=\\s|[([{,;:!?]))${escapedTrigger}([A-Z][a-zA-Z]*(?:\\s[A-Z][a-zA-Z]*)*)`,
      "g"
    );
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1];
      const person = this.personManager.getPersonByName(name);
      if (person) {
        matches.push({
          index: match.index,
          fullMatch: match[0],
          name
        });
      }
    }
    if (matches.length === 0)
      return;
    const parent = textNode.parentNode;
    if (!parent)
      return;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    for (const m of matches) {
      if (m.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, m.index))
        );
      }
      const span = document.createElement("span");
      span.className = "arcadia-connect-mention";
      span.textContent = m.fullMatch;
      span.setAttribute("data-person-name", m.name);
      span.addEventListener("click", (e) => {
        e.preventDefault();
        const person = this.personManager.getPersonByName(m.name);
        if (person) {
          this.app.workspace.openLinkText(person.file.path, "", false);
        }
      });
      if (this.settings.showHoverCard) {
        span.addEventListener("mouseenter", (e) => {
          const person = this.personManager.getPersonByName(m.name);
          if (person) {
            this.profileCard.show(person, span);
          }
        });
        span.addEventListener("mouseleave", () => {
          this.profileCard.scheduleHide();
        });
      }
      fragment.appendChild(span);
      lastIndex = m.index + m.fullMatch.length;
    }
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    parent.replaceChild(fragment, textNode);
  }
};

// src/profile-card.ts
var ProfileCard = class {
  constructor(app) {
    this.cardEl = null;
    this.hideTimeout = null;
    this.app = app;
  }
  show(person, anchor) {
    this.cancelHide();
    this.hide();
    const card = document.createElement("div");
    card.className = "arcadia-connect-profile-card";
    const header = card.createDiv({ cls: "arcadia-connect-card-header" });
    const icon = header.createSpan({ cls: "arcadia-connect-card-icon" });
    icon.textContent = "\u{1F464}";
    header.createEl("strong", { text: person.name });
    const details = card.createDiv({ cls: "arcadia-connect-card-details" });
    if (person.organization) {
      const row = details.createDiv({ cls: "arcadia-connect-card-row" });
      row.createSpan({ cls: "arcadia-connect-card-label", text: "Org" });
      row.createSpan({ text: person.organization });
    }
    if (person.role) {
      const row = details.createDiv({ cls: "arcadia-connect-card-row" });
      row.createSpan({ cls: "arcadia-connect-card-label", text: "Role" });
      row.createSpan({ text: person.role });
    }
    if (person.email) {
      const row = details.createDiv({ cls: "arcadia-connect-card-row" });
      row.createSpan({ cls: "arcadia-connect-card-label", text: "Email" });
      row.createSpan({ text: person.email });
    }
    if (person.phone) {
      const row = details.createDiv({ cls: "arcadia-connect-card-row" });
      row.createSpan({ cls: "arcadia-connect-card-label", text: "Phone" });
      row.createSpan({ text: person.phone });
    }
    if (person.relationshipType) {
      const row = details.createDiv({ cls: "arcadia-connect-card-row" });
      row.createSpan({ cls: "arcadia-connect-card-label", text: "Type" });
      row.createSpan({ text: person.relationshipType });
    }
    const footer = card.createDiv({ cls: "arcadia-connect-card-footer" });
    const openBtn = footer.createEl("button", {
      cls: "arcadia-connect-card-open-btn",
      text: "Open"
    });
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.app.workspace.openLinkText(person.file.path, "", false);
      this.hide();
    });
    document.body.appendChild(card);
    this.cardEl = card;
    const anchorRect = anchor.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    let top = anchorRect.bottom + 4;
    let left = anchorRect.left;
    if (top + cardRect.height > window.innerHeight) {
      top = anchorRect.top - cardRect.height - 4;
    }
    if (left + cardRect.width > window.innerWidth) {
      left = window.innerWidth - cardRect.width - 8;
    }
    if (left < 0)
      left = 8;
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.addEventListener("mouseenter", () => {
      this.cancelHide();
    });
    card.addEventListener("mouseleave", () => {
      this.scheduleHide();
    });
  }
  scheduleHide() {
    this.cancelHide();
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, 300);
  }
  cancelHide() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  hide() {
    if (this.cardEl) {
      this.cardEl.remove();
      this.cardEl = null;
    }
  }
  destroy() {
    this.cancelHide();
    this.hide();
  }
};

// src/people-view.ts
var import_obsidian5 = require("obsidian");

// src/interaction-logger.ts
var import_obsidian4 = require("obsidian");
var InteractionLoggerModal = class extends import_obsidian4.Modal {
  constructor(app, personManager, preselectedPerson = null, onSuccess) {
    super(app);
    this.personManager = personManager;
    this.preselectedPerson = preselectedPerson;
    this.onSuccess = onSuccess;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("arcadia-interaction-modal");
    contentEl.createEl("h2", { text: "Log Interaction" });
    const today = new Date().toISOString().split("T")[0];
    let selectedPerson = this.preselectedPerson;
    let selectedType = "call";
    let selectedDate = today;
    let summary = "";
    let nextFollowUp = "";
    if (!this.preselectedPerson) {
      const people = this.personManager.getAllPeople();
      new import_obsidian4.Setting(contentEl).setName("Person").setDesc("Who did you interact with?").addDropdown((dd) => {
        dd.addOption("", "\u2014 Select person \u2014");
        for (const p of people.sort((a, b) => a.name.localeCompare(b.name))) {
          dd.addOption(p.name, p.name);
        }
        dd.onChange((value) => {
          var _a;
          selectedPerson = (_a = this.personManager.getPersonByName(value)) != null ? _a : null;
        });
      });
    } else {
      contentEl.createEl("p", {
        text: `Contact: ${this.preselectedPerson.name}`,
        cls: "arcadia-interaction-contact-name"
      });
    }
    new import_obsidian4.Setting(contentEl).setName("Type").addDropdown((dd) => {
      for (const [value, label] of Object.entries(INTERACTION_TYPES)) {
        dd.addOption(value, label);
      }
      dd.setValue("call");
      dd.onChange((value) => {
        selectedType = value;
      });
    });
    new import_obsidian4.Setting(contentEl).setName("Date").addText((text) => {
      text.setValue(today);
      text.inputEl.type = "date";
      text.onChange((value) => {
        selectedDate = value;
      });
    });
    new import_obsidian4.Setting(contentEl).setName("Summary").setDesc("Brief description of the interaction").addTextArea((ta) => {
      ta.setPlaceholder("What was discussed or decided?");
      ta.inputEl.rows = 3;
      ta.onChange((value) => {
        summary = value;
      });
    });
    new import_obsidian4.Setting(contentEl).setName("Next follow-up").setDesc("Optional: schedule a follow-up").addText((text) => {
      text.inputEl.type = "date";
      text.onChange((value) => {
        nextFollowUp = value;
      });
    });
    const buttonRow = contentEl.createDiv({ cls: "arcadia-interaction-buttons" });
    const cancelBtn = buttonRow.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = buttonRow.createEl("button", {
      text: "Log Interaction",
      cls: "mod-cta"
    });
    saveBtn.addEventListener("click", async () => {
      var _a;
      if (!selectedPerson) {
        new import_obsidian4.Notice("Please select a person.");
        return;
      }
      if (!summary.trim()) {
        new import_obsidian4.Notice("Please add a summary.");
        return;
      }
      try {
        await this.personManager.logInteraction(
          selectedPerson,
          INTERACTION_TYPES[selectedType],
          summary.trim(),
          selectedDate
        );
        if (nextFollowUp) {
          await this.app.fileManager.processFrontMatter(selectedPerson.file, (fm) => {
            fm["next-follow-up"] = nextFollowUp;
            fm["follow-up-status"] = "pending";
          });
        }
        new import_obsidian4.Notice(`Logged interaction with ${selectedPerson.name}`);
        this.close();
        (_a = this.onSuccess) == null ? void 0 : _a.call(this);
      } catch (e) {
        new import_obsidian4.Notice("Failed to log interaction. Check console for details.");
        console.error("Interaction log error:", e);
      }
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SetFollowUpModal = class extends import_obsidian4.Modal {
  constructor(app, person, personManager, onSuccess) {
    super(app);
    this.person = person;
    this.personManager = personManager;
    this.onSuccess = onSuccess;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("arcadia-followup-modal");
    contentEl.createEl("h2", { text: `Follow-up: ${this.person.name}` });
    let followUpDate = "";
    let notes = "";
    new import_obsidian4.Setting(contentEl).setName("Follow-up date").addText((text) => {
      text.inputEl.type = "date";
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      text.setValue(nextWeek.toISOString().split("T")[0]);
      followUpDate = nextWeek.toISOString().split("T")[0];
      text.onChange((value) => {
        followUpDate = value;
      });
    });
    new import_obsidian4.Setting(contentEl).setName("Note").setDesc("What to follow up about (optional)").addText((text) => {
      text.setPlaceholder("Reminder note...");
      text.onChange((value) => {
        notes = value;
      });
    });
    const buttonRow = contentEl.createDiv({ cls: "arcadia-interaction-buttons" });
    const cancelBtn = buttonRow.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = buttonRow.createEl("button", { text: "Set Follow-up", cls: "mod-cta" });
    saveBtn.addEventListener("click", async () => {
      var _a;
      if (!followUpDate) {
        new import_obsidian4.Notice("Please select a date.");
        return;
      }
      await this.app.fileManager.processFrontMatter(this.person.file, (fm) => {
        fm["next-follow-up"] = followUpDate;
        fm["follow-up-status"] = "pending";
        if (notes.trim()) {
          fm["follow-up-note"] = notes.trim();
        }
      });
      new import_obsidian4.Notice(`Follow-up set for ${this.person.name} on ${followUpDate}`);
      this.close();
      (_a = this.onSuccess) == null ? void 0 : _a.call(this);
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/people-view.ts
var PeopleView = class extends import_obsidian5.ItemView {
  constructor(leaf, personManager, mentionScanner, profileCard) {
    super(leaf);
    this.searchQuery = "";
    this.sortMode = "alpha";
    this.filterOverdue = false;
    this.listEl = null;
    this.personManager = personManager;
    this.mentionScanner = mentionScanner;
    this.profileCard = profileCard;
  }
  getViewType() {
    return VIEW_TYPE_PEOPLE;
  }
  getDisplayText() {
    return "People";
  }
  getIcon() {
    return "users";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("arcadia-connect-people-view");
    const header = container.createDiv({ cls: "arcadia-connect-people-header" });
    const searchContainer = header.createDiv({ cls: "arcadia-connect-search-container" });
    const searchInput = searchContainer.createEl("input", {
      cls: "arcadia-connect-search-input",
      attr: { type: "text", placeholder: "Search people..." }
    });
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value;
      this.renderList();
    });
    const controls = header.createDiv({ cls: "arcadia-connect-controls" });
    const sortSelect = controls.createEl("select", { cls: "arcadia-connect-sort-select" });
    const sortOptions2 = [
      { value: "alpha", label: "A-Z" },
      { value: "recent", label: "Recent mention" },
      { value: "last-contact", label: "Last contacted" },
      { value: "next-follow-up", label: "Follow-up due" },
      { value: "deal-stage", label: "Deal stage" },
      { value: "relationship", label: "Relationship" }
    ];
    for (const opt of sortOptions2) {
      sortSelect.createEl("option", { value: opt.value, text: opt.label });
    }
    sortSelect.value = this.sortMode;
    sortSelect.addEventListener("change", () => {
      this.sortMode = sortSelect.value;
      this.filterOverdue = false;
      this.renderList();
    });
    const overdueBtn = controls.createEl("button", {
      cls: "arcadia-connect-overdue-btn",
      text: "\u23F0",
      attr: { title: "Show overdue follow-ups" }
    });
    overdueBtn.addEventListener("click", () => {
      this.filterOverdue = !this.filterOverdue;
      overdueBtn.toggleClass("is-active", this.filterOverdue);
      this.renderList();
    });
    const newBtn = controls.createEl("button", {
      cls: "arcadia-connect-new-btn",
      text: "+ Person"
    });
    newBtn.addEventListener("click", () => {
      this.createNewPerson();
    });
    const logBtn = controls.createEl("button", {
      cls: "arcadia-connect-log-btn",
      text: "+ Log",
      attr: { title: "Log an interaction" }
    });
    logBtn.addEventListener("click", () => {
      new InteractionLoggerModal(this.app, this.personManager, null, () => {
        this.renderList();
      }).open();
    });
    this.listEl = container.createDiv({ cls: "arcadia-connect-people-list" });
    this.renderList();
  }
  renderList() {
    var _a;
    if (!this.listEl)
      return;
    this.listEl.empty();
    let people = this.searchQuery ? this.personManager.searchPeople(this.searchQuery) : this.personManager.getAllPeople();
    if (this.filterOverdue) {
      const today2 = new Date().toISOString().split("T")[0];
      people = people.filter((p) => {
        if (!p.nextFollowUp)
          return false;
        if (p.followUpStatus === "done")
          return false;
        return p.nextFollowUp <= today2;
      });
    }
    people = this.sortPeople(people);
    if (people.length === 0) {
      const empty = this.listEl.createDiv({ cls: "arcadia-connect-empty" });
      if (this.filterOverdue) {
        empty.textContent = "No overdue follow-ups.";
      } else if (this.searchQuery) {
        empty.textContent = "No people match your search.";
      } else {
        empty.textContent = "No people notes found. Create one to get started.";
      }
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    for (const person of people) {
      const item = this.listEl.createDiv({ cls: "arcadia-connect-person-item" });
      const followUpOverdue = person.nextFollowUp && person.followUpStatus !== "done" && person.nextFollowUp < today;
      const followUpDueToday = person.nextFollowUp && person.followUpStatus !== "done" && person.nextFollowUp === today;
      if (followUpOverdue)
        item.addClass("has-overdue-followup");
      if (followUpDueToday)
        item.addClass("has-followup-today");
      const icon = item.createSpan({ cls: "arcadia-connect-person-icon" });
      icon.textContent = followUpOverdue ? "\u23F0" : followUpDueToday ? "\u{1F514}" : "\u{1F464}";
      const info = item.createDiv({ cls: "arcadia-connect-person-info" });
      info.createDiv({ cls: "arcadia-connect-person-name", text: person.name });
      const meta = [];
      if (person.organization)
        meta.push(person.organization);
      if (person.dealStage)
        meta.push((_a = DEAL_STAGE_LABELS[person.dealStage]) != null ? _a : person.dealStage);
      if (meta.length > 0) {
        info.createDiv({
          cls: "arcadia-connect-person-meta",
          text: meta.join(" \xB7 ")
        });
      }
      if (person.lastContact || person.nextFollowUp) {
        const dateLine = info.createDiv({ cls: "arcadia-connect-person-dates" });
        if (person.lastContact) {
          dateLine.createSpan({ cls: "arcadia-date-last", text: `Last: ${person.lastContact}` });
        }
        if (person.nextFollowUp && person.followUpStatus !== "done") {
          const cls = followUpOverdue ? "arcadia-date-followup overdue" : followUpDueToday ? "arcadia-date-followup due-today" : "arcadia-date-followup";
          dateLine.createSpan({ cls, text: ` \xB7 Due: ${person.nextFollowUp}` });
        }
      }
      const mentionCount = this.mentionScanner.getMentionCount(person.name);
      if (mentionCount > 0) {
        const badge = item.createSpan({ cls: "arcadia-connect-mention-badge" });
        badge.textContent = String(mentionCount);
        badge.setAttribute("title", `${mentionCount} mention${mentionCount === 1 ? "" : "s"}`);
      }
      const actions = item.createDiv({ cls: "arcadia-connect-item-actions" });
      const logBtn = actions.createEl("button", {
        cls: "arcadia-connect-action-btn",
        text: "+ Log",
        attr: { title: "Log interaction" }
      });
      logBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        new InteractionLoggerModal(this.app, this.personManager, person, () => {
          this.renderList();
        }).open();
      });
      const followUpBtn = actions.createEl("button", {
        cls: "arcadia-connect-action-btn",
        text: "\u{1F4C5}",
        attr: { title: "Set follow-up" }
      });
      followUpBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        new SetFollowUpModal(this.app, person, this.personManager, () => {
          this.renderList();
        }).open();
      });
      item.addEventListener("click", () => {
        this.app.workspace.openLinkText(person.file.path, "", false);
      });
      item.addEventListener("mouseenter", () => {
        this.profileCard.show(person, item);
      });
      item.addEventListener("mouseleave", () => {
        this.profileCard.scheduleHide();
      });
    }
  }
  sortPeople(people) {
    const FAR_FUTURE = "9999-99-99";
    const FAR_PAST = "0000-00-00";
    switch (this.sortMode) {
      case "alpha":
        return [...people].sort((a, b) => a.name.localeCompare(b.name));
      case "recent":
        return [...people].sort((a, b) => {
          const dateA = this.mentionScanner.getLastMentionDate(a.name) || FAR_PAST;
          const dateB = this.mentionScanner.getLastMentionDate(b.name) || FAR_PAST;
          return dateB.localeCompare(dateA);
        });
      case "last-contact":
        return [...people].sort((a, b) => {
          const dateA = a.lastContact || FAR_PAST;
          const dateB = b.lastContact || FAR_PAST;
          return dateB.localeCompare(dateA);
        });
      case "next-follow-up":
        return [...people].sort((a, b) => {
          const dateA = (a.followUpStatus === "done" ? FAR_FUTURE : a.nextFollowUp) || FAR_FUTURE;
          const dateB = (b.followUpStatus === "done" ? FAR_FUTURE : b.nextFollowUp) || FAR_FUTURE;
          return dateA.localeCompare(dateB);
        });
      case "deal-stage": {
        const stageOrder = ["lead", "prospect", "proposal", "negotiation", "closed-won", "closed-lost", "nurture"];
        return [...people].sort((a, b) => {
          const ia = a.dealStage ? stageOrder.indexOf(a.dealStage) : stageOrder.length;
          const ib = b.dealStage ? stageOrder.indexOf(b.dealStage) : stageOrder.length;
          return ia !== ib ? ia - ib : a.name.localeCompare(b.name);
        });
      }
      case "relationship":
        return [...people].sort((a, b) => {
          const typeA = a.relationshipType || "zzz";
          const typeB = b.relationshipType || "zzz";
          const cmp = typeA.localeCompare(typeB);
          return cmp !== 0 ? cmp : a.name.localeCompare(b.name);
        });
      default:
        return people;
    }
  }
  async createNewPerson() {
    const name = await this.promptForName();
    if (!name)
      return;
    const file = await this.personManager.createPersonNote(name);
    this.app.workspace.openLinkText(file.path, "", false);
    this.renderList();
  }
  promptForName() {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "arcadia-connect-name-modal";
      const overlay = document.createElement("div");
      overlay.className = "arcadia-connect-modal-overlay";
      const content = document.createElement("div");
      content.className = "arcadia-connect-modal-content";
      const label = document.createElement("label");
      label.textContent = "Person name:";
      content.appendChild(label);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "arcadia-connect-modal-input";
      input.placeholder = "Full Name";
      content.appendChild(input);
      const buttons = document.createElement("div");
      buttons.className = "arcadia-connect-modal-buttons";
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => {
        modal.remove();
        resolve(null);
      });
      buttons.appendChild(cancelBtn);
      const createBtn = document.createElement("button");
      createBtn.textContent = "Create";
      createBtn.className = "mod-cta";
      createBtn.addEventListener("click", () => {
        const value = input.value.trim();
        modal.remove();
        resolve(value || null);
      });
      buttons.appendChild(createBtn);
      content.appendChild(buttons);
      modal.appendChild(overlay);
      modal.appendChild(content);
      document.body.appendChild(modal);
      overlay.addEventListener("click", () => {
        modal.remove();
        resolve(null);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const value = input.value.trim();
          modal.remove();
          resolve(value || null);
        }
        if (e.key === "Escape") {
          modal.remove();
          resolve(null);
        }
      });
      input.focus();
    });
  }
  async onClose() {
    this.profileCard.hide();
  }
};

// src/timeline-view.ts
var import_obsidian6 = require("obsidian");
var INTERACTION_RE = /^- (\d{4}-\d{2}-\d{2}) — \*\*(.+?)\*\*: (.+)$/;
var TimelineView = class extends import_obsidian6.ItemView {
  constructor(leaf, personManager) {
    super(leaf);
    this.entries = [];
    this.filterContact = "";
    this.listEl = null;
    this.personManager = personManager;
  }
  getViewType() {
    return VIEW_TYPE_TIMELINE;
  }
  getDisplayText() {
    return "Interaction Timeline";
  }
  getIcon() {
    return "history";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("arcadia-timeline-view");
    const header = container.createDiv({ cls: "arcadia-timeline-header" });
    header.createEl("h4", { text: "Interaction Timeline" });
    const controls = header.createDiv({ cls: "arcadia-timeline-controls" });
    const filterInput = controls.createEl("input", {
      cls: "arcadia-timeline-filter",
      attr: { type: "text", placeholder: "Filter by contact..." }
    });
    filterInput.addEventListener("input", () => {
      this.filterContact = filterInput.value.toLowerCase();
      this.renderEntries();
    });
    const refreshBtn = controls.createEl("button", {
      cls: "arcadia-timeline-refresh",
      text: "\u21BB",
      attr: { title: "Refresh" }
    });
    refreshBtn.addEventListener("click", () => this.reload());
    this.listEl = container.createDiv({ cls: "arcadia-timeline-list" });
    await this.reload();
  }
  async reload() {
    this.entries = await this.parseAllInteractions();
    this.renderEntries();
  }
  async parseAllInteractions() {
    const entries = [];
    const people = this.personManager.getAllPeople();
    for (const person of people) {
      try {
        const content = await this.app.vault.read(person.file);
        const logStart = content.indexOf("## Interaction Log");
        if (logStart === -1)
          continue;
        const logSection = content.slice(logStart);
        const lines = logSection.split("\n");
        for (const line of lines) {
          const match = line.match(INTERACTION_RE);
          if (!match)
            continue;
          entries.push({
            date: match[1],
            type: match[2],
            summary: match[3].trim(),
            contactName: person.name,
            contactFile: person.file
          });
        }
      } catch (e) {
      }
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }
  renderEntries() {
    if (!this.listEl)
      return;
    this.listEl.empty();
    let filtered = this.entries;
    if (this.filterContact) {
      filtered = filtered.filter(
        (e) => e.contactName.toLowerCase().includes(this.filterContact)
      );
    }
    if (filtered.length === 0) {
      const empty = this.listEl.createDiv({ cls: "arcadia-timeline-empty" });
      empty.textContent = this.filterContact ? "No interactions found for that contact." : 'No interactions logged yet. Use "Log Interaction" to get started.';
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];
    const getBucket = (date) => {
      if (date === today)
        return "Today";
      if (date === yesterday)
        return "Yesterday";
      if (date >= weekAgo)
        return "This Week";
      if (date >= monthAgo)
        return "This Month";
      return "Earlier";
    };
    let currentBucket = "";
    for (const entry of filtered) {
      const bucket = getBucket(entry.date);
      if (bucket !== currentBucket) {
        currentBucket = bucket;
        const bucketHeader = this.listEl.createDiv({ cls: "arcadia-timeline-bucket" });
        bucketHeader.textContent = bucket;
      }
      const row = this.listEl.createDiv({ cls: "arcadia-timeline-entry" });
      const dateBadge = row.createDiv({ cls: "arcadia-timeline-date" });
      dateBadge.textContent = entry.date;
      const body = row.createDiv({ cls: "arcadia-timeline-body" });
      const topLine = body.createDiv({ cls: "arcadia-timeline-top" });
      const typeBadge = topLine.createSpan({ cls: "arcadia-timeline-type" });
      typeBadge.textContent = entry.type;
      const contactLink = topLine.createEl("a", {
        cls: "arcadia-timeline-contact",
        text: entry.contactName
      });
      contactLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.app.workspace.openLinkText(entry.contactFile.path, "", false);
      });
      body.createDiv({
        cls: "arcadia-timeline-summary",
        text: entry.summary
      });
    }
  }
  async onClose() {
  }
};

// src/pipeline-view.ts
var import_obsidian7 = require("obsidian");
var PipelineView = class extends import_obsidian7.ItemView {
  constructor(leaf, personManager) {
    super(leaf);
    this.boardEl = null;
    this.personManager = personManager;
  }
  getViewType() {
    return VIEW_TYPE_PIPELINE;
  }
  getDisplayText() {
    return "Pipeline";
  }
  getIcon() {
    return "kanban-square";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("arcadia-pipeline-view");
    const header = container.createDiv({ cls: "arcadia-pipeline-header" });
    header.createEl("h4", { text: "Deal Pipeline" });
    const refreshBtn = header.createEl("button", {
      cls: "arcadia-pipeline-refresh",
      text: "\u21BB",
      attr: { title: "Refresh" }
    });
    refreshBtn.addEventListener("click", () => this.renderBoard());
    this.boardEl = container.createDiv({ cls: "arcadia-pipeline-board" });
    this.renderBoard();
  }
  renderBoard() {
    var _a, _b;
    if (!this.boardEl)
      return;
    this.boardEl.empty();
    const people = this.personManager.getAllPeople();
    const today = new Date().toISOString().split("T")[0];
    const byStage = /* @__PURE__ */ new Map();
    for (const stage of DEAL_STAGE_ORDER) {
      byStage.set(stage, []);
    }
    for (const person of people) {
      const stage = (_a = person.dealStage) != null ? _a : "lead";
      const bucket = byStage.get(stage);
      if (bucket)
        bucket.push(person);
    }
    const visibleStages = ["lead", "prospect", "proposal", "negotiation", "closed-won", "closed-lost"];
    for (const stage of visibleStages) {
      const contacts = (_b = byStage.get(stage)) != null ? _b : [];
      const column = this.boardEl.createDiv({ cls: `arcadia-pipeline-column arcadia-stage-${stage}` });
      const colHeader = column.createDiv({ cls: "arcadia-pipeline-col-header" });
      colHeader.createSpan({ cls: "arcadia-pipeline-stage-name", text: DEAL_STAGE_LABELS[stage] });
      const countBadge = colHeader.createSpan({ cls: "arcadia-pipeline-count" });
      countBadge.textContent = String(contacts.length);
      const stageValue = contacts.reduce((sum, p) => {
        var _a2;
        return sum + ((_a2 = p.dealValue) != null ? _a2 : 0);
      }, 0);
      if (stageValue > 0) {
        colHeader.createSpan({
          cls: "arcadia-pipeline-value",
          text: `$${stageValue.toLocaleString()}`
        });
      }
      const cardsEl = column.createDiv({ cls: "arcadia-pipeline-cards" });
      if (contacts.length === 0) {
        cardsEl.createDiv({ cls: "arcadia-pipeline-empty-col", text: "Empty" });
      }
      for (const person of contacts.sort((a, b) => {
        var _a2, _b2;
        return ((_a2 = b.dealValue) != null ? _a2 : 0) - ((_b2 = a.dealValue) != null ? _b2 : 0);
      })) {
        const card = cardsEl.createDiv({ cls: "arcadia-pipeline-card" });
        const hasOverdue = person.nextFollowUp && person.followUpStatus !== "done" && person.nextFollowUp < today;
        const hasDueToday = person.nextFollowUp && person.followUpStatus !== "done" && person.nextFollowUp === today;
        if (hasOverdue)
          card.addClass("has-overdue");
        if (hasDueToday)
          card.addClass("has-due-today");
        const cardTop = card.createDiv({ cls: "arcadia-card-top" });
        cardTop.createDiv({ cls: "arcadia-card-name", text: person.name });
        if (hasOverdue)
          cardTop.createSpan({ cls: "arcadia-card-flag", text: "\u23F0" });
        else if (hasDueToday)
          cardTop.createSpan({ cls: "arcadia-card-flag", text: "\u{1F514}" });
        if (person.organization) {
          card.createDiv({ cls: "arcadia-card-org", text: person.organization });
        }
        if (person.dealValue && person.dealValue > 0) {
          card.createDiv({
            cls: "arcadia-card-deal-value",
            text: `$${person.dealValue.toLocaleString()}`
          });
        }
        if (person.lastContact) {
          card.createDiv({
            cls: "arcadia-card-last-contact",
            text: `Last: ${person.lastContact}`
          });
        }
        const actions = card.createDiv({ cls: "arcadia-card-actions" });
        const moveSelect = actions.createEl("select", { cls: "arcadia-card-move-select" });
        moveSelect.createEl("option", { value: "", text: "Move to..." });
        for (const s of DEAL_STAGE_ORDER) {
          if (s === stage)
            continue;
          moveSelect.createEl("option", { value: s, text: DEAL_STAGE_LABELS[s] });
        }
        moveSelect.addEventListener("change", async () => {
          const newStage = moveSelect.value;
          if (!newStage)
            return;
          await this.app.fileManager.processFrontMatter(person.file, (fm) => {
            fm["deal-stage"] = newStage;
          });
          this.personManager.updatePerson(person.file);
          new import_obsidian7.Notice(`Moved ${person.name} to ${DEAL_STAGE_LABELS[newStage]}`);
          this.renderBoard();
        });
        const logBtn = actions.createEl("button", {
          cls: "arcadia-card-log-btn",
          text: "+ Log",
          attr: { title: "Log interaction" }
        });
        logBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          new InteractionLoggerModal(this.app, this.personManager, person, () => {
            this.renderBoard();
          }).open();
        });
        card.addEventListener("click", (e) => {
          if (e.target.closest("select, button"))
            return;
          this.app.workspace.openLinkText(person.file.path, "", false);
        });
      }
    }
  }
  async onClose() {
  }
};

// node_modules/@codemirror/autocomplete/dist/index.js
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");
var import_language = require("@codemirror/language");
var CompletionContext = class {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(state, pos, explicit, view) {
    this.state = state;
    this.pos = pos;
    this.explicit = explicit;
    this.view = view;
    this.abortListeners = [];
    this.abortOnDocChange = false;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(types) {
    let token = (0, import_language.syntaxTree)(this.state).resolveInner(this.pos, -1);
    while (token && types.indexOf(token.name) < 0)
      token = token.parent;
    return token ? {
      from: token.from,
      to: this.pos,
      text: this.state.sliceDoc(token.from, this.pos),
      type: token.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(expr) {
    let line = this.state.doc.lineAt(this.pos);
    let start = Math.max(line.from, this.pos - 250);
    let str = line.text.slice(start - line.from, this.pos - line.from);
    let found = str.search(ensureAnchor(expr, false));
    return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(type, listener, options) {
    if (type == "abort" && this.abortListeners) {
      this.abortListeners.push(listener);
      if (options && options.onDocChange)
        this.abortOnDocChange = true;
    }
  }
};
function toSet(chars) {
  let flat = Object.keys(chars).join("");
  let words = /\w/.test(flat);
  if (words)
    flat = flat.replace(/\w/g, "");
  return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
  let first = /* @__PURE__ */ Object.create(null), rest = /* @__PURE__ */ Object.create(null);
  for (let { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++)
      rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
  let options = list.map((o) => typeof o == "string" ? { label: o } : o);
  let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
  return (context) => {
    let token = context.matchBefore(match);
    return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
  };
}
var Option = class {
  constructor(completion, source, match, score2) {
    this.completion = completion;
    this.source = source;
    this.match = match;
    this.score = score2;
  }
};
function cur(state) {
  return state.selection.main.from;
}
function ensureAnchor(expr, start) {
  var _a;
  let { source } = expr;
  let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
  if (!addStart && !addEnd)
    return expr;
  return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : expr.ignoreCase ? "i" : "");
}
var pickedCompletion = /* @__PURE__ */ import_state.Annotation.define();
function insertCompletionText(state, text, from, to) {
  let { main } = state.selection, fromOff = from - main.from, toOff = to - main.from;
  return {
    ...state.changeByRange((range) => {
      if (range != main && from != to && state.sliceDoc(range.from + fromOff, range.from + toOff) != state.sliceDoc(from, to))
        return { range };
      let lines = state.toText(text);
      return {
        changes: { from: range.from + fromOff, to: to == main.from ? range.to : range.from + toOff, insert: lines },
        range: import_state.EditorSelection.cursor(range.from + fromOff + lines.length)
      };
    }),
    scrollIntoView: true,
    userEvent: "input.complete"
  };
}
var SourceCache = /* @__PURE__ */ new WeakMap();
function asSource(source) {
  if (!Array.isArray(source))
    return source;
  let known = SourceCache.get(source);
  if (!known)
    SourceCache.set(source, known = completeFromList(source));
  return known;
}
var startCompletionEffect = /* @__PURE__ */ import_state.StateEffect.define();
var closeCompletionEffect = /* @__PURE__ */ import_state.StateEffect.define();
var FuzzyMatcher = class {
  constructor(pattern) {
    this.pattern = pattern;
    this.chars = [];
    this.folded = [];
    this.any = [];
    this.precise = [];
    this.byWord = [];
    this.score = 0;
    this.matched = [];
    for (let p = 0; p < pattern.length; ) {
      let char = (0, import_state.codePointAt)(pattern, p), size = (0, import_state.codePointSize)(char);
      this.chars.push(char);
      let part = pattern.slice(p, p + size), upper = part.toUpperCase();
      this.folded.push((0, import_state.codePointAt)(upper == part ? part.toLowerCase() : upper, 0));
      p += size;
    }
    this.astral = pattern.length != this.chars.length;
  }
  ret(score2, matched) {
    this.score = score2;
    this.matched = matched;
    return this;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(word) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (word.length < this.pattern.length)
      return null;
    let { chars, folded, any, precise, byWord } = this;
    if (chars.length == 1) {
      let first = (0, import_state.codePointAt)(word, 0), firstSize = (0, import_state.codePointSize)(first);
      let score2 = firstSize == word.length ? 0 : -100;
      if (first == chars[0])
        ;
      else if (first == folded[0])
        score2 += -200;
      else
        return null;
      return this.ret(score2, [0, firstSize]);
    }
    let direct = word.indexOf(this.pattern);
    if (direct == 0)
      return this.ret(word.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let len = chars.length, anyTo = 0;
    if (direct < 0) {
      for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
        let next = (0, import_state.codePointAt)(word, i);
        if (next == chars[anyTo] || next == folded[anyTo])
          any[anyTo++] = i;
        i += (0, import_state.codePointSize)(next);
      }
      if (anyTo < len)
        return null;
    }
    let preciseTo = 0;
    let byWordTo = 0, byWordFolded = false;
    let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
    let hasLower = /[a-z]/.test(word), wordAdjacent = true;
    for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
      let next = (0, import_state.codePointAt)(word, i);
      if (direct < 0) {
        if (preciseTo < len && next == chars[preciseTo])
          precise[preciseTo++] = i;
        if (adjacentTo < len) {
          if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
            if (adjacentTo == 0)
              adjacentStart = i;
            adjacentEnd = i + 1;
            adjacentTo++;
          } else {
            adjacentTo = 0;
          }
        }
      }
      let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = (0, import_state.fromCodePoint)(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
      if (!i || type == 1 && hasLower || prevType == 0 && type != 0) {
        if (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true))
          byWord[byWordTo++] = i;
        else if (byWord.length)
          wordAdjacent = false;
      }
      prevType = type;
      i += (0, import_state.codePointSize)(next);
    }
    if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
      return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
    if (adjacentTo == len && adjacentStart == 0)
      return this.ret(-200 - word.length + (adjacentEnd == word.length ? 0 : -100), [0, adjacentEnd]);
    if (direct > -1)
      return this.ret(-700 - word.length, [direct, direct + this.pattern.length]);
    if (adjacentTo == len)
      return this.ret(-200 + -700 - word.length, [adjacentStart, adjacentEnd]);
    if (byWordTo == len)
      return this.result(-100 + (byWordFolded ? -200 : 0) + -700 + (wordAdjacent ? 0 : -1100), byWord, word);
    return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
  }
  result(score2, positions, word) {
    let result = [], i = 0;
    for (let pos of positions) {
      let to = pos + (this.astral ? (0, import_state.codePointSize)((0, import_state.codePointAt)(word, pos)) : 1);
      if (i && result[i - 1] == pos)
        result[i - 1] = to;
      else {
        result[i++] = pos;
        result[i++] = to;
      }
    }
    return this.ret(score2 - word.length, result);
  }
};
var StrictMatcher = class {
  constructor(pattern) {
    this.pattern = pattern;
    this.matched = [];
    this.score = 0;
    this.folded = pattern.toLowerCase();
  }
  match(word) {
    if (word.length < this.pattern.length)
      return null;
    let start = word.slice(0, this.pattern.length);
    let match = start == this.pattern ? 0 : start.toLowerCase() == this.folded ? -200 : null;
    if (match == null)
      return null;
    this.matched = [0, start.length];
    this.score = match + (word.length == this.pattern.length ? 0 : -100);
    return this;
  }
};
var completionConfig = /* @__PURE__ */ import_state.Facet.define({
  combine(configs) {
    return (0, import_state.combineConfig)(configs, {
      activateOnTyping: true,
      activateOnCompletion: () => false,
      activateOnTypingDelay: 100,
      selectOnOpen: true,
      override: null,
      closeOnBlur: true,
      maxRenderedOptions: 100,
      defaultKeymap: true,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: false,
      icons: true,
      addToOptions: [],
      positionInfo: defaultPositionInfo,
      filterStrict: false,
      compareCompletions: (a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label),
      interactionDelay: 75,
      updateSyncTime: 100
    }, {
      defaultKeymap: (a, b) => a && b,
      closeOnBlur: (a, b) => a && b,
      icons: (a, b) => a && b,
      tooltipClass: (a, b) => (c) => joinClass(a(c), b(c)),
      optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
      addToOptions: (a, b) => a.concat(b),
      filterStrict: (a, b) => a || b
    });
  }
});
function joinClass(a, b) {
  return a ? b ? a + " " + b : a : b;
}
function defaultPositionInfo(view, list, option, info, space, tooltip) {
  let rtl = view.textDirection == import_view.Direction.RTL, left = rtl, narrow = false;
  let side = "top", offset, maxWidth;
  let spaceLeft = list.left - space.left, spaceRight = space.right - list.right;
  let infoWidth = info.right - info.left, infoHeight = info.bottom - info.top;
  if (left && spaceLeft < Math.min(infoWidth, spaceRight))
    left = false;
  else if (!left && spaceRight < Math.min(infoWidth, spaceLeft))
    left = true;
  if (infoWidth <= (left ? spaceLeft : spaceRight)) {
    offset = Math.max(space.top, Math.min(option.top, space.bottom - infoHeight)) - list.top;
    maxWidth = Math.min(400, left ? spaceLeft : spaceRight);
  } else {
    narrow = true;
    maxWidth = Math.min(
      400,
      (rtl ? list.right : space.right - list.left) - 30
      /* Info.Margin */
    );
    let spaceBelow = space.bottom - list.bottom;
    if (spaceBelow >= infoHeight || spaceBelow > list.top) {
      offset = option.bottom - list.top;
    } else {
      side = "bottom";
      offset = list.bottom - option.top;
    }
  }
  let scaleY = (list.bottom - list.top) / tooltip.offsetHeight;
  let scaleX = (list.right - list.left) / tooltip.offsetWidth;
  return {
    style: `${side}: ${offset / scaleY}px; max-width: ${maxWidth / scaleX}px`,
    class: "cm-completionInfo-" + (narrow ? rtl ? "left-narrow" : "right-narrow" : left ? "left" : "right")
  };
}
var setSelectedEffect = /* @__PURE__ */ import_state.StateEffect.define();
function optionContent(config) {
  let content = config.addToOptions.slice();
  if (config.icons)
    content.push({
      render(completion) {
        let icon = document.createElement("div");
        icon.classList.add("cm-completionIcon");
        if (completion.type)
          icon.classList.add(...completion.type.split(/\s+/g).map((cls) => "cm-completionIcon-" + cls));
        icon.setAttribute("aria-hidden", "true");
        return icon;
      },
      position: 20
    });
  content.push({
    render(completion, _s, _v, match) {
      let labelElt = document.createElement("span");
      labelElt.className = "cm-completionLabel";
      let label = completion.displayLabel || completion.label, off = 0;
      for (let j = 0; j < match.length; ) {
        let from = match[j++], to = match[j++];
        if (from > off)
          labelElt.appendChild(document.createTextNode(label.slice(off, from)));
        let span = labelElt.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(label.slice(from, to)));
        span.className = "cm-completionMatchedText";
        off = to;
      }
      if (off < label.length)
        labelElt.appendChild(document.createTextNode(label.slice(off)));
      return labelElt;
    },
    position: 50
  }, {
    render(completion) {
      if (!completion.detail)
        return null;
      let detailElt = document.createElement("span");
      detailElt.className = "cm-completionDetail";
      detailElt.textContent = completion.detail;
      return detailElt;
    },
    position: 80
  });
  return content.sort((a, b) => a.position - b.position).map((a) => a.render);
}
function rangeAroundSelected(total, selected, max) {
  if (total <= max)
    return { from: 0, to: total };
  if (selected < 0)
    selected = 0;
  if (selected <= total >> 1) {
    let off2 = Math.floor(selected / max);
    return { from: off2 * max, to: (off2 + 1) * max };
  }
  let off = Math.floor((total - selected) / max);
  return { from: total - (off + 1) * max, to: total - off * max };
}
var CompletionTooltip = class {
  constructor(view, stateField, applyCompletion2) {
    this.view = view;
    this.stateField = stateField;
    this.applyCompletion = applyCompletion2;
    this.info = null;
    this.infoDestroy = null;
    this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (pos) => this.placeInfo(pos),
      key: this
    };
    this.space = null;
    this.currentClass = "";
    let cState = view.state.field(stateField);
    let { options, selected } = cState.open;
    let config = view.state.facet(completionConfig);
    this.optionContent = optionContent(config);
    this.optionClass = config.optionClass;
    this.tooltipClass = config.tooltipClass;
    this.range = rangeAroundSelected(options.length, selected, config.maxRenderedOptions);
    this.dom = document.createElement("div");
    this.dom.className = "cm-tooltip-autocomplete";
    this.updateTooltipClass(view.state);
    this.dom.addEventListener("mousedown", (e) => {
      let { options: options2 } = view.state.field(stateField).open;
      for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
        if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options2.length) {
          this.applyCompletion(view, options2[+match[1]]);
          e.preventDefault();
          return;
        }
      }
      if (e.target == this.list) {
        let move = this.list.classList.contains("cm-completionListIncompleteTop") && e.clientY < this.list.firstChild.getBoundingClientRect().top ? this.range.from - 1 : this.list.classList.contains("cm-completionListIncompleteBottom") && e.clientY > this.list.lastChild.getBoundingClientRect().bottom ? this.range.to : null;
        if (move != null) {
          view.dispatch({ effects: setSelectedEffect.of(move) });
          e.preventDefault();
        }
      }
    });
    this.dom.addEventListener("focusout", (e) => {
      let state = view.state.field(this.stateField, false);
      if (state && state.tooltip && view.state.facet(completionConfig).closeOnBlur && e.relatedTarget != view.contentDOM)
        view.dispatch({ effects: closeCompletionEffect.of(null) });
    });
    this.showOptions(options, cState.id);
  }
  mount() {
    this.updateSel();
  }
  showOptions(options, id) {
    if (this.list)
      this.list.remove();
    this.list = this.dom.appendChild(this.createListBox(options, id, this.range));
    this.list.addEventListener("scroll", () => {
      if (this.info)
        this.view.requestMeasure(this.placeInfoReq);
    });
  }
  update(update) {
    var _a;
    let cState = update.state.field(this.stateField);
    let prevState = update.startState.field(this.stateField);
    this.updateTooltipClass(update.state);
    if (cState != prevState) {
      let { options, selected, disabled } = cState.open;
      if (!prevState.open || prevState.open.options != options) {
        this.range = rangeAroundSelected(options.length, selected, update.state.facet(completionConfig).maxRenderedOptions);
        this.showOptions(options, cState.id);
      }
      this.updateSel();
      if (disabled != ((_a = prevState.open) === null || _a === void 0 ? void 0 : _a.disabled))
        this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!disabled);
    }
  }
  updateTooltipClass(state) {
    let cls = this.tooltipClass(state);
    if (cls != this.currentClass) {
      for (let c of this.currentClass.split(" "))
        if (c)
          this.dom.classList.remove(c);
      for (let c of cls.split(" "))
        if (c)
          this.dom.classList.add(c);
      this.currentClass = cls;
    }
  }
  positioned(space) {
    this.space = space;
    if (this.info)
      this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let cState = this.view.state.field(this.stateField), open = cState.open;
    if (open.selected > -1 && open.selected < this.range.from || open.selected >= this.range.to) {
      this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
      this.showOptions(open.options, cState.id);
    }
    let newSel = this.updateSelectedOption(open.selected);
    if (newSel) {
      this.destroyInfo();
      let { completion } = open.options[open.selected];
      let { info } = completion;
      if (!info)
        return;
      let infoResult = typeof info === "string" ? document.createTextNode(info) : info(completion);
      if (!infoResult)
        return;
      if ("then" in infoResult) {
        infoResult.then((obj) => {
          if (obj && this.view.state.field(this.stateField, false) == cState)
            this.addInfoPane(obj, completion);
        }).catch((e) => (0, import_view.logException)(this.view.state, e, "completion info"));
      } else {
        this.addInfoPane(infoResult, completion);
        newSel.setAttribute("aria-describedby", this.info.id);
      }
    }
  }
  addInfoPane(content, completion) {
    this.destroyInfo();
    let wrap = this.info = document.createElement("div");
    wrap.className = "cm-tooltip cm-completionInfo";
    wrap.id = "cm-completionInfo-" + Math.floor(Math.random() * 65535).toString(16);
    if (content.nodeType != null) {
      wrap.appendChild(content);
      this.infoDestroy = null;
    } else {
      let { dom, destroy } = content;
      wrap.appendChild(dom);
      this.infoDestroy = destroy || null;
    }
    this.dom.appendChild(wrap);
    this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(selected) {
    let set = null;
    for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
      if (opt.nodeName != "LI" || !opt.id) {
        i--;
      } else if (i == selected) {
        if (!opt.hasAttribute("aria-selected")) {
          opt.setAttribute("aria-selected", "true");
          set = opt;
        }
      } else {
        if (opt.hasAttribute("aria-selected")) {
          opt.removeAttribute("aria-selected");
          opt.removeAttribute("aria-describedby");
        }
      }
    }
    if (set)
      scrollIntoView(this.list, set);
    return set;
  }
  measureInfo() {
    let sel = this.dom.querySelector("[aria-selected]");
    if (!sel || !this.info)
      return null;
    let listRect = this.dom.getBoundingClientRect();
    let infoRect = this.info.getBoundingClientRect();
    let selRect = sel.getBoundingClientRect();
    let space = this.space;
    if (!space) {
      let docElt = this.dom.ownerDocument.documentElement;
      space = { left: 0, top: 0, right: docElt.clientWidth, bottom: docElt.clientHeight };
    }
    if (selRect.top > Math.min(space.bottom, listRect.bottom) - 10 || selRect.bottom < Math.max(space.top, listRect.top) + 10)
      return null;
    return this.view.state.facet(completionConfig).positionInfo(this.view, listRect, selRect, infoRect, space, this.dom);
  }
  placeInfo(pos) {
    if (this.info) {
      if (pos) {
        if (pos.style)
          this.info.style.cssText = pos.style;
        this.info.className = "cm-tooltip cm-completionInfo " + (pos.class || "");
      } else {
        this.info.style.cssText = "top: -1e6px";
      }
    }
  }
  createListBox(options, id, range) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
    ul.addEventListener("mousedown", (e) => {
      if (e.target == ul)
        e.preventDefault();
    });
    let curSection = null;
    for (let i = range.from; i < range.to; i++) {
      let { completion, match } = options[i], { section } = completion;
      if (section) {
        let name = typeof section == "string" ? section : section.name;
        if (name != curSection && (i > range.from || range.from == 0)) {
          curSection = name;
          if (typeof section != "string" && section.header) {
            ul.appendChild(section.header(section));
          } else {
            let header = ul.appendChild(document.createElement("completion-section"));
            header.textContent = name;
          }
        }
      }
      const li = ul.appendChild(document.createElement("li"));
      li.id = id + "-" + i;
      li.setAttribute("role", "option");
      let cls = this.optionClass(completion);
      if (cls)
        li.className = cls;
      for (let source of this.optionContent) {
        let node = source(completion, this.view.state, this.view, match);
        if (node)
          li.appendChild(node);
      }
    }
    if (range.from)
      ul.classList.add("cm-completionListIncompleteTop");
    if (range.to < options.length)
      ul.classList.add("cm-completionListIncompleteBottom");
    return ul;
  }
  destroyInfo() {
    if (this.info) {
      if (this.infoDestroy)
        this.infoDestroy();
      this.info.remove();
      this.info = null;
    }
  }
  destroy() {
    this.destroyInfo();
  }
};
function completionTooltip(stateField, applyCompletion2) {
  return (view) => new CompletionTooltip(view, stateField, applyCompletion2);
}
function scrollIntoView(container, element) {
  let parent = container.getBoundingClientRect();
  let self = element.getBoundingClientRect();
  let scaleY = parent.height / container.offsetHeight;
  if (self.top < parent.top)
    container.scrollTop -= (parent.top - self.top) / scaleY;
  else if (self.bottom > parent.bottom)
    container.scrollTop += (self.bottom - parent.bottom) / scaleY;
}
function score(option) {
  return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
}
function sortOptions(active, state) {
  let options = [];
  let sections = null, dynamicSectionScore = null;
  let addOption = (option) => {
    options.push(option);
    let { section } = option.completion;
    if (section) {
      if (!sections)
        sections = [];
      let name = typeof section == "string" ? section : section.name;
      if (!sections.some((s) => s.name == name))
        sections.push(typeof section == "string" ? { name } : section);
    }
  };
  let conf = state.facet(completionConfig);
  for (let a of active)
    if (a.hasResult()) {
      let getMatch = a.result.getMatch;
      if (a.result.filter === false) {
        for (let option of a.result.options) {
          addOption(new Option(option, a.source, getMatch ? getMatch(option) : [], 1e9 - options.length));
        }
      } else {
        let pattern = state.sliceDoc(a.from, a.to), match;
        let matcher = conf.filterStrict ? new StrictMatcher(pattern) : new FuzzyMatcher(pattern);
        for (let option of a.result.options)
          if (match = matcher.match(option.label)) {
            let matched = !option.displayLabel ? match.matched : getMatch ? getMatch(option, match.matched) : [];
            let score2 = match.score + (option.boost || 0);
            addOption(new Option(option, a.source, matched, score2));
            if (typeof option.section == "object" && option.section.rank === "dynamic") {
              let { name } = option.section;
              if (!dynamicSectionScore)
                dynamicSectionScore = /* @__PURE__ */ Object.create(null);
              dynamicSectionScore[name] = Math.max(score2, dynamicSectionScore[name] || -1e9);
            }
          }
      }
    }
  if (sections) {
    let sectionOrder = /* @__PURE__ */ Object.create(null), pos = 0;
    let cmp = (a, b) => {
      return (a.rank === "dynamic" && b.rank === "dynamic" ? dynamicSectionScore[b.name] - dynamicSectionScore[a.name] : 0) || (typeof a.rank == "number" ? a.rank : 1e9) - (typeof b.rank == "number" ? b.rank : 1e9) || (a.name < b.name ? -1 : 1);
    };
    for (let s of sections.sort(cmp)) {
      pos -= 1e5;
      sectionOrder[s.name] = pos;
    }
    for (let option of options) {
      let { section } = option.completion;
      if (section)
        option.score += sectionOrder[typeof section == "string" ? section : section.name];
    }
  }
  let result = [], prev = null;
  let compare = conf.compareCompletions;
  for (let opt of options.sort((a, b) => b.score - a.score || compare(a.completion, b.completion))) {
    let cur2 = opt.completion;
    if (!prev || prev.label != cur2.label || prev.detail != cur2.detail || prev.type != null && cur2.type != null && prev.type != cur2.type || prev.apply != cur2.apply || prev.boost != cur2.boost)
      result.push(opt);
    else if (score(opt.completion) > score(prev))
      result[result.length - 1] = opt;
    prev = opt.completion;
  }
  return result;
}
var CompletionDialog = class {
  constructor(options, attrs, tooltip, timestamp, selected, disabled) {
    this.options = options;
    this.attrs = attrs;
    this.tooltip = tooltip;
    this.timestamp = timestamp;
    this.selected = selected;
    this.disabled = disabled;
  }
  setSelected(selected, id) {
    return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected, this.disabled);
  }
  static build(active, state, id, prev, conf, didSetActive) {
    if (prev && !didSetActive && active.some((s) => s.isPending))
      return prev.setDisabled();
    let options = sortOptions(active, state);
    if (!options.length)
      return prev && active.some((a) => a.isPending) ? prev.setDisabled() : null;
    let selected = state.facet(completionConfig).selectOnOpen ? 0 : -1;
    if (prev && prev.selected != selected && prev.selected != -1) {
      let selectedValue = prev.options[prev.selected].completion;
      for (let i = 0; i < options.length; i++)
        if (options[i].completion == selectedValue) {
          selected = i;
          break;
        }
    }
    return new CompletionDialog(options, makeAttrs(id, selected), {
      pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
      create: createTooltip,
      above: conf.aboveCursor
    }, prev ? prev.timestamp : Date.now(), selected, false);
  }
  map(changes) {
    return new CompletionDialog(this.options, this.attrs, { ...this.tooltip, pos: changes.mapPos(this.tooltip.pos) }, this.timestamp, this.selected, this.disabled);
  }
  setDisabled() {
    return new CompletionDialog(this.options, this.attrs, this.tooltip, this.timestamp, this.selected, true);
  }
};
var CompletionState = class {
  constructor(active, id, open) {
    this.active = active;
    this.id = id;
    this.open = open;
  }
  static start() {
    return new CompletionState(none, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(tr) {
    let { state } = tr, conf = state.facet(completionConfig);
    let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
    let active = sources.map((source) => {
      let value = this.active.find((s) => s.source == source) || new ActiveSource(
        source,
        this.active.some(
          (a) => a.state != 0
          /* State.Inactive */
        ) ? 1 : 0
        /* State.Inactive */
      );
      return value.update(tr, conf);
    });
    if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
      active = this.active;
    let open = this.open, didSet = tr.effects.some((e) => e.is(setActiveEffect));
    if (open && tr.docChanged)
      open = open.map(tr.changes);
    if (tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) || didSet)
      open = CompletionDialog.build(active, state, this.id, open, conf, didSet);
    else if (open && open.disabled && !active.some((a) => a.isPending))
      open = null;
    if (!open && active.every((a) => !a.isPending) && active.some((a) => a.hasResult()))
      active = active.map((a) => a.hasResult() ? new ActiveSource(
        a.source,
        0
        /* State.Inactive */
      ) : a);
    for (let effect of tr.effects)
      if (effect.is(setSelectedEffect))
        open = open && open.setSelected(effect.value, this.id);
    return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : this.active.length ? baseAttrs : noAttrs;
  }
};
function sameResults(a, b) {
  if (a == b)
    return true;
  for (let iA = 0, iB = 0; ; ) {
    while (iA < a.length && !a[iA].hasResult())
      iA++;
    while (iB < b.length && !b[iB].hasResult())
      iB++;
    let endA = iA == a.length, endB = iB == b.length;
    if (endA || endB)
      return endA == endB;
    if (a[iA++].result != b[iB++].result)
      return false;
  }
}
var baseAttrs = {
  "aria-autocomplete": "list"
};
var noAttrs = {};
function makeAttrs(id, selected) {
  let result = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": id
  };
  if (selected > -1)
    result["aria-activedescendant"] = id + "-" + selected;
  return result;
}
var none = [];
function getUpdateType(tr, conf) {
  if (tr.isUserEvent("input.complete")) {
    let completion = tr.annotation(pickedCompletion);
    if (completion && conf.activateOnCompletion(completion))
      return 4 | 8;
  }
  let typing = tr.isUserEvent("input.type");
  return typing && conf.activateOnTyping ? 4 | 1 : typing ? 1 : tr.isUserEvent("delete.backward") ? 2 : tr.selection ? 8 : tr.docChanged ? 16 : 0;
}
var ActiveSource = class {
  constructor(source, state, explicit = false) {
    this.source = source;
    this.state = state;
    this.explicit = explicit;
  }
  hasResult() {
    return false;
  }
  get isPending() {
    return this.state == 1;
  }
  update(tr, conf) {
    let type = getUpdateType(tr, conf), value = this;
    if (type & 8 || type & 16 && this.touches(tr))
      value = new ActiveSource(
        value.source,
        0
        /* State.Inactive */
      );
    if (type & 4 && value.state == 0)
      value = new ActiveSource(
        this.source,
        1
        /* State.Pending */
      );
    value = value.updateFor(tr, type);
    for (let effect of tr.effects) {
      if (effect.is(startCompletionEffect))
        value = new ActiveSource(value.source, 1, effect.value);
      else if (effect.is(closeCompletionEffect))
        value = new ActiveSource(
          value.source,
          0
          /* State.Inactive */
        );
      else if (effect.is(setActiveEffect)) {
        for (let active of effect.value)
          if (active.source == value.source)
            value = active;
      }
    }
    return value;
  }
  updateFor(tr, type) {
    return this.map(tr.changes);
  }
  map(changes) {
    return this;
  }
  touches(tr) {
    return tr.changes.touchesRange(cur(tr.state));
  }
};
var ActiveResult = class extends ActiveSource {
  constructor(source, explicit, limit, result, from, to) {
    super(source, 3, explicit);
    this.limit = limit;
    this.result = result;
    this.from = from;
    this.to = to;
  }
  hasResult() {
    return true;
  }
  updateFor(tr, type) {
    var _a;
    if (!(type & 3))
      return this.map(tr.changes);
    let result = this.result;
    if (result.map && !tr.changes.empty)
      result = result.map(result, tr.changes);
    let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
    let pos = cur(tr.state);
    if (pos > to || !result || type & 2 && (cur(tr.startState) == this.from || pos < this.limit))
      return new ActiveSource(
        this.source,
        type & 4 ? 1 : 0
        /* State.Inactive */
      );
    let limit = tr.changes.mapPos(this.limit);
    if (checkValid(result.validFor, tr.state, from, to))
      return new ActiveResult(this.source, this.explicit, limit, result, from, to);
    if (result.update && (result = result.update(result, from, to, new CompletionContext(tr.state, pos, false))))
      return new ActiveResult(this.source, this.explicit, limit, result, result.from, (_a = result.to) !== null && _a !== void 0 ? _a : cur(tr.state));
    return new ActiveSource(this.source, 1, this.explicit);
  }
  map(mapping) {
    if (mapping.empty)
      return this;
    let result = this.result.map ? this.result.map(this.result, mapping) : this.result;
    if (!result)
      return new ActiveSource(
        this.source,
        0
        /* State.Inactive */
      );
    return new ActiveResult(this.source, this.explicit, mapping.mapPos(this.limit), this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
  }
  touches(tr) {
    return tr.changes.touchesRange(this.from, this.to);
  }
};
function checkValid(validFor, state, from, to) {
  if (!validFor)
    return false;
  let text = state.sliceDoc(from, to);
  return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
}
var setActiveEffect = /* @__PURE__ */ import_state.StateEffect.define({
  map(sources, mapping) {
    return sources.map((s) => s.map(mapping));
  }
});
var completionState = /* @__PURE__ */ import_state.StateField.define({
  create() {
    return CompletionState.start();
  },
  update(value, tr) {
    return value.update(tr);
  },
  provide: (f) => [
    import_view.showTooltip.from(f, (val) => val.tooltip),
    import_view.EditorView.contentAttributes.from(f, (state) => state.attrs)
  ]
});
function applyCompletion(view, option) {
  const apply = option.completion.apply || option.completion.label;
  let result = view.state.field(completionState).active.find((a) => a.source == option.source);
  if (!(result instanceof ActiveResult))
    return false;
  if (typeof apply == "string")
    view.dispatch({
      ...insertCompletionText(view.state, apply, result.from, result.to),
      annotations: pickedCompletion.of(option.completion)
    });
  else
    apply(view, option.completion, result.from, result.to);
  return true;
}
var createTooltip = /* @__PURE__ */ completionTooltip(completionState, applyCompletion);
function moveCompletionSelection(forward, by = "option") {
  return (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || cState.open.disabled || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
      return false;
    let step = 1, tooltip;
    if (by == "page" && (tooltip = (0, import_view.getTooltip)(view, cState.open.tooltip)))
      step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
    let { length } = cState.open.options;
    let selected = cState.open.selected > -1 ? cState.open.selected + step * (forward ? 1 : -1) : forward ? 0 : length - 1;
    if (selected < 0)
      selected = by == "page" ? 0 : length - 1;
    else if (selected >= length)
      selected = by == "page" ? length - 1 : 0;
    view.dispatch({ effects: setSelectedEffect.of(selected) });
    return true;
  };
}
var acceptCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (view.state.readOnly || !cState || !cState.open || cState.open.selected < 0 || cState.open.disabled || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
    return false;
  return applyCompletion(view, cState.open.options[cState.open.selected]);
};
var startCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState)
    return false;
  view.dispatch({ effects: startCompletionEffect.of(true) });
  return true;
};
var closeCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState || !cState.active.some(
    (a) => a.state != 0
    /* State.Inactive */
  ))
    return false;
  view.dispatch({ effects: closeCompletionEffect.of(null) });
  return true;
};
var RunningQuery = class {
  constructor(active, context) {
    this.active = active;
    this.context = context;
    this.time = Date.now();
    this.updates = [];
    this.done = void 0;
  }
};
var MaxUpdateCount = 50;
var MinAbortTime = 1e3;
var completionPlugin = /* @__PURE__ */ import_view.ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.debounceUpdate = -1;
    this.running = [];
    this.debounceAccept = -1;
    this.pendingStart = false;
    this.composing = 0;
    for (let active of view.state.field(completionState).active)
      if (active.isPending)
        this.startQuery(active);
  }
  update(update) {
    let cState = update.state.field(completionState);
    let conf = update.state.facet(completionConfig);
    if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
      return;
    let doesReset = update.transactions.some((tr) => {
      let type = getUpdateType(tr, conf);
      return type & 8 || (tr.selection || tr.docChanged) && !(type & 3);
    });
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (doesReset || query.context.abortOnDocChange && update.docChanged || query.updates.length + update.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
        for (let handler of query.context.abortListeners) {
          try {
            handler();
          } catch (e) {
            (0, import_view.logException)(this.view.state, e);
          }
        }
        query.context.abortListeners = null;
        this.running.splice(i--, 1);
      } else {
        query.updates.push(...update.transactions);
      }
    }
    if (this.debounceUpdate > -1)
      clearTimeout(this.debounceUpdate);
    if (update.transactions.some((tr) => tr.effects.some((e) => e.is(startCompletionEffect))))
      this.pendingStart = true;
    let delay = this.pendingStart ? 50 : conf.activateOnTypingDelay;
    this.debounceUpdate = cState.active.some((a) => a.isPending && !this.running.some((q) => q.active.source == a.source)) ? setTimeout(() => this.startUpdate(), delay) : -1;
    if (this.composing != 0)
      for (let tr of update.transactions) {
        if (tr.isUserEvent("input.type"))
          this.composing = 2;
        else if (this.composing == 2 && tr.selection)
          this.composing = 3;
      }
  }
  startUpdate() {
    this.debounceUpdate = -1;
    this.pendingStart = false;
    let { state } = this.view, cState = state.field(completionState);
    for (let active of cState.active) {
      if (active.isPending && !this.running.some((r) => r.active.source == active.source))
        this.startQuery(active);
    }
    if (this.running.length && cState.open && cState.open.disabled)
      this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
  }
  startQuery(active) {
    let { state } = this.view, pos = cur(state);
    let context = new CompletionContext(state, pos, active.explicit, this.view);
    let pending = new RunningQuery(active, context);
    this.running.push(pending);
    Promise.resolve(active.source(context)).then((result) => {
      if (!pending.context.aborted) {
        pending.done = result || null;
        this.scheduleAccept();
      }
    }, (err) => {
      this.view.dispatch({ effects: closeCompletionEffect.of(null) });
      (0, import_view.logException)(this.view.state, err);
    });
  }
  scheduleAccept() {
    if (this.running.every((q) => q.done !== void 0))
      this.accept();
    else if (this.debounceAccept < 0)
      this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var _a;
    if (this.debounceAccept > -1)
      clearTimeout(this.debounceAccept);
    this.debounceAccept = -1;
    let updated = [];
    let conf = this.view.state.facet(completionConfig), cState = this.view.state.field(completionState);
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (query.done === void 0)
        continue;
      this.running.splice(i--, 1);
      if (query.done) {
        let pos = cur(query.updates.length ? query.updates[0].startState : this.view.state);
        let limit = Math.min(pos, query.done.from + (query.active.explicit ? 0 : 1));
        let active = new ActiveResult(query.active.source, query.active.explicit, limit, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : pos);
        for (let tr of query.updates)
          active = active.update(tr, conf);
        if (active.hasResult()) {
          updated.push(active);
          continue;
        }
      }
      let current = cState.active.find((a) => a.source == query.active.source);
      if (current && current.isPending) {
        if (query.done == null) {
          let active = new ActiveSource(
            query.active.source,
            0
            /* State.Inactive */
          );
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (!active.isPending)
            updated.push(active);
        } else {
          this.startQuery(current);
        }
      }
    }
    if (updated.length || cState.open && cState.open.disabled)
      this.view.dispatch({ effects: setActiveEffect.of(updated) });
  }
}, {
  eventHandlers: {
    blur(event) {
      let state = this.view.state.field(completionState, false);
      if (state && state.tooltip && this.view.state.facet(completionConfig).closeOnBlur) {
        let dialog = state.open && (0, import_view.getTooltip)(this.view, state.open.tooltip);
        if (!dialog || !dialog.dom.contains(event.relatedTarget))
          setTimeout(() => this.view.dispatch({ effects: closeCompletionEffect.of(null) }), 10);
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      if (this.composing == 3) {
        setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
      }
      this.composing = 0;
    }
  }
});
var windows = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform);
var commitCharacters = /* @__PURE__ */ import_state.Prec.highest(/* @__PURE__ */ import_view.EditorView.domEventHandlers({
  keydown(event, view) {
    let field = view.state.field(completionState, false);
    if (!field || !field.open || field.open.disabled || field.open.selected < 0 || event.key.length > 1 || event.ctrlKey && !(windows && event.altKey) || event.metaKey)
      return false;
    let option = field.open.options[field.open.selected];
    let result = field.active.find((a) => a.source == option.source);
    let commitChars = option.completion.commitCharacters || result.result.commitCharacters;
    if (commitChars && commitChars.indexOf(event.key) > -1)
      applyCompletion(view, option);
    return false;
  }
}));
var baseTheme = /* @__PURE__ */ import_view.EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"\xB7\xB7\xB7"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: `${400}px`,
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: `${30}px` },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: `${30}px` },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'\u0192'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'\u25CB'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'\u25CC'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'\u{1D465}'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'\u{1D436}'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'\u{1D461}'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'\u222A'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'\u25A1'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'\u{1F511}\uFE0E'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'\u25A2'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
var closedBracket = /* @__PURE__ */ new class extends import_state.RangeValue {
}();
closedBracket.startSide = 1;
closedBracket.endSide = -1;
var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
function autocompletion(config = {}) {
  return [
    commitCharacters,
    completionState,
    completionConfig.of(config),
    completionPlugin,
    completionKeymapExt,
    baseTheme
  ];
}
var completionKeymap = [
  { key: "Ctrl-Space", run: startCompletion },
  { mac: "Alt-`", run: startCompletion },
  { mac: "Alt-i", run: startCompletion },
  { key: "Escape", run: closeCompletion },
  { key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true) },
  { key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false) },
  { key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page") },
  { key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page") },
  { key: "Enter", run: acceptCompletion }
];
var completionKeymapExt = /* @__PURE__ */ import_state.Prec.highest(/* @__PURE__ */ import_view.keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

// src/mention-extension.ts
function createMentionExtension(personManager, settings) {
  return autocompletion({
    override: [
      (context) => {
        return mentionCompletionSource(context, personManager, settings);
      }
    ],
    defaultKeymap: true
  });
}
function mentionCompletionSource(context, personManager, settings) {
  const trigger = settings.triggerChar || "@";
  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text;
  const cursorInLine = context.pos - line.from;
  let triggerPos = -1;
  for (let i = cursorInLine - 1; i >= 0; i--) {
    if (lineText[i] === trigger) {
      if (i === 0 || /[\s\(\[\{,;:!?]/.test(lineText[i - 1])) {
        triggerPos = i;
      }
      break;
    }
    if (/\s/.test(lineText[i])) {
      break;
    }
  }
  if (triggerPos === -1) {
    return null;
  }
  const query = lineText.slice(triggerPos + 1, cursorInLine);
  const from = line.from + triggerPos;
  if (triggerPos > 0 && /[a-zA-Z0-9._-]/.test(lineText[triggerPos - 1])) {
    return null;
  }
  const people = query ? personManager.fuzzyMatch(query) : personManager.getAllPeople();
  if (people.length === 0 && !settings.autoCreatePerson) {
    return null;
  }
  const options = people.map((person) => ({
    label: `${trigger}${person.name}`,
    detail: person.organization || person.relationshipType || "",
    info: person.role || void 0,
    type: "text",
    apply: (view, completion, from2, to) => {
      const peoplePath = settings.peopleFolder.replace(/\/$/, "");
      const wikilink = `[[${peoplePath}/${person.name}|${trigger}${person.name}]]`;
      view.dispatch({
        changes: { from: from2, to, insert: wikilink },
        annotations: pickedCompletion.of(completion)
      });
    }
  }));
  if (settings.autoCreatePerson && query && query.length > 0) {
    const exists = people.some((p) => p.name.toLowerCase() === query.toLowerCase());
    if (!exists) {
      options.push({
        label: `${trigger}${query} (new)`,
        detail: "Create new person note",
        type: "text",
        boost: -1,
        apply: (view, completion, from2, to) => {
          const peoplePath = settings.peopleFolder.replace(/\/$/, "");
          const name = query.charAt(0).toUpperCase() + query.slice(1);
          const wikilink = `[[${peoplePath}/${name}|${trigger}${name}]]`;
          view.dispatch({
            changes: { from: from2, to, insert: wikilink },
            annotations: pickedCompletion.of(completion)
          });
          personManager.createPersonNote(name);
        }
      });
    }
  }
  return {
    from,
    options,
    filter: false
  };
}

// src/followup-engine.ts
var import_obsidian8 = require("obsidian");
var CHECK_INTERVAL_MS = 60 * 60 * 1e3;
var FollowUpEngine = class {
  constructor(personManager) {
    this.intervalId = null;
    this.firedToday = /* @__PURE__ */ new Set();
    this.lastFiredDate = "";
    this.personManager = personManager;
  }
  start() {
    this.check();
    this.intervalId = window.setInterval(() => this.check(), CHECK_INTERVAL_MS);
  }
  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  check() {
    const today = new Date().toISOString().split("T")[0];
    if (today !== this.lastFiredDate) {
      this.firedToday.clear();
      this.lastFiredDate = today;
    }
    const overdue = this.personManager.getOverdueFollowUps();
    const dueToday = this.personManager.getDueToday();
    for (const person of dueToday) {
      const key = `today:${person.file.path}`;
      if (!this.firedToday.has(key)) {
        this.firedToday.add(key);
        this.showFollowUpNotice(person, false);
      }
    }
    if (overdue.length > 0) {
      const overdueKey = `overdue:${today}`;
      if (!this.firedToday.has(overdueKey)) {
        this.firedToday.add(overdueKey);
        this.showOverdueSummary(overdue);
      }
    }
  }
  showFollowUpNotice(person, isOverdue) {
    const prefix = isOverdue ? "Overdue" : "Follow-up due today";
    const msg = `${prefix}: ${person.name}`;
    if (person.organization) {
      new import_obsidian8.Notice(`${msg} (${person.organization})`, 8e3);
    } else {
      new import_obsidian8.Notice(msg, 8e3);
    }
  }
  showOverdueSummary(overdue) {
    if (overdue.length === 1) {
      this.showFollowUpNotice(overdue[0], true);
    } else {
      const names = overdue.slice(0, 3).map((p) => p.name).join(", ");
      const extra = overdue.length > 3 ? ` +${overdue.length - 3} more` : "";
      new import_obsidian8.Notice(`${overdue.length} overdue follow-ups: ${names}${extra}`, 1e4);
    }
  }
  // Force a check (e.g., after vault opens or settings change)
  forceCheck() {
    this.check();
  }
};

// src/ai-enrichment.ts
var import_obsidian9 = require("obsidian");
var MAX_INTERACTION_LINES = 20;
function extractInteractionHistory(content) {
  const logStart = content.indexOf("## Interaction Log");
  if (logStart === -1)
    return "";
  const section = content.slice(logStart + "## Interaction Log".length);
  const lines = section.split("\n").filter((l) => l.trim().startsWith("- ")).slice(0, MAX_INTERACTION_LINES);
  return lines.join("\n");
}
async function callAnthropic(apiKey, prompt) {
  var _a, _b, _c;
  const response = await (0, import_obsidian9.requestUrl)({
    url: "https://api.anthropic.com/v1/messages",
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (response.status !== 200) {
    throw new Error(`Anthropic API error ${response.status}: ${response.text}`);
  }
  const data = response.json;
  return (_c = (_b = (_a = data.content) == null ? void 0 : _a[0]) == null ? void 0 : _b.text) != null ? _c : "";
}
async function callOpenAI(apiKey, model, prompt) {
  var _a, _b, _c, _d;
  const response = await (0, import_obsidian9.requestUrl)({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (response.status !== 200) {
    throw new Error(`OpenAI API error ${response.status}: ${response.text}`);
  }
  const data = response.json;
  return (_d = (_c = (_b = (_a = data.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) != null ? _d : "";
}
async function parseAISuggestion(raw) {
  var _a, _b, _c, _d, _e;
  const jsonMatch = (_a = raw.match(/```json\n?([\s\S]+?)\n?```/)) != null ? _a : raw.match(/\{[\s\S]*"action"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse((_b = jsonMatch[1]) != null ? _b : jsonMatch[0]);
      return {
        action: (_c = parsed.action) != null ? _c : raw,
        reasoning: (_d = parsed.reasoning) != null ? _d : "",
        suggestedMessage: (_e = parsed.suggested_message) != null ? _e : parsed.suggestedMessage
      };
    } catch (e) {
    }
  }
  return { action: raw.trim(), reasoning: "" };
}
async function getSuggestedFollowUp(person, personContent, settings) {
  const hasAnthropic = settings.aiProvider === "anthropic" && settings.anthropicApiKey;
  const hasOpenAI = settings.aiProvider === "openai" && settings.openaiApiKey;
  if (!hasAnthropic && !hasOpenAI) {
    throw new Error("No AI API key configured. Add one in Settings > Arcadia Connect > AI Enrichment.");
  }
  const history = extractInteractionHistory(personContent);
  const contextLines = [
    `Contact: ${person.name}`,
    person.organization ? `Organization: ${person.organization}` : "",
    person.role ? `Role: ${person.role}` : "",
    person.dealStage ? `Deal stage: ${person.dealStage}` : "",
    person.dealValue ? `Deal value: $${person.dealValue}` : "",
    person.lastContact ? `Last contact: ${person.lastContact}` : "",
    person.nextFollowUp ? `Scheduled follow-up: ${person.nextFollowUp}` : ""
  ].filter(Boolean);
  const prompt = `You are a CRM assistant. Based on this contact's profile and interaction history, suggest one specific, actionable follow-up action.

Contact profile:
${contextLines.join("\n")}

Recent interactions:
${history || "(No interactions logged yet)"}

Respond in this JSON format:
\`\`\`json
{
  "action": "Specific action to take (1-2 sentences)",
  "reasoning": "Why this action makes sense given the history",
  "suggested_message": "Optional: a short draft message or talking point"
}
\`\`\`

Keep the action concrete and immediate. Reference specific details from the history where possible.`;
  let raw;
  if (hasAnthropic) {
    raw = await callAnthropic(settings.anthropicApiKey, prompt);
  } else {
    raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
  }
  return parseAISuggestion(raw);
}
var AISuggestionModal = class extends import_obsidian9.Modal {
  constructor(app, person, personManager, settings) {
    super(app);
    this.person = person;
    this.personManager = personManager;
    this.settings = settings;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("arcadia-ai-modal");
    contentEl.createEl("h3", { text: `AI Suggestion: ${this.person.name}` });
    const loadingEl = contentEl.createDiv({ cls: "arcadia-ai-loading", text: "Analyzing interaction history..." });
    try {
      const content = await this.app.vault.read(this.person.file);
      const suggestion = await getSuggestedFollowUp(this.person, content, this.settings);
      loadingEl.remove();
      const actionEl = contentEl.createDiv({ cls: "arcadia-ai-action" });
      actionEl.createDiv({ cls: "arcadia-ai-label", text: "Suggested action" });
      actionEl.createDiv({ cls: "arcadia-ai-value", text: suggestion.action });
      if (suggestion.reasoning) {
        const reasonEl = contentEl.createDiv({ cls: "arcadia-ai-reasoning" });
        reasonEl.createDiv({ cls: "arcadia-ai-label", text: "Reasoning" });
        reasonEl.createDiv({ cls: "arcadia-ai-value mod-muted", text: suggestion.reasoning });
      }
      if (suggestion.suggestedMessage) {
        const msgEl = contentEl.createDiv({ cls: "arcadia-ai-message" });
        msgEl.createDiv({ cls: "arcadia-ai-label", text: "Draft message" });
        const msgText = msgEl.createEl("textarea", {
          cls: "arcadia-ai-draft",
          attr: { rows: "4" }
        });
        msgText.value = suggestion.suggestedMessage;
      }
      const buttons = contentEl.createDiv({ cls: "arcadia-ai-buttons" });
      const appendBtn = buttons.createEl("button", {
        text: "Append to note",
        cls: "mod-cta"
      });
      appendBtn.addEventListener("click", async () => {
        const noteContent = await this.app.vault.read(this.person.file);
        const today = new Date().toISOString().split("T")[0];
        const entry = `
---
**AI Suggestion** (${today})
${suggestion.action}${suggestion.suggestedMessage ? "\n\n*Draft:* " + suggestion.suggestedMessage : ""}
`;
        await this.app.vault.modify(this.person.file, noteContent + entry);
        new import_obsidian9.Notice("Suggestion appended to note.");
        this.close();
      });
      const closeBtn = buttons.createEl("button", { text: "Dismiss" });
      closeBtn.addEventListener("click", () => this.close());
    } catch (err) {
      loadingEl.remove();
      const errEl = contentEl.createDiv({ cls: "arcadia-ai-error" });
      errEl.textContent = err instanceof Error ? err.message : "Unknown error.";
      contentEl.createEl("button", { text: "Close" }).addEventListener("click", () => this.close());
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/main.ts
var ArcadiaConnectPlugin = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.personManager = new PersonManager(this.app, this.settings.peopleFolder);
    this.mentionScanner = new MentionScanner(this.app, this.settings.peopleFolder);
    this.profileCard = new ProfileCard(this.app);
    this.followUpEngine = new FollowUpEngine(this.personManager);
    this.mentionPostProcessor = new MentionPostProcessor(
      this.app,
      this.personManager,
      this.settings,
      this.profileCard
    );
    this.addSettingTab(new ArcadiaConnectSettingTab(this.app, this));
    this.registerView(VIEW_TYPE_PEOPLE, (leaf) => {
      return new PeopleView(
        leaf,
        this.personManager,
        this.mentionScanner,
        this.profileCard
      );
    });
    this.registerView(VIEW_TYPE_TIMELINE, (leaf) => {
      return new TimelineView(leaf, this.personManager);
    });
    this.registerView(VIEW_TYPE_PIPELINE, (leaf) => {
      return new PipelineView(leaf, this.personManager);
    });
    this.registerEditorExtension(
      createMentionExtension(this.personManager, this.settings)
    );
    this.registerMarkdownPostProcessor(
      this.mentionPostProcessor.getProcessor()
    );
    this.addRibbonIcon("users", "People Panel", () => this.activatePeopleView());
    this.addRibbonIcon("history", "Interaction Timeline", () => this.activateView(VIEW_TYPE_TIMELINE));
    this.addRibbonIcon("kanban-square", "Deal Pipeline", () => this.activateView(VIEW_TYPE_PIPELINE));
    this.addCommand({
      id: "open-people-panel",
      name: "Open People Panel",
      callback: () => {
        this.activatePeopleView();
      }
    });
    this.addCommand({
      id: "create-person-note",
      name: "Create Person Note",
      callback: async () => {
        await this.createPersonNoteCommand();
      }
    });
    this.addCommand({
      id: "mention-person",
      name: "Mention Person",
      editorCallback: (editor) => {
        editor.replaceSelection(this.settings.triggerChar || "@");
      }
    });
    this.addCommand({
      id: "open-timeline",
      name: "Open Interaction Timeline",
      callback: () => this.activateView(VIEW_TYPE_TIMELINE)
    });
    this.addCommand({
      id: "open-pipeline",
      name: "Open Deal Pipeline",
      callback: () => this.activateView(VIEW_TYPE_PIPELINE)
    });
    this.addCommand({
      id: "log-interaction",
      name: "Log Interaction",
      callback: () => {
        new InteractionLoggerModal(this.app, this.personManager, null, () => {
          this.refreshPeopleView();
        }).open();
      }
    });
    this.addCommand({
      id: "ai-suggest-followup",
      name: "AI: Suggest Follow-up for Active Contact",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file)
          return false;
        const person = this.personManager.getAllPeople().find((p) => p.file.path === file.path);
        if (!person)
          return false;
        if (!checking) {
          new AISuggestionModal(this.app, person, this.personManager, this.settings).open();
        }
        return true;
      }
    });
    this.app.workspace.onLayoutReady(async () => {
      await this.personManager.initialize();
      await this.mentionScanner.buildIndex();
      this.followUpEngine.start();
    });
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (this.personManager.isInPeopleFolder(file)) {
          this.personManager.updatePerson(file);
        }
        this.mentionScanner.onFileChange(file);
        this.refreshPeopleView();
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (file instanceof import_obsidian10.TFile) {
          if (this.personManager.isInPeopleFolder(file)) {
            this.personManager.removePerson(file);
          }
          this.mentionScanner.onFileDelete(file);
          this.refreshPeopleView();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof import_obsidian10.TFile && this.personManager.isInPeopleFolder(file)) {
          setTimeout(() => {
            this.personManager.updatePerson(file);
            this.refreshPeopleView();
          }, 500);
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian10.TFile) {
          setTimeout(() => {
            this.personManager.scanPeopleFolder();
            this.mentionScanner.buildIndex();
            this.refreshPeopleView();
          }, 500);
        }
      })
    );
  }
  async onunload() {
    this.followUpEngine.stop();
    this.profileCard.destroy();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.personManager.setPeopleFolder(this.settings.peopleFolder);
    this.mentionScanner.setPeopleFolder(this.settings.peopleFolder);
    await this.personManager.scanPeopleFolder();
    await this.mentionScanner.buildIndex();
    this.refreshPeopleView();
  }
  async activatePeopleView() {
    return this.activateView(VIEW_TYPE_PEOPLE);
  }
  async activateView(viewType) {
    const existing = this.app.workspace.getLeavesOfType(viewType);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: viewType, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }
  refreshPeopleView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PEOPLE);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof PeopleView) {
        view.renderList();
      }
    }
  }
  async createPersonNoteCommand() {
    const name = await this.promptForName();
    if (!name)
      return;
    const file = await this.personManager.createPersonNote(name);
    await this.app.workspace.openLinkText(file.path, "", false);
  }
  promptForName() {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.className = "arcadia-connect-name-modal";
      const overlay = document.createElement("div");
      overlay.className = "arcadia-connect-modal-overlay";
      const content = document.createElement("div");
      content.className = "arcadia-connect-modal-content";
      const label = document.createElement("label");
      label.textContent = "Person name:";
      content.appendChild(label);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "arcadia-connect-modal-input";
      input.placeholder = "Full Name";
      content.appendChild(input);
      const buttons = document.createElement("div");
      buttons.className = "arcadia-connect-modal-buttons";
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => {
        modal.remove();
        resolve(null);
      });
      buttons.appendChild(cancelBtn);
      const createBtn = document.createElement("button");
      createBtn.textContent = "Create";
      createBtn.className = "mod-cta";
      createBtn.addEventListener("click", () => {
        const value = input.value.trim();
        modal.remove();
        resolve(value || null);
      });
      buttons.appendChild(createBtn);
      content.appendChild(buttons);
      modal.appendChild(overlay);
      modal.appendChild(content);
      document.body.appendChild(modal);
      overlay.addEventListener("click", () => {
        modal.remove();
        resolve(null);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const value = input.value.trim();
          modal.remove();
          resolve(value || null);
        }
        if (e.key === "Escape") {
          modal.remove();
          resolve(null);
        }
      });
      input.focus();
    });
  }
};
