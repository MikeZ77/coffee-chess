import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { Action } from '../actions/actions';
import LoginLogo from './LoginLogo';
import {
  updateInputUsername,
  updateInputPassword,
  signInLoading,
  signIn
} from '../actions/actions';

const { form, div, label, input, button } = hh(h);
const { SERVER_FQDN } = process.env;

const LoginForm: Component<State, Action> = (dispatch, state) => {
  return form({ className: 'box' }, [
    LoginLogo(),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Username'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'text',
          value: state.username,
          oninput: (e: Event) => {
            dispatch(updateInputUsername((<HTMLInputElement>e.target).value));
          }
        })
      ])
    ]),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Password'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'password',
          value: state.password,
          oninput: (e: Event) =>
            dispatch(updateInputPassword((<HTMLInputElement>e.target).value))
        })
      ])
    ]),
    button(
      {
        className: `button is-primary mr-2 ${
          state.loading ? 'is-loading' : ''
        }`,
        disabled: state.loading ? 'disabled' : '',
        onclick: (e: Event) => {
          e.preventDefault();
          dispatch(signInLoading(true));
          dispatch(
            signIn({ username: state.username, password: state.password })
          );
        }
      },
      'Sign in'
    ),
    button(
      {
        className: 'button is-primary is-light',
        onclick: (e: Event) => {
          e.preventDefault();
          window.location.assign(`${SERVER_FQDN}/register`);
        }
      },
      'Register'
    )
  ]);
};

export default LoginForm;
