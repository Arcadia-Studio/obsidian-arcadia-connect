import { TFile } from 'obsidian';
import type { LicenseStatus } from './license';

export interface ArcadiaConnectSettings {
	peopleFolder: string;
	triggerChar: string;
	showHoverCard: boolean;
	autoCreatePerson: boolean;
	licenseKey: string;
	licenseStatus: LicenseStatus | null;
	isPro: boolean;
}

export const DEFAULT_SETTINGS: ArcadiaConnectSettings = {
	peopleFolder: 'People/',
	triggerChar: '@',
	showHoverCard: true,
	autoCreatePerson: true,
	licenseKey: '',
	licenseStatus: null,
	isPro: false,
};

export interface PersonNote {
	file: TFile;
	name: string;
	email?: string;
	phone?: string;
	organization?: string;
	role?: string;
	birthday?: string;
	relationshipType?: string;
	tags?: string[];
	photo?: string;
}

export interface MentionInstance {
	personName: string;
	noteFile: TFile;
	noteName: string;
	line: number;
	date: string;
}

export const VIEW_TYPE_PEOPLE = 'arcadia-connect-people';

export const PERSON_NOTE_TEMPLATE = `---
type: person
name: "{{name}}"
email: ""
phone: ""
organization: ""
role: ""
birthday: ""
relationship-type: ""
tags: []
---

# {{name}}

## About

## Interaction Log
`;
