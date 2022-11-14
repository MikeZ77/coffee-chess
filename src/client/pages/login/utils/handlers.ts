import axios from 'axios';
import { signInLoading, Action } from '../actions/actions';
import { Dispatch } from '../../../common/types';
import { successToast, errorToast } from '../../../common/toast';

export const comingFromRegistration = () => {
  const message = localStorage.getItem('REGISTRATION_COMPLETE');
  if (message) {
    localStorage.removeItem('REGISTRATION_COMPLETE');
    successToast(message);
  }
};

export const hanldeError = (error: Error, dispatch: Dispatch<Action>) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorToast(error.response.data);
      dispatch(signInLoading(false));
    }
  }
};
