import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { VIEW_TYPE_PIPELINE, PersonNote, DealStage, DEAL_STAGE_LABELS, DEAL_STAGE_ORDER } from './types';
import { PersonManager } from './person-manager';
import { InteractionLoggerModal } from './interaction-logger';

export class PipelineView extends ItemView {
	private personManager: PersonManager;
	private boardEl: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, personManager: PersonManager) {
		super(leaf);
		this.personManager = personManager;
	}

	getViewType(): string { return VIEW_TYPE_PIPELINE; }
	getDisplayText(): string { return 'Pipeline'; }
	getIcon(): string { return 'kanban-square'; }

	onOpen(): void {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass('arcadia-pipeline-view');

		const header = container.createDiv({ cls: 'arcadia-pipeline-header' });
		header.createEl('h4', { text: 'Deal pipeline' });

		const refreshBtn = header.createEl('button', {
			cls: 'arcadia-pipeline-refresh',
			text: '↻',
			attr: { title: 'Refresh' },
		});
		refreshBtn.addEventListener('click', () => this.renderBoard());

		this.boardEl = container.createDiv({ cls: 'arcadia-pipeline-board' });
		this.renderBoard();
	}

	renderBoard(): void {
		if (!this.boardEl) return;
		this.boardEl.empty();

		const people = this.personManager.getAllPeople();
		const today = new Date().toISOString().split('T')[0];

		// Group contacts by stage
		const byStage = new Map<DealStage, PersonNote[]>();
		for (const stage of DEAL_STAGE_ORDER) {
			byStage.set(stage, []);
		}
		// Contacts with no stage go to 'lead'
		for (const person of people) {
			const stage = person.dealStage ?? 'lead';
			const bucket = byStage.get(stage);
			if (bucket) bucket.push(person);
		}

		// Render only stages that have contacts OR are core sales stages
		const visibleStages: DealStage[] = ['lead', 'prospect', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

		for (const stage of visibleStages) {
			const contacts = byStage.get(stage) ?? [];
			const column = this.boardEl.createDiv({ cls: `arcadia-pipeline-column arcadia-stage-${stage}` });

			// Column header
			const colHeader = column.createDiv({ cls: 'arcadia-pipeline-col-header' });
			colHeader.createSpan({ cls: 'arcadia-pipeline-stage-name', text: DEAL_STAGE_LABELS[stage] });
			const countBadge = colHeader.createSpan({ cls: 'arcadia-pipeline-count' });
			countBadge.textContent = String(contacts.length);

			// Calculate stage value
			const stageValue = contacts.reduce((sum, p) => sum + (p.dealValue ?? 0), 0);
			if (stageValue > 0) {
				colHeader.createSpan({
					cls: 'arcadia-pipeline-value',
					text: `$${stageValue.toLocaleString()}`,
				});
			}

			// Cards
			const cardsEl = column.createDiv({ cls: 'arcadia-pipeline-cards' });

			if (contacts.length === 0) {
				cardsEl.createDiv({ cls: 'arcadia-pipeline-empty-col', text: 'Empty' });
			}

			for (const person of contacts.sort((a, b) => {
				// Sort by deal value desc within column
				return (b.dealValue ?? 0) - (a.dealValue ?? 0);
			})) {
				const card = cardsEl.createDiv({ cls: 'arcadia-pipeline-card' });

				// Follow-up indicator
				const hasOverdue = person.nextFollowUp &&
					person.followUpStatus !== 'done' &&
					person.nextFollowUp < today;
				const hasDueToday = person.nextFollowUp &&
					person.followUpStatus !== 'done' &&
					person.nextFollowUp === today;
				if (hasOverdue) card.addClass('has-overdue');
				if (hasDueToday) card.addClass('has-due-today');

				// Card header row
				const cardTop = card.createDiv({ cls: 'arcadia-card-top' });
				cardTop.createDiv({ cls: 'arcadia-card-name', text: person.name });
				if (hasOverdue) cardTop.createSpan({ cls: 'arcadia-card-flag', text: '⏰' });
				else if (hasDueToday) cardTop.createSpan({ cls: 'arcadia-card-flag', text: '🔔' });

				if (person.organization) {
					card.createDiv({ cls: 'arcadia-card-org', text: person.organization });
				}

				// Deal value
				if (person.dealValue && person.dealValue > 0) {
					card.createDiv({
						cls: 'arcadia-card-deal-value',
						text: `$${person.dealValue.toLocaleString()}`,
					});
				}

				// Last contact
				if (person.lastContact) {
					card.createDiv({
						cls: 'arcadia-card-last-contact',
						text: `Last: ${person.lastContact}`,
					});
				}

				// Card actions
				const actions = card.createDiv({ cls: 'arcadia-card-actions' });

				// Move stage dropdown
				const moveSelect = actions.createEl('select', { cls: 'arcadia-card-move-select' });
				moveSelect.createEl('option', { value: '', text: 'Move to...' });
				for (const s of DEAL_STAGE_ORDER) {
					if (s === stage) continue;
					moveSelect.createEl('option', { value: s, text: DEAL_STAGE_LABELS[s] });
				}
				moveSelect.addEventListener('change', () => {
					void (async () => {
						const newStage = moveSelect.value as DealStage;
						if (!newStage) return;
						await this.app.fileManager.processFrontMatter(person.file, (fm) => {
							fm['deal-stage'] = newStage;
						});
						this.personManager.updatePerson(person.file);
						new Notice(`Moved ${person.name} to ${DEAL_STAGE_LABELS[newStage]}`);
						this.renderBoard();
					})();
				});

				// Log interaction button
				const logBtn = actions.createEl('button', {
					cls: 'arcadia-card-log-btn',
					text: '+ Log',
					attr: { title: 'Log interaction' },
				});
				logBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					new InteractionLoggerModal(this.app, this.personManager, person, () => {
						this.renderBoard();
					}).open();
				});

				// Click card to open note
				card.addEventListener('click', (e) => {
					if ((e.target as HTMLElement).closest('select, button')) return;
					void this.app.workspace.openLinkText(person.file.path, '', false);
				});
			}
		}
	}

	onClose(): void {
		// nothing
	}
}
