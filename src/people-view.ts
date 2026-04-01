import { ItemView, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_PEOPLE, PersonNote, DEAL_STAGE_LABELS } from './types';
import { PersonManager } from './person-manager';
import { MentionScanner } from './mention-scanner';
import { ProfileCard } from './profile-card';
import { InteractionLoggerModal, SetFollowUpModal } from './interaction-logger';

type SortMode = 'alpha' | 'recent' | 'relationship' | 'last-contact' | 'next-follow-up' | 'deal-stage';

export class PeopleView extends ItemView {
	private personManager: PersonManager;
	private mentionScanner: MentionScanner;
	private profileCard: ProfileCard;
	private searchQuery = '';
	private sortMode: SortMode = 'alpha';
	private filterOverdue = false;
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

	onOpen(): void {
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
		const sortOptions: { value: SortMode; label: string }[] = [
			{ value: 'alpha', label: 'A-Z' },
			{ value: 'recent', label: 'Recent mention' },
			{ value: 'last-contact', label: 'Last contacted' },
			{ value: 'next-follow-up', label: 'Follow-up due' },
			{ value: 'deal-stage', label: 'Deal stage' },
			{ value: 'relationship', label: 'Relationship' },
		];
		for (const opt of sortOptions) {
			sortSelect.createEl('option', { value: opt.value, text: opt.label });
		}
		sortSelect.value = this.sortMode;
		sortSelect.addEventListener('change', () => {
			this.sortMode = sortSelect.value as SortMode;
			this.filterOverdue = false;
			this.renderList();
		});

		// Overdue filter button
		const overdueBtn = controls.createEl('button', {
			cls: 'arcadia-connect-overdue-btn',
			text: '⏰',
			attr: { title: 'Show overdue follow-ups' },
		});
		overdueBtn.addEventListener('click', () => {
			this.filterOverdue = !this.filterOverdue;
			overdueBtn.toggleClass('is-active', this.filterOverdue);
			this.renderList();
		});

		// New Person button
		const newBtn = controls.createEl('button', {
			cls: 'arcadia-connect-new-btn',
			text: '+ Person',
		});
		newBtn.addEventListener('click', () => {
			void this.createNewPerson();
		});

		// Log interaction button
		const logBtn = controls.createEl('button', {
			cls: 'arcadia-connect-log-btn',
			text: '+ Log',
			attr: { title: 'Log an interaction' },
		});
		logBtn.addEventListener('click', () => {
			new InteractionLoggerModal(this.app, this.personManager, null, () => {
				this.renderList();
			}).open();
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

		// Apply overdue filter
		if (this.filterOverdue) {
			const today = new Date().toISOString().split('T')[0];
			people = people.filter(p => {
				if (!p.nextFollowUp) return false;
				if (p.followUpStatus === 'done') return false;
				return p.nextFollowUp <= today;
			});
		}

		people = this.sortPeople(people);

		if (people.length === 0) {
			const empty = this.listEl.createDiv({ cls: 'arcadia-connect-empty' });
			if (this.filterOverdue) {
				empty.textContent = 'No overdue follow-ups.';
			} else if (this.searchQuery) {
				empty.textContent = 'No people match your search.';
			} else {
				empty.textContent = 'No people notes found. Create one to get started.';
			}
			return;
		}

		const today = new Date().toISOString().split('T')[0];

		for (const person of people) {
			const item = this.listEl.createDiv({ cls: 'arcadia-connect-person-item' });

			const followUpOverdue = person.nextFollowUp &&
				person.followUpStatus !== 'done' &&
				person.nextFollowUp < today;
			const followUpDueToday = person.nextFollowUp &&
				person.followUpStatus !== 'done' &&
				person.nextFollowUp === today;

			if (followUpOverdue) item.addClass('has-overdue-followup');
			if (followUpDueToday) item.addClass('has-followup-today');

			const icon = item.createSpan({ cls: 'arcadia-connect-person-icon' });
			icon.textContent = followUpOverdue ? '⏰' : followUpDueToday ? '🔔' : '👤';

			const info = item.createDiv({ cls: 'arcadia-connect-person-info' });
			info.createDiv({ cls: 'arcadia-connect-person-name', text: person.name });

			const meta: string[] = [];
			if (person.organization) meta.push(person.organization);
			if (person.dealStage) meta.push(DEAL_STAGE_LABELS[person.dealStage] ?? person.dealStage);
			if (meta.length > 0) {
				info.createDiv({
					cls: 'arcadia-connect-person-meta',
					text: meta.join(' · '),
				});
			}

			if (person.lastContact || person.nextFollowUp) {
				const dateLine = info.createDiv({ cls: 'arcadia-connect-person-dates' });
				if (person.lastContact) {
					dateLine.createSpan({ cls: 'arcadia-date-last', text: `Last: ${person.lastContact}` });
				}
				if (person.nextFollowUp && person.followUpStatus !== 'done') {
					const cls = followUpOverdue
						? 'arcadia-date-followup overdue'
						: followUpDueToday
						? 'arcadia-date-followup due-today'
						: 'arcadia-date-followup';
					dateLine.createSpan({ cls, text: ` · Due: ${person.nextFollowUp}` });
				}
			}

			const mentionCount = this.mentionScanner.getMentionCount(person.name);
			if (mentionCount > 0) {
				const badge = item.createSpan({ cls: 'arcadia-connect-mention-badge' });
				badge.textContent = String(mentionCount);
				badge.setAttribute('title', `${mentionCount} mention${mentionCount === 1 ? '' : 's'}`);
			}

			// Action buttons (shown on hover via CSS)
			const actions = item.createDiv({ cls: 'arcadia-connect-item-actions' });

			const logBtn = actions.createEl('button', {
				cls: 'arcadia-connect-action-btn',
				text: '+ Log',
				attr: { title: 'Log interaction' },
			});
			logBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				new InteractionLoggerModal(this.app, this.personManager, person, () => {
					this.renderList();
				}).open();
			});

			const followUpBtn = actions.createEl('button', {
				cls: 'arcadia-connect-action-btn',
				text: '📅',
				attr: { title: 'Set follow-up' },
			});
			followUpBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				new SetFollowUpModal(this.app, person, this.personManager, () => {
					this.renderList();
				}).open();
			});

