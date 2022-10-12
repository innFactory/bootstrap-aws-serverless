import { ExceptionOptionType as __ExceptionOptionType } from "@aws-sdk/smithy-client";
import { MetadataBearer as $MetadataBearer } from "@aws-sdk/types";
import {
  ServiceException as __BaseException,
  CompositeValidator as __CompositeValidator,
  MultiConstraintValidator as __MultiConstraintValidator,
  NoOpValidator as __NoOpValidator,
  RequiredValidator as __RequiredValidator,
  ValidationFailure as __ValidationFailure,
} from "@aws-smithy/server-common";

/**
 * Describes one specific validation failure for an input member.
 */
export interface ValidationExceptionField {
  /**
   * A JSONPointer expression to the structure member whose value failed to satisfy the modeled constraints.
   */
  path: string | undefined;

  /**
   * A detailed description of the validation failure.
   */
  message: string | undefined;
}

export namespace ValidationExceptionField {
  /**
   * @internal
   */
  export const filterSensitiveLog = (obj: ValidationExceptionField): any => ({
    ...obj,
  })
  const memberValidators : {
    path?: __MultiConstraintValidator<string>,
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: ValidationExceptionField, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "path": {
            memberValidators["path"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
          case "message": {
            memberValidators["message"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("path").validate(obj.path, `${path}/path`),
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

/**
 * A standard error for input validation failures.
 * This should be thrown by services when a member of the input structure
 * falls outside of the modeled or documented constraints.
 */
export class ValidationException extends __BaseException {
  readonly name: "ValidationException" = "ValidationException";
  readonly $fault: "client" = "client";
  /**
   * A list of specific failures encountered while validating the input.
   * A member can appear in this list more than once if it failed to satisfy multiple constraints.
   */
  fieldList?: (ValidationExceptionField)[];

  constructor(opts: __ExceptionOptionType<ValidationException, __BaseException>) {
    super({
      name: "ValidationException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, ValidationException.prototype);
    this.fieldList = opts.fieldList;
  }
}

export interface EchoInput {
  message?: string;
}

export namespace EchoInput {
  /**
   * @internal
   */
  export const filterSensitiveLog = (obj: EchoInput): any => ({
    ...obj,
  })
  const memberValidators : {
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: EchoInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "message": {
            memberValidators["message"] = new __NoOpValidator();
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

export interface EchoOutput {
  message?: string;
}

export namespace EchoOutput {
  /**
   * @internal
   */
  export const filterSensitiveLog = (obj: EchoOutput): any => ({
    ...obj,
  })
  const memberValidators : {
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: EchoOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "message": {
            memberValidators["message"] = new __NoOpValidator();
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

/**
 * For some reason, this service does not like palindromes!
 */
export class PalindromeException extends __BaseException {
  readonly name: "PalindromeException" = "PalindromeException";
  readonly $fault: "client" = "client";
  constructor(opts: __ExceptionOptionType<PalindromeException, __BaseException>) {
    super({
      name: "PalindromeException",
      $fault: "client",
      ...opts
    });
    Object.setPrototypeOf(this, PalindromeException.prototype);
  }
}

export interface LengthInput {
  message: string | undefined;
}

export namespace LengthInput {
  /**
   * @internal
   */
  export const filterSensitiveLog = (obj: LengthInput): any => ({
    ...obj,
  })
  const memberValidators : {
    message?: __MultiConstraintValidator<string>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: LengthInput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "message": {
            memberValidators["message"] = new __CompositeValidator<string>([
              new __RequiredValidator(),
            ]);
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("message").validate(obj.message, `${path}/message`),
    ];
  }
}

export interface LengthOutput {
  length?: number;
}

export namespace LengthOutput {
  /**
   * @internal
   */
  export const filterSensitiveLog = (obj: LengthOutput): any => ({
    ...obj,
  })
  const memberValidators : {
    length?: __MultiConstraintValidator<number>,
  } = {};
  /**
   * @internal
   */
  export const validate = (obj: LengthOutput, path: string = ""): __ValidationFailure[] => {
    function getMemberValidator<T extends keyof typeof memberValidators>(member: T): NonNullable<typeof memberValidators[T]> {
      if (memberValidators[member] === undefined) {
        switch (member) {
          case "length": {
            memberValidators["length"] = new __NoOpValidator();
            break;
          }
        }
      }
      return memberValidators[member]!!;
    }
    return [
      ...getMemberValidator("length").validate(obj.length, `${path}/length`),
    ];
  }
}
