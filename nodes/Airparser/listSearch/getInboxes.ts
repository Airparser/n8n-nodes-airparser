import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodeListSearchItems,
} from 'n8n-workflow';
import { airparserApiRequest } from '../shared/transport';

type InboxSearchItem = {
	id: string;
	name: string;
};

type InboxSearchResponse = {
	items: InboxSearchItem[];
	total_count: number;
};

export async function getInboxes(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const page = paginationToken ? +paginationToken : 1;
	const per_page = 100;

	let responseData: InboxSearchResponse = {
		items: [],
		total_count: 0,
	};

	try {
		responseData = await airparserApiRequest.call(this, 'GET', '/n8n/inboxes', {
			q: filter,
			page,
			per_page,
		});
	} catch {
		// ...
	}

	const results: INodeListSearchItems[] = responseData.items.map((item: InboxSearchItem) => ({
		name: item.name,
		value: item.id,
	}));

	const nextPaginationToken =
		page * per_page < responseData.total_count ? (page + 1).toString() : undefined;
	return { results, paginationToken: nextPaginationToken };
}
