import React, { useEffect, useState } from 'react';
import RadioGroupChoice from 'Assets/Elements/RadioGroupChoice';
import CustomizedSelectCheckList from 'Assets/Elements/CustomizedSelectCheckList';
import { useTranslation } from 'react-i18next';
import { StyledSensitivities } from './Style';
import { getValueSet } from 'Utils/Services/FhirAPI';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { useFormContext } from 'react-hook-form';
import { FormHelperText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirCondition from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirCondition';
import {ParseQuestionnaireResponseBoolean} from 'Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem';
import { store } from 'index';

const Sensitivities = ({
  defaultRenderOptionFunction,
  defaultChipLabelFunction,
  handleLoading,
  initValueFunction
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
  const radioName = 'sensitivities';

  const sensitivityToggleValue = watch(radioName);

  const [selectedList, setSelectedList] = useState([]);

  const [sensitivitiesList, setSensitivitiesList] = useState([]);
  const [servicesTypeOpen, setServicesTypeOpen] = useState(false);
  const loadingSensitivitiesList =
    servicesTypeOpen && sensitivitiesList.length === 0;

  const sensitivitiesRadioList = ['Not known', 'Known'];

  useEffect(() => {
    register({ name: 'sensitivitiesCodes' });
    register({ name: 'sensitiveConditionsIds' });
    (async () => {
      const sensitivitiesLinkId = '5';
      if ((typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) || (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length)) {
        let isSensitive = 'noResponse';
        let encounterId = null;
        if (typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) {
          isSensitive = ParseQuestionnaireResponseBoolean(currEncounterResponse, sensitivitiesLinkId)
          encounterId = currEncounterResponse.encounter;
        } else if (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length) {
          isSensitive = ParseQuestionnaireResponseBoolean(prevEncounterResponse, sensitivitiesLinkId)
          encounterId = prevEncounterResponse.encounter;
        }
        if (isSensitive === true) {
          const conditions = await FHIR('Condition', 'doWork', {
            functionName: 'getConditionListByParams',
            functionParams: {
              category: 'sensitive',
              subject: patientId,
              status: 'active',
              encounter: encounterId
            },
          });
          if (conditions.data.total) {
            const conditionCodes = [];
            const conditionInitIds = [];
            const conditionIds = {};
            conditions.data.entry.forEach((condition) => {
              if (condition.resource) {
                const normalizedCondition = normalizeFhirCondition(
                  condition.resource,
                );
                if (!conditionInitIds.includes(normalizedCondition.codeCode)) {
                  conditionCodes.push({
                    reasonCode: {
                      name: normalizedCondition.codeText,
                      code: normalizedCondition.codeCode,
                    },
                    serviceType: {
                      code: '',
                      name: '',
                    },
                  });
                  conditionIds[normalizedCondition.codeCode] = {
                    id: normalizedCondition.id,
                    code: normalizedCondition.codeCode,
                  };
                  conditionInitIds.push(normalizedCondition.codeCode)
                }
              }
            });
            setSelectedList(conditionCodes);
            initValueFunction([
              { sensitivities: 'Known' },
              { sensitiveConditionsIds: conditionIds },
              { sensitivitiesCodes: conditionInitIds },
            ]);
            handleLoading('sensitivities');
          }
        } else if (isSensitive === false) {
          initValueFunction([{ sensitivities: 'Not known' }]);
          handleLoading('sensitivities');
        }
      } else {
        handleLoading('sensitivities');
      }
    })();
    return () => unregister(['sensitivitiesCodes', 'sensitiveConditionsIds']);
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

    if (!loadingSensitivitiesList) {
      return undefined;
    }

    (async () => {
      try {
        const sensitivitiesResponse = store.getState().listsBox.sensitivities;
        if (active) {
          const options = [];
          const servicesTypeObj = {};
          await Promise.all(
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
          setSensitivitiesList(options);
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingSensitivitiesList]);

  return (
    <StyledSensitivities>
      <RadioGroupChoice
        gridLabel={`* ${t('Sensitivities')}`}
        radioName={radioName}
        listValues={sensitivitiesRadioList}
        // customRef={focus}
      />
      <FormHelperText
        style={{ textAlign: `${direction === 'rtl' ? 'right' : 'left'}` }}
        error={requiredErrors[radioName] ? true : false}>
        {requiredErrors[radioName] || ' '}
      </FormHelperText>
      {sensitivityToggleValue === 'Known' && (
        <CustomizedSelectCheckList
          selectedList={selectedList}
          selectCheckList={sensitivitiesList}
          loadingCheckList={loadingSensitivitiesList}
          servicesTypeOpen={servicesTypeOpen}
          setServicesTypeOpen={setServicesTypeOpen}
          valueSetCode={'sensitivitiesCodes'}
          labelInputText={'Sensitivities details'}
          // helperErrorText={'Some error text'}
          defaultRenderOptionFunction={defaultRenderOptionFunction}
          defaultChipLabelFunction={defaultChipLabelFunction}
          sortByTranslation
        />
      )}
    </StyledSensitivities>
  );
};

export default Sensitivities;
