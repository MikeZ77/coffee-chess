import hh, { HyperScriptHelperFn } from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { GameChat } from '@Types';
import { updateChatMessage, GameConsoleAction, setDisableChat } from '../actions/index';
import { clientEvent } from '../utils/simple.utils';

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
  const {
    username,
    gameConsole: { disableChat },
    currentGame: { gameChat, pendingDrawOfferFrom, state: gameState }
  } = state;

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
          pendingDrawOfferFrom && pendingDrawOfferFrom !== username
            ? button(
                {
                  className: 'button is-rounded is-small is-info',
                  onclick: (e: Event) => {
                    e.preventDefault();
                    clientEvent.emit('event:game:draw:accept');
                  }
                },
                [
                  span({ className: 'icon is-small mx-2' }, [
                    i({ className: 'fas fa-regular fa-handshake' })
                  ])
                ]
              )
            : button(
                {
                  className: 'button is-rounded is-small is-warning',
                  disabled:
                    pendingDrawOfferFrom && pendingDrawOfferFrom === username
                      ? 'disabled'
                      : '',
                  onclick: (e: Event) => {
                    e.preventDefault();
                    if (gameState === 'IN_PROGRESS') {
                      clientEvent.emit('event:game:draw:offer');
                    }
                  }
                },
                'Draw'
              ),
          button(
            {
              className: 'button is-rounded is-small is-danger',
              onclick: (e: Event) => {
                e.preventDefault();
                if (gameState === 'IN_PROGRESS') {
                  clientEvent.emit('event:game:resign');
                }
              }
            },
            'Resign'
          )
        ])
      ])
    ]),
    div({ className: 'card-content p-0 pl-3', style: 'height: 24vh' }, [
      span(
        {
          className: 'icon is-small m-2',
          style: 'cursor: pointer; float: right;',
          onclick: () => {
            dispatch(setDisableChat(!disableChat));
          }
        },
        [
          disableChat
            ? i({ className: 'fas fa-solid fa-comment-slash' })
            : i({ className: 'fas fa-solid fa-comment' })
        ]
      ),
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
              clientEvent.emit('event:game:send:chat');
            }
          },
          [span({ className: 'icon' }, [i({ className: 'fas fa-regular fa-message' })])]
        )
      ])
    ])
  ]);
};

export default ConsoleGame;
