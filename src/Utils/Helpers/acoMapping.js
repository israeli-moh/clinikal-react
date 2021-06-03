/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param getUIACOMapping - array
 * @returns getUIACOMapping - aco mapping
 */

const getUIACOMapping = {
  invited: 'PatientTrackingInvited',
  waiting_for_examination: 'PatientTrackingWaitingForExamination',
  waiting_for_decoding: 'PatientTrackingWaitingForDecoding',
  finished: 'PatientTrackingFinished',
  add_patient: 'AddPatient',
  appointment_details: 'AppointmentDetails',
  calendar: 'Calendar',
  encounter_sheet: 'EncounterSheet',
  patient_admission: 'PatientAdmission',
  search_patient: 'SearchPatient',
  appointments_and_encounters: 'AppointmentsAndEncounters',
  summary_letter: `SummaryLetter`,
  waiting_for_nurse: 'PatientTrackingWaitingForNurse',
  waiting_for_doctor: 'PatientTrackingWaitingForDoctor',
  waiting_for_xray: 'PatientTrackingWaitingForXray',
  waiting_for_release: 'PatientTrackingWaitingForRelease',
  finished_visit: 'PatientTrackingFinishedVisit',
  diagnosis_and_recommendations_form: 'DiagnosisandRecommendationsForm',
  medical_admission_form: 'MedicalAdmissionForm',
  add_new_treatment_instruction: 'AddNewTreatmentInstruction'
};

export default getUIACOMapping;
