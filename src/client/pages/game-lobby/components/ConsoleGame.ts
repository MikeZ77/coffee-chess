import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import {
  updateChatMessage,
  GameConsoleAction,
  sendChatMessage
} from '../actions/index';

const { div, footer, a, button, i, span, p, input } = hh(h);

const ConsoleGame: Component<State, GameConsoleAction> = (dispatch, state) => {
  return div({ className: 'card' }, [
    div({ className: 'card-content', style: 'height: 48vh' }, [
      div({ className: 'content' }, [])
    ]),
    footer(
      { className: 'card-footer', style: 'border-bottom: 1px solid #ededed; ' },
      [
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
          div({ className: 'buttons' }, [
            button(
              { className: 'button is-rounded is-small is-warning' },
              'Draw'
            ),
            button(
              { className: 'button is-rounded is-small is-danger' },
              'Resign'
            )
          ])
        ])
      ]
    ),
    div({ className: 'card-content', style: 'height: 24vh' }, [
      div({ className: 'content' }, [])
    ]),

    div({ className: 'field has-addons' }, [
      p({ className: 'control is-expanded' }, [
        input(
          '#message-game-chat',
          {
            className: 'input',
            type: 'text',
            value: state.gameConsole.gameChatMessage,
            oninput: (e: Event) => {
              dispatch(updateChatMessage((<HTMLInputElement>e.target).value));
            }
          },
          []
        )
      ]),
      p({ className: 'control' }, [
        a(
          '#button-game-chat',
          {
            className: 'button is-success',
            onclick: () => {
              dispatch(sendChatMessage());
            }
          },
          [
            span({ className: 'icon' }, [
              i({ className: 'fas fa-regular fa-message' })
            ])
          ]
        )
      ])
    ])
  ]);
};

export default ConsoleGame;
