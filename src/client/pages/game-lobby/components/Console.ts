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
        button({ className: 'button is-fullwidth' }, [
          span({ className: 'icon is-small' }, [
            i({ className: 'fas fa-solid fa-users' })
          ]),
          span('Players')
        ])
      ]),
      p({ className: 'control is-expanded' }, [
        button({ className: 'button is-fullwidth' }, [
          span({ className: 'icon is-small' }, [
            i({ className: 'fas fa-solid fa-chess-board' })
          ]),
          span('Games  ')
        ])
      ]),
      p({ className: 'control is-expanded' }, [
        button({ className: 'button is-fullwidth' }, [
          span({ className: 'icon is-small' }, [
            i({ className: 'fas fa-solid fa-people-arrows' })
          ]),
          span('Game   ')
        ])
      ])
    ]),
    ConsoleGame(dispatch, state)
  ]);
};

export default Console;
