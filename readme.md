## QuickStart

Follow the steps below to get started with the project.

### You need:

typescript, nodejs, npm, gradle, smithy-vs code extension

### Codegen:

to generate the code, run the following command in the root directory of the project:

```bash
npm run codegen
```

### Start local SST development

```bash
npm run start
```

If this is the first time. SST will prompt you to set a local stage name.
Enter a name to identify YOUR stage and press enter.
This will create a new stack in the default AWS account.
You can change the stack name in the `.sst` Folder in the `stage` File.
