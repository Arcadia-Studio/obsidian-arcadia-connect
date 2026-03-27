import { ItemView, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_PEOPLE, PersonNote } from './types';
import { PersonManager } from './person-manager';
import { MentionScanner } from './mention-scanner';
import { ProfileCard } from './profile-card';

type SortMode = 'alpha' | 'recent' | 'relationship';

export class PeopleView extends ItemView {
	private personManager: PersonManager;
	private mentionScanner: MentionScanner;
	private profileCard: ProfileCard;
	private searchQuery = '';
	private sortMode: SortMode = 'alpha';
	private listEl: HTMLElement | null = null;

	constructor(
		leaf: WorkspaceLeaf,
		personManager: PersonManager,
		mentionScanner: MentionScanner,
		profileCard: ProfileCard
	) {
		super(leaf);
		this.personManager = personManager;
		this.mentionScanner = mentionScanner;
		this.profileCard = profileCard;
	}

	getViewType(): string {
		return VIEW_TYPE_PEOPLE;
	}

	getDisplayText(): string {
		return 'People';
	}

	getIcon(): string {
		return 'users';
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass('arcadia-connect-people-view');

		// Header
		const header = container.createDiv({ cls: 'arcadia-connect-people-header' });

		// Search
		const searchContainer = header.createDiv({ cls: 'arcadia-connect-search-container' });
		const searchInput = searchContainer.createEl('input', {
			cls: 'arcadia-connect-search-input',
			attr: { type: 'text', placeholder: 'Search people...' },
		});
		searchInput.addEventListener('input', () => {
			this.searchQuery = searchInput.value;
			this.renderList();
		});

		// Controls row
		const controls = header.createDiv({ cls: 'arcadia-connect-controls' });

		// Sort dropdown
		const sortSelect = controls.createEl('select', { cls: 'arcadia-connect-sort-select' });
		const sortOptions = [
			{ value: 'alpha', label: 'A-Z' },
			{ value: 'recent', label: 'Recent' },
			{ value: 'relationship', label: 'Relationship' },
		];
		for (const opt of sortOptions) {
			sortSelect.createEl('option', { value: opt.value, text: opt.label });
		}
		sortSelect.value = this.sortMode;
		sortSelect.addEventListener('change', () => {
			this.sortMode = sortSelect.value as SortMode;
			this.renderList();
		});

		// New Person button
		const newBtn = controls.createEl('button', {
			cls: 'arcadia-connect-new-btn',
			text: '+ New Person',
		});
		newBtn.addEventListener('click', () => {
			this.createNewPerson();
		});

		// People list
		this.listEl = container.createDiv({ cls: 'arcadia-connect-people-list' });
		this.renderList();
	}

	renderList(): void {
		if (!this.listEl) return;
		this.listEl.empty();

		let people = this.searchQuery
			? this.personManager.searchPeople(this.searchQuery)
			: this.personManager.getAllPeople();

		people = this.sortPeople(people);

		if (people.length === 0) {
			const empty = this.listEl.createDiv({ cls: 'arcadia-connect-empty' });
			empty.textContent = this.searchQuery
				? 'No people match your search.'
				: 'No people notes found. Create one to get started.';
			return;
		}

		for (const person of people) {
			const item = this.listEl.createDiv({ cls: 'arcadia-connect-person-item' });

			const icon = item.createSpan({ cls: 'arcadia-connect-person-icon' });
			icon.textContent = '\u{1F464}';

			const info = item.createDiv({ cls: 'arcadia-connect-person-info' });
			info.createDiv({ cls: 'arcadia-connect-person-name', text: person.name });

			const meta: string[] = [];
			if (person.organization) meta.push(person.organization);
			if (person.relationshipType) meta.push(person.relationshipType);
			if (meta.length > 0) {
				info.createDiv({
					cls: 'arcadia-connect-person-meta',
					text: meta.join(' \u00B7 '),
				});
			}

			const mentionCount = this.mentionScanner.getMentionCount(person.name);
			if (mentionCount > 0) {
				const badge = item.createSpan({ cls: 'arcadia-connect-mention-badge' });
				badge.textContent = String(mentionCount);
				badge.setAttribute('title', `${mentionCount} mention${mentionCount === 1 ? '' : 's'}`);
			}

			// Click to open
			item.addEventListener('click', () => {
				this.app.workspace.openLinkText(person.file.path, '', false);
			});

			// Hover for profile card
			item.addEventListener('mouseenter', () => {
				this.profileCard.show(person, item);
			});
			item.addEventListener('mouseleave', () => {
				this.profileCard.scheduleHide();
			});
		}
	}

	private sortPeople(people: PersonNote[]): PersonNote[] {
		switch (this.sortMode) {
			case 'alpha':
				return [...people].sort((a, b) => a.name.localeCompare(b.name));

			case 'recent':
				return [...people].sort((a, b) => {
					const dateA = this.mentionScanner.getLastMentionDate(a.name) || '0000';
					const dateB = this.mentionScanner.getLastMentionDate(b.name) || '0000';
					return dateB.localeCompare(dateA);
				});

			case 'relationship':
				return [...people].sort((a, b) => {
					const typeA = a.relationshipType || 'zzz';
					const typeB = b.relationshipType || 'zzz';
					const cmp = typeA.localeCompare(typeB);
					return cmp !== 0 ? cmp : a.name.localeCompare(b.name);
				});

			default:
				return people;
		}
	}

	private async createNewPerson(): Promise<void> {
		const name = await this.promptForName();
		if (!name) return;

		const file = await this.personManager.createPersonNote(name);
		this.app.workspace.openLinkText(file.path, '', false);
		this.renderList();
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

	async onClose(): Promise<void> {
		this.profileCard.hide();
	}
}
