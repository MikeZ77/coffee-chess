import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction, openNewGameMenu, requestLogout } from '../actions/index';
import { clientEvent } from '../utils/simple.utils';
import sideNavBarGameTypes from './SideNavBarGameTypes';

const { div, aside, ul, li, a, span, i } = hh(h);
const { SERVER_FQDN } = process.env;

const sideNavBar: Component<State, NavBarAction> = (dispatch, state) => {
  const {
    sideNavBar: { newGameMenuOpen },
    currentGame: { state: gameState }
  } = state;
  return aside({ className: 'menu' }, [
    span({ className: 'icon is-large is-clickable mt-4 mb-4' }, [
      i({ className: 'fas fa-2x fa-solid fa-bars' })
    ]),
    div({ className: 'box p-2' }, [
      ul({ className: 'menu-list' }, [
        li({}, [
          a(
            {
              className: `${
                newGameMenuOpen ? 'is-active' : ''
              } columns is-flex is-vcentered mb-0`,
              onclick: () => {
                dispatch(openNewGameMenu(newGameMenuOpen));
              }
            },
            [
              span({ className: 'icon is-large mr-2' }, [
                i({ className: 'fas fa-xl fa-solid fa-chess-board' })
              ]),
              span('New Game')
            ]
          ),
          newGameMenuOpen ? sideNavBarGameTypes(dispatch, state) : div()
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
          a(
            {
              className: 'columns is-flex is-vcentered',
              onclick: () => {
                if (gameState === 'IN_PROGRESS') {
                  clientEvent.emit('event:game:resign');
                }
                dispatch(requestLogout(() => window.location.assign(`${SERVER_FQDN}/login`)));
              }
            },
            [
              span({ className: 'icon is-large mr-2' }, [
                i({ className: 'fas fa-xl fa-solid fa-power-off' })
              ]),
              span('Log Out')
            ]
          )
        ])
      ])
    ])
  ]);
};

export default sideNavBar;
