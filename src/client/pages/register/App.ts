import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import { View, Dispatch } from 'common/types';
import { BasicResponse } from '../../../types';
import { State } from './state';
import { hanldeError, handleResponse } from './utils/handlers';
import { reduceRegister } from './reducers/reduceRegister';
import { Action } from './actions/actions';
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
      sendRequest<BasicResponse>(newRequest)
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
