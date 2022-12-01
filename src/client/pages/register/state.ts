import { HttpRequest, Payloads } from '@Common/types';

export type State = {
  username: string;
  email: string;
  password: string;
  repeatedPassword: string;
  loading: boolean;
  pendingRequest: HttpRequest<Payloads> | null;
};

const state: State = {
  username: '',
  email: '',
  password: '',
  repeatedPassword: '',
  loading: false,
  pendingRequest: null
};

export default state;
