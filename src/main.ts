import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { ArcadiaConnectSettings, DEFAULT_SETTINGS, VIEW_TYPE_PEOPLE } from './types';
import { ArcadiaConnectSettingTab } from './settings';
import { PersonManager } from './person-manager';
import { MentionScanner } from './mention-scanner';
import { MentionPostProcessor } from './mention-postprocessor';
import { ProfileCard } from './profile-card';
import { PeopleView } from './people-view';
import { createMentionExtension } from './mention-extension';

export default class ArcadiaConnectPlugin extends Plugin {
	settings: ArcadiaConnectSettings = DEFAULT_SETTINGS;
	personManager!: PersonManager;
	mentionScanner!: MentionScanner;
	profileCard!: ProfileCard;
	private mentionPostProcessor!: MentionPostProcessor;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Initialize core services
		this.personManager = new PersonManager(this.app, this.settings.peopleFolder);
		this.mentionScanner = new MentionScanner(this.app, this.settings.peopleFolder);
		this.profileCard = new ProfileCard(this.app);
		this.mentionPostProcessor = new MentionPostProcessor(
			this.app,
			this.personManager,
			this.settings,
			this.profileCard
		);

		// Register settings tab
		this.addSettingTab(new ArcadiaConnectSettingTab(this.app, this));

		// Register the People sidebar view
		this.registerView(VIEW_TYPE_PEOPLE, (leaf: WorkspaceLeaf) => {
			return new PeopleView(
				leaf,
				this.personManager,
				this.mentionScanner,
				this.profileCard
			);
		});

		// Register CM6 editor extension for @-mention autocomplete
		this.registerEditorExtension(
			createMentionExtension(this.personManager, this.settings)
		);

		// Register markdown post-processor for reading view
		this.registerMarkdownPostProcessor(
			this.mentionPostProcessor.getProcessor()
		);

		// Add ribbon icon
		this.addRibbonIcon('users', 'Open People Panel', () => {
			this.activatePeopleView();
		});

		// Add commands
		this.addCommand({
			id: 'open-people-panel',
			name: 'Open People Panel',
			callback: () => {
				this.activatePeopleView();
			},
		});

		this.addCommand({
			id: 'create-person-note',
			name: 'Create Person Note',
			callback: async () => {
				await this.createPersonNoteCommand();
			},
		});

		this.addCommand({
			id: 'mention-person',
			name: 'Mention Person',
			editorCallback: (editor) => {
				// Insert @ trigger to activate autocomplete
				editor.replaceSelection(this.settings.triggerChar || '@');
			},
		});

		// Initialize after layout is ready
		this.app.workspace.onLayoutReady(async () => {
			await this.personManager.initialize();
			await this.mentionScanner.buildIndex();
		});

		// Watch for file changes to keep index updated
		this.registerEvent(
			this.app.metadataCache.on('changed', (file: TFile) => {
				if (this.personManager.isInPeopleFolder(file)) {
					this.personManager.updatePerson(file);
				}
				this.mentionScanner.onFileChange(file);
				this.refreshPeopleView();
			})
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile) {
					if (this.personManager.isInPeopleFolder(file)) {
						this.personManager.removePerson(file);
					}
					this.mentionScanner.onFileDelete(file);
					this.refreshPeopleView();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile && this.personManager.isInPeopleFolder(file)) {
					// Wait for metadata cache to populate
					setTimeout(() => {
						this.personManager.updatePerson(file);
						this.refreshPeopleView();
					}, 500);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					// Re-scan after rename
					setTimeout(() => {
						this.personManager.scanPeopleFolder();
						this.mentionScanner.buildIndex();
						this.refreshPeopleView();
					}, 500);
				}
			})
		);
	}

	async onunload(): Promise<void> {
		this.profileCard.destroy();
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);

		// Update folder paths in services
		this.personManager.setPeopleFolder(this.settings.peopleFolder);
		this.mentionScanner.setPeopleFolder(this.settings.peopleFolder);

		// Re-scan with new settings
		await this.personManager.scanPeopleFolder();
		await this.mentionScanner.buildIndex();
		this.refreshPeopleView();
	}

	private async activatePeopleView(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_PEOPLE);
		if (existing.length > 0) {
			this.app.workspace.revealLeaf(existing[0]);
			return;
		}

		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: VIEW_TYPE_PEOPLE,
				active: true,
			});
			this.app.workspace.revealLeaf(leaf);
		}
	}

	private refreshPeopleView(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_PEOPLE);
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof PeopleView) {
				view.renderList();
			}
		}
	}

	private async createPersonNoteCommand(): Promise<void> {
		const name = await this.promptForName();
		if (!name) return;

		const file = await this.personManager.createPersonNote(name);
		await this.app.workspace.openLinkText(file.path, '', false);
	}

	private promptForName(): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = document.createElement('div');
			modal.className = 'arcadia-connect-name-modal';

			const overlay = document.createElement('div');
			overlay.className = 'arcadia-connect-modal-overlay';

			const content = document.createElement('div');
			content.className = 'arcadia-connect-modal-content';

			const label = document.createElement('label');
			label.textContent = 'Person name:';
			content.appendChild(label);

			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'arcadia-connect-modal-input';
			input.placeholder = 'Full Name';
			content.appendChild(input);

			const buttons = document.createElement('div');
			buttons.className = 'arcadia-connect-modal-buttons';

			const cancelBtn = document.createElement('button');
			cancelBtn.textContent = 'Cancel';
			cancelBtn.addEventListener('click', () => {
				modal.remove();
				resolve(null);
			});
			buttons.appendChild(cancelBtn);

			const createBtn = document.createElement('button');
			createBtn.textContent = 'Create';
			createBtn.className = 'mod-cta';
			createBtn.addEventListener('click', () => {
				const value = input.value.trim();
				modal.remove();
				resolve(value || null);
			});
			buttons.appendChild(createBtn);

			content.appendChild(buttons);
			modal.appendChild(overlay);
			modal.appendChild(content);
			document.body.appendChild(modal);

			overlay.addEventListener('click', () => {
				modal.remove();
				resolve(null);
			});

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					const value = input.value.trim();
					modal.remove();
					resolve(value || null);
				}
				if (e.key === 'Escape') {
					modal.remove();
					resolve(null);
				}
			});

			input.focus();
		});
	}
}
