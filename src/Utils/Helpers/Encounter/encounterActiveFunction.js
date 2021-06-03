import { FHIR } from 'Utils/Services/FHIR';
import { normalizeFhirEncountersWithPatients } from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirEncountersWithPatients';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { setEncounterWithPatientsAction } from 'Store/Actions/FhirActions/fhirActions';
import { store } from 'index';

export const encounterActiveFunction = async function (
  setTable,
  setTabs,
  history,
  selectFilter,
) {
  try {
    const searchParameters = {
      summary: false,
      organization: selectFilter.filter_organization,
      serviceType: selectFilter.filter_service_type,
      statuses: this.statuses,
      sortParams: this.sort,
      extendedStatuses: this.extendedStatuses,
    };
    if (!this.isDateDisabled) {
      if (this.searchDateColumn) {
        searchParameters[this.searchDateColumn] = selectFilter.filter_date;
      } else {
        searchParameters['date'] = selectFilter.filter_date;
      }
    }
    const encountersWithPatients = await FHIR('Encounter', 'doWork', {
      functionName: 'getEncountersWithPatients',
      functionParams: searchParameters,
    });

    const [patients, encounters] = normalizeFhirEncountersWithPatients(
      encountersWithPatients.data.entry,
    );
    setTabs((prevTabs) => {
      //Must be copied with ... operator so it will change reference and re-render StatusFilterBoxTabs
      const prevTabsClone = [...prevTabs];
      prevTabsClone[
        prevTabsClone.findIndex(
          (prevTabsObj) => prevTabsObj.tabValue === this.tabValue,
        )
      ].count = encountersWithPatients.data.total;
      return prevTabsClone;
    });

    let options = [];
    let secOptions = [];
    let {
        expansion: { contains },
    } = store.getState().listsBox.encounter_statuses;
    for (let status of contains) {
      options.push(normalizeFhirValueSet(status));
    }
    if (this.valueSet) {
      let {
          expansion: { contains },
      } = store.getState().listsBox[this.valueSet];
      for (let status of contains) {
        secOptions.push(normalizeFhirValueSet(status));
      }
    }
    const table = this.tableFunction(
      patients,
      encounters,
      options,
      history,
      this.mode,
      secOptions,
    );

    setTable(table);

    store.dispatch(setEncounterWithPatientsAction(patients, encounters));
  } catch (err) {
    console.log(err);
  }
};
