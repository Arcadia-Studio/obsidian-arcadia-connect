import { App, MarkdownPostProcessorContext } from 'obsidian';
import { PersonManager } from './person-manager';
import { ArcadiaConnectSettings } from './types';
import { ProfileCard } from './profile-card';

export class MentionPostProcessor {
	private app: App;
	private personManager: PersonManager;
	private settings: ArcadiaConnectSettings;
	private profileCard: ProfileCard;

	constructor(
		app: App,
		personManager: PersonManager,
		settings: ArcadiaConnectSettings,
		profileCard: ProfileCard
	) {
		this.app = app;
		this.personManager = personManager;
		this.settings = settings;
		this.profileCard = profileCard;
	}

	getProcessor() {
		return (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			this.processElement(el);
		};
	}

	private processElement(el: HTMLElement): void {
		const trigger = this.settings.triggerChar || '@';

		// Find text nodes containing @mentions that aren't already inside links
		const walker = document.createTreeWalker(
			el,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: (node) => {
					const parent = node.parentElement;
					if (!parent) return NodeFilter.FILTER_REJECT;
					// Skip if already inside a link or our styled span
					if (
						parent.tagName === 'A' ||
						parent.closest('a') ||
						parent.classList.contains('arcadia-connect-mention')
					) {
						return NodeFilter.FILTER_REJECT;
					}
					if (node.textContent && node.textContent.includes(trigger)) {
						return NodeFilter.FILTER_ACCEPT;
					}
					return NodeFilter.FILTER_REJECT;
				},
			}
		);

		const textNodes: Text[] = [];
		let node: Node | null;
		while ((node = walker.nextNode())) {
			textNodes.push(node as Text);
		}

		for (const textNode of textNodes) {
			this.processMentionsInText(textNode, trigger);
		}
	}

	private processMentionsInText(textNode: Text, trigger: string): void {
		const text = textNode.textContent;
		if (!text) return;

		// Match @PersonName patterns (word boundary, not in email)
		const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(
			`(?:^|(?<=\\s|[([{,;:!?]))${escapedTrigger}([A-Z][a-zA-Z]*(?:\\s[A-Z][a-zA-Z]*)*)`,
			'g'
		);

		const matches: { index: number; fullMatch: string; name: string }[] = [];
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			const name = match[1];
			const person = this.personManager.getPersonByName(name);
			if (person) {
				matches.push({
					index: match.index,
					fullMatch: match[0],
					name,
				});
			}
		}

		if (matches.length === 0) return;

		const parent = textNode.parentNode;
		if (!parent) return;

		const fragment = document.createDocumentFragment();
		let lastIndex = 0;

		for (const m of matches) {
			// Text before this match
			if (m.index > lastIndex) {
				fragment.appendChild(
					document.createTextNode(text.slice(lastIndex, m.index))
				);
			}

			// Create the styled mention span
			const span = document.createElement('span');
			span.className = 'arcadia-connect-mention';
			span.textContent = m.fullMatch;
			span.setAttribute('data-person-name', m.name);

			// Click to navigate
			span.addEventListener('click', (e) => {
				e.preventDefault();
				const person = this.personManager.getPersonByName(m.name);
				if (person) {
					void this.app.workspace.openLinkText(person.file.path, '', false);
				}
			});

			// Hover to show profile card
			if (this.settings.showHoverCard) {
				span.addEventListener('mouseenter', (e) => {
					const person = this.personManager.getPersonByName(m.name);
					if (person) {
						this.profileCard.show(person, span);
					}
				});

				span.addEventListener('mouseleave', () => {
					this.profileCard.scheduleHide();
				});
			}

			fragment.appendChild(span);
			lastIndex = m.index + m.fullMatch.length;
		}

		// Remaining text
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		parent.replaceChild(fragment, textNode);
	}
}
