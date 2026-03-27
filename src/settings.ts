import { App, PluginSettingTab, Setting } from 'obsidian';
import type ArcadiaConnectPlugin from './main';
import { ArcadiaConnectSettings } from './types';
import { validateLicense, isCacheValid } from './license';

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

		const licenseStatus = this.plugin.settings.licenseStatus;
		const isPro = this.plugin.settings.isPro && licenseStatus?.valid;
		const statusDesc = isPro
			? `Active${licenseStatus?.customerEmail ? ` (${licenseStatus.customerEmail})` : ''}${licenseStatus?.expiresAt ? ` - expires ${licenseStatus.expiresAt}` : ''}`
			: 'No active license. Enter your license key and click Validate.';

		const licenseStatusEl = containerEl.createEl('p', {
			text: `License status: ${statusDesc}`,
			cls: isPro ? 'mod-success' : 'mod-warning',
		});

		let keyInputEl: HTMLInputElement | null = null;

		new Setting(containerEl)
			.setName('License key')
			.setDesc('Enter your Arcadia Connect Premium license key from Lemon Squeezy.')
			.addText(text => {
				keyInputEl = text.inputEl;
				text
					.setPlaceholder('XXXX-XXXX-XXXX-XXXX')
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
						licenseStatusEl.textContent = `License status: Active${status.customerEmail ? ` (${status.customerEmail})` : ''}`;
						licenseStatusEl.className = 'mod-success';
					} else {
						licenseStatusEl.textContent = 'License status: Invalid or expired. Check your key and try again.';
						licenseStatusEl.className = 'mod-warning';
					}
				})
			);

		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText('Get Arcadia Connect Premium')
				.onClick(() => {
					window.open('https://arcadia-studio.lemonsqueezy.com', '_blank');
				})
			);
	}
}
