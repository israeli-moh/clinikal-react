import React from 'react';
import ReactDOM from 'react-dom';
import 'index.css';
import App from 'Components/App/App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import loginReducer from 'Store/Reducers/LoginReducer';
import facilityReducer from 'Store/Reducers/FacilityReducer';
import SettingsReducer from 'Store/Reducers/SettingsReducer';
import FiltersReducer from 'Store/Reducers/FiltersReducer';
import FhirDataReducer from 'Store/Reducers/FhirDataReducer';
import ActiveDataReducer from 'Store/Reducers/ActiveDataReducer';
import UiReducer from "Store/Reducers/UiReducer";
import listBoxReducer from "Store/Reducers/ListsBoxReducer";
import 'material-icons-font/material-icons-font.css';
import thunk from 'redux-thunk';



const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const rootReducer = combineReducers({
  login: loginReducer,
  facilityData: facilityReducer,
  settings: SettingsReducer,
  filters: FiltersReducer,
  fhirData: FhirDataReducer,
  active: ActiveDataReducer,
  ui: UiReducer,
  listsBox: listBoxReducer
});
//Added export so I can use it in story book hopefully. Months later it worked :D. It is also used for to dispatch redux actions outside react component
export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
);

// ReactDOM.render(<Provider Store={Store}><Suspense fallback="loading..."><App appUrl={iframePath}/></Suspense></Provider>, document.getElementById('root'));
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
