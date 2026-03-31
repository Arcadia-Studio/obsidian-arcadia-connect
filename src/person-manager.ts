import { App, TFile, TFolder, normalizePath, FrontMatterCache } from 'obsidian';
import { PersonNote, PERSON_NOTE_TEMPLATE, DealStage } from './types';

export class PersonManager {
	private app: App;
	private peopleFolder: string;
	private people: Map<string, PersonNote> = new Map();

	constructor(app: App, peopleFolder: string) {
		this.app = app;
		this.peopleFolder = peopleFolder;
	}

	setPeopleFolder(folder: string): void {
		this.peopleFolder = folder;
	}

	initialize(): void {
		this.scanPeopleFolder();
	}

	scanPeopleFolder(): void {
		this.people.clear();
		const folderPath = normalizePath(this.peopleFolder);
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder || !(folder instanceof TFolder)) {
			return;
		}

		const files = folder.children.filter(
			(f): f is TFile => f instanceof TFile && f.extension === 'md'
		);

		for (const file of files) {
			const person = this.parsePersonFile(file);
			if (person) {
				this.people.set(person.name.toLowerCase(), person);
			}
		}
	}

	private parsePersonFile(file: TFile): PersonNote | null {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache?.frontmatter) {
			return null;
		}

		const fm: FrontMatterCache = cache.frontmatter;

		// Accept both old (type: person) and new (file-role: crm-contact) formats
		if (fm.type !== 'person' && fm['file-role'] !== 'crm-contact') {
			return null;
		}

		const name = fm.name || file.basename;
		if (!name) {
			return null;
		}

		return {
			file,
			name: String(name),
			email: fm.email ? String(fm.email) : undefined,
			phone: fm.phone ? String(fm.phone) : undefined,
			organization: fm.organization ? String(fm.organization) : undefined,
			role: fm.role ? String(fm.role) : undefined,
			birthday: fm.birthday ? String(fm.birthday) : undefined,
			relationshipType: fm['relationship-type'] ? String(fm['relationship-type']) : undefined,
			tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
			photo: fm.photo ? String(fm.photo) : undefined,
			// CRM fields
			lastContact: fm['last-contact'] ? String(fm['last-contact']) : undefined,
			nextFollowUp: fm['next-follow-up'] ? String(fm['next-follow-up']) : undefined,
			followUpStatus: fm['follow-up-status'] as PersonNote['followUpStatus'] ?? 'pending',
			dealStage: fm['deal-stage'] ? (fm['deal-stage'] as DealStage) : undefined,
			dealValue: fm['deal-value'] ? Number(fm['deal-value']) : undefined,
		};
	}

	getAllPeople(): PersonNote[] {
		return Array.from(this.people.values());
	}

	getPersonByName(name: string): PersonNote | undefined {
		return this.people.get(name.toLowerCase());
	}

	searchPeople(query: string): PersonNote[] {
		if (!query) {
			return this.getAllPeople();
		}
		const lower = query.toLowerCase();
		return this.getAllPeople().filter(p => {
			return (
				p.name.toLowerCase().includes(lower) ||
				(p.organization && p.organization.toLowerCase().includes(lower)) ||
				(p.tags && p.tags.some(t => t.toLowerCase().includes(lower))) ||
				(p.dealStage && p.dealStage.toLowerCase().includes(lower))
			);
		});
	}

	fuzzyMatch(query: string): PersonNote[] {
		if (!query) {
			return this.getAllPeople();
		}
		const lower = query.toLowerCase();
		return this.getAllPeople()
			.map(p => ({
				person: p,
				score: this.fuzzyScore(p.name.toLowerCase(), lower),
			}))
			.filter(r => r.score > 0)
			.sort((a, b) => b.score - a.score)
			.map(r => r.person);
	}

	private fuzzyScore(target: string, query: string): number {
		let score = 0;
		let qi = 0;
		let consecutive = 0;

		for (let ti = 0; ti < target.length && qi < query.length; ti++) {
			if (target[ti] === query[qi]) {
				score += 1 + consecutive;
				consecutive++;
				qi++;
			} else {
				consecutive = 0;
			}
		}

		if (qi < query.length) {
			return 0;
		}

		if (target.startsWith(query)) {
			score += 10;
		}

		return score;
	}

	getOverdueFollowUps(now: Date = new Date()): PersonNote[] {
		const today = now.toISOString().split('T')[0];
		return this.getAllPeople().filter(p => {
			if (!p.nextFollowUp) return false;
			if (p.followUpStatus === 'done') return false;
			return p.nextFollowUp < today;
		});
	}

	getDueToday(now: Date = new Date()): PersonNote[] {
		const today = now.toISOString().split('T')[0];
		return this.getAllPeople().filter(p => {
			if (!p.nextFollowUp) return false;
			if (p.followUpStatus === 'done') return false;
			return p.nextFollowUp === today;
		});
	}

	async updateFollowUpStatus(file: TFile, status: PersonNote['followUpStatus']): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			fm['follow-up-status'] = status;
		});
	}

	async logInteraction(
		person: PersonNote,
		type: string,
		summary: string,
		date: string
	): Promise<void> {
		// Update last-contact in frontmatter
		await this.app.fileManager.processFrontMatter(person.file, (fm) => {
			fm['last-contact'] = date;
			// Mark follow-up done if it was pending and the due date has passed
			if (fm['follow-up-status'] === 'pending' && fm['next-follow-up'] && fm['next-follow-up'] <= date) {
				fm['follow-up-status'] = 'done';
			}
		});

		// Append interaction entry to note body
		const content = await this.app.vault.read(person.file);
		const interactionLine = `- ${date} — **${type}**: ${summary}`;

		let updatedContent: string;
		const logHeader = '## Interaction Log';
		if (content.includes(logHeader)) {
			updatedContent = content.replace(
				logHeader + '\n',
				logHeader + '\n' + interactionLine + '\n'
			);
		} else {
			updatedContent = content + '\n' + logHeader + '\n' + interactionLine + '\n';
		}

		await this.app.vault.modify(person.file, updatedContent);
		this.updatePerson(person.file);
	}

	async createPersonNote(name: string): Promise<TFile> {
		const folderPath = normalizePath(this.peopleFolder);
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}

		const content = PERSON_NOTE_TEMPLATE.replace(/\{\{name\}\}/g, name);
		const filePath = normalizePath(`${this.peopleFolder}/${name}.md`);

		const file = await this.app.vault.create(filePath, content);

		const person: PersonNote = {
			file,
			name,
			followUpStatus: 'pending',
		};
		this.people.set(name.toLowerCase(), person);

		return file;
	}

	updatePerson(file: TFile): void {
		const person = this.parsePersonFile(file);
		if (person) {
			this.people.set(person.name.toLowerCase(), person);
		}
	}

	removePerson(file: TFile): void {
		for (const [key, person] of this.people.entries()) {
			if (person.file.path === file.path) {
				this.people.delete(key);
				break;
			}
		}
	}

	isInPeopleFolder(file: TFile): boolean {
		const folderPath = normalizePath(this.peopleFolder);
		return file.path.startsWith(folderPath);
	}
}
