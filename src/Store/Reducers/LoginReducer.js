import {
  LOGIN_FAILED,
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGOUT_FAILED,
  LOGOUT_START,
  LOGOUT_SUCCESS,
  LOGIN_EXPIRED
} from 'Store/Actions/LoginActions/LoginActionTypes';
import moment from 'moment';


const INITIAL_STATE = {
  isAuth: false,
  STATUS: '',
  userData: null,
};

const loginReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        STATUS: action.type,
        isAuth: action.isAuth,
        userID: action.userID,
      };

    case LOGIN_START:
      return {
        ...state,
        STATUS: action.type,
      };
    case LOGIN_FAILED:
      return {
        ...state,
        isAuth: action.isAuth,
        STATUS: action.type,
      };
    case LOGOUT_START:
      return {
        ...state,
        STATUS: action.type,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isAuth: false,
        STATUS: action.type,
      };
    case LOGOUT_FAILED:
      return {
        ...state,
        STATUS: action.type,
      };
    default:
      return state;
  }
};
export default loginReducer;
