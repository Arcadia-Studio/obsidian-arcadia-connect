import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import { VIEW_TYPE_TIMELINE } from './types';
import { PersonManager } from './person-manager';

export interface TimelineEntry {
	date: string;
	type: string;
	summary: string;
	contactName: string;
	contactFile: TFile;
}

// Parses lines like: - 2026-03-30 — **📞 Call**: Summary text
const INTERACTION_RE = /^- (\d{4}-\d{2}-\d{2}) — \*\*(.+?)\*\*: (.+)$/;

export class TimelineView extends ItemView {
	private personManager: PersonManager;
	private entries: TimelineEntry[] = [];
	private filterContact = '';
	private listEl: HTMLElement | null = null;

	constructor(leaf: WorkspaceLeaf, personManager: PersonManager) {
		super(leaf);
		this.personManager = personManager;
	}

	getViewType(): string { return VIEW_TYPE_TIMELINE; }
	getDisplayText(): string { return 'Interaction timeline'; }
	getIcon(): string { return 'history'; }

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass('arcadia-timeline-view');

		const header = container.createDiv({ cls: 'arcadia-timeline-header' });
		header.createEl('h4', { text: 'Interaction timeline' });

		const controls = header.createDiv({ cls: 'arcadia-timeline-controls' });

		// Filter by contact
		const filterInput = controls.createEl('input', {
			cls: 'arcadia-timeline-filter',
			attr: { type: 'text', placeholder: 'Filter by contact...' },
		});
		filterInput.addEventListener('input', () => {
			this.filterContact = filterInput.value.toLowerCase();
			this.renderEntries();
		});

		// Refresh button
		const refreshBtn = controls.createEl('button', {
			cls: 'arcadia-timeline-refresh',
			text: '↻',
			attr: { title: 'Refresh' },
		});
		refreshBtn.addEventListener('click', () => { void this.reload(); });

		this.listEl = container.createDiv({ cls: 'arcadia-timeline-list' });
		await this.reload();
	}

	async reload(): Promise<void> {
		this.entries = await this.parseAllInteractions();
		this.renderEntries();
	}

	private async parseAllInteractions(): Promise<TimelineEntry[]> {
		const entries: TimelineEntry[] = [];
		const people = this.personManager.getAllPeople();

		for (const person of people) {
			try {
				const content = await this.app.vault.read(person.file);
				const logStart = content.indexOf('## Interaction Log');
				if (logStart === -1) continue;

				const logSection = content.slice(logStart);
				const lines = logSection.split('\n');

				for (const line of lines) {
					const match = line.match(INTERACTION_RE);
					if (!match) continue;
					entries.push({
						date: match[1],
						type: match[2],
						summary: match[3].trim(),
						contactName: person.name,
						contactFile: person.file,
					});
				}
			} catch {
				// Skip unreadable files
			}
		}

		// Sort newest first
		return entries.sort((a, b) => b.date.localeCompare(a.date));
	}

	private renderEntries(): void {
		if (!this.listEl) return;
		this.listEl.empty();

		let filtered = this.entries;
		if (this.filterContact) {
			filtered = filtered.filter(e =>
				e.contactName.toLowerCase().includes(this.filterContact)
			);
		}

		if (filtered.length === 0) {
			const empty = this.listEl.createDiv({ cls: 'arcadia-timeline-empty' });
			empty.textContent = this.filterContact
				? 'No interactions found for that contact.'
				: 'No interactions logged yet. Use "Log interaction" to get started.';
			return;
		}

		// Group by date bucket
		const today = new Date().toISOString().split('T')[0];
		const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
		const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
		const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

		const getBucket = (date: string): string => {
			if (date === today) return 'Today';
			if (date === yesterday) return 'Yesterday';
			if (date >= weekAgo) return 'This week';
			if (date >= monthAgo) return 'This month';
			return 'Earlier';
		};

		let currentBucket = '';

		for (const entry of filtered) {
			const bucket = getBucket(entry.date);

			if (bucket !== currentBucket) {
				currentBucket = bucket;
				const bucketHeader = this.listEl.createDiv({ cls: 'arcadia-timeline-bucket' });
				bucketHeader.textContent = bucket;
			}

			const row = this.listEl.createDiv({ cls: 'arcadia-timeline-entry' });

			const dateBadge = row.createDiv({ cls: 'arcadia-timeline-date' });
			dateBadge.textContent = entry.date;

			const body = row.createDiv({ cls: 'arcadia-timeline-body' });

			const topLine = body.createDiv({ cls: 'arcadia-timeline-top' });

			const typeBadge = topLine.createSpan({ cls: 'arcadia-timeline-type' });
			typeBadge.textContent = entry.type;

			const contactLink = topLine.createEl('a', {
				cls: 'arcadia-timeline-contact',
				text: entry.contactName,
			});
			contactLink.addEventListener('click', (e) => {
				e.preventDefault();
				void this.app.workspace.openLinkText(entry.contactFile.path, '', false);
			});

			body.createDiv({
				cls: 'arcadia-timeline-summary',
				text: entry.summary,
			});
		}
	}

	async onClose(): Promise<void> {
		await Promise.resolve();
	}
}
