import { requestUrl, Notice, Modal, App } from 'obsidian';
import { PersonNote, ArcadiaConnectSettings } from './types';
import { PersonManager } from './person-manager';

const MAX_INTERACTION_LINES = 20;

interface AISuggestion {
	action: string;
	reasoning: string;
	suggestedMessage?: string;
}

function extractInteractionHistory(content: string): string {
	const logStart = content.indexOf('## Interaction Log');
	if (logStart === -1) return '';
	const section = content.slice(logStart + '## Interaction Log'.length);
	const lines = section.split('\n')
		.filter(l => l.trim().startsWith('- '))
		.slice(0, MAX_INTERACTION_LINES);
	return lines.join('\n');
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
	const response = await requestUrl({
		url: 'https://api.anthropic.com/v1/messages',
		method: 'POST',
		headers: {
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			model: 'claude-haiku-4-5-20251001',
			max_tokens: 512,
			messages: [{ role: 'user', content: prompt }],
		}),
	});

	if (response.status !== 200) {
		throw new Error(`Anthropic API error ${response.status}: ${response.text}`);
	}

	const data = response.json;
	return data.content?.[0]?.text ?? '';
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
	const response = await requestUrl({
		url: 'https://api.openai.com/v1/chat/completions',
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			model,
			max_tokens: 512,
			messages: [{ role: 'user', content: prompt }],
		}),
	});

	if (response.status !== 200) {
		throw new Error(`OpenAI API error ${response.status}: ${response.text}`);
	}

	const data = response.json;
	return data.choices?.[0]?.message?.content ?? '';
}

function parseAISuggestion(raw: string): AISuggestion {
	// Try to parse JSON block from response
	const jsonMatch = raw.match(/```json\n?([\s\S]+?)\n?```/) ??
		raw.match(/\{[\s\S]*"action"[\s\S]*\}/);
	if (jsonMatch) {
		try {
			const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0]);
			return {
				action: parsed.action ?? raw,
				reasoning: parsed.reasoning ?? '',
				suggestedMessage: parsed.suggested_message ?? parsed.suggestedMessage,
			};
		} catch {
			// Fall through to plain text
		}
	}
	return { action: raw.trim(), reasoning: '' };
}

export async function getSuggestedFollowUp(
	person: PersonNote,
	personContent: string,
	settings: ArcadiaConnectSettings
): Promise<AISuggestion> {
	const hasAnthropic = settings.aiProvider === 'anthropic' && settings.anthropicApiKey;
	const hasOpenAI = settings.aiProvider === 'openai' && settings.openaiApiKey;

	if (!hasAnthropic && !hasOpenAI) {
		throw new Error('No AI API key configured. Add one in Settings > Arcadia Connect > AI Enrichment.');
	}

	const history = extractInteractionHistory(personContent);
	const contextLines: string[] = [
		`Contact: ${person.name}`,
		person.organization ? `Organization: ${person.organization}` : '',
		person.role ? `Role: ${person.role}` : '',
		person.dealStage ? `Deal stage: ${person.dealStage}` : '',
		person.dealValue ? `Deal value: $${person.dealValue}` : '',
		person.lastContact ? `Last contact: ${person.lastContact}` : '',
		person.nextFollowUp ? `Scheduled follow-up: ${person.nextFollowUp}` : '',
	].filter(Boolean);

	const prompt = `You are a CRM assistant. Based on this contact's profile and interaction history, suggest one specific, actionable follow-up action.

Contact profile:
${contextLines.join('\n')}

Recent interactions:
${history || '(No interactions logged yet)'}

Respond in this JSON format:
\`\`\`json
{
  "action": "Specific action to take (1-2 sentences)",
  "reasoning": "Why this action makes sense given the history",
  "suggested_message": "Optional: a short draft message or talking point"
}
\`\`\`

Keep the action concrete and immediate. Reference specific details from the history where possible.`;

	let raw: string;
	if (hasAnthropic) {
		raw = await callAnthropic(settings.anthropicApiKey, prompt);
	} else {
		raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
	}

	return parseAISuggestion(raw);
}

export class AISuggestionModal extends Modal {
	private person: PersonNote;
	private personManager: PersonManager;
	private settings: ArcadiaConnectSettings;

	constructor(
		app: App,
		person: PersonNote,
		personManager: PersonManager,
		settings: ArcadiaConnectSettings
	) {
		super(app);
		this.person = person;
		this.personManager = personManager;
		this.settings = settings;
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('arcadia-ai-modal');

		contentEl.createEl('h3', { text: `AI Suggestion: ${this.person.name}` });

		const loadingEl = contentEl.createDiv({ cls: 'arcadia-ai-loading', text: 'Analyzing interaction history...' });

		try {
			const content = await this.app.vault.read(this.person.file);
			const suggestion = await getSuggestedFollowUp(this.person, content, this.settings);

			loadingEl.remove();

			const actionEl = contentEl.createDiv({ cls: 'arcadia-ai-action' });
			actionEl.createDiv({ cls: 'arcadia-ai-label', text: 'Suggested action' });
			actionEl.createDiv({ cls: 'arcadia-ai-value', text: suggestion.action });

			if (suggestion.reasoning) {
				const reasonEl = contentEl.createDiv({ cls: 'arcadia-ai-reasoning' });
				reasonEl.createDiv({ cls: 'arcadia-ai-label', text: 'Reasoning' });
				reasonEl.createDiv({ cls: 'arcadia-ai-value mod-muted', text: suggestion.reasoning });
			}

			if (suggestion.suggestedMessage) {
				const msgEl = contentEl.createDiv({ cls: 'arcadia-ai-message' });
				msgEl.createDiv({ cls: 'arcadia-ai-label', text: 'Draft message' });
				const msgText = msgEl.createEl('textarea', {
					cls: 'arcadia-ai-draft',
					attr: { rows: '4' },
				});
				msgText.value = suggestion.suggestedMessage;
			}

			// Actions
			const buttons = contentEl.createDiv({ cls: 'arcadia-ai-buttons' });

			const appendBtn = buttons.createEl('button', {
				text: 'Append to note',
				cls: 'mod-cta',
			});
			appendBtn.addEventListener('click', () => {
				void (async () => {
					const noteContent = await this.app.vault.read(this.person.file);
					const today = new Date().toISOString().split('T')[0];
					const entry = `\n---\n**AI Suggestion** (${today})\n${suggestion.action}${suggestion.suggestedMessage ? '\n\n*Draft:* ' + suggestion.suggestedMessage : ''}\n`;
					await this.app.vault.modify(this.person.file, noteContent + entry);
					new Notice('Suggestion appended to note.');
					this.close();
				})();
			});

			const closeBtn = buttons.createEl('button', { text: 'Dismiss' });
			closeBtn.addEventListener('click', () => this.close());

		} catch (err) {
			loadingEl.remove();
			const errEl = contentEl.createDiv({ cls: 'arcadia-ai-error' });
			errEl.textContent = err instanceof Error ? err.message : 'Unknown error.';
			contentEl.createEl('button', { text: 'Close' })
				.addEventListener('click', () => this.close());
		}
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
