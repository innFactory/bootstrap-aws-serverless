export const convertStatusCode = (statusCode: number | undefined) => {
	const statusCodeStart = statusCode?.toString().at(0);

	const stringifiedStatusCode =
		statusCodeStart === '4' || statusCodeStart === '5'
			? `${statusCodeStart}XX`
			: 'Unknown';

	return stringifiedStatusCode;
};
