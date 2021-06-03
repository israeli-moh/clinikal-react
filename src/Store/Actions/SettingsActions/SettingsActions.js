import { getGlobalSettings } from 'Utils/Services/API';
import firstRouteMapper from 'Utils/Helpers/firstRouteMapper';
import {
  GET_SETTINGS,
  GET_SETTINGS_FAILED,
  GET_SETTINGS_SUCCESS,
  SET_SETTINGS,
  SET_SETTINGS_FAILED,
  SET_SETTINGS_SUCCESS,
} from './SettingsActionTypes';
import { geti18n } from 'Utils/Services/i18n';
import { FHIR } from 'Utils/Services/FHIR';
import { setUserAction } from 'Store/Actions/ActiveActions';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import {loginSuccessAction} from "../LoginActions/LoginActions";
import { setValueset } from 'Store/Actions/ListsBoxActions/ListsBoxActions';
import { SET_VALUESET } from 'Store/Actions/ListsBoxActions/ListsboxActionTypes';


export const getSettingsStartAction = () => {
  return {
    type: GET_SETTINGS,
  };
};

export const getSettingsSuccessAction = (payload) => {
  return {
    type: GET_SETTINGS_SUCCESS,
    payload,
  };
};

export const getSettingsFailedAction = () => {
  return {
    type: GET_SETTINGS_FAILED,
  };
};

export const getSettingsAction = (history, userName) => {
  return async (dispatch) => {
    try {
      dispatch(getSettingsStartAction());
      const settings = await getGlobalSettings(userName);
      document.cookie = `langDir=${settings.data.lang_dir}`;
      document.cookie = `langCode=${settings.data.lang_code}`;
      dispatch(loginSuccessAction(settings.data.user_id));

      /* Load all the main lists are on multiple usage into redux */
      const APISettings = [];
      APISettings.push(
        FHIR('Practitioner', 'doWork', {
          functionName: 'getPractitioner',
          functionParams: {
            user: settings.data.user_id,
          },
        })
      )

      APISettings.push(
          FHIR('Organization', 'doWork', {
            functionName: 'getOrganization',
          })
      )

      APISettings.push(
          FHIR('Organization', 'doWork', {
            functionName: 'getOrganizationTypeKupatHolim',
          })
      )

      APISettings.push(
          geti18n(settings.data.lang_id)
      )
      const systemLists = ['encounter_statuses', 'gender', 'encounter_secondary_statuses', 'appointment_statuses', 'identifier_type_list', 'waiting_for_xray_statuses', 'waiting_for_release_statuses', 'service_types', 'no_payment_reasons']
      systemLists.forEach((value => {
            APISettings.push(
                dispatch(setValueset(value))
            )
          }
      ));

      const responseSettings = await Promise.all(APISettings);

      dispatch(getSettingsSuccessAction(settings.data));
      if (responseSettings[0]) {
        dispatch(setUserAction(responseSettings[0].data));
      }

      if (responseSettings[1]) {
        dispatch({ type: SET_VALUESET, valueset: {clinicsList:responseSettings[1].data} })
      }

      if (responseSettings[2]) {
        dispatch({ type: SET_VALUESET, valueset: {hmoList:responseSettings[2].data} })
      }

      //history.push(`${firstRouteMapper(settings.data.clinikal_vertical)}`);
      history.push(`${baseRoutePath()}/generic/patientTracking`);
    } catch (err) {
      dispatch(getSettingsFailedAction());
    }
  };
};
