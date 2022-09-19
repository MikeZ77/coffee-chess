import '../../common/bulma.styles.scss';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from './types';
import { LoginForm } from './components/index';

const { div, section } = hh(h);

const view: View = (dispatch, store) => {
  const { loginModel } = store;

  return section({ className: 'hero is-fullheight' }, [
    div({ className: 'hero-body' }, [
      div({ className: 'container center-text' }, [
        div({ className: 'columns' }, [
          div({ className: 'column is-half is-offset-one-quarter' }, [
            LoginForm(dispatch, loginModel)
          ])
        ])
      ])
    ])
  ]);

  // return div({ className: 'columns is-centered' }, [
  //   div({ className: 'column is-one-third' }, [
  //     button({ className: 'button' }, 'Hello')
  //   ]),
  //   div({ className: 'column' }, [button({ className: 'button' }, 'Hello2')]),
  //   div({ className: 'column' }, [button({ className: 'button' }, 'Hello3')])
  // ]);
};

export default view;
