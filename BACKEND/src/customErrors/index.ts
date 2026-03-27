export const _400 = 400;
export const _401 = 401;
export const _402 = 402;
export const _404 = 404;

export class BadRequest extends Error {
  code = 400;

  constructor(message: string) {
    super(message);
    this.name = "BadRequest";
  }
}

export class Unauthorized extends Error {
  code = 401;

  constructor(message: string) {
    super(message);
    this.name = "Unauthorized";
  }
}

export class NotFound extends Error {
  code = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFound";
  }
}

export class Forbidden extends Error {
  code = 403;

  constructor(message: string) {
    super(message);
    this.message = "Forbidden";
  }
}
