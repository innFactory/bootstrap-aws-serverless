import {
  LengthInput,
  LengthOutput,
  PalindromeException,
  ValidationException,
} from "../../models/models_0";
import {
  deserializeLengthRequest,
  serializeFrameworkException,
  serializeLengthResponse,
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
export class LengthHandler<Context> implements __ServiceHandler<Context> {
  private readonly operation: __Operation<LengthServerInput, LengthServerOutput, Context>;
  private readonly mux: __Mux<"StringWizard", "Length">;
  private readonly serializer: __OperationSerializer<StringWizardService<Context>, "Length", LengthErrors>;
  private readonly serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>;
  private readonly validationCustomizer: __ValidationCustomizer<"Length">;
  /**
   * Construct a Length handler.
   * @param operation The {@link __Operation} implementation that supplies the business logic for Length
   * @param mux The {@link __Mux} that verifies which service and operation are being invoked by a given {@link __HttpRequest}
   * @param serializer An {@link __OperationSerializer} for Length that
   *                   handles deserialization of requests and serialization of responses
   * @param serializeFrameworkException A function that can serialize {@link __SmithyFrameworkException}s
   * @param validationCustomizer A {@link __ValidationCustomizer} for turning validation failures into {@link __SmithyFrameworkException}s
   */
  constructor(
    operation: __Operation<LengthServerInput, LengthServerOutput, Context>,
    mux: __Mux<"StringWizard", "Length">,
    serializer: __OperationSerializer<StringWizardService<Context>, "Length", LengthErrors>,
    serializeFrameworkException: (e: __SmithyFrameworkException, ctx: __ServerSerdeContext) => Promise<__HttpResponse>,
    validationCustomizer: __ValidationCustomizer<"Length">
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
      console.log('Received a request that did not match software.amazon.smithy.demo#StringWizard.Length. This indicates a misconfiguration.');
      return this.serializeFrameworkException(new __InternalFailureException(), serdeContextBase);
    }
    return handle(request, context, "Length", this.serializer, this.operation, this.serializeFrameworkException, LengthServerInput.validate, this.validationCustomizer);
  }
}

export type Length<Context> = __Operation<LengthServerInput, LengthServerOutput, Context>

export interface LengthServerInput extends LengthInput {}
export namespace LengthServerInput {
  /**
   * @internal
   */
  export const validate: (obj: Parameters<typeof LengthInput.validate>[0]) => __ValidationFailure[] = LengthInput.validate;
}
export interface LengthServerOutput extends LengthOutput {}

export type LengthErrors = ValidationException | PalindromeException

export class LengthSerializer implements __OperationSerializer<StringWizardService<any>, "Length", LengthErrors> {
  serialize = serializeLengthResponse;
  deserialize = deserializeLengthRequest;

  isOperationError(error: any): error is LengthErrors {
    const names: LengthErrors['name'][] = ["ValidationException", "PalindromeException"];
    return names.includes(error.name);
  };

  serializeError(error: LengthErrors, ctx: ServerSerdeContext): Promise<__HttpResponse> {
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

export const getLengthHandler = <Context>(operation: __Operation<LengthServerInput, LengthServerOutput, Context>): __ServiceHandler<Context, __HttpRequest, __HttpResponse> => {
  const mux = new httpbinding.HttpBindingMux<"StringWizard", "Length">([
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
  const customizer: __ValidationCustomizer<"Length"> = (ctx, failures) => {
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
  return new LengthHandler(operation, mux, new LengthSerializer(), serializeFrameworkException, customizer);
}
