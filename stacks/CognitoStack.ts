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
	stackId: string
): CognitoProps => ({
	login: ['email'],
	triggers: {
		preAuthentication: preAuthentication(context, stackId),
		postAuthentication: postAuthentication(context, stackId),
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
				callbackUrls: ['http://test.local:3000'], // TODO
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
	const stacks = createStacks([], context);

	const userPoolIdEnvs = Object.entries(stacks).map(([stackId, value]) => {
		return {
			[stackId + 'USER_POOL_ID']: value.userPoolId,
			[stackId + 'USER_POOL_CLIENT_ID']: value.userPoolClientId,
		};
	});

	const resourceARNs = Object.entries(stacks).map(([, value]) => {
		return value.userPoolArn;
	});

	const cognitoUserPools = Object.entries(stacks).map(([, value]) => {
		return value.cdk.userPool;
	});

	return { stacks, userPoolIdEnvs, resourceARNs, cognitoUserPools };
};

const createStacks = (props: { stackId: string }[], context: StackContext) => {
	return props.reduce<{
		[stackId: string]: Cognito;
	}>((stacks, { stackId }) => {
		const next = { ...stacks };

		const cognito = new Cognito(
			context.stack,
			stackId,
			createDefaultCognitoSettings(context, stackId)
		);
		next[stackId] = cognito;
		return next;
	}, {});
};
