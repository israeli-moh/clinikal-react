import { tokenInstanceGenerator } from 'Utils/Services/AxiosWithTokenInstance';
import { ApiTokens } from 'Utils/Services/ApiTokens';
import { FHIR } from './FHIR';
import {OPENEMR_SITE} from 'Utils/Helpers/constants/general';

/**
 * @author Idan Gigi idangi@matrix.co.il
 *         Dror Golan idangi@matrix.co.il
 * @fileOverview Where all the apis that uses the normal api Token
 */

const apiTokenInstance = () => tokenInstanceGenerator(ApiTokens.API.tokenName);

export const getGlobalSettings = (userName) => {
  return apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/settings/globals/${userName}`);
};

export const getMenu = (menuName) => {
  return apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/settings/menu/${menuName}`);
};

export const getCities = () => {
  return apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/lists/cities`);
};

export const getIndicatorsSettings = () => {
  return apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/indicator-settings`);
};

export const getStreets = (city) => {
  return city && apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/lists/streets/${city}`);
};

export const getForms = (service_type, examination_code) => {
  if (!service_type && (!examination_code || examination_code.length < 1))
    return [];

  let reason_code = examination_code ? examination_code.toString() : null;

  return apiTokenInstance().get(
    `apis/${OPENEMR_SITE}/api/load-forms?${service_type ? 'service_type=' + service_type : ''}${
      reason_code && service_type
        ? '&reason_code=' + reason_code
        : reason_code
        ? 'reason_code=' + reason_code
        : ''
    }`,
  );
};

export const getFormTemplates = (
  serviceType,
  reasonCode,
  formID,
  formField,
) => {
  if (serviceType && reasonCode && formID && formField)
    return apiTokenInstance().get(
      `apis/${OPENEMR_SITE}/api/templates/search?service-type=${serviceType}&reason-code=${reasonCode}&form=${formID}&form-field=${formField}`,
    );
  return null;
};

export const getLetterAPIListOfParams = (city) => {
  //GET /${OPENEMR_SITE}/api/letters/list
  return city && apiTokenInstance().get(`apis/${OPENEMR_SITE}/api/letters/list`);
};

export const createLetter = async ({ ...props }) => {
  if (props.id && props.id > 0) {
    const documentReferenceData = await FHIR('DocumentReference', 'doWork', {
      functionName: 'deleteDocumentReference',
      documentReferenceId: props.id,
    });
  }

  return apiTokenInstance().post(
    `apis/${OPENEMR_SITE}/api/letters/${props.letter_type}`,
    props,
  );
};
