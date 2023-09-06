# AWS Serverless (SST) Bootstrap

###### SST, Serverless, Typescript, Smithy

Bootstrap a AWS service with its ressources with SST

## QuickStart

Follow the steps below to get started with the project.

### Prerequisites

typescript, nodejs, npm, gradle, smithy-vs code extension

### Install dependencies

install the dependencies

```bash
npm i
```

### Generate API code as defined in smithy

to generate the code, run the following command in the root directory of the project:

```bash
npm run codegen
```

### Configure your aws account

#### Local config/credentials file

add the profile `innfactory-demo` into your aws config/credentials file in `~/.aws/`

#### Single sign on

1. Use `aws configure sso` to start the profile setup
2. As start URL set the URL shown in IAM Identity Provider (the url to the AWS access portal) and SSO Region to `eu-central-1`
3. (If already configured skip to step 4) You will be promted to verify your identity in your browser, select the profile that is authorized the aws account.
    > **_NOTE:_** If your microsoft isn't set to remember your login it might falsely select an unauthorized account.
4. Select the aws account and role that you want to setup, make sure to name the profile `innfactory-demo`
5. run `npm run login`

### Start local SST development

```bash
npm run start
```

If this is the first time. SST will prompt you to set a local stage name.
Enter a name to identify YOUR stage and press enter.
This will create a new stack in the AWS account.
You can change the stack name in the `.sst` Folder in the `stage` File.

## Documentation

### Knowledgebase

This service heavily uses some libraries you might want to learn more about

-   [SST](https://sst.dev/) - a fullstack application framework to build apps on AWS, based on [CDK](https://aws.amazon.com/de/cdk/)
-   [smithy](https://smithy.io/2.0/index.html) - a interface definition language
-   [fp-ts](https://gcanti.github.io/fp-ts/) - typed function programming for typescript

### Architecture

#### API Definition

Smithy API models are defined in `./smithy-codegen/model/`. Generated code can be found in `./smithy-codegen/build/smithyprojections/smithy-codegen/source/typescript-ssdk-codegen/src/models`. Generated OpenAPI spec can be found in `smithy-codegen/build/smithyprojections/smithy-codegen/source/openapi/`. Use the OpenAPI spec to generate a client e.g. for postman.

#### Infrastructure / AWS Ressources

AWS Ressources are defined in `./stacks/` using SST and/or CDK. Entrypoint of the SST Application is `./sst.config.ts`

##### ApiStack

-   Definition of the api gateway(s) with its routes and lambda handlers
-   As an example you can find a api gateway v1, which is used for REST endpoints
-   Api gateway v2 is a HTTP and web socket api gateway

##### DynamoDbStack

-   Defines the (encrypted) tables of dynamoDb

##### KeysStack

-   Manages the available KMS Keys

##### CognitoStack

-   Allows to create multiple cognito instances, differentiated by a predefined id
-   Authorization via custom lambda handler `services/functions/auth/application/handler/cognitoLambdaAuthorizer.ts` to authenticate a user in one of many cognito instances
-   Example interactions with Cognito are found in `services/functions/users/infrastructure/cognitoRepository.ts`
    -   Add the `userPoolIdEnvs` to the environment of a lambda handler to receive the cognito user pool id in `CognitoRepository`
-   Registers pre and post authentication lambda handlers to manage failed login attempts
    -   pre: increments counter and blocks requests if above threshold
    -   post: resets counter after successful login
    -   remove them or reset counter e.g. after change of password -> refer to `setPassword` in `services/functions/users/domain/services/userServiceImpl.ts`

##### AlarmStack

-   Creates cloudwatch alarms and registers them to a sns topic
-   The lambda handler of the sns topic sends the alarm to registered webhooks
    -   The webhooks are read from a aws secret which has to be of the format of `services/functions/alarms/domain/models/alarmRecipients.ts`
    -   Currently there is only an implementation for teams webhooks
-   It is also possible to register a sns topic to the aws chatbot. The aws chatbot can format alarms and send them to registered webhooks

##### QueuesStack

-   Creates SQS Queues

#### Lambda Handlers

Source code for the lambda handlers can be found in `./services/functions/` and `./services/common/`. Entrypoints of handlers are always located in `./services/functions/<domain_object>/application/handler/` where `<domain_object>` stands for the name of a domain object.

##### Folder structure of domain objects

###### Application

-   API Logic / Entrypoint
-   Handlers for SQS Messages, refer to `./services/functions/users/application/handler/deleteByQueue.ts` for an example

###### Domain

Business Logic

###### Infrastructure

Abstraction Logic to external services, like third party APIs, databases, auth providers etc.

### Logging, Tracing and Metrics

Logging, Tracing and Metrics are done with [AWS Powertools](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/)

### Testing

Testing is done via SST and [vitest](https://vitest.dev/). Tests are located at `./services/test/`.

Deploy a test stage

```bash
npm run deploy:test
```

Run the tests

```bash
npm run test
```

### CDK Assets

CDK is ramping up assets in S3 with each deploy which won't be deleted automatically. Refer to this [issue](https://github.com/aws/aws-cdk-rfcs/issues/64) for further information about the difficulties of deleting CDK assets and to track a future built in feature. This app makes use of a 3. party tool called [Toolkit cleaner](https://github.com/jogold/cloudstructs/blob/master/src/toolkit-cleaner) to determine and delete old and unused CDK assets. It is initialized in [CdkAssetsCleanupStack](./stacks/CdkAssetsCleanupStack.ts). Deploy it once per AWS Account. Either as scheduled job or execute it manually as needed in the cloud console via the step function menu.

### Deployment

Opt out of [anonymous telemetry collection](https://docs.sst.dev/anonymous-telemetry): `npx sst telemetry disable`

## Contributors

<a href="https://github.com/anderha"><img src="https://avatars.githubusercontent.com/u/36031262?v=4" title="anderha" width="80" height="80"></a>
<a href="https://github.com/MoeQuadrat"><img src="https://avatars.githubusercontent.com/u/53238135?v=4" title="MoeQuadrat" width="80" height="80"></a>
