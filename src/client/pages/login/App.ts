import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { State, View, Dispatch } from './types';
import { sendRequest, handleResponse, hanldeError } from './Request';
import { reduceLogin } from './reducers/reduceLogin';
import combineReducers from './reducers/combineReducers';

const app = (initState: State, view: View, node: HTMLElement) => {
  const dispatch: Dispatch = (action) => {
    state = reduce(action, state);

    if (state.pendingRequest != null) {
      const newRequest = { ...state.pendingRequest };
      state.pendingRequest = null;
      // console.log(newRequest, state.pendingRequest);
      sendRequest(newRequest)
        .then((data) => {
          handleResponse(data, dispatch);
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
  const reduce = combineReducers({ reduceLogin });
  node.appendChild(rootNode);
};

export default app;
