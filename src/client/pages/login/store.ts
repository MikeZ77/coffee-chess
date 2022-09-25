import { State } from './types';

const store: State = {
  username: '',
  password: '',
  loading: false,
  pendingRequest: null,
  noitificationShow: false,
  notificationLevel: '',
  noitificationMessage: ''
};

export default store;
