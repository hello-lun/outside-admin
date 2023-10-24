/* eslint-enable */
// import { configureStore } from '@reduxjs/toolkit';
import { combineReducers, legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';

import user from './modules/user/reducer';

const reducer = combineReducers({
  user,
});

const composeEnhancers = composeWithDevTools({
  // Specify name here, actionsBlacklist, actionsCreators and other options if needed
});

const enhancer = composeEnhancers(
  applyMiddleware(reduxThunk),
  // other store enhancers if any
);
const store = createStore(reducer, enhancer);

export default store;