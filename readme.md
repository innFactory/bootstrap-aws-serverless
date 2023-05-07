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

add the profile `innfactory-demo` into your aws config/credentials file in `~/.aws/`

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

-   [SST](https://sst.dev/) - a fullstack application framework to build apps on AWS
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

-   Here are the encrypted table definitions of dynamoDb

##### KeysStack

-   Manages the available KMS Keys

##### CognitoStack

-   Allows to create multiple cognito instances

##### AlarmStack

-   Creates cloudwatch alarms and registers them to a sns topic
-   The lambda handler of the sns topic sends the alarm to registered webhooks
    -   The webhooks are read from a aws secret which has to be of the format of `services/functions/alarms/domain/models/alarmRecipients.ts`
    -   Currently there is only an implementation for teams webhooks
-   It is also possible to register a sns topic to the aws chatbot. The aws chatbot can format alarms and send them to registered webhooks

#### Lambda Handlers

Source code for the lambda handlers can be found in `./services/functions/` and `./services/common/`. Entrypoints of handlers are always located in `./services/functions/<domain_object>/application/handler/` where `<domain_object>` stands for the name of a domain object.

##### Folder structure of domain objects

###### Application

API Logic / Entrypoint

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

## Contributors

<a href="https://github.com/anderha"><img src="https://avatars.githubusercontent.com/u/36031262?v=4" title="anderha" width="80" height="80"></a>
<a href="https://github.com/MoeQuadrat"><img src="https://avatars.githubusercontent.com/u/53238135?v=4" title="MoeQuadrat" width="80" height="80"></a>
