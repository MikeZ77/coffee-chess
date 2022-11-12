import { State } from './types';

const store: State = {
  username: '',
  password: '',
  loading: false,
  pendingRequest: null
};

export default store;
