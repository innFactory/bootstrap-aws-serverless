import {
  PalindromeException,
  ValidationException,
  ValidationExceptionField,
} from "../models/models_0";
import {
  EchoServerInput,
  EchoServerOutput,
} from "../server/operations/Echo";
import {
  LengthServerInput,
  LengthServerOutput,
} from "../server/operations/Length";
import {
  HttpRequest as __HttpRequest,
  HttpResponse as __HttpResponse,
} from "@aws-sdk/protocol-http";
import {
  expectNonNull as __expectNonNull,
  expectObject as __expectObject,
  expectString as __expectString,
} from "@aws-sdk/smithy-client";
import {
  Endpoint as __Endpoint,
  ResponseMetadata as __ResponseMetadata,
  SerdeContext as __SerdeContext,
} from "@aws-sdk/types";
import { calculateBodyLength } from "@aws-sdk/util-body-length-node";
import {
  ServerSerdeContext,
  ServiceException as __BaseException,
  NotAcceptableException as __NotAcceptableException,
  SmithyFrameworkException as __SmithyFrameworkException,
  UnsupportedMediaTypeException as __UnsupportedMediaTypeException,
  acceptMatches as __acceptMatches,
} from "@aws-smithy/server-common";

export const deserializeEchoRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<EchoServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey !== undefined && contentTypeHeaderKey !== null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey !== undefined && acceptHeaderKey !== null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: EchoServerInput = {
    message: undefined,
  };
  const data: { [key: string] : any } = __expectNonNull((__expectObject(await parseBody(output.body, context))), "body");
  if (data.message !== undefined && data.message !== null) {
    contents.message = __expectString(data.message);
  }
  return Promise.resolve(contents);
}

export const deserializeLengthRequest = async(
  output: __HttpRequest,
  context: __SerdeContext
): Promise<LengthServerInput> => {
  const contentTypeHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'content-type');
  if (contentTypeHeaderKey !== undefined && contentTypeHeaderKey !== null) {
    const contentType = output.headers[contentTypeHeaderKey];
    if (contentType !== undefined && contentType !== "application/json") {
      throw new __UnsupportedMediaTypeException();
    };
  };
  const acceptHeaderKey: string | undefined = Object.keys(output.headers).find(key => key.toLowerCase() === 'accept');
  if (acceptHeaderKey !== undefined && acceptHeaderKey !== null) {
    const accept = output.headers[acceptHeaderKey];
    if (!__acceptMatches(accept, "application/json")) {
      throw new __NotAcceptableException();
    };
  };
  const contents: LengthServerInput = {
    message: undefined,
  };
  const pathRegex = new RegExp("/length/(?<message>[^/]+)");
  const parsedPath = output.path.match(pathRegex);
  if (parsedPath?.groups !== undefined) {
    contents.message = decodeURIComponent(parsedPath.groups.message);
  }
  await collectBody(output.body, context);
  return Promise.resolve(contents);
}

