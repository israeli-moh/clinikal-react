import { SET_VALUESET } from './ListsboxActionTypes';
import {FHIR} from "Utils/Services/FHIR";

export const setValueset = (valueset) => {
  return async (dispatch) => {
    try {
      const result = await FHIR('ValueSet', 'doWork', {
        functionName: 'getValueSet',
        functionParams: {
          id: valueset,
        },
      })
      let objValueset = {};
      if(result.data) {
        // store list in the listsBox
        objValueset[result.data.id] = result.data;
        dispatch({ type: SET_VALUESET, valueset:objValueset });
      }
    } catch (err) {
      console.log(err);
    }
  };
};
