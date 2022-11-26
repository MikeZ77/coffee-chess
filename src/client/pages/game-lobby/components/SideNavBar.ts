import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBar';

const { div, aside, ul, li, a, span, i } = hh(h);

const sideNavBar: Component<State, NavBarAction> = (dispatch, state) => {
  return aside({ className: 'menu' }, [
    span({ className: 'icon is-large is-clickable mt-4 mb-4' }, [
      i({ className: 'fas fa-2x fa-solid fa-bars' })
    ]),
    div({ className: 'box p-2' }, [
      ul({ className: 'menu-list' }, [
        li({}, [
          // span('New Game')
          a({ className: 'is-active columns is-flex is-vcentered' }, [
            span({ className: 'icon is-large mr-2' }, [
              i({ className: 'fas fa-xl fa-solid fa-chess-board' })
            ]),
            span('New Game')
          ]),
          ul({}, [
            li({}, [
              a({ className: 'columns is-flex is-vcentered' }, [
                a('1-Minute'),
                [
                  span({ className: 'icon is-medium' }, [
                    i({ className: 'fas fa-circle-notch fa-spin' })
                  ])
                ]
              ])
            ]),
            li({}, [
              a({ className: 'columns is-flex is-vcentered' }, [
                a('5-Minute'),
                [
                  span({ className: 'icon is-medium' }, [
                    i({ className: 'fas fa-circle-notch fa-spin' })
                  ])
                ]
              ])
            ]),
            li({}, [
              a({ className: 'columns is-flex is-vcentered' }, [
                a('15-Minute'),
                [
                  span({ className: 'icon is-medium' }, [
                    i({ className: 'fas fa-circle-notch fa-spin' })
                  ])
                ]
              ])
            ])
          ])
        ]),
        li({}, [
          a({ className: 'columns is-flex is-vcentered' }, [
            span({ className: 'icon is-large mr-2' }, [
              i({ className: 'fas fa-xl fa-solid fa-chess' })
            ]),
            span('Game History')
          ])
        ]),
        li({}, [
          a({ className: 'columns is-flex is-vcentered' }, [
            span({ className: 'icon is-large mr-2' }, [
              i({ className: 'fas fa-xl fa-solid fa-gear' })
            ]),
            span('Settings')
          ])
        ]),
        li({}, [
          a({ className: 'columns is-flex is-vcentered' }, [
            span({ className: 'icon is-large mr-2' }, [
              i({ className: 'fas fa-xl fa-solid fa-power-off' })
            ]),
            span('Log Out')
          ])
        ])
      ])
    ])
  ]);
};

export default sideNavBar;
