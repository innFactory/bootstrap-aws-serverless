import {
	postAuthentication,
	preAuthentication,
} from '@resources/auth/authFunctions';
import { StackContext, Cognito, CognitoProps } from 'sst/constructs';
import {
	AccountRecovery,
	OAuthScope,
	StringAttribute,
	UserPoolClientIdentityProvider,
	VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';

const createDefaultCognitoSettings = (
	context: StackContext,
	instanceId: string
): CognitoProps => ({
	login: ['email'],
	triggers: {
		preAuthentication: preAuthentication(context, instanceId),
		postAuthentication: postAuthentication(context, instanceId),
	},
	cdk: {
		userPoolClient: {
			authFlows: {
				userPassword: true,
				userSrp: true,
			},
			oAuth: {
				flows: {
					implicitCodeGrant: true,
				},
				scopes: [OAuthScope.EMAIL],
				callbackUrls: ['http://localhost:3000'], // TODO
			},
			supportedIdentityProviders: [
				UserPoolClientIdentityProvider.COGNITO,
			],
		},
		userPool: {
			userVerification: {
				emailSubject: 'Your Account',
				emailBody:
					'Thanks for signing up! Your verification link is {##Verify Email##}',
				emailStyle: VerificationEmailStyle.LINK,
			},
			standardAttributes: {
				email: {
					mutable: true,
					required: true,
				},
			},
			customAttributes: {
				registrationId: new StringAttribute({
					mutable: true,
					maxLen: 37,
				}),
			},
			accountRecovery: AccountRecovery.EMAIL_ONLY,
			selfSignUpEnabled: false,
			passwordPolicy: {
				minLength: 10,
				requireDigits: true,
				requireLowercase: true,
				requireUppercase: true,
			},
		},
	},
});

export const CognitoStack = (context: StackContext) => {
	/**
	 * Add the cognito instances which should be created here
	 */
	const cognitoInstancess = createInstances(
		[{ instanceId: 'example' }],
		context
	);

	const userPoolIdEnvs = Object.entries(cognitoInstancess).map(
		([instanceId, value]) => {
			return {
				[instanceId + '_USER_POOL_ID']: value.userPoolId,
				[instanceId + '_USER_POOL_CLIENT_ID']: value.userPoolClientId,
			};
		}
	);

	const resourceARNs = Object.entries(cognitoInstancess).map(([, value]) => {
		return value.userPoolArn;
	});

	const cognitoUserPools = Object.entries(cognitoInstancess).map(
		([, value]) => {
			return value.cdk.userPool;
		}
	);

	return {
		cognitoInstancess,
		userPoolIdEnvs: Object.assign({}, ...userPoolIdEnvs),
		resourceARNs,
		cognitoUserPools,
	};
};

const createInstances = (
	props: { instanceId: string }[],
	context: StackContext
) => {
	return props.reduce<{
		[instanceId: string]: Cognito;
	}>((stacks, { instanceId }) => {
		const next = { ...stacks };

		const cognito = new Cognito(
			context.stack,
			instanceId,
			createDefaultCognitoSettings(context, instanceId)
		);
		next[instanceId] = cognito;
		return next;
	}, {});
};
