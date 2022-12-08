import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBar';

const { div, span, p, i } = hh(h);

const Board: Component<State, NavBarAction> = (dispatch, state) => {
  const { currentGame, username } = state;
  const { ratingBlack, ratingWhite, userWhite, userBlack } = currentGame;
  let { whiteTime, blackTime } = currentGame;
  let player, opponent, whiteTimeTemp, blackTimeTemp;

  const whiteSeconds = parseInt(whiteTime.split(':')[1]);
  const blackSeconds = parseInt(whiteTime.split(':')[1]);

  if (whiteSeconds >= 20) {
    whiteTimeTemp = whiteTime.split(':');
    whiteTimeTemp.pop();
    whiteTime = whiteTimeTemp.join();
  }

  if (blackSeconds >= 20) {
    blackTimeTemp = blackTime.split(':');
    blackTimeTemp.pop();
    blackTime = blackTimeTemp.join();
  }

  username === userWhite
    ? ((player = { username: userWhite, rating: ratingWhite, clock: whiteTime }),
      (opponent = { username: userBlack, rating: ratingBlack, clock: blackTime }))
    : ((player = { username: userBlack, rating: ratingBlack, clock: blackTime }),
      (opponent = { username: userWhite, rating: ratingWhite, clock: whiteTime }));

  return div({ className: 'box' }, [
    div({ className: 'tile is-ancestor' }, [
      div({ className: 'tile is-parent' }, [
        div('#board', {
          className: 'tile is-child',
          style: 'height: 88vh; width: 88vh;'
        })
      ]),
      div({ className: 'tile is-4 is-vertical is-parent' }, [
        div({ className: 'tile is-child box is-flex', style: 'width:65%' }, [
          div({ className: 'tile is-ancestor' }, [
            div({ className: 'tile is-12 is-vertical is-parent' }, [
              div({ className: 'tile is-child is-flex-grow-5 p-1' }, [
                span({ className: 'icon' }, [i({ className: 'fas  fa-solid fa-chess-pawn' })]),
                span({ className: 'is-size-5 has-text-grey-darker' }, opponent.username),
                span(
                  {
                    className: 'is-size-5 has-text-weight-semibold has-text-grey'
                  },
                  opponent.rating
                )
              ]),
              div(
                {
                  className: 'tile is-child box has-background-dark p-1 has-text-centered'
                },
                [
                  div([
                    p(
                      {
                        className: 'is-family-monospace is-size-3',
                        style: 'color: hsl(60,100%,50%);'
                      },
                      opponent.clock ? opponent.clock : '0:00'
                    )
                  ])
                ]
              )
            ])
          ])
        ]),
        div({ className: 'tile is-child box is-flex', style: 'width:65%' }, [
          div({ className: 'tile is-ancestor' }, [
            div({ className: 'tile is-12 is-vertical is-parent' }, [
              div(
                {
                  className: 'tile is-child p-0 is-flex-grow-5'
                },
                [
                  div(
                    {
                      className: 'tile is-child box has-background-dark p-1 has-text-centered'
                    },
                    [
                      p(
                        {
                          className: 'is-family-monospace is-size-3',
                          style: 'color: hsl(60,100%,50%);'
                        },
                        player.clock ? player.clock : '0:00'
                      )
                    ]
                  )
                ]
              ),
              div(
                {
                  className: 'tile is-child p-0',
                  style: 'position: relative;'
                },
                [
                  div({ style: 'bottom: 0; position: absolute;' }, [
                    span({ className: 'icon' }, [
                      i({ className: 'fas fa-solid fa-chess-knight' })
                    ]),
                    span({ className: 'is-size-5 has-text-grey-darker' }, player.username),
                    span(
                      {
                        className: 'is-size-5 has-text-weight-semibold has-text-grey'
                      },
                      player.rating
                    )
                  ])
                ]
              )
            ])
          ])
        ])
      ])
    ])
  ]);
};

export default Board;
