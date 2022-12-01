import '../../public/styles/bulma.styles.scss';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from '@Common/types';
import { State } from './state';
import { Action } from './actions/actions';
import RegisterForm from './components/RegisterForm';

const { div, section } = hh(h);

const view: View<State, Action> = (dispatch, state) => {
  return section({ className: 'hero is-fullheight' }, [
    div({ className: 'hero-body' }, [
      div({ className: 'container' }, [
        div({ className: 'columns' }, [
          div(
            {
              className: 'column is-4 is-offset-4'
            },
            [RegisterForm(dispatch, state)]
          )
        ])
      ])
    ])
  ]);
};

export default view;
