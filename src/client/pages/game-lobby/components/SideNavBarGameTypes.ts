import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { Component } from 'common/types';
import { State } from '../state';
import {
  NavBarAction,
  searchOneMinute,
  searchThreeMinute,
  searchFifteenMinute
} from '../actions/index';

const { ul, li, a, span, i, div } = hh(h);

const sideNavBarGameTypes: Component<State, NavBarAction> = (
  dispatch,
  state
) => {
  const { oneMinuteSearching, threeMinuteSearching, fifteenMinuteSearching } =
    state.sideNavBar;
  return ul({}, [
    li(
      {
        onclick: () => {
          dispatch(searchOneMinute());
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
          dispatch(searchThreeMinute());
        }
      },
      [
        a({ className: 'columns is-flex is-vcentered' }, [
          a('5-Minute'),
          [
            threeMinuteSearching
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
          dispatch(searchFifteenMinute());
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
