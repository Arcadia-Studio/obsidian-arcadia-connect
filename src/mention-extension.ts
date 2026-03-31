import { EditorView } from '@codemirror/view';
import {
	CompletionContext,
	CompletionResult,
	Completion,
	autocompletion,
	pickedCompletion,
} from '@codemirror/autocomplete';
import { PersonManager } from './person-manager';
import { ArcadiaConnectSettings } from './types';

export function createMentionExtension(
	personManager: PersonManager,
	settings: ArcadiaConnectSettings
) {
	return autocompletion({
		override: [
			(context: CompletionContext): CompletionResult | null => {
				return mentionCompletionSource(context, personManager, settings);
			},
		],
		defaultKeymap: true,
	});
}

function mentionCompletionSource(
	context: CompletionContext,
	personManager: PersonManager,
	settings: ArcadiaConnectSettings
): CompletionResult | null {
	const trigger = settings.triggerChar || '@';

	const line = context.state.doc.lineAt(context.pos);
	const lineText = line.text;
	const cursorInLine = context.pos - line.from;

	// Find the @ trigger before the cursor
	let triggerPos = -1;
	for (let i = cursorInLine - 1; i >= 0; i--) {
		if (lineText[i] === trigger) {
			// Check it's at word boundary (start of line or preceded by whitespace/punctuation)
			if (i === 0 || /[\s([{,;:!?]/.test(lineText[i - 1])) {
				triggerPos = i;
			}
			break;
		}
		// Stop searching if we hit whitespace (the @ must be contiguous with query)
		if (/\s/.test(lineText[i])) {
			break;
		}
	}

	if (triggerPos === -1) {
		return null;
	}

	const query = lineText.slice(triggerPos + 1, cursorInLine);
	const from = line.from + triggerPos;

	// Don't trigger inside emails (check for alphanumeric before @)
	if (triggerPos > 0 && /[a-zA-Z0-9._-]/.test(lineText[triggerPos - 1])) {
		return null;
	}

	const people = query
		? personManager.fuzzyMatch(query)
		: personManager.getAllPeople();

	if (people.length === 0 && !settings.autoCreatePerson) {
		return null;
	}

	const options: Completion[] = people.map(person => ({
		label: `${trigger}${person.name}`,
		detail: person.organization || person.relationshipType || '',
		info: person.role || undefined,
		type: 'text',
		apply: (view: EditorView, completion: Completion, from: number, to: number) => {
			const peoplePath = settings.peopleFolder.replace(/\/$/, '');
			const wikilink = `[[${peoplePath}/${person.name}|${trigger}${person.name}]]`;
			view.dispatch({
				changes: { from, to, insert: wikilink },
				annotations: pickedCompletion.of(completion),
			});
		},
	}));

	// Add "Create new person" option if auto-create is enabled and query is non-empty
	if (settings.autoCreatePerson && query && query.length > 0) {
		const exists = people.some(p => p.name.toLowerCase() === query.toLowerCase());
		if (!exists) {
			options.push({
				label: `${trigger}${query} (new)`,
				detail: 'Create new person note',
				type: 'text',
				boost: -1,
				apply: (view: EditorView, completion: Completion, from: number, to: number) => {
					const peoplePath = settings.peopleFolder.replace(/\/$/, '');
					const name = query.charAt(0).toUpperCase() + query.slice(1);
					const wikilink = `[[${peoplePath}/${name}|${trigger}${name}]]`;
					view.dispatch({
						changes: { from, to, insert: wikilink },
						annotations: pickedCompletion.of(completion),
					});
					// Create the person note asynchronously
					void personManager.createPersonNote(name);
				},
			});
		}
	}

	return {
		from,
		options,
		filter: false,
	};
}
