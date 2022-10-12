import { serializeFrameworkException } from "../protocols/Aws_restJson1";
import {
  Echo,
  EchoSerializer,
  EchoServerInput,
} from "./operations/Echo";
import {
  Length,
  LengthSerializer,
  LengthServerInput,
} from "./operations/Length";
import {
  NodeHttpHandler,
  streamCollector,
} from "@aws-sdk/node-http-handler";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@aws-sdk/protocol-http";
import {
  fromBase64,
  toBase64,
} from "@aws-sdk/util-base64-node";
import {
  fromUtf8,
  toUtf8,
} from "@aws-sdk/util-utf8-node";
import {
  InternalFailureException as __InternalFailureException,
  Mux as __Mux,
  Operation as __Operation,
  OperationInput as __OperationInput,
  OperationOutput as __OperationOutput,
  OperationSerializer as __OperationSerializer,
  SerializationException as __SerializationException,
  ServerSerdeContext as __ServerSerdeContext,
  ServiceException as __ServiceException,
  ServiceHandler as __ServiceHandler,
  SmithyFrameworkException as __SmithyFrameworkException,
  UnknownOperationException as __UnknownOperationException,
  ValidationCustomizer as __ValidationCustomizer,
  ValidationFailure as __ValidationFailure,
  generateValidationMessage as __generateValidationMessage,
  generateValidationSummary as __generateValidationSummary,
  isFrameworkException as __isFrameworkException,
  httpbinding,
} from "@aws-smithy/server-common";

export type StringWizardServiceOperations = "Echo" | "Length";
export interface StringWizardService<Context> {
  Echo: Echo<Context>
  Length: Length<Context>
}
const serdeContextBase = {
  base64Encoder: toBase64,
  base64Decoder: fromBase64,
  utf8Encoder: toUtf8,
  utf8Decoder: fromUtf8,
  streamCollector: streamCollector,
  requestHandler: new NodeHttpHandler(),
  disableHostPrefix: true
};
async function handle<S, O extends keyof S & string, Context>(
  request: __HttpRequest,
  context: Context,
  operationName: O,
  serializer: __OperationSerializer<S, O, __ServiceException>,
  operation: __Operation<__OperationInput<S[O]>, __OperationOutput<S[O]>, Context>,
  serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
  validationFn: (input: __OperationInput<S[O]>) => __ValidationFailure[],
  validationCustomizer: __ValidationCustomizer<O>
): Promise<__HttpResponse> {
  let input;
  try {
    input = await serializer.deserialize(request, {
      endpoint: () => Promise.resolve(request), ...serdeContextBase
    });
  } catch (error: unknown) {
    if (__isFrameworkException(error)) {
      return serializeFrameworkException(error, serdeContextBase);
    };
    return serializeFrameworkException(new __SerializationException(), serdeContextBase);
  }
  try {
    let validationFailures = validationFn(input);
    if (validationFailures && validationFailures.length > 0) {
      let validationException = validationCustomizer({ operation: operationName }, validationFailures);
      if (validationException) {
        return serializer.serializeError(validationException, serdeContextBase);
      }
    }
    let output = await operation(input, context);
    return serializer.serialize(output, serdeContextBase);
  } catch(error: unknown) {
    if (serializer.isOperationError(error)) {
      return serializer.serializeError(error, serdeContextBase);
    }
    console.log('Received an unexpected error', error);
    return serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
  }
}
export class StringWizardServiceHandler<Context> implements __ServiceHandler<Context> {
  private readonly service: StringWizardService<Context>;
  private readonly mux: __Mux<"StringWizard", StringWizardServiceOperations>;
  private readonly serializerFactory: <T extends StringWizardServiceOperations>(operation: T) => __OperationSerializer<StringWizardService<Context>, T, __ServiceException>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<StringWizardServiceOperations>;
  /**
   * Construct a StringWizardService handler.
   * @param service The {@link StringWizardService} implementation that supplies the business logic for StringWizardService
   * @param mux The {@link __Mux} that determines which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializerFactory A factory for an {@link __OperationSerializer} for each operation in StringWizardService that
   *                          handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    service: StringWizardService<Context>,
    mux: __Mux<"StringWizard", StringWizardServiceOperations>,
    serializerFactory:<T extends StringWizardServiceOperations>(op: T) => __OperationSerializer<StringWizardService<Context>, T, __ServiceException>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<StringWizardServiceOperations>
  ) {
    this.service = service;
    this.mux = mux;
    this.serializerFactory = serializerFactory;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      return this.serializeFrameworkException(new __UnknownOperationException(), serdeContextBase);
    }
    switch (target.operation) {
      case "Echo" : {
        return handle(request, context, "Echo", this.serializerFactory("Echo"), this.service.Echo, this.serializeFrameworkException, EchoServerInput.validate, this.validationCustomizer);
      }
      case "Length" : {
        return handle(request, context, "Length", this.serializerFactory("Length"), this.service.Length, this.serializeFrameworkException, LengthServerInput.validate, this.validationCustomizer);
      }
    }
  }
}

export const getStringWizardServiceHandler = <Context>(service: StringWizardService<Context>): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"StringWizard", keyof StringWizardService<Context>>([
    new httpbinding.UriSpec<"StringWizard", "Echo">(
      'POST',
      [
        { type: 'path_literal', value: "echo" },
      ],
      [
      ],
      { service: "StringWizard", operation: "Echo" }),
    new httpbinding.UriSpec<"StringWizard", "Length">(
      'GET',
      [
        { type: 'path_literal', value: "length" },
        { type: 'path' },
      ],
      [
      ],
      { service: "StringWizard", operation: "Length" }),
  ]);
  const serFn: (op: StringWizardServiceOperations) => __OperationSerializer<StringWizardService<Context>, StringWizardServiceOperations, __ServiceException> = (op) => {
    switch (op) {
      case "Echo": return new EchoSerializer();
      case "Length": return new LengthSerializer();
    }
  };
  const customizer: __ValidationCustomizer<StringWizardServiceOperations> = (ctx, failures) => {
    if (!failures) {
      return undefined;
    }
    return {
      name: "ValidationException",
      $fault: "client",
      message: __generateValidationSummary(failures),
      fieldList: failures.map(failure => ({
        path: failure.path,
        message: __generateValidationMessage(failure)
      }))
    };
  };
  return new StringWizardServiceHandler(service, mux, serFn, serializeFrameworkException, customizer);
}
