import { App, PluginSettingTab, Setting } from 'obsidian';
import type ArcadiaConnectPlugin from './main';
import { ArcadiaConnectSettings } from './types';

export class ArcadiaConnectSettingTab extends PluginSettingTab {
	plugin: ArcadiaConnectPlugin;

	constructor(app: App, plugin: ArcadiaConnectPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Arcadia Connect Settings' });

		new Setting(containerEl)
			.setName('People folder')
			.setDesc('Folder where person notes are stored (relative to vault root).')
			.addText(text => text
				.setPlaceholder('People/')
				.setValue(this.plugin.settings.peopleFolder)
				.onChange(async (value) => {
					this.plugin.settings.peopleFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Trigger character')
			.setDesc('Character that triggers the @-mention autocomplete.')
			.addText(text => text
				.setPlaceholder('@')
				.setValue(this.plugin.settings.triggerChar)
				.onChange(async (value) => {
					this.plugin.settings.triggerChar = value || '@';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show hover card')
			.setDesc('Show a mini profile card when hovering over @-mentions.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showHoverCard)
				.onChange(async (value) => {
					this.plugin.settings.showHoverCard = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-create person note')
			.setDesc('Automatically create a person note when mentioning someone new.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoCreatePerson)
				.onChange(async (value) => {
					this.plugin.settings.autoCreatePerson = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'License' });

		new Setting(containerEl)
			.setName('License key')
			.setDesc('Enter your Arcadia Connect Pro license key.')
			.addText(text => text
				.setPlaceholder('Enter license key')
				.setValue(this.plugin.settings.licenseKey)
				.onChange(async (value) => {
					this.plugin.settings.licenseKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
