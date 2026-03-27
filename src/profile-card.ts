import { App } from 'obsidian';
import { PersonNote } from './types';

export class ProfileCard {
	private app: App;
	private cardEl: HTMLElement | null = null;
	private hideTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(app: App) {
		this.app = app;
	}

	show(person: PersonNote, anchor: HTMLElement): void {
		this.cancelHide();
		this.hide();

		const card = document.createElement('div');
		card.className = 'arcadia-connect-profile-card';

		// Header with name
		const header = card.createDiv({ cls: 'arcadia-connect-card-header' });
		const icon = header.createSpan({ cls: 'arcadia-connect-card-icon' });
		icon.textContent = '\u{1F464}';
		header.createEl('strong', { text: person.name });

		// Details
		const details = card.createDiv({ cls: 'arcadia-connect-card-details' });

		if (person.organization) {
			const row = details.createDiv({ cls: 'arcadia-connect-card-row' });
			row.createSpan({ cls: 'arcadia-connect-card-label', text: 'Org' });
			row.createSpan({ text: person.organization });
		}

		if (person.role) {
			const row = details.createDiv({ cls: 'arcadia-connect-card-row' });
			row.createSpan({ cls: 'arcadia-connect-card-label', text: 'Role' });
			row.createSpan({ text: person.role });
		}

		if (person.email) {
			const row = details.createDiv({ cls: 'arcadia-connect-card-row' });
			row.createSpan({ cls: 'arcadia-connect-card-label', text: 'Email' });
			row.createSpan({ text: person.email });
		}

		if (person.phone) {
			const row = details.createDiv({ cls: 'arcadia-connect-card-row' });
			row.createSpan({ cls: 'arcadia-connect-card-label', text: 'Phone' });
			row.createSpan({ text: person.phone });
		}

		if (person.relationshipType) {
			const row = details.createDiv({ cls: 'arcadia-connect-card-row' });
			row.createSpan({ cls: 'arcadia-connect-card-label', text: 'Type' });
			row.createSpan({ text: person.relationshipType });
		}

		// Open button
		const footer = card.createDiv({ cls: 'arcadia-connect-card-footer' });
		const openBtn = footer.createEl('button', {
			cls: 'arcadia-connect-card-open-btn',
			text: 'Open',
		});
		openBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.app.workspace.openLinkText(person.file.path, '', false);
			this.hide();
		});

		// Position near anchor
		document.body.appendChild(card);
		this.cardEl = card;

		const anchorRect = anchor.getBoundingClientRect();
		const cardRect = card.getBoundingClientRect();

		let top = anchorRect.bottom + 4;
		let left = anchorRect.left;

		// Keep card within viewport
		if (top + cardRect.height > window.innerHeight) {
			top = anchorRect.top - cardRect.height - 4;
		}
		if (left + cardRect.width > window.innerWidth) {
			left = window.innerWidth - cardRect.width - 8;
		}
		if (left < 0) left = 8;

		card.style.top = `${top}px`;
		card.style.left = `${left}px`;

		// Keep card visible while hovering over it
		card.addEventListener('mouseenter', () => {
			this.cancelHide();
		});
		card.addEventListener('mouseleave', () => {
			this.scheduleHide();
		});
	}

	scheduleHide(): void {
		this.cancelHide();
		this.hideTimeout = setTimeout(() => {
			this.hide();
		}, 300);
	}

	private cancelHide(): void {
		if (this.hideTimeout) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = null;
		}
	}

	hide(): void {
		if (this.cardEl) {
			this.cardEl.remove();
			this.cardEl = null;
		}
	}

	destroy(): void {
		this.cancelHide();
		this.hide();
	}
}
