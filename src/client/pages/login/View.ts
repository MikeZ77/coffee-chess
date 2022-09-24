import '../../common/bulma.styles.scss';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from './types';
import { LoginForm } from './components/index';

const { div, section } = hh(h);

const view: View = (dispatch, state) => {
  return section({ className: 'hero is-fullheight' }, [
    div({ className: 'hero-body' }, [
      div({ className: 'container' }, [
        div({ className: 'columns' }, [
          div(
            {
              className: 'column is-4 is-offset-4'
            },
            [LoginForm(dispatch, state)]
          )
        ])
      ])
    ])
  ]);
};

export default view;
