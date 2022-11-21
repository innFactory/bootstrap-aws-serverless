export const prettyPrint = (value: unknown) => {
	if (value instanceof Error) {
		return JSON.stringify({
			message: value.message,
			stack: value.stack,
		});
	} else if (typeof value === 'object' && value !== null) {
		return JSON.stringify(value);
	} else {
		return `${value}`;
	}
};
