import type { INodeProperties } from 'n8n-workflow';

export const inboxSelect: INodeProperties = {
	displayName: 'Inbox',
	name: 'inbox',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'Inbox',
			name: 'list',
			type: 'list',
			placeholder: 'Select an inbox...',
			typeOptions: {
				searchListMethod: 'getInboxes',
				searchable: true,
				searchFilterRequired: false,
			},
		},
	],
};
