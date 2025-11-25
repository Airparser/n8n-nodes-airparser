import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AirparserApi implements ICredentialType {
	name = 'airparserApi';
	displayName = 'Airparser API';
	icon: Icon = 'file:../icons/airparser.svg';
	documentationUrl = 'https://help.airparser.com/';

	properties: INodeProperties[] = [
		{
			displayName: 'Airparser API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			hint: 'Get your API key from your <a href="https://app.airparser.com/account" target="_blank">Airparser account settings</a>',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.airparser.com',
			url: '/users/me',
			method: 'GET',
		},
	};
}
