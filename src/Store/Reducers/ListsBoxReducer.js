import { SET_VALUESET } from 'Store/Actions/ListsBoxActions/ListsboxActionTypes';

const INITIAL_STATE = {
};

const listBoxReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_VALUESET:
      return {
        ...state,
        ...action.valueset
      };
    default:
      return state;
  }
};

export default listBoxReducer;
