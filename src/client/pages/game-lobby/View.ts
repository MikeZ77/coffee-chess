import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import { View } from '@Common/types';
import { State } from './state';
import { AnyActions } from './actions/index';
import sideNavBar from './components/SideNavBar';
import Console from './components/Console';
import Board from './components/Board';

const { div, section, p } = hh(h);

const view: View<State, AnyActions> = (dispatch, state) => {
  if (!state.disablePage) {
    return section({ className: 'hero is-fullheight' }, [
      div({ className: 'columns' }, [
        div({ className: 'column is-2' }, [sideNavBar(dispatch, state)]),
        div({ className: 'column is-7 mt-5' }, [Board(dispatch, state)]),
        div({ className: 'column is-3 mt-5' }, [
          div({ className: 'box mr-5', style: 'height: 100%' }, [Console(dispatch, state)])
        ])
      ])
    ]);
  } else {
    return div({ className: 'modal is-active' }, [
      div({ className: 'modal-background' }),
      div({ className: 'modal-content box' }, [
        p(`Multiple windows or tabs detected. Please either close this 
          window/tab or close all other open window/tabs and refresh the page.`)
      ])
    ]);
  }
};

export default view;
