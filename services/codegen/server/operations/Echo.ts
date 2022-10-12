import {
  EchoInput,
  EchoOutput,
  PalindromeException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeEchoRequest,
  serializeEchoResponse,
  serializeFrameworkException,
  serializePalindromeExceptionError,
  serializeValidationExceptionError,
} from "../../protocols/Aws_restJson1";
import { StringWizardService } from "../StringWizardService";
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
  ServerSerdeContext,
  ServiceException as __BaseException,
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
  ValidationCustomizer as __ValidationCustomizer,
  ValidationFailure as __ValidationFailure,
  generateValidationMessage as __generateValidationMessage,
  generateValidationSummary as __generateValidationSummary,
  isFrameworkException as __isFrameworkException,
  httpbinding,
} from "@aws-smithy/server-common";

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
export class EchoHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<EchoServerInput, EchoServerOutput, Context>;
  private readonly mux: __Mux<"StringWizard", "Echo">;
  private readonly serializer: __OperationSerializer<StringWizardService<Context>, "Echo", EchoErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"Echo">;
  /**
   * Construct a Echo handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for Echo
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for Echo that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<EchoServerInput, EchoServerOutput, Context>,
    mux: __Mux<"StringWizard", "Echo">,
    serializer: __OperationSerializer<StringWizardService<Context>, "Echo", EchoErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"Echo">
  ) {
    this.operation = operation;
    this.mux = mux;
    this.serializer = serializer;
    this.serializeFrameworkException = serializeFrameworkException;
    this.validationCustomizer = validationCustomizer;
  }
  async handle(request: __HttpRequest, context: Context): Promise<__HttpResponse> {
    const target = this.mux.match(request);
    if (target === undefined) {
      console.log('Received a request that did not match software.amazon.smithy.demo#StringWizard.Echo. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "Echo", this.serializer, this.operation, this.serializeFrameworkException, EchoServerInput.validate, this.validationCustomizer);
  }
}

export type Echo<Context> = __Operation<EchoServerInput, EchoServerOutput, Context>

export interface EchoServerInput extends EchoInput {}
export namespace EchoServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof EchoInput.validate>[0]) => __ValidationFailure[] = EchoInput.validate;
}
export interface EchoServerOutput extends EchoOutput {}

export type EchoErrors = ValidationException | PalindromeException

export class EchoSerializer implements __OperationSerializer<StringWizardService<any>, "Echo", EchoErrors> {
  serialize = serializeEchoResponse;
  deserialize = deserializeEchoRequest;

  isOperationError(error: any): error is EchoErrors {
    const names: EchoErrors['name'][] = ["ValidationException", "PalindromeException"];
    return names.includes(error.name);
  };

  serializeError(error: EchoErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
    switch (error.name) {
      case "ValidationException": {
        return serializeValidationExceptionError(error, ctx);
      }
      case "PalindromeException": {
        return serializePalindromeExceptionError(error, ctx);
      }
      default: {
        throw error;
      }
    }
  }

}

export const getEchoHandler = <Context>(operation: __Operation<EchoServerInput, EchoServerOutput, Context>): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"StringWizard", "Echo">([
    new httpbinding.UriSpec<"StringWizard", "Echo">(
      'POST',
      [
        { type: 'path_literal', value: "echo" },
      ],
      [
      ],
      { service: "StringWizard", operation: "Echo" }),
  ]);
  const customizer: __ValidationCustomizer<"Echo"> = (ctx, failures) => {
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
  return new EchoHandler(operation, mux, new EchoSerializer(), serializeFrameworkException, customizer);
}
