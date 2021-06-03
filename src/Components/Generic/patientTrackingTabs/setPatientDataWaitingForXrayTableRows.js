import { formatTime } from 'Utils/Helpers/Datetime/formatDate';
import { goToEncounterSheet } from 'Utils/Helpers/goTo/goToEncounterSheet';
import { getTableHeaders } from 'Components/Generic/patientTrackingTabs/tableHeaders';
import { FHIR } from 'Utils/Services/FHIR';
import isAllowed from 'Utils/Helpers/isAllowed';

// ממתינים לצילום

export const setPatientDataWaitingForXrayTableRows = function (
  patients,
  encounters,
  options,
  history,
  mode,
  secOptions,
) {
  let result = [];
  let rows = [];
  const tableHeadersId = [
    'personalInformation',
    'cellPhone',
    'healthcareService',
    'reasonForReferral',
    'time',
    'status',
    /*'messages',*/
    'encounterSheet',
  ];
  const tableHeaders = getTableHeaders(tableHeadersId);
  for (let [encountersId, encounter] of Object.entries(encounters)) {
    let row = [];
    for (
      let columnIndex = 0;
      columnIndex < tableHeaders.length;
      columnIndex++
    ) {
      const patient = patients[`#${encounter.patient}`];
      switch (tableHeaders[columnIndex].tableHeader) {
        case 'Personal information':
          row.push({
            id: patient.identifier,
            idType: patient.identifierTypeText,
            priority: encounter.priority,
            gender: patient.gender,
            firstName: patient.firstName,
            lastName: patient.lastName,
            align: 'right',
          });
          break;
        case 'Encounter sheet':
          row.push({
            label: 'Encounter Sheet',
            padding: 'default',
            align: 'center',
            color: 'primary',
            onClickHandler() {
              goToEncounterSheet(encounter, patient, history);
            },
            mode: isAllowed('encounter_sheet') === 'hide' ? 'view' : mode,
          });
          break;
        case 'Messages':
          row.push({
            padding: 'default',
            align: 'center',
            badgeContent: 0,
          });
          break;
        case 'Status':
          row.push({
            async onChange(code) {
              try {
                const answer = await FHIR('Encounter', 'doWork', {
                  functionName: 'patchEncounter',
                  functionParams: {
                    encountersId: encounter.id,
                    encounterPatchParams: {
                      extensionSecondaryStatus: code,
                      extensionSecondaryStatusIndex:
                        encounter.extensionSecondaryStatusIndex,
                    },
                  },
                });
                if (answer.status === 200) {
                  return true;
                } else {
                  return true;
                }
              } catch (err) {
                console.log(err);
                return false;
              }
            },
            text_color: '#076ce9',
            padding: 'default',
            defaultValue:
              encounter.extensionSecondaryStatus || encounter.status,
            options:
              encounter.extensionSecondaryStatus && secOptions.length
                ? secOptions
                : options,
            align: 'center',
            background_color: '#eaf7ff',
            icon_color: '#076ce9',
            langDirection: 'rtl',
            mode: this.mode,
          });
          break;
        case 'Cell phone':
          row.push({
            padding: 'default',
            align: 'center',
            label: patient.mobileCellPhone || null,
            color: '#0027a5',
          });
          break;
        case 'Healthcare service':
          row.push({
            padding: 'default',
            label: encounter.serviceType ? encounter.serviceType : null,
          });
          break;
        case 'Reason for refferal':
          row.push({
            padding: 'default',
            label: encounter.examination ? encounter.examination : null,
          });
          break;
        case 'Time':
          row.push({
            padding: 'default',
            align: 'center',
            label: formatTime(encounter.extensionStatusUpdateDate),
          });
          break;
        default:
          break;
      }
    }
    rows.push(row);
  }
  result[0] = tableHeaders;
  result[1] = rows;
  return result;
};
