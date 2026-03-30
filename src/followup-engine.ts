import { Notice } from 'obsidian';
import { PersonManager } from './person-manager';
import { PersonNote } from './types';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const FIRED_KEY = 'arcadia-connect-followup-fired';

export class FollowUpEngine {
	private personManager: PersonManager;
	private intervalId: number | null = null;
	private firedToday: Set<string> = new Set();
	private lastFiredDate = '';

	constructor(personManager: PersonManager) {
		this.personManager = personManager;
	}

	start(): void {
		// Run immediately on start, then on interval
		this.check();
		this.intervalId = window.setInterval(() => this.check(), CHECK_INTERVAL_MS);
	}

	stop(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	private check(): void {
		const today = new Date().toISOString().split('T')[0];

		// Reset fired set on new day
		if (today !== this.lastFiredDate) {
			this.firedToday.clear();
			this.lastFiredDate = today;
		}

		const overdue = this.personManager.getOverdueFollowUps();
		const dueToday = this.personManager.getDueToday();

		// Fire notices for due today (once per session per person)
		for (const person of dueToday) {
			const key = `today:${person.file.path}`;
			if (!this.firedToday.has(key)) {
				this.firedToday.add(key);
				this.showFollowUpNotice(person, false);
			}
		}

		// Fire a summary notice for overdue (once per day)
		if (overdue.length > 0) {
			const overdueKey = `overdue:${today}`;
			if (!this.firedToday.has(overdueKey)) {
				this.firedToday.add(overdueKey);
				this.showOverdueSummary(overdue);
			}
		}
	}

	private showFollowUpNotice(person: PersonNote, isOverdue: boolean): void {
		const prefix = isOverdue ? 'Overdue' : 'Follow-up due today';
		const msg = `${prefix}: ${person.name}`;
		if (person.organization) {
			new Notice(`${msg} (${person.organization})`, 8000);
		} else {
			new Notice(msg, 8000);
		}
	}

	private showOverdueSummary(overdue: PersonNote[]): void {
		if (overdue.length === 1) {
			this.showFollowUpNotice(overdue[0], true);
		} else {
			const names = overdue
				.slice(0, 3)
				.map(p => p.name)
				.join(', ');
			const extra = overdue.length > 3 ? ` +${overdue.length - 3} more` : '';
			new Notice(`${overdue.length} overdue follow-ups: ${names}${extra}`, 10000);
		}
	}

	// Force a check (e.g., after vault opens or settings change)
	forceCheck(): void {
		this.check();
	}
}
