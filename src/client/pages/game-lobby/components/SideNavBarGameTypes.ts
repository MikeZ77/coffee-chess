import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { cacheStateData, removeCacheStateData } from '../utils/simple.utils';
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
  const {
    sideNavBar: { oneMinuteSearching, fiveMinuteSearching, fifteenMinuteSearching },
    audio
  } = state;
  return ul({}, [
    li(
      {
        onclick: () => {
          if (![fiveMinuteSearching, fifteenMinuteSearching].includes(true)) {
            dispatch(requestSearchOneMinute(!oneMinuteSearching));
            dispatch(spinnerSearchOneMinute(!oneMinuteSearching));
            !oneMinuteSearching
              ? cacheStateData('searching', '1+0')
              : removeCacheStateData('searching');
            Object.values(audio).includes(null) && dispatch(setAudioNewGame());
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
            !fiveMinuteSearching
              ? cacheStateData('searching', '5+0')
              : removeCacheStateData('searching');
            Object.values(audio).includes(null) && dispatch(setAudioNewGame());
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
            !fifteenMinuteSearching
              ? cacheStateData('searching', '15+0')
              : removeCacheStateData('searching');
            Object.values(audio).includes(null) && dispatch(setAudioNewGame());
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
