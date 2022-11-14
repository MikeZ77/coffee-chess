import { HttpRequest, Payloads } from 'common/types';

export type State = {
  username: string;
  password: string;
  loading: boolean;
  pendingRequest: HttpRequest<Payloads> | null;
};

const state: State = {
  username: '',
  password: '',
  loading: false,
  pendingRequest: null
};

export default state;
