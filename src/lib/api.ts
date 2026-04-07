/** @format */

const API = process.env.NEXT_PUBLIC_API_URL;

export const post = async (url: string, data: any) => {
	const res = await fetch(`${API}${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return res.json();
};
