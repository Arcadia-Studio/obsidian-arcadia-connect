import { App, TFile, normalizePath } from 'obsidian';
import { MentionInstance } from './types';

export class MentionScanner {
	private app: App;
	private peopleFolder: string;
	private mentionIndex: Map<string, MentionInstance[]> = new Map();

	constructor(app: App, peopleFolder: string) {
		this.app = app;
		this.peopleFolder = peopleFolder;
	}

	setPeopleFolder(folder: string): void {
		this.peopleFolder = folder;
	}

	buildIndex(): void {
		this.mentionIndex.clear();
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			// Skip files in the people folder itself
			if (this.isInPeopleFolder(file)) continue;
			this.scanFile(file);
		}
	}

	scanFile(file: TFile): void {
		// Remove existing mentions from this file
		this.removeFileFromIndex(file);

		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache) return;

		// Scan resolved links that point to the people folder
		const peoplePath = normalizePath(this.peopleFolder);

		if (cache.links) {
			for (const link of cache.links) {
				const resolved = this.app.metadataCache.getFirstLinkpathDest(
					link.link,
					file.path
				);
				if (resolved && resolved.path.startsWith(peoplePath)) {
					this.addMention(resolved.basename, file, link.position.start.line);
				}
			}
		}

		// Also check frontmatter links (embeds that might reference people)
		if (cache.embeds) {
			for (const embed of cache.embeds) {
				const resolved = this.app.metadataCache.getFirstLinkpathDest(
					embed.link,
					file.path
				);
				if (resolved && resolved.path.startsWith(peoplePath)) {
					this.addMention(resolved.basename, file, embed.position.start.line);
				}
			}
		}
	}

	private addMention(personName: string, noteFile: TFile, line: number): void {
		const key = personName.toLowerCase();
		if (!this.mentionIndex.has(key)) {
			this.mentionIndex.set(key, []);
		}

		const fileDate = this.extractDateFromFile(noteFile);

		this.mentionIndex.get(key)!.push({
			personName,
			noteFile,
			noteName: noteFile.basename,
			line,
			date: fileDate,
		});
	}

	private extractDateFromFile(file: TFile): string {
		// Try to get date from frontmatter
		const cache = this.app.metadataCache.getFileCache(file);
		if (cache?.frontmatter?.date) {
			return String(cache.frontmatter.date);
		}

		// Try to extract date from filename (YYYY-MM-DD pattern)
		const dateMatch = file.basename.match(/(\d{4}-\d{2}-\d{2})/);
		if (dateMatch) {
			return dateMatch[1];
		}

		// Fall back to file modification time
		return new Date(file.stat.mtime).toISOString().slice(0, 10);
	}

	private removeFileFromIndex(file: TFile): void {
		for (const [key, mentions] of this.mentionIndex.entries()) {
			const filtered = mentions.filter(m => m.noteFile.path !== file.path);
			if (filtered.length === 0) {
				this.mentionIndex.delete(key);
			} else {
				this.mentionIndex.set(key, filtered);
			}
		}
	}

	getMentionsForPerson(personName: string): MentionInstance[] {
		const key = personName.toLowerCase();
		return this.mentionIndex.get(key) || [];
	}

	getRecentMentions(personName: string, limit: number = 10): MentionInstance[] {
		const mentions = this.getMentionsForPerson(personName);
		return mentions
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, limit);
	}

	getMentionCount(personName: string): number {
		return this.getMentionsForPerson(personName).length;
	}

	getLastMentionDate(personName: string): string | null {
		const mentions = this.getMentionsForPerson(personName);
		if (mentions.length === 0) return null;
		return mentions
			.map(m => m.date)
			.sort()
			.reverse()[0];
	}

	private isInPeopleFolder(file: TFile): boolean {
		const folderPath = normalizePath(this.peopleFolder);
		return file.path.startsWith(folderPath);
	}

	onFileChange(file: TFile): void {
		if (!this.isInPeopleFolder(file)) {
			this.scanFile(file);
		}
	}

	onFileDelete(file: TFile): void {
		this.removeFileFromIndex(file);
	}
}
