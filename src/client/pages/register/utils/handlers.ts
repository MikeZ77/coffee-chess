import { Dispatch } from '../../../common/types';
import axios, { AxiosResponse } from 'axios';
import { registerLoading, Action } from '../actions/actions';
import { errorToast } from '../../../common/toast';

const { SERVER_FQDN } = process.env;

export const handleResponse = (response: AxiosResponse) => {
  localStorage.setItem('REGISTRATION_COMPLETE', response.data.message);
  window.location.assign(`${SERVER_FQDN}/login`);
};

export const hanldeError = (error: Error, dispatch: Dispatch<Action>) => {
  if (axios.isAxiosError(error)) {
    dispatch(registerLoading(false));
    if (error.response) {
      errorToast(error.response.data);
    }
  }
};