			item.addEventListener('click', () => {
				void this.app.workspace.openLinkText(person.file.path, '', false);
			});

			item.addEventListener('mouseenter', () => {
				this.profileCard.show(person, item);
			});
			item.addEventListener('mouseleave', () => {
				this.profileCard.scheduleHide();
			});
		}
	}

	private sortPeople(people: PersonNote[]): PersonNote[] {
		const FAR_FUTURE = '9999-99-99';
		const FAR_PAST = '0000-00-00';

		switch (this.sortMode) {
			case 'alpha':
				return [...people].sort((a, b) => a.name.localeCompare(b.name));

			case 'recent':
				return [...people].sort((a, b) => {
					const dateA = this.mentionScanner.getLastMentionDate(a.name) || FAR_PAST;
					const dateB = this.mentionScanner.getLastMentionDate(b.name) || FAR_PAST;
					return dateB.localeCompare(dateA);
				});

			case 'last-contact':
				return [...people].sort((a, b) => {
					const dateA = a.lastContact || FAR_PAST;
					const dateB = b.lastContact || FAR_PAST;
					return dateB.localeCompare(dateA);
				});

			case 'next-follow-up':
				return [...people].sort((a, b) => {
					const dateA = (a.followUpStatus === 'done' ? FAR_FUTURE : a.nextFollowUp) || FAR_FUTURE;
					const dateB = (b.followUpStatus === 'done' ? FAR_FUTURE : b.nextFollowUp) || FAR_FUTURE;
					return dateA.localeCompare(dateB);
				});

			case 'deal-stage': {
				const stageOrder = ['lead', 'prospect', 'proposal', 'negotiation', 'closed-won', 'closed-lost', 'nurture'];
				return [...people].sort((a, b) => {
					const ia = a.dealStage ? stageOrder.indexOf(a.dealStage) : stageOrder.length;
					const ib = b.dealStage ? stageOrder.indexOf(b.dealStage) : stageOrder.length;
					return ia !== ib ? ia - ib : a.name.localeCompare(b.name);
				});
			}

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
		await this.app.workspace.openLinkText(file.path, '', false);
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
			input.placeholder = 'Full name';
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

	onClose(): void {
		this.profileCard.hide();
	}
}
