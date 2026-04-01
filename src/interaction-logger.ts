import { App, Modal, Notice, Setting } from 'obsidian';
import { PersonManager } from './person-manager';
import { PersonNote, InteractionType, INTERACTION_TYPES } from './types';

export class InteractionLoggerModal extends Modal {
	private personManager: PersonManager;
	private preselectedPerson: PersonNote | null;
	private onSuccess?: () => void;

	constructor(
		app: App,
		personManager: PersonManager,
		preselectedPerson: PersonNote | null = null,
		onSuccess?: () => void
	) {
		super(app);
		this.personManager = personManager;
		this.preselectedPerson = preselectedPerson;
		this.onSuccess = onSuccess;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('arcadia-interaction-modal');

		contentEl.createEl('h2', { text: 'Log interaction' });

		const today = new Date().toISOString().split('T')[0];

		let selectedPerson: PersonNote | null = this.preselectedPerson;
		let selectedType: InteractionType = 'call';
		let selectedDate = today;
		let summary = '';
		let nextFollowUp = '';

		// Person selector (if not preselected)
		if (!this.preselectedPerson) {
			const people = this.personManager.getAllPeople();

			new Setting(contentEl)
				.setName('Person')
				.setDesc('Who did you interact with?')
				.addDropdown(dd => {
					dd.addOption('', '— select a person —');
					for (const p of people.sort((a, b) => a.name.localeCompare(b.name))) {
						dd.addOption(p.name, p.name);
					}
					dd.onChange(value => {
						selectedPerson = this.personManager.getPersonByName(value) ?? null;
					});
				});
		} else {
			contentEl.createEl('p', {
				text: `Contact: ${this.preselectedPerson.name}`,
				cls: 'arcadia-interaction-contact-name',
			});
		}

		// Interaction type
		new Setting(contentEl)
			.setName('Type')
			.addDropdown(dd => {
				for (const [value, label] of Object.entries(INTERACTION_TYPES)) {
					dd.addOption(value, label);
				}
				dd.setValue('call');
				dd.onChange(value => {
					selectedType = value as InteractionType;
				});
			});

		// Date
		new Setting(contentEl)
			.setName('Date')
			.addText(text => {
				text.setValue(today);
				text.inputEl.type = 'date';
				text.onChange(value => {
					selectedDate = value;
				});
			});

		// Summary
		new Setting(contentEl)
			.setName('Summary')
			.setDesc('Brief description of the interaction')
			.addTextArea(ta => {
				ta.setPlaceholder('What was discussed or decided?');
				ta.inputEl.rows = 3;
				ta.onChange(value => {
					summary = value;
				});
			});

		// Next follow-up date (optional)
		new Setting(contentEl)
			.setName('Next follow-up')
			.setDesc('Optional: schedule a follow-up')
			.addText(text => {
				text.inputEl.type = 'date';
				text.onChange(value => {
					nextFollowUp = value;
				});
			});

		// Buttons
		const buttonRow = contentEl.createDiv({ cls: 'arcadia-interaction-buttons' });

		const cancelBtn = buttonRow.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const saveBtn = buttonRow.createEl('button', {
			text: 'Log interaction',
			cls: 'mod-cta',
		});

		saveBtn.addEventListener('click', () => {
			void (async () => {
				if (!selectedPerson) {
					new Notice('Please select a person.');
					return;
				}
				if (!summary.trim()) {
					new Notice('Please add a summary.');
					return;
				}

				try {
					await this.personManager.logInteraction(
						selectedPerson,
						INTERACTION_TYPES[selectedType],
						summary.trim(),
						selectedDate
					);

					// Set next follow-up if provided
					if (nextFollowUp) {
						await this.app.fileManager.processFrontMatter(selectedPerson.file, (fm) => {
							fm['next-follow-up'] = nextFollowUp;
							fm['follow-up-status'] = 'pending';
						});
					}

					new Notice(`Logged interaction with ${selectedPerson.name}`);
					this.close();
					this.onSuccess?.();
				} catch (e) {
					new Notice('Failed to log interaction. Check console for details.');
					console.error('Interaction log error:', e);
				}
			})();
		});
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

export class SetFollowUpModal extends Modal {
	private person: PersonNote;
	private personManager: PersonManager;
	private onSuccess?: () => void;

	constructor(
		app: App,
		person: PersonNote,
		personManager: PersonManager,
		onSuccess?: () => void
	) {
		super(app);
		this.person = person;
		this.personManager = personManager;
		this.onSuccess = onSuccess;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('arcadia-followup-modal');

		contentEl.createEl('h2', { text: `Follow-up: ${this.person.name}` });

		let followUpDate = '';
		let notes = '';

		new Setting(contentEl)
			.setName('Follow-up date')
			.addText(text => {
				text.inputEl.type = 'date';
				// Default to one week from today
				const nextWeek = new Date();
				nextWeek.setDate(nextWeek.getDate() + 7);
				text.setValue(nextWeek.toISOString().split('T')[0]);
				followUpDate = nextWeek.toISOString().split('T')[0];
				text.onChange(value => { followUpDate = value; });
			});

		new Setting(contentEl)
			.setName('Note')
			.setDesc('What to follow up about (optional)')
			.addText(text => {
				text.setPlaceholder('Reminder note...');
				text.onChange(value => { notes = value; });
			});

		const buttonRow = contentEl.createDiv({ cls: 'arcadia-interaction-buttons' });

		const cancelBtn = buttonRow.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const saveBtn = buttonRow.createEl('button', { text: 'Set follow-up', cls: 'mod-cta' });
		saveBtn.addEventListener('click', () => {
			void (async () => {
				if (!followUpDate) {
					new Notice('Please select a date.');
					return;
				}

				await this.app.fileManager.processFrontMatter(this.person.file, (fm) => {
					fm['next-follow-up'] = followUpDate;
					fm['follow-up-status'] = 'pending';
					if (notes.trim()) {
						fm['follow-up-note'] = notes.trim();
					}
				});

				new Notice(`Follow-up set for ${this.person.name} on ${followUpDate}`);
				this.close();
				this.onSuccess?.();
			})();
		});
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
