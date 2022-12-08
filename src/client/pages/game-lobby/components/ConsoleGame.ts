import hh, { HyperScriptHelperFn } from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { GameChat } from '@Types';
import { updateChatMessage, GameConsoleAction, sendChatMessage } from '../actions/index';

const { div, footer, a, button, i, span, p, input } = hh(h);

const renderChatMessages = (messages: GameChat[]): HyperScriptHelperFn[] => {
  const chatElements: HyperScriptHelperFn[] = [];
  messages.forEach((content) => {
    const { username, message } = content;
    !username
      ? chatElements.push(p({ className: 'mb-1 is-italic' }, message))
      : chatElements.push(
          p({ className: 'mb-1' }, [
            span({ className: 'has-text-weight-semibold' }, `${username}: `),
            span(message)
          ])
        );
  });
  return chatElements;
};

const ConsoleGame: Component<State, GameConsoleAction> = (dispatch, state) => {
  const { gameChat } = state.currentGame;
  return div({ className: 'card' }, [
    div({ className: 'card-content', style: 'height: 48vh' }, [
      div({ className: 'content' }, [])
    ]),
    footer({ className: 'card-footer', style: 'border-bottom: 1px solid #ededed; ' }, [
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
          button({ className: 'button is-rounded is-small is-warning' }, 'Draw'),
          button({ className: 'button is-rounded is-small is-danger' }, 'Resign')
        ])
      ])
    ]),
    div({ className: 'card-content p-0 pl-3', style: 'height: 24vh' }, [
      div(
        '#game-chat',
        {
          className: 'content mb-1',
          style: 'height: 100%; overflow-y: auto; font-size: 0.9rem;'
        },
        renderChatMessages(gameChat)
      )
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
          [span({ className: 'icon' }, [i({ className: 'fas fa-regular fa-message' })])]
        )
      ])
    ])
  ]);
};

export default ConsoleGame;
