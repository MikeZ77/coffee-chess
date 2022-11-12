import '../../common/bulma.styles.scss';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from './types';
import RegisterForm from './components/RegisterForm';

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
            [RegisterForm(dispatch, state)]
          )
        ])
      ])
    ])
  ]);
};

export default view;
