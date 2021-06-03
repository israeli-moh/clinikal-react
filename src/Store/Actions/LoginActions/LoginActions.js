import {
  LOGIN_START,
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  LOGOUT_FAILED,
  LOGOUT_SUCCESS,
  LOGOUT_START,
  LOGIN_EXPIRED,
  MFA_REQUIRED
} from './LoginActionTypes';
import { loginInstance } from 'Utils/Services/AxiosLoginInstance';
import { stateLessOrNot } from 'Utils/Helpers/StatelessOrNot';
import { getSettingsAction } from '../SettingsActions/SettingsActions';
import { basePath } from 'Utils/Helpers/basePath';
import { ApiTokens } from 'Utils/Services/ApiTokens';
import {convertParamsToUrl} from "Utils/Helpers/CommonFunctions";
import { getToken } from 'Utils/Helpers/getToken';
import moment from 'moment';

export const logoutStartAction = () => {
  return {
    type: LOGOUT_START,
  };
};

export const logoutSuccessAction = () => {
  return {
    type: LOGOUT_SUCCESS,
    isAuth: false,
  };
};

export const logoutFailedAction = () => {
  return {
    type: LOGOUT_FAILED,
  };
};

export const logoutAction = () => {
  return async (dispatch) => {
    dispatch(logoutStartAction());
    try {
      for (const token in ApiTokens) {
        document.cookie = '';
        document.cookie = '';
        document.cookie = '';
      }
      if (!stateLessOrNot()) {
        window.location = `${basePath()}interface/logout.php`;
      }
      dispatch(logoutSuccessAction());
    } catch (err) {
      dispatch(logoutFailedAction());
    }
  };
};

export const loginStartAction = () => {
  return {
    type: LOGIN_START,
  };
};

export const loginFailedAction = () => {
  return {
    type: LOGIN_FAILED,
    isAuth: false,
  };
};


export const loginSuccessAction = (userID) => {
  return {
    type: LOGIN_SUCCESS,
    isAuth: true,
    userID:userID,
  };
};

const loginPromise = async (client_id,username, password, mfa_token = null) => {
  if (stateLessOrNot()) {
    const userObj = {
      "grant_type": 'password',
      "client_id": client_id,
      "username":username,
      "password" : password,
      "user_role":'users',
      "scope": 'api:oemr api:fhir openid name'
    };

    if(mfa_token !== null) {
      userObj['mfa_token'] = mfa_token;
    }

    return loginInstance({'Content-Type': 'application/x-www-form-urlencoded'}).post('oauth2/default/token', convertParamsToUrl(userObj))

  } else {
    return loginInstance.get(
      'interface/modules/zend_modules/public/clinikal-api/get-csrf-token',
    );
  }
};

export const loginAction = (client_id, username, password, history, mfa_token = null) => {
  return async (dispatch) => {
    dispatch(loginStartAction());
    try {
      let tokenData;
      if (stateLessOrNot()) {
        const connection = await loginPromise(client_id, username, password, mfa_token);
        document.cookie = `clientId=${client_id}`;
        document.cookie = `accessToken=${connection.data.access_token}`;
        document.cookie = `refreshToken=${connection.data.refresh_token}`;
        document.cookie = `tokenExpired=${moment().add(connection.data.expires_in, 'seconds').unix()}`;
      }else {
        tokenData = await loginPromise(null, username, password);
        document.cookie = `${ApiTokens.CSRF.tokenName}=${tokenData.data.csrf_token}`;
      }
      dispatch(getSettingsAction(history, username));
      return 'success';
    } catch (err) {
      let error_key = err.response.data.error;
      return error_key;
    }
  };
};


const refreshTokenPromise = async () => {
  if (stateLessOrNot()) {
    const userObj = {
      "grant_type": 'refresh_token',
      "client_id": getToken('clientId'),
      "refresh_token": getToken('refreshToken')
    };

    return loginInstance({'Content-Type': 'application/x-www-form-urlencoded'}).post('oauth2/default/token', convertParamsToUrl(userObj))

  } else {
    //todo - not support currently
  }
};


export const  restoreTokenAction = () => {
  return async (dispatch) => {
    //dispatch(loginStartAction());
    try {
      if (stateLessOrNot()) {
        const connection = await refreshTokenPromise();
        document.cookie = `accessToken=${connection.data.access_token}`;
        document.cookie = `refreshToken=${connection.data.refresh_token}`;
        document.cookie = `tokenExpired=${moment().add(connection.data.expires_in, 'seconds').unix()}`;
      }else {
        //todo - not supported
      }
    } catch (err) {

      logoutAction()

    }
  };
};
