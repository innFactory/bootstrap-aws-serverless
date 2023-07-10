import { BaseController } from '@common/application/baseController';
import { INJECTABLES } from '@common/injection/injectables';
import { lazyInject } from '@common/injection/decorator';
import { pipe } from 'fp-ts/lib/function';
import { LoginAttemptsService } from '../domain/interfaces/authService';
import { InvocationContext } from '@common/gateway/model/invocationContext';
import {
	PostAuthenticationTriggerEvent,
	PreAuthenticationTriggerEvent,
} from 'aws-lambda';
import { mapResultToApiProxyResult } from './mapper/authMapper';

class LoginAttemptsController extends BaseController {
	@lazyInject(INJECTABLES.LoginAttemptsService)
	private authService!: LoginAttemptsService;

	public preAuthentication = async (
		event: PreAuthenticationTriggerEvent,
		context: InvocationContext
	) =>
		pipe(
			this.authService.preAuthentication(event.userName, context),
			mapResultToApiProxyResult
		)();

	public postAuthentication = async (
		event: PostAuthenticationTriggerEvent,
		context: InvocationContext
	) =>
		pipe(
			this.authService.postAuthentication(event.userName, context),
			mapResultToApiProxyResult
		)();
}

export const authController = new LoginAttemptsController();
