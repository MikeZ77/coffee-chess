// interface ErrorInterface extends ErrorConstructor {
//   code: number;
// }

// class ServerError extends Error implements ErrorInterface {
//   constructor(message) {
//     super(message);
//     this.name = this.constructor.name;
//     Error.captureStackTrace(this, this.constructor);
//     this.code = message;
//   }
// }
