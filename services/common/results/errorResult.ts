export interface ErrorResult {
	statusCode: number;
	body: ErrorResultBody;
}

interface ErrorResultBody {
	message: string;
}
