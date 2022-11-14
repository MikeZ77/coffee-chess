import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { View, Dispatch } from 'common/types';
import { State } from './state';
import { hanldeError } from './utils/handlers';
import { reduceLogin } from './reducers/reduceLogin';
import { Action } from './actions/actions';
import { comingFromRegistration } from './utils/handlers';
import sendRequest from '../../common/request';
import combineReducers from './utils/combineReducers';

const app = (
  initState: State,
  view: View<State, Action>,
  node: HTMLElement
) => {
  const dispatch: Dispatch<Action> = (action) => {
    state = reduce(action, state);

    if (state.pendingRequest != null) {
      const newRequest = { ...state.pendingRequest };
      state.pendingRequest = null;
      sendRequest(newRequest).catch((error) => {
        hanldeError(error, dispatch);
      });
    }
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
  comingFromRegistration();
};

export default app;
