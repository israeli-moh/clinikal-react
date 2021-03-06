import {
  SET_ACTIVE_ENCOUNTER,
  SET_ACTIVE_PATIENT,
  SET_ACTIVE_ENCOUNTER_AND_PATIENT,
  SET_ACTIVE_USER,
} from 'Store/Actions/ActiveActions/ActiveActionsTypes';

const INITIAL_STATE = {
  STATUS: '',
  activePatient: {},
  activeEncounter: {},
  activeUser: {},
};

const ActiveDataReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_ACTIVE_ENCOUNTER:
      return {
        ...state,
        activeEncounter: action.encounter,
        STATUS: action.type,
      };

    case SET_ACTIVE_PATIENT:
      return { ...state, activePatient: action.patient, STATUS: action.type };

    case SET_ACTIVE_ENCOUNTER_AND_PATIENT:
      return {
        ...state,
        activePatient: action.patient,
        activeEncounter: action.encounter,
        STATUS: action.type,
      };

    case SET_ACTIVE_USER:
      return { ...state, activeUser: action.user, STATUS: action.type };
    default:
      return state;
  }
};

export default ActiveDataReducer;
