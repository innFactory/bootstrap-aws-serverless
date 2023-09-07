import { getAwsSecret } from '@common/aws/secret';
import { prettyPrint } from '@common/logging/prettyPrint';
import { errorResults } from '@common/results/errorResults';
import { SNSEventRecord, SNSHandler } from 'aws-lambda';
import axios, { AxiosError } from 'axios';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import {
	AlarmRecipients,
	TeamsWebhookAlarmRecipient,
	WebhookAlarmRecipient,
	WebhookAlarmRecipients,
} from './domain/models/alarmRecipients';
import { isDeployedStage, isTestStage } from 'stacks/common/isOfStage';
import { Logger } from '@aws-lambda-powertools/logger';
import { ApiGatewayHandler } from '@common/gateway/handler/apiGatewayHandler';

export const handler: SNSHandler = async (event, context) => {
	const invocationContext =
		ApiGatewayHandler.createInvocationContextOrThrow(context);

	await pipe(
		getAwsSecret<AlarmRecipients>(
			'alarm-recipients',
			invocationContext.logger
		),
		taskEither.chain((recipients) =>
			taskEither.tryCatch(
				async () => {
					await Promise.all(
						event.Records.map((record) =>
							recipients.webhooks.map((webhook) =>
								sendToWebhook(
									record,
									webhook,
									invocationContext.stage,
									invocationContext.logger
								)
							)
						)
					);
					return;
				},
				(error) => {
					const axiosError = error as AxiosError;
					invocationContext.logger.error(
						'Error sending alarms to webhooks',
						`${axiosError.response?.status} - ${prettyPrint(
							axiosError.response?.data
						)}`
					);
					return errorResults.internalServerError(
						'Error sending alarms to webhooks'
					);
				}
			)
		)
	)();

	return;
};

const sendToWebhook = (
	record: SNSEventRecord,
	webhook: WebhookAlarmRecipient<WebhookAlarmRecipients>,
	stage: string,
	logger: Logger
) => {
	if (webhook.type === 'TEAMS') {
		return sendToTeams(
			record,
			webhook as TeamsWebhookAlarmRecipient,
			isDeployedStage(stage) || isTestStage(stage)
				? stage
				: `local - ${stage}`
		);
	} else {
		logger.error('Unknown webhook type', webhook.type);
		return Promise.reject(`Unknown webhook type ${webhook.type}`);
	}
};

const sendToTeams = (
	record: SNSEventRecord,
	teamsWebhookAlarmRecipient: TeamsWebhookAlarmRecipient,
	stage: string
) => {
	const alarmDetails = JSON.parse(record.Sns.Message);

	return axios.post(
		teamsWebhookAlarmRecipient.url,
		JSON.stringify({
			'@type': 'MessageCard',
			'@context': 'http://schema.org/extensions',
			themeColor: '0076D7',
			summary: `Alarm - ${stage} - ${alarmDetails['AlarmName']}`,
			sections: [
				{
					activityTitle: `Alarm`,
					activitySubtitle: `Stage: ${stage}`,
					facts: [
						{
							name: 'Stage',
							value: stage,
						},
						{
							name: 'Name',
							value: alarmDetails['AlarmName'],
						},
					],
					markdown: true,
				},
			],
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
};
