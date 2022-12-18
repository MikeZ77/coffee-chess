import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBar';
import { type DurationObjectUnits, Duration } from 'luxon';

const { div, span, p, i } = hh(h);

const Board: Component<State, NavBarAction> = (dispatch, state) => {
  const { currentGame, username } = state;
  const { ratingBlack, ratingWhite, userWhite, userBlack } = currentGame;
  const { whiteTime, blackTime } = currentGame;
  let player,
    opponent,
    whiteClockTimeParsed,
    blackClockTimeParsed,
    whiteClockTime: DurationObjectUnits | null,
    blackClockTime: DurationObjectUnits | null;

  whiteTime
    ? (whiteClockTime = Duration.fromMillis(whiteTime)
        .shiftTo('minutes', 'seconds', 'milliseconds')
        .toObject())
    : (whiteClockTime = null);

  blackTime
    ? (blackClockTime = Duration.fromMillis(blackTime)
        .shiftTo('minutes', 'seconds', 'milliseconds')
        .toObject())
    : (blackClockTime = null);

  if (whiteClockTime) {
    const minutes = <number>whiteClockTime.minutes;
    const seconds = <number>whiteClockTime.seconds;
    const milliseconds = <number>whiteClockTime.milliseconds;
    if ((minutes == 0 && seconds >= 20) || minutes >= 1) {
      whiteClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}`;
    } else {
      whiteClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}:${String(
        milliseconds
      ).padStart(2, '0')}`;
    }
  } else {
    whiteClockTimeParsed = '0:00';
  }

  if (blackClockTime) {
    const minutes = <number>blackClockTime.minutes;
    const seconds = <number>blackClockTime.seconds;
    const milliseconds = <number>blackClockTime.milliseconds;
    if ((minutes == 0 && seconds >= 20) || minutes >= 1) {
      blackClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}`;
    } else {
      blackClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}:${String(
        milliseconds
      ).padStart(2, '0')}`;
    }
  } else {
    blackClockTimeParsed = '0:00';
  }

  username === userWhite
    ? ((player = { username: userWhite, rating: ratingWhite, clock: whiteClockTimeParsed }),
      (opponent = { username: userBlack, rating: ratingBlack, clock: blackClockTimeParsed }))
    : ((player = { username: userBlack, rating: ratingBlack, clock: blackClockTimeParsed }),
      (opponent = { username: userWhite, rating: ratingWhite, clock: whiteClockTimeParsed }));

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
                span(
                  { className: 'is-size-5 has-text-grey-darker' },
                  opponent.username ? opponent.username : ''
                ),
                span(
                  {
                    className: 'is-size-5 has-text-weight-semibold has-text-grey'
                  },
                  opponent.rating ? ` (${opponent.rating})` : ''
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
                      opponent.clock
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
                        player.clock
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
                    span(
                      { className: 'is-size-5 has-text-grey-darker' },
                      player.username ? player.username : ''
                    ),
                    span(
                      {
                        className: 'is-size-5 has-text-weight-semibold has-text-grey'
                      },
                      player.rating ? ` (${player.rating})` : ''
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
