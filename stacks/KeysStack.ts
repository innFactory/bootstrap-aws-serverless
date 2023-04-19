import { StackContext } from 'sst/constructs';
import { Key } from 'aws-cdk-lib/aws-kms';
import { isDeployedStage } from 'stacks/common/isOfStage';
import * as iam from 'aws-cdk-lib/aws-iam';

export function KeysStack(context: StackContext) {
	const dynamoDBKey = isDeployedStage(context.app.stage)
		? new Key(context.stack, `DynamoDBKey-${context.app.stage}`, {
				description:
					'Customer-managed key for encrypting DynamoDB tables',
				alias: `DynamoDBKey-${context.app.stage}`,
				enableKeyRotation: true,
		  })
		: undefined;

	const policy = dynamoDBKey
		? new iam.PolicyStatement({
				actions: ['kms:*'],
				effect: iam.Effect.ALLOW,
				resources: [dynamoDBKey.keyArn],
		  })
		: undefined;

	const withDynamoDBKeyPolicy = <T>(otherPolicies: T[]) => {
		return policy ? [policy, ...otherPolicies] : otherPolicies;
	};

	return { dynamoDBKey, withDynamoDBKeyPolicy };
}
