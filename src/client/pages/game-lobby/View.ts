import '../../common/bulma.styles.scss';
import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from './types';

const { div, section, aside, ul, li, a, span, i } = hh(h);

const view: View = (dispatch, state) => {
  return section({ className: 'hero is-fullheight' }, [
    div({ className: 'columns' }, [
      div({ className: 'column is-2' }, [
        aside({ className: 'menu' }, [
          div({ className: 'box p-2' }, [
            ul({ className: 'menu-list' }, [
              li({}, [
                // span('New Game')
                a({ className: 'is-active columns is-flex is-vcentered' }, [
                  span({ className: 'icon is-large' }, [
                    i({ className: 'fas fa-2x fa-solid fa-chess-board' })
                  ]),
                  span('New Game')
                ]),
                ul({}, [
                  li({}, [a('Game Type 1')]),
                  li({}, [a('Game Type 2')]),
                  li({}, [a('Game Type 3')])
                ])
              ]),
              li({}, [
                // span('New Game')
                a({ className: 'columns is-flex is-vcentered' }, [
                  span({ className: 'icon is-large' }, [
                    i({ className: 'fas fa-2x fa-solid fa-chess' })
                  ]),
                  span('Game History')
                ])
              ]),
              li({}, [
                // span('New Game')
                a({ className: 'columns is-flex is-vcentered' }, [
                  span({ className: 'icon is-large' }, [
                    i({ className: 'fas fa-2x fa-solid fa-gear' })
                  ]),
                  span('Settings')
                ])
              ])
            ])
          ])
        ])
      ]),
      div({ className: 'column is-7' }, []),
      div({ className: 'column is-3' }, [])
    ])
  ]);
};

export default view;
