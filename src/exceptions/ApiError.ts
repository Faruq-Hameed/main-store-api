export class ApiError extends Error {
  public response: any;

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
    this.name = 'ApiError';
  }
}

export class LogicError extends Error {
  public response: any;

  constructor(message: string, response: any) {
    super(message);
    this.response = response;
    this.name = 'LogicError';
  }
}
