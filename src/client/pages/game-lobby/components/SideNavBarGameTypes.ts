import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import {
  NavBarAction,
  spinnerSearchOneMinute,
  spinnerSearchFiveMinute,
  spinnerSearchFifteenMinute,
  requestSearchOneMinute,
  requestSearchMinute,
  requestSearchFifteenMinute,
  setAudioNewGame
} from '../actions/index';

const { ul, li, a, span, i, div } = hh(h);

const sideNavBarGameTypes: Component<State, NavBarAction> = (dispatch, state) => {
  const { oneMinuteSearching, fiveMinuteSearching, fifteenMinuteSearching } = state.sideNavBar;
  return ul({}, [
    li(
      {
        onclick: () => {
          if (![fiveMinuteSearching, fifteenMinuteSearching].includes(true)) {
            dispatch(requestSearchOneMinute(!oneMinuteSearching));
            dispatch(spinnerSearchOneMinute(!oneMinuteSearching));
            dispatch(setAudioNewGame());
          }
        }
      },
      [
        a({ className: 'columns is-flex is-vcentered' }, [
          a('1-Minute'),
          [
            oneMinuteSearching
              ? span({ className: 'icon is-medium' }, [
                  i({ className: 'fas fa-circle-notch fa-spin' })
                ])
              : div()
          ]
        ])
      ]
    ),
    li(
      {
        onclick: () => {
          if (![oneMinuteSearching, fifteenMinuteSearching].includes(true)) {
            dispatch(spinnerSearchFiveMinute(!fiveMinuteSearching));
            dispatch(requestSearchMinute(!fiveMinuteSearching));
            dispatch(setAudioNewGame());
          }
        }
      },
      [
        a({ className: 'columns is-flex is-vcentered' }, [
          a('5-Minute'),
          [
            fiveMinuteSearching
              ? span({ className: 'icon is-medium' }, [
                  i({ className: 'fas fa-circle-notch fa-spin' })
                ])
              : div()
          ]
        ])
      ]
    ),
    li(
      {
        onclick: () => {
          if (![oneMinuteSearching, fiveMinuteSearching].includes(true)) {
            dispatch(spinnerSearchFifteenMinute(!fifteenMinuteSearching));
            dispatch(requestSearchFifteenMinute(!fifteenMinuteSearching));
            dispatch(setAudioNewGame());
          }
        }
      },
      [
        a({ className: 'columns is-flex is-vcentered' }, [
          a('15-Minute'),
          [
            fifteenMinuteSearching
              ? span({ className: 'icon is-medium' }, [
                  i({ className: 'fas fa-circle-notch fa-spin' })
                ])
              : div()
          ]
        ])
      ]
    )
  ]);
};

export default sideNavBarGameTypes;
