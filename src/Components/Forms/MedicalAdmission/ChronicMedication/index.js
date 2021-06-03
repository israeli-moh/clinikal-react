import React, { useEffect, useState } from 'react';
import RadioGroupChoice from 'Assets/Elements/RadioGroupChoice';
import CustomizedSelectCheckList from 'Assets/Elements/CustomizedSelectCheckList';
import { useTranslation } from 'react-i18next';
import { StyleChronicMedication } from './Style';
import { getValueSet } from 'Utils/Services/FhirAPI';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { useFormContext } from 'react-hook-form';
import { FormHelperText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirMedicationStatement from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirMedicationStatement';
import { multiMedicationsOptions } from 'Assets/Elements/CustomizedSelectCheckList/RenderTemplates/multiMedicationOptions';
import {ParseQuestionnaireResponseBoolean} from "Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem";
import { store } from 'index';

const ChronicMedication = ({
  defaultRenderOptionFunction,
  defaultChipLabelFunction,
  handleLoading,
  initValueFunction,
}) => {
  const { t } = useTranslation();
  const {
    register,
    unregister,
    watch,
    requiredErrors,
    patientId,
    setValue,
    currEncounterResponse,
    prevEncounterResponse,
    getValues,
  } = useFormContext();

  const direction = useSelector((state) => state.settings.lang_dir);
  const radioName = 'medication';
  const medicationToggleButton = watch(radioName);

  const [chronicMedicationList, setChronicMedicationList] = useState([]);
  const [servicesTypeOpen, setServicesTypeOpen] = useState(false);
  const loadingChronicMedicationList =
    servicesTypeOpen && chronicMedicationList.length === 0;

  //Radio buttons for medication details
  const medicationRadioList = ["Doesn't exist", 'Exist'];

  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    register({ name: 'chronicMedicationCodes' });
    register({ name: 'chronicMedicationIds' });
    (async () => {
      const chronicMedicationLinkId = '7';
      let encounterId  = null;
      if ((typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) || (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length)) {
        let isChronicDisease = 'noResponse';
        if (typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) {
          isChronicDisease = ParseQuestionnaireResponseBoolean(currEncounterResponse, chronicMedicationLinkId);
          encounterId = currEncounterResponse.encounter;
        } else if (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length) {
          isChronicDisease = ParseQuestionnaireResponseBoolean(prevEncounterResponse, chronicMedicationLinkId);
          encounterId = prevEncounterResponse.encounter;
        }
        if (isChronicDisease === true) {
          const medicationStatement = await FHIR(
            'MedicationStatement',
            'doWork',
            {
              functionName: 'getMedicationStatementListByParams',
              functionParams: {
                patient: patientId,
                status: 'active',
                category: 'medication',
                encounter: encounterId
              },
            },
          );
          if (medicationStatement.data.total) {
            const medicationCodes = [];
            const medicationInitIds = [];
            const medicationIds = {};
            medicationStatement.data.entry.forEach((medication) => {
              if (medication.resource) {
                const normalizedMedicationStatement = normalizeFhirMedicationStatement(
                  medication.resource,
                );
                if (!medicationInitIds.includes(normalizedMedicationStatement.medicationCodeableConceptCode)) {
                  medicationCodes.push({
                    reasonCode: {
                      name:
                      normalizedMedicationStatement.medicationCodeableConceptText,
                      code:
                      normalizedMedicationStatement.medicationCodeableConceptCode,
                    },
                    serviceType: {
                      code: '',
                      name: '',
                    },
                  });
                  medicationIds[
                    normalizedMedicationStatement.medicationCodeableConceptCode
                    ] = {
                    id: normalizedMedicationStatement.id,
                    code:
                    normalizedMedicationStatement.medicationCodeableConceptCode,
                  };
                  medicationInitIds.push(normalizedMedicationStatement.medicationCodeableConceptCode)
                }
              }
            });
            setSelectedList(medicationCodes);
            initValueFunction([
              { medication: 'Exist' },
              { chronicMedicationIds: medicationIds },
              { chronicMedicationCodes: medicationInitIds },
            ]);
            handleLoading('medication');
          }
        } else if (isChronicDisease === false) {
          initValueFunction([{ medication: "Doesn't exist" }]);
          handleLoading('medication');
        }
      } else {
        handleLoading('medication');
      }
    })();
    return () => unregister(['chronicMedicationCodes', 'chronicMedicationIds']);
  }, [
    register,
    unregister,
    patientId,
    setValue,
    currEncounterResponse,
    prevEncounterResponse,
  ]);

  useEffect(() => {
    let active = true;

    if (!loadingChronicMedicationList) {
      return undefined;
    }

    (async () => {
      try {
        const sensitivitiesResponse = store.getState().listsBox.drugs_list;
        if (active) {
          // const myOptions = [{ code: '1', display: 'sadfadsasd' }];
          const options = [];
          const servicesTypeObj = {};
          const allReasonsCode = await Promise.all(
              sensitivitiesResponse.expansion.contains.map((sensitive) => {
              const normalizedSensitiveSet = normalizeFhirValueSet(sensitive);
              const optionObj = {};
              optionObj['serviceType'] = {
                ...servicesTypeObj[normalizedSensitiveSet.code],
              };
              optionObj['reasonCode'] = normalizedSensitiveSet;
              options.push(optionObj);
            }),
          );
          console.log(options);
          setChronicMedicationList(options);
          // setChronicMedicationList(myOptions);
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingChronicMedicationList]);

  return (
    <StyleChronicMedication>
      <RadioGroupChoice
        gridLabel={`* ${t('Chronic medications')}`}
        radioName={radioName}
        listValues={medicationRadioList}
      />
      <FormHelperText
        style={{ textAlign: `${direction === 'rtl' ? 'right' : 'left'}` }}
        error={requiredErrors[radioName] ? true : false}>
        {requiredErrors[radioName] || ' '}
      </FormHelperText>
      {medicationToggleButton === 'Exist' && (
        <CustomizedSelectCheckList
          selectedList={selectedList}
          selectCheckList={chronicMedicationList}
          loadingCheckList={loadingChronicMedicationList}
          servicesTypeOpen={servicesTypeOpen}
          setServicesTypeOpen={setServicesTypeOpen}
          valueSetCode={'chronicMedicationCodes'}
          labelInputText={'Medications details'}
          popperWidth={800}
          popperLanguageDirection={'ltr'}
          // helperErrorText={
          //   'The visit reason performed during the visit must be selected'
          // }
          virtual
          defaultRenderOptionFunction={multiMedicationsOptions}
          defaultChipLabelFunction={defaultChipLabelFunction}
        />
      )}
    </StyleChronicMedication>
  );
};
export default ChronicMedication;
