import { ApiGatewayV1ApiRouteProps } from 'sst/constructs';
import { Authorizers } from './authorizers';

export type Routes =
	| Record<string, ApiGatewayV1ApiRouteProps<keyof Authorizers>>
	| undefined;
