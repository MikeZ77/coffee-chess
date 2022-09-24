import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { State, View, Dispatch } from './types';
import combineReducers from './reducers/combineReducers';
import { reduceLogin } from './reducers/reduceLogin';

const app = (initState: State, view: View, node: HTMLElement) => {
  const dispatch: Dispatch = (action) => {
    state = reduce(action, state);
    const updatedView = view(dispatch, state);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  };

  let state = initState;
  let currentView = view(dispatch, state);
  let rootNode = createElement(currentView);
  const reduce = combineReducers({ reduceLogin });
  node.appendChild(rootNode);
};

export default app;

// import '../../common/bulma.styles.scss';
// import createElement from 'virtual-dom/create-element';
// import hh from 'hyperscript-helpers';
// import { h } from 'virtual-dom';

// const { button, div } = hh(h);

// const node = <HTMLElement>document.getElementById('app');
// // let btn = createElement(button({className: 'button'}, 'Hello'))

// function testLayout() {
//   return div({ className: 'columns is-centered' }, [
//     div({ className: 'column is-one-third' }, [
//       button({ className: 'button' }, 'Hello')
//     ]),
//     div({ className: 'column' }, [button({ className: 'button' }, 'Hello2')]),
//     div({ className: 'column' }, [button({ className: 'button' }, 'Hello3')])
//   ]);
// }

// const view = createElement(testLayout());
// node.appendChild(view);
