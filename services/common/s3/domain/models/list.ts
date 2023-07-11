import { S3Object } from './s3Object';

export interface ListOptions {
	all?: boolean;
	tokenForNext?: string;
}

export interface ListResult {
	objects: Pick<S3Object, 'name'>[];
	tokenForNext: string | undefined;
}
