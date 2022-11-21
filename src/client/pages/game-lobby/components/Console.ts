import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBarActions';
import ConsoleGame from './ConsoleGame';

const { div, p, button, span, i } = hh(h);

const Console: Component<State, NavBarAction> = (dispatch, state) => {
  return div({ className: 'container' }, [
    div({ className: 'field has-addons mb-0' }, [
      p({ className: 'control is-expanded' }, [
        button('#player-list', { className: 'button is-fullwidth' }, [
          span({ className: 'icon is-medium' }, [
            i({ className: 'fas fa-lg fa-solid fa-users' })
          ])
        ])
      ]),
      p({ className: 'control is-expanded' }, [
        button('#games', { className: 'button is-fullwidth' }, [
          span({ className: 'icon is-medium' }, [
            i({ className: 'fas fa-lg fa-solid fa-chess-board' })
          ])
        ])
      ]),
      p({ className: 'control is-expanded' }, [
        button('#current-game', { className: 'button is-fullwidth' }, [
          span({ className: 'icon is-medium' }, [
            i({ className: 'fas fa-lg fa-solid fa-people-arrows' })
          ])
        ])
      ]),
      p({ className: 'control is-expanded' }, [
        button('#chat', { className: 'button is-fullwidth' }, [
          span({ className: 'icon is-medium' }, [
            i({ className: 'fas fa-lg fa-solid fa-comments' })
          ])
        ])
      ])
    ]),
    ConsoleGame(dispatch, state)
  ]);
};

export default Console;
