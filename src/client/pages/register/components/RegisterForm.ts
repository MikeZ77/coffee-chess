import { toast } from 'bulma-toast';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from '@Common/types';
import { State } from '../state';
import { Action } from '../actions/actions';
import {
  updateInputUsername,
  updateInputPassword,
  updateInputRepeatedPassword,
  updateInputEmail,
  registerLoading,
  register
} from '../actions/actions';

const { form, div, label, input, button } = hh(h);

const RegisterForm: Component<State, Action> = (dispatch, state) => {
  const { username, email, password, repeatedPassword, loading } = state;
  return form({ className: 'box' }, [
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Username'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'text',
          value: username,
          oninput: (e: Event) => {
            e.preventDefault();
            dispatch(updateInputUsername((<HTMLInputElement>e.target).value));
          }
        })
      ])
    ]),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Email'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'email',
          value: email,
          oninput: (e: Event) => {
            e.preventDefault();
            dispatch(updateInputEmail((<HTMLInputElement>e.target).value));
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
          value: password,
          oninput: (e: Event) => {
            e.preventDefault();
            dispatch(updateInputPassword((<HTMLInputElement>e.target).value));
          }
        })
      ])
    ]),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Repeated Password'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'password',
          value: repeatedPassword,
          oninput: (e: Event) => {
            e.preventDefault();
            dispatch(
              updateInputRepeatedPassword((<HTMLInputElement>e.target).value)
            );
          }
        })
      ])
    ]),
    button(
      {
        className: `button is-primary mr-2 ${loading ? 'is-loading' : ''}`,
        disabled: loading ? 'disabled' : '',
        onclick: (e: Event) => {
          e.preventDefault();
          if (password == repeatedPassword) {
            dispatch(registerLoading(true));
            dispatch(register({ username, password, email }));
          } else {
            toast({
              message: 'Passwords do not match.',
              type: 'is-danger',
              position: 'bottom-center',
              dismissible: true,
              pauseOnHover: true,
              duration: 3000
            });
          }
        }
      },
      'Register'
    )
  ]);
};

export default RegisterForm;
