import { App, PluginSettingTab, Setting } from 'obsidian';
import type ArcadiaConnectPlugin from './main';
import { ArcadiaConnectSettings } from './types';
import { validateLicense } from './license';

export class ArcadiaConnectSettingTab extends PluginSettingTab {
	plugin: ArcadiaConnectPlugin;

	constructor(app: App, plugin: ArcadiaConnectPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

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

		new Setting(containerEl).setName('License').setHeading();

		const licenseStatus = this.plugin.settings.licenseStatus;
		const isPro = this.plugin.settings.isPro && licenseStatus?.valid;
		const statusDesc = isPro
			? `active${licenseStatus?.customerEmail ? ` (${licenseStatus.customerEmail})` : ''}${licenseStatus?.expiresAt ? ` - expires ${licenseStatus.expiresAt}` : ''}`
			: 'No active license. Enter your license key and click validate.';

		const licenseStatusEl = containerEl.createEl('p', {
			text: `License status: ${statusDesc}`,
			cls: isPro ? 'mod-success' : 'mod-warning',
		});

		new Setting(containerEl)
			.setName('License key')
			.setDesc('Enter your license key to activate premium features.')
			.addText(text => {
				text
					.setPlaceholder('Xxxx-xxxx-xxxx-xxxx')
					.setValue(this.plugin.settings.licenseKey)
					.onChange(async (value) => {
						this.plugin.settings.licenseKey = value.trim();
						await this.plugin.saveSettings();
					});
			})
			.addButton(btn => btn
				.setButtonText('Validate')
				.setCta()
				.onClick(async () => {
					const key = this.plugin.settings.licenseKey.trim();
					if (!key) return;
					btn.setButtonText('Checking...').setDisabled(true);
					const status = await validateLicense(key);
					this.plugin.settings.licenseStatus = status;
					this.plugin.settings.isPro = status.valid;
					await this.plugin.saveSettings();
					btn.setButtonText('Validate').setDisabled(false);
					if (status.valid) {
						licenseStatusEl.textContent = `License status: active${status.customerEmail ? ` (${status.customerEmail})` : ''}`;
						licenseStatusEl.className = 'mod-success';
					} else {
						licenseStatusEl.textContent = 'License status: invalid or expired. Check your key and try again.';
						licenseStatusEl.className = 'mod-warning';
					}
				})
			);

		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText('Get premium')
				.onClick(() => {
					window.open('https://arcadia-studio.lemonsqueezy.com', '_blank');
				})
			);

		// ----- AI Enrichment -----
		new Setting(containerEl).setName('AI enrichment').setHeading();
		containerEl.createEl('p', {
			text: 'Bring your own API key to unlock AI-powered follow-up suggestions. Keys are stored locally in your vault settings and never sent to our servers.',
			cls: 'setting-item-description',
		});

		new Setting(containerEl)
			.setName('AI provider')
			.addDropdown(dd => dd
				.addOption('anthropic', 'anthropic')
				.addOption('openai', 'openai')
				.setValue(this.plugin.settings.aiProvider)
				.onChange(async (value) => {
					this.plugin.settings.aiProvider = value as ArcadiaConnectSettings['aiProvider'];
					await this.plugin.saveSettings();
					this.display(); // re-render to show/hide relevant key field
				})
			);

		if (this.plugin.settings.aiProvider === 'anthropic') {
			new Setting(containerEl)
				.setName('API key')
				.setDesc('Your anthropic API key')
				.addText(text => text
					.setPlaceholder('Sk-ant-...')
					.setValue(this.plugin.settings.anthropicApiKey)
					.onChange(async (value) => {
						this.plugin.settings.anthropicApiKey = value.trim();
						await this.plugin.saveSettings();
					})
				);
		} else {
			new Setting(containerEl)
				.setName('API key')
				.setDesc('Your openAI API key')
				.addText(text => text
					.setPlaceholder('Sk-...')
					.setValue(this.plugin.settings.openaiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openaiApiKey = value.trim();
						await this.plugin.saveSettings();
					})
				);

			new Setting(containerEl)
				.setName('Model')
				.addDropdown(dd => dd
					.addOption('gpt-4o-mini', 'Gpt-4o-mini (fast, cheap)')
					.addOption('gpt-4o', 'Gpt-4o (best quality)')
					.addOption('gpt-4-turbo', 'Gpt-4-turbo')
					.setValue(this.plugin.settings.openaiModel)
					.onChange(async (value) => {
						this.plugin.settings.openaiModel = value;
						await this.plugin.saveSettings();
					})
				);
		}
	}
}

