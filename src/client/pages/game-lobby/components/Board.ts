import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import { NavBarAction } from '../actions/sideNavBarActions';

const { div, span, p, i } = hh(h);

const Board: Component<State, NavBarAction> = (dispatch, state) => {
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
              div({ className: 'tile is-child box is-flex-grow-5 p-1' }, [
                span({ className: 'icon' }, [
                  i({ className: 'fas  fa-solid fa-chess-pawn' })
                ]),
                span(
                  { className: 'is-size-5 has-text-grey-darker' },
                  'Player1 '
                ),
                span(
                  {
                    className:
                      'is-size-5 has-text-weight-semibold has-text-grey'
                  },
                  '(1800)'
                )
              ]),
              div(
                {
                  className:
                    'tile is-child box has-background-dark p-1 has-text-centered'
                },
                [
                  p(
                    {
                      className: 'is-family-monospace is-size-3',
                      style: 'color: hsl(60,100%,50%);'
                    },
                    '3:00'
                  )
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
                  className:
                    'tile is-child box has-background-dark p-1 has-text-centered'
                },
                [
                  p(
                    {
                      className: 'is-family-monospace is-size-3',
                      style: 'color: hsl(60,100%,50%);'
                    },
                    '3:00'
                  )
                ]
              ),
              div({ className: 'tile is-child box p-1 is-flex-grow-5' }, [
                div({ className: 'is-flex-grow-4 ' }, [
                  span({ className: 'icon' }, [
                    i({ className: 'fas fa-solid fa-chess-knight' })
                  ]),
                  span(
                    { className: 'is-size-5 has-text-grey-darker' },
                    'Player1 '
                  ),
                  span(
                    {
                      className:
                        'is-size-5 has-text-weight-semibold has-text-grey'
                    },
                    '(1900)'
                  )
                ])
              ])
            ])
          ])
        ])
      ])
    ])
  ]);
};

export default Board;
