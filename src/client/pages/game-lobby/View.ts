import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from '../../common/types';
import { State } from './state';
import { NavBarAction, AnyActions } from './actions/index';
import sideNavBar from './components/SideNavBar';
import Console from './components/Console';
import Board from './components/Board';

const { div, section } = hh(h);

const view: View<State, AnyActions> = (dispatch, state) => {
  return section({ className: 'hero is-fullheight' }, [
    div({ className: 'columns' }, [
      div({ className: 'column is-2' }, [sideNavBar(dispatch, state)]),
      div({ className: 'column is-7 mt-5' }, [Board(dispatch, state)]),
      div({ className: 'column is-3 mt-5' }, [
        div({ className: 'box mr-5', style: 'height: 100%' }, [
          Console(dispatch, state)
        ])
      ])
    ])
  ]);
};

export default view;
