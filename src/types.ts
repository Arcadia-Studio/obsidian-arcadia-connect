import { TFile } from 'obsidian';
import type { LicenseStatus } from './license';

export type AIProvider = 'anthropic' | 'openai';

export interface ArcadiaConnectSettings {
	peopleFolder: string;
	triggerChar: string;
	showHoverCard: boolean;
	autoCreatePerson: boolean;
	licenseKey: string;
	licenseStatus: LicenseStatus | null;
	isPro: boolean;
	// AI enrichment (BYOK)
	aiProvider: AIProvider;
	anthropicApiKey: string;
	openaiApiKey: string;
	openaiModel: string;
}

export const DEFAULT_SETTINGS: ArcadiaConnectSettings = {
	peopleFolder: 'People/',
	triggerChar: '@',
	showHoverCard: true,
	autoCreatePerson: true,
	licenseKey: '',
	licenseStatus: null,
	isPro: false,
	aiProvider: 'anthropic',
	anthropicApiKey: '',
	openaiApiKey: '',
	openaiModel: 'gpt-4o-mini',
};

export type DealStage =
	| 'lead'
	| 'prospect'
	| 'proposal'
	| 'negotiation'
	| 'closed-won'
	| 'closed-lost'
	| 'nurture';

export type RelationshipType =
	| 'client'
	| 'prospect'
	| 'partner'
	| 'vendor'
	| 'personal'
	| 'colleague'
	| (string & Record<never, never>);

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'other';

export interface PersonNote {
	file: TFile;
	name: string;
	email?: string;
	phone?: string;
	organization?: string;
	role?: string;
	birthday?: string;
	relationshipType?: RelationshipType;
	tags?: string[];
	photo?: string;
	// CRM fields
	lastContact?: string;       // ISO date string YYYY-MM-DD
	nextFollowUp?: string;      // ISO date string YYYY-MM-DD
	followUpStatus?: 'pending' | 'done' | 'snoozed';
	dealStage?: DealStage;
	dealValue?: number;
	notes?: string;
}

export interface InteractionEntry {
	date: string;          // ISO date YYYY-MM-DD
	type: InteractionType;
	summary: string;
	contactName: string;
	contactFile: TFile;
}

export interface MentionInstance {
	personName: string;
	noteFile: TFile;
	noteName: string;
	line: number;
	date: string;
}

export const VIEW_TYPE_PEOPLE = 'arcadia-connect-people';
export const VIEW_TYPE_TIMELINE = 'arcadia-connect-timeline';
export const VIEW_TYPE_PIPELINE = 'arcadia-connect-pipeline';

export const PERSON_NOTE_TEMPLATE = `---
file-role: crm-contact
type: person
name: "{{name}}"
email: ""
phone: ""
organization: ""
role: ""
birthday: ""
relationship-type: ""
last-contact: ""
next-follow-up: ""
follow-up-status: pending
deal-stage: ""
deal-value: 0
tags:
  - type/crm-contact
---

# {{name}}

## About

## Interaction Log

`;

export const INTERACTION_TYPES: Record<InteractionType, string> = {
	call: '📞 Call',
	email: '📧 Email',
	meeting: '🤝 Meeting',
	note: '📝 Note',
	other: '💬 Other',
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
	lead: 'Lead',
	prospect: 'Prospect',
	proposal: 'Proposal',
	negotiation: 'Negotiation',
	'closed-won': 'Closed Won',
	'closed-lost': 'Closed Lost',
	nurture: 'Nurture',
};

export const DEAL_STAGE_ORDER: DealStage[] = [
	'lead',
	'prospect',
	'proposal',
	'negotiation',
	'closed-won',
	'closed-lost',
	'nurture',
];
