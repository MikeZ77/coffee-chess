import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component, Login } from '../types';
import { updateInputUsername, updateInputPassword } from '../actions';
import { redLogin } from '../reducers';
// import TempLogo from '../../../images/coffee_logo.png';

const { form, div, label, input, button } = hh(h);

const LoginForm: Component<Login> = (dispatch, loginModel) => {
  return form({ className: 'box' }, [
    // img({ src: TempLogo, alt: 'Coffee Chess', width: '75', height: '75' }),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Username'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'email',
          value: loginModel.username,
          oninput: (e) =>
            dispatch(updateInputUsername(e.target.value), redLogin(loginModel))
        })
      ])
    ]),
    div({ className: 'field' }, [
      label({ className: 'label' }, 'Password'),
      div({ className: 'control' }, [
        input({
          className: 'input',
          type: 'password',
          value: loginModel.password
          // oninput: (e) => dispatch(updateInputPassword(e.target.value))
        })
      ])
    ]),
    button({ className: 'button is-primary mr-2' }, 'Sign in'),
    button({ className: 'button is-primary is-light' }, 'Register')
  ]);
};

export default LoginForm;
