import morgan, { StreamOptions } from 'morgan';
import Logger from '../../utils/logging.config';

const { DEV = 'dev' } = process.env;

const stream: StreamOptions = {
  write: (message) => Logger.http(message)
};
const skip = () => {
  return DEV !== 'dev';
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
