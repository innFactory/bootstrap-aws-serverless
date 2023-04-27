export interface AlarmRecipients {
	webhooks: WebhookAlarmRecipient<WebhookAlarmRecipients>[];
}

export type WebhookAlarmRecipients = 'TEAMS';

export interface WebhookAlarmRecipient<T extends WebhookAlarmRecipients> {
	type: T;
}

export interface TeamsWebhookAlarmRecipient
	extends WebhookAlarmRecipient<'TEAMS'> {
	url: string;
}
