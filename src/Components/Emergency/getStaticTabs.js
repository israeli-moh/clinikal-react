import { encounterActiveFunction } from 'Utils/Helpers/Encounter/encounterActiveFunction';
import { encounterNotActiveFunction } from 'Utils/Helpers/Encounter/encounterNotActiveFunction';
import { setPatientDataWaitingForNurseTableRows } from 'Components/Generic/patientTrackingTabs/setPatientDataWaitingForNurseTableRows';
import { setPatientDataWaitingForDoctorTableRows } from 'Components/Generic/patientTrackingTabs/setPatientDataWaitingForDoctorTableRows';
import { setPatientDataWaitingForXrayTableRows } from 'Components/Generic/patientTrackingTabs/setPatientDataWaitingForXrayTableRows';
import { setPatientDataWaitingForReleaseTableRows } from 'Components/Generic/patientTrackingTabs/setPatientDataWaitingForReleaseTableRows';
import { setPatientDataFinishedVisitTableRows } from 'Components/Generic/patientTrackingTabs/setPatientDataFinishedVisitTableRows';
export const emergencyTabs = [
  {
    tabName: 'Waiting for nurse',
    id: 'Patient Tracking Waiting for Nurse',
    mode: 'hide',
    count: 0,
    tabValue: 0,
    activeAction: encounterActiveFunction,
    notActiveAction: encounterNotActiveFunction,
    tableFunction: setPatientDataWaitingForNurseTableRows,
    sort: '-priority,status-update-date,service-type',
    statuses: ['arrived'],
    extendedStatuses: ['waiting-for-nurse'],
    isDateDisabled: true,
  },
  {
    tabName: 'Waiting for doctor',
    id: 'Patient Tracking Waiting for Doctor',
    mode: 'hide',
    count: 0,
    tabValue: 1,
    sort: '-priority,status-update-date,service-type',
    statuses: ['triaged'],
    extendedStatuses: ['waiting_for_doctor'],
    activeAction: encounterActiveFunction,
    notActiveAction: encounterNotActiveFunction,
    tableFunction: setPatientDataWaitingForDoctorTableRows,
    isDateDisabled: true,
  },
  {
    tabName: 'Waiting for xray',
    id: 'Patient Tracking Waiting for Xray',
    mode: 'hide',
    count: 0,
    tabValue: 2,
    sort: '-priority,status-update-date,service-type',
    valueSet: 'waiting_for_xray_statuses',
    extendedStatuses: ['waiting_for_xray'],
    activeAction: encounterActiveFunction,
    notActiveAction: encounterNotActiveFunction,
    tableFunction: setPatientDataWaitingForXrayTableRows,
    isDateDisabled: true,
  },
  {
    tabName: 'Waiting for release',
    id: 'Patient Tracking Waiting for Release',
    mode: 'hide',
    count: 0,
    tabValue: 3,
    sort: '-priority,status-update-date,service-type',
    valueSet: 'waiting_for_release_statuses',
    extendedStatuses: ['waiting_for_release'],
    activeAction: encounterActiveFunction,
    notActiveAction: encounterNotActiveFunction,
    tableFunction: setPatientDataWaitingForReleaseTableRows,
    isDateDisabled: true,
  },
  {
    tabName: 'Finished visit',
    id: 'Patient Tracking Finished visit',
    mode: 'hide',
    count: 0,
    tabValue: 4,
    valueSet: 'waiting_for_release_statuses',
    sort: 'status-update-date,-priority,service-type',
    statuses: ['finished'],
    activeAction: encounterActiveFunction,
    notActiveAction: encounterNotActiveFunction,
    tableFunction: setPatientDataFinishedVisitTableRows,
    isDateDisabled: false,
  },
];
