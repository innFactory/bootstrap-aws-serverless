export const prettyPrint = (value: unknown) => {
	if (typeof value === 'object' && value !== null) {
		return JSON.stringify(value);
	} else {
		return `${value}`;
	}
};
