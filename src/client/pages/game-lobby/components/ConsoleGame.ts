import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBarActions';

const { div, footer, a, button, i, span, p } = hh(h);

const ConsoleGame: Component<State, NavBarAction> = (dispatch, state) => {
  return div({ className: 'card' }, [
    div({ className: 'card-content', style: 'height: 50vh' }, []),
    div({ className: 'content' }, [
      footer({ className: 'card-footer' }, [
        a({ className: 'card-footer-item' }, [
          div({ className: 'field has-addons' }, [
            p({ className: 'control m-0' }, [
              button({ className: 'button is-fullwidth' }, [
                span({ className: 'icon is-small' }, [
                  i({ className: 'fas fa-regular fa-backward' })
                ])
              ])
            ]),
            p({ className: 'control m-0' }, [
              button({ className: 'button is-fullwidth' }, [
                span({ className: 'icon is-small' }, [
                  i({ className: 'fas fa-regular fa-backward-step' })
                ])
              ])
            ]),
            p({ className: 'control m-0' }, [
              button({ className: 'button is-fullwidth' }, [
                span({ className: 'icon is-small' }, [
                  i({ className: 'fas fa-regular fa-forward-step' })
                ])
              ])
            ]),
            p({ className: 'control m-0' }, [
              button({ className: 'button is-fullwidth' }, [
                span({ className: 'icon is-small' }, [
                  i({ className: 'fas fa-regular fa-forward' })
                ])
              ])
            ])
          ])
        ]),
        a({ className: 'card-footer-item' }, [
          button({ className: 'button is-rounded is-warning' }, 'Draw')
        ]),
        a({ className: 'card-footer-item' }, [
          button({ className: 'button is-rounded is-danger' }, 'Resign')
        ])
      ])
    ])
  ]);
};

export default ConsoleGame;
