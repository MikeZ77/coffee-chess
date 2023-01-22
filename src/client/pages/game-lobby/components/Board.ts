import hh, { type HyperScriptHelperFn } from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction, setAudioNewGame } from '../actions/index';
import { type DurationObjectUnits, Duration } from 'luxon';
import { Result } from '@Types';

const { div, span, p, i } = hh(h);
const { GAME_LOW_TIME_MS } = process.env;

type PlayerInfo = {
  username: string;
  color: 'BLACK' | 'WHITE';
  rating: number;
  clock: string;
};

const getSpanIcon = (color: 'red' | 'green' | 'grey'): HyperScriptHelperFn => {
  return span({ className: 'icon' }, [
    i({
      className: `fas fa-solid fa-chess-king ${
        color === 'red' ? 'fa-flip-vertical' : color === 'grey' ? 'fa-flip-horizontal' : ''
      }`,
      style: `color: ${color};`
    })
    // span({ className: 'mr-2' }),
    // span(`${color === 'red' ? '[0-1]' : color === 'green' ? '[1-0]' : '[0.5-0.5]'}`)
  ]);
};

const renderResultHelper = (result: Result, player: PlayerInfo): HyperScriptHelperFn => {
  if (result === 'BLACK' && player.color === 'BLACK') {
    return getSpanIcon('green');
  } else if (result === 'WHITE' && player.color === 'BLACK') {
    return getSpanIcon('red');
  } else if (result === 'BLACK' && player.color === 'WHITE') {
    return getSpanIcon('red');
  } else if (result === 'WHITE' && player.color === 'WHITE') {
    return getSpanIcon('green');
  } else if (result === 'DRAW') {
    return getSpanIcon('grey');
  } else {
    return div();
  }
};

const formatLowTimeHelper = (clockTime: string): string => {
  return clockTime.split(':').slice(-2).join(':');
};

const Board: Component<State, NavBarAction> = (dispatch, state) => {
  const { currentGame, username, audio } = state;
  const { ratingBlack, ratingWhite, userWhite, userBlack, result, whiteTime, blackTime } =
    currentGame;
  console.log('result', result);
  const lowTimeMark = parseInt(GAME_LOW_TIME_MS);
  let player,
    opponent,
    whiteClockTimeParsed,
    blackClockTimeParsed,
    whiteClockTime: DurationObjectUnits | null,
    blackClockTime: DurationObjectUnits | null;

  whiteTime && whiteTime > 0
    ? (whiteClockTime = Duration.fromMillis(whiteTime)
        .shiftTo('minutes', 'seconds', 'milliseconds')
        .toObject())
    : (whiteClockTime = null);

  blackTime && blackTime > 0
    ? (blackClockTime = Duration.fromMillis(blackTime)
        .shiftTo('minutes', 'seconds', 'milliseconds')
        .toObject())
    : (blackClockTime = null);

  if (whiteClockTime) {
    const minutes = <number>whiteClockTime.minutes;
    const seconds = <number>whiteClockTime.seconds;
    const milliseconds = <number>whiteClockTime.milliseconds;
    if ((minutes == 0 && seconds >= lowTimeMark / 1000) || minutes >= 1) {
      whiteClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}`;
    } else {
      whiteClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}:${String(
        milliseconds
      ).slice(0, 2)}`;
    }
  } else {
    whiteClockTimeParsed = '0:00';
  }

  if (blackClockTime) {
    const minutes = <number>blackClockTime.minutes;
    const seconds = <number>blackClockTime.seconds;
    const milliseconds = <number>blackClockTime.milliseconds;
    if ((minutes == 0 && seconds >= lowTimeMark / 1000) || minutes >= 1) {
      blackClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}`;
    } else {
      blackClockTimeParsed = `${minutes}:${String(seconds).padStart(2, '0')}:${String(
        milliseconds
      ).slice(0, 2)}`;
    }
  } else {
    blackClockTimeParsed = '0:00';
  }

  username === userWhite
    ? ((player = {
        username: userWhite,
        color: 'WHITE',
        rating: ratingWhite,
        clock: whiteClockTimeParsed
      }),
      (opponent = {
        username: userBlack,
        color: 'BLACK',
        rating: ratingBlack,
        clock: blackClockTimeParsed
      }))
    : ((player = {
        username: userBlack,
        rating: ratingBlack,
        color: 'BLACK',
        clock: blackClockTimeParsed
      }),
      (opponent = {
        username: userWhite,
        color: 'WHITE',
        rating: ratingWhite,
        clock: whiteClockTimeParsed
      }));

  if (whiteTime && whiteTime < lowTimeMark) {
    if (player.color === 'WHITE') {
      player.clock = formatLowTimeHelper(player.clock);
    }
    if (opponent.color === 'WHITE') {
      opponent.clock = formatLowTimeHelper(opponent.clock);
    }
  }

  if (blackTime && blackTime < lowTimeMark) {
    if (player.color === 'BLACK') {
      player.clock = formatLowTimeHelper(player.clock);
    }
    if (opponent.color === 'BLACK') {
      opponent.clock = formatLowTimeHelper(opponent.clock);
    }
  }

  return div({ className: 'box' }, [
    div({ className: 'tile is-ancestor' }, [
      div({ className: 'tile is-parent' }, [
        div('#board', {
          className: 'tile is-child',
          style: 'height: 88vh; width: 88vh;',
          onclick: () => {
            Object.values(audio).includes(null) && dispatch(setAudioNewGame());
          }
        })
      ]),
      div({ className: 'tile is-4 is-vertical is-parent' }, [
        div({ className: 'tile is-child box is-flex', style: 'width:65%' }, [
          div({ className: 'tile is-ancestor' }, [
            div({ className: 'tile is-12 is-vertical is-parent' }, [
              div({ className: 'tile is-child is-flex-grow-5 p-1' }, [
                // TODO: Player rank goes here.
                // span({ className: 'icon' }, [i({ className: 'fas fa-solid fa-chess-pawn' })]),
                span(
                  { className: 'is-size-5 has-text-grey-darker' },
                  opponent.username ? opponent.username : ''
                ),
                span(
                  {
                    className: 'is-size-5 has-text-weight-semibold has-text-grey mr-2'
                  },
                  opponent.rating ? ` (${opponent.rating})` : ''
                ),
                renderResultHelper(result, <PlayerInfo>opponent)
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
                    // span({ className: 'icon' }, [
                    //   i({ className: 'fas fa-solid fa-chess-knight' })
                    // ]),
                    span(
                      { className: 'is-size-5 has-text-grey-darker' },
                      player.username ? player.username : ''
                    ),
                    span(
                      {
                        className: 'is-size-5 has-text-weight-semibold has-text-grey mr-2'
                      },
                      player.rating ? ` (${player.rating})` : ''
                    ),
                    renderResultHelper(result, <PlayerInfo>player)
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