export const serializeEchoResponse = async(
  input: EchoServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = {
    'content-type': "application/json",
  };
  let body: any;
  body = JSON.stringify({
    ...(input.message !== undefined && input.message !== null &&{ "message": input.message }),
  });
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeLengthResponse = async(
  input: LengthServerOutput,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  let statusCode: number = 200
  let headers: any = {
    'content-type': "application/json",
  };
  let body: any;
  body = JSON.stringify({
    ...(input.length !== undefined && input.length !== null &&{ "length": input.length }),
  });
  if (body && Object.keys(headers).map((str) => str.toLowerCase()).indexOf('content-length') === -1) {
    const length = calculateBodyLength(body);
    if (length !== undefined) {
      headers = { ...headers, 'content-length': String(length) };
    }
  }
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializeFrameworkException = async(
  input: __SmithyFrameworkException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  switch (input.name) {
    case "InternalFailure": {
      const statusCode: number = 500
      let headers: any = {
        'content-type': "application/json",
        'x-amzn-errortype': "InternalFailure",
      };
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "NotAcceptableException": {
      const statusCode: number = 406
      let headers: any = {
        'content-type': "application/json",
        'x-amzn-errortype': "NotAcceptableException",
      };
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "SerializationException": {
      const statusCode: number = 400
      let headers: any = {
        'content-type': "application/json",
        'x-amzn-errortype': "SerializationException",
      };
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnknownOperationException": {
      const statusCode: number = 404
      let headers: any = {
        'content-type': "application/json",
        'x-amzn-errortype': "UnknownOperationException",
      };
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
    case "UnsupportedMediaTypeException": {
      const statusCode: number = 415
      let headers: any = {
        'content-type': "application/json",
        'x-amzn-errortype': "UnsupportedMediaTypeException",
      };
      let body: any;
      body = "{}";
      return new __HttpResponse({
        headers,
        body,
        statusCode,
      });
    }
  }
}

export const serializeValidationExceptionError = async(
  input: ValidationException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 400
  let headers: any = {
    'content-type': "application/json",
    'x-amzn-errortype': "ValidationException",
  };
  let body: any;
  body = JSON.stringify({
    ...(input.fieldList !== undefined && input.fieldList !== null &&{ "fieldList": serializeAws_restJson1ValidationExceptionFieldList(input.fieldList, context) }),
    ...(input.message !== undefined && input.message !== null &&{ "message": input.message }),
  });
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

export const serializePalindromeExceptionError = async(
  input: PalindromeException,
  ctx: ServerSerdeContext
): Promise<__HttpResponse> => {
  const context: __SerdeContext = {
    ...ctx,
    endpoint: () => Promise.resolve({
      protocol: '',
      hostname: '',
      path: '',
    }),
  }
  const statusCode: number = 400
  let headers: any = {
    'content-type': "application/json",
    'x-amzn-errortype': "PalindromeException",
  };
  let body: any;
  body = JSON.stringify({
    ...(input.message !== undefined && input.message !== null &&{ "message": input.message }),
  });
  return new __HttpResponse({
    headers,
    body,
    statusCode,
  });
}

const serializeAws_restJson1ValidationExceptionField = (
  input: ValidationExceptionField,
  context: __SerdeContext
): any => {
  return {
    ...(input.message !== undefined && input.message !== null && { "message": input.message }),
    ...(input.path !== undefined && input.path !== null && { "path": input.path }),
  };
}

const serializeAws_restJson1ValidationExceptionFieldList = (
  input: (ValidationExceptionField)[],
  context: __SerdeContext
): any => {
  return input.filter((e: any) => e != null).map(entry => {
    if (entry === null) { return null as any; }
    return serializeAws_restJson1ValidationExceptionField(entry, context);
  });
}

const deserializeMetadata = (output: __HttpResponse): __ResponseMetadata => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"],
});

// Collect low-level response body stream to Uint8Array.
const collectBody = (streamBody: any = new Uint8Array(), context: __SerdeContext): Promise<Uint8Array> => {
  if (streamBody instanceof Uint8Array) {
    return Promise.resolve(streamBody);
  }
  return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
};

// Encode Uint8Array data into string with utf-8.
const collectBodyString = (streamBody: any, context: __SerdeContext): Promise<string> => collectBody(streamBody, context).then(body => context.utf8Encoder(body))

const isSerializableHeaderValue = (value: any): boolean =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  (!Object.getOwnPropertyNames(value).includes("length") ||
    value.length != 0) &&
  (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);

const parseBody = (streamBody: any, context: __SerdeContext): any => collectBodyString(streamBody, context).then(encoded => {
  if (encoded.length) {
    return JSON.parse(encoded);
  }
  return {};
});

/**
 * Load an error code for the aws.rest-json-1.1 protocol.
 */
const loadRestJsonErrorCode = (output: __HttpResponse, data: any): string => {
  const findKey = (object: any, key: string) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());

  const sanitizeErrorCode = (rawValue: string): string => {
    let cleanValue = rawValue;
    if (cleanValue.indexOf(":") >= 0) {
      cleanValue = cleanValue.split(":")[0];
    }
    if (cleanValue.indexOf("#") >= 0) {
      cleanValue = cleanValue.split("#")[1];
    }
    return cleanValue;
  };

  const headerKey = findKey(output.headers, "x-amzn-errortype");
  if (headerKey !== undefined) {
    return sanitizeErrorCode(output.headers[headerKey]);
  }

  if (data.code !== undefined) {
    return sanitizeErrorCode(data.code);
  }

  if (data["__type"] !== undefined) {
    return sanitizeErrorCode(data["__type"]);
  }

  return "";
};
