 buildscript {
     repositories {
         mavenCentral()
     }
     dependencies {
        "classpath" ("software.amazon.smithy.typescript:smithy-typescript-codegen:0.15.0")
        "classpath" ("software.amazon.smithy.typescript:smithy-aws-typescript-codegen:0.15.0")
        "classpath" ("software.amazon.smithy:smithy-cli:1.32.0")
     }
 }

 plugins {
     id("software.amazon.smithy").version("0.7.0")
 }

 repositories {
     mavenLocal()
     mavenCentral()
 }

 dependencies {
     implementation("software.amazon.smithy:smithy-model:1.32.0")
     implementation("software.amazon.smithy:smithy-validation-model:1.32.0")
     implementation("software.amazon.smithy:smithy-openapi:1.32.0")
     implementation("software.amazon.smithy:smithy-aws-traits:1.32.0")
     implementation("software.amazon.smithy:smithy-aws-apigateway-openapi:1.32.0")
 }