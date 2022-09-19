import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { Store, Action, View, Reducer, Model } from './types';

function app(initModel: Store, view: View, node: HTMLElement) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(action: Action, reduce: Reducer) {
    model = reduce(action, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

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
