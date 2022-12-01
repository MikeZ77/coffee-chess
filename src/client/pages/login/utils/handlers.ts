import axios from 'axios';
import { signInLoading, Action } from '../actions/actions';
import { Dispatch } from '@Common/types';
import { successToast, errorToast } from '@Common/toast';

const { SERVER_FQDN } = process.env;

export const comingFromRegistration = () => {
  const message = localStorage.getItem('REGISTRATION_COMPLETE');
  if (message) {
    localStorage.removeItem('REGISTRATION_COMPLETE');
    successToast(message);
  }
};

export const handleResponse = () => {
  window.location.assign(`${SERVER_FQDN}`);
};

export const hanldeError = (error: Error, dispatch: Dispatch<Action>) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      errorToast(error.response.data);
      dispatch(signInLoading(false));
    }
  }
};
