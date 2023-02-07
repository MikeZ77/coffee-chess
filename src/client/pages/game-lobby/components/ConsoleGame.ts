import hh, { HyperScriptHelperFn } from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { GameChat, GameHistory } from '@Types';
import { updateChatMessage, GameConsoleAction, setDisableChat } from '../actions/index';
import { clientEvent, parsePositionId } from '../utils/simple.utils';

const { div, footer, a, button, i, span, p, br, input } = hh(h);

const renderChatMessages = (
  messages: GameChat[],
  disableChat: boolean
): HyperScriptHelperFn[] => {
  const chatElements: HyperScriptHelperFn[] = [];
  messages.forEach((content) => {
    const { username, message } = content;
    if (!username) {
      chatElements.push(p({ className: 'mb-1 is-italic' }, message));
    } else if (username && !disableChat) {
      chatElements.push(
        p({ className: 'mb-1' }, [
          span({ className: 'has-text-weight-semibold' }, `${username}: `),
          span(message)
        ])
      );
    }
  });
  return chatElements;
};

const getPieceIcon = (piece: string, index: number): HyperScriptHelperFn => {
  const black = index % 2 === 1;
  switch (piece) {
    case 'p': {
      return span({ className: 'icon is-small' }, [
        i({ className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-pawn fa-xs` })
      ]);
    }
    case 'n':
      return span({ className: 'icon is-small' }, [
        i({
          className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-knight fa-xs`
        })
      ]);
    case 'b':
      return span({ className: 'icon is-small' }, [
        i({
          className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-bishop fa-xs`
        })
      ]);
    case 'r':
      return span({ className: 'icon is-small' }, [
        i({ className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-rook fa-xs` })
      ]);
    case 'q':
      return span({ className: 'icon is-small' }, [
        i({ className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-queen fa-xs` })
      ]);
    case 'k':
      return span({ className: 'icon is-small' }, [
        i({ className: `fas ${black ? 'fa-solid' : 'fa-regular'} fa-chess-king fa-xs` })
      ]);
    default:
      return span({ className: 'icon is-small' }, [
        i({ className: 'fa-regular question fa-xs' })
      ]);
  }
};

const renderMoveHistory = (history: GameHistory[]): HyperScriptHelperFn[] => {
  const moveHistory: HyperScriptHelperFn[] = [];
  history.forEach((move, index) => {
    const { to: moveTo, position, piece, captured, promotion } = move;
    const moveNumber = (index + 1) / 2;
    moveHistory.push(
      span([
        span([
          span(
            { className: 'has-text-weight-semibold' },
            `${!Number.isInteger(moveNumber) ? Math.ceil(moveNumber).toString() + '. ' : ''}`
          ),
          span(
            `#${parsePositionId(position)} ${'.move-history'}`,
            {
              style: 'cursor: pointer;',
              onclick: () => {
                clientEvent.emit('event:game:history:position', position);
              }
            },
            [
              getPieceIcon(piece, index),
              span(`${captured ? 'x' : ''}${moveTo}${promotion ? '=' : ' '}`),
              promotion && getPieceIcon(promotion, index)
            ]
          )
        ]),
        Number.isInteger(moveNumber) ? br() : span()
      ])
    );
  });
  return moveHistory;
};

const ConsoleGame: Component<State, GameConsoleAction> = (dispatch, state) => {
  const {
    username,
    gameConsole: { disableChat },
    currentGame: { gameChat, pendingDrawOfferFrom, state: gameState, history }
  } = state;
  // use this for adjusting vh height of console for different screens.
  // const smallScreen = window.innerWidth < 1720;
  return div({ className: 'card' }, [
    div({ className: 'card-content p-0 pl-4', style: 'height: 44vh' }, [
      gameState && ['COMPLETE', 'OBSERVING', 'SEARCHING_OBSERVING'].includes(gameState)
        ? span(
            {
              className: 'icon is-small m-2',
              // position: fixed;
              style: 'cursor: pointer; float: right;',
              onclick: () => {
                clientEvent.emit('event:game:exit');
              }
            },
            [i({ className: 'fas fa-solid fa-arrow-up-right-from-square' })]
          )
        : div(),
      div(
        { className: 'content', style: 'height: 100%; overflow-y: auto;' },
        renderMoveHistory(history)
      )
    ]),
    footer({ className: 'card-footer', style: 'border-bottom: 1px solid #ededed; ' }, [
      a({ className: 'card-footer-item' }, [
        div({ className: 'field has-addons' }, [
          p({ className: 'control m-0' }, [
            button(
              {
                className: 'button is-fullwidth',
                onclick: () => {
                  clientEvent.emit('event:game:history:start');
                }
              },
              [span({ className: 'icon is-small' }, [i({ className: 'fas fa-backward' })])]
            )
          ]),
          p({ className: 'control m-0' }, [
            button(
              {
                className: 'button is-fullwidth',
                onclick: () => {
                  clientEvent.emit('event:game:history:prev');
                }
              },
              [
                span({ className: 'icon is-small' }, [
                  i({ className: 'fas fa-backward-step' })
                ])
              ]
            )
          ]),
          p({ className: 'control m-0' }, [
            button(
              {
                className: 'button is-fullwidth',
                onclick: () => {
                  clientEvent.emit('event:game:history:next');
                }
              },
              [span({ className: 'icon is-small' }, [i({ className: 'fas fa-forward-step' })])]
            )
          ]),
          p({ className: 'control m-0' }, [
            button(
              {
                className: 'button is-fullwidth',
                onclick: () => {
                  clientEvent.emit('event:game:history:current');
                }
              },
              [span({ className: 'icon is-small' }, [i({ className: 'fas fa-forward' })])]
            )
          ])
        ])
      ]),
      a({ className: 'card-footer-item px-0' }, [
        div({ className: 'buttons has-addons' }, [
          pendingDrawOfferFrom && pendingDrawOfferFrom !== username
            ? button(
                {
                  className: 'button is-small is-info pr-3',
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
                  className: 'button is-small is-warning pr-3',
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
              className: 'button is-small is-danger px-2',
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
    div({ className: 'card-content p-0' }, [
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
            ? i({ className: 'fas fa-solid fa-comment' })
            : i({ className: 'fas fa-solid fa-comment-slash' })
        ]
      )
    ]),
    div(
      {
        className: 'card-content p-0 pl-3',
        style: `height: 24vh; ${disableChat && 'background-color: hsl(192, 15%, 94%);'}`
      },
      [
        div(
          '#game-chat',
          {
            className: 'content mb-1',
            style: 'height: 100%; overflow-y: auto; font-size: 0.9rem;'
          },
          renderChatMessages(gameChat, disableChat)
        )
      ]
    ),
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
