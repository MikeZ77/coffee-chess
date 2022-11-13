import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { State, View, Dispatch } from './types';
import { sendRequest, hanldeError, handleResponse } from './request';
import { reduceRegister } from './reducers/reduceRegister';
import combineReducers from './reducers/combineReducers';

const app = (initState: State, view: View, node: HTMLElement) => {
  const dispatch: Dispatch = (action) => {
    state = reduce(action, state);

    if (state.pendingRequest != null) {
      const newRequest = { ...state.pendingRequest };
      state.pendingRequest = null;
      sendRequest(newRequest)
        .then((res) => {
          handleResponse(res);
        })
        .catch((error) => {
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
  const reduce = combineReducers({ reduceRegister });
  node.appendChild(rootNode);
};

export default app;
