import React, { useEffect, useState } from 'react';
import RadioGroupChoice from 'Assets/Elements/RadioGroupChoice';
import CustomizedSelectCheckList from 'Assets/Elements/CustomizedSelectCheckList';
import { useTranslation } from 'react-i18next';
import { StyleBackgroundDiseases } from './Style';
import { getValueSet } from 'Utils/Services/FhirAPI';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { useFormContext } from 'react-hook-form';
import { FormHelperText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirCondition from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirCondition';
import {ParseQuestionnaireResponseBoolean} from 'Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem';
import { store } from 'index';
import { longCodeListOptions } from 'Assets/Elements/CustomizedSelectCheckList/RenderTemplates/longCodeListOptions';
import { isRTLLanguage } from 'Utils/Helpers/language';

const BackgroundDiseases = ({
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
  const radioName = 'background_diseases';
  const backgroundDiseasesToggleValue = watch(radioName);

  const direction = useSelector((state) => state.settings.lang_dir);

  const [backgroundDiseasesLang, setBackgroundDiseasesLang] = useState('he');
  const [backgroundDiseasesList, setBackgroundDiseasesList] = useState([]);
  const [servicesTypeOpen, setServicesTypeOpen] = useState(false);
  const loadingBackgroundDiseasesList =
    servicesTypeOpen && backgroundDiseasesList.length === 0;

  const backgroundDisRadioList = ['Usually healthy', 'There are diseases'];

  const [selectedList, setSelectedList] = useState([]);

  useEffect(() => {
    register({ name: 'backgroundDiseasesCodes' });
    register({ name: 'backgroundDiseasesIds' });
    (async () => {
      const backgroundDiseasesLinkId = '6';
      let encounterId = null;
      if ((typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) || (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length)) {
        let isBackgroundDiseases = 'noResponse';
        if (typeof currEncounterResponse.items !== "undefined" && currEncounterResponse.items.length) {
          isBackgroundDiseases = ParseQuestionnaireResponseBoolean(currEncounterResponse, backgroundDiseasesLinkId);
          encounterId = currEncounterResponse.encounter;
        } else if (typeof prevEncounterResponse.items !== "undefined" && prevEncounterResponse.items.length) {
          isBackgroundDiseases = ParseQuestionnaireResponseBoolean(prevEncounterResponse, backgroundDiseasesLinkId);
          encounterId = prevEncounterResponse.encounter;
        }
        if (isBackgroundDiseases === true) {
          const conditions = await FHIR('Condition', 'doWork', {
            functionName: 'getConditionListByParams',
            functionParams: {
              category: 'medical_problem',
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
                //ignore duplicates
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
              { background_diseases: 'There are diseases' },
              { backgroundDiseasesIds: conditionIds },
              { backgroundDiseasesCodes: conditionInitIds },
            ]);
            handleLoading('backgroundDiseases');
          }
        } else if (isBackgroundDiseases === false) {
          initValueFunction([
            {
              background_diseases: 'Usually healthy',
            },
          ]);
          handleLoading('backgroundDiseases');
        }
      } else {
        handleLoading('backgroundDiseases');
      }
    })();
    return () =>
      unregister(['backgroundDiseasesCodes', 'backgroundDiseasesIds']);
  }, [
    register,
    unregister,
    patientId,
    setValue,
    currEncounterResponse,
    prevEncounterResponse,
  ]);

  const medicalAdmissionChipLabel = (selected) => {
    return backgroundDiseasesLang !== 'en' ? `${t(selected.reasonCode.name)}` : selected.reasonCode.name;
  };

  useEffect(() => {
    let active = true;

    if (!loadingBackgroundDiseasesList) {
      return undefined;
    }

    (async () => {
      try {
        const sensitivitiesResponse = store.getState().listsBox.bk_diseases;
        setBackgroundDiseasesLang(sensitivitiesResponse.language)
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
          setBackgroundDiseasesList(options);
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingBackgroundDiseasesList]);

  return (
    <StyleBackgroundDiseases>
      <RadioGroupChoice
        gridLabel={`* ${t('Background diseases')}`}
        radioName={radioName}
        listValues={backgroundDisRadioList}
      />
      <FormHelperText
        style={{ textAlign: `${direction === 'rtl' ? 'right' : 'left'}` }}
        error={requiredErrors[radioName] ? true : false}>
        {requiredErrors[radioName] || ' '}
      </FormHelperText>
      {backgroundDiseasesToggleValue === 'There are diseases' && (
        <CustomizedSelectCheckList
          selectedList={selectedList}
          selectCheckList={backgroundDiseasesList}
          loadingCheckList={loadingBackgroundDiseasesList}
          servicesTypeOpen={servicesTypeOpen}
          setServicesTypeOpen={setServicesTypeOpen}
          valueSetCode={'backgroundDiseasesCodes'}
          labelInputText={'Diseases details'}
          popperWidth={700}
          popperLanguageDirection={isRTLLanguage(backgroundDiseasesLang) ? 'rtl' : 'ltr'}
          //if the language is english the list will be list of professional codes
          defaultRenderOptionFunction={backgroundDiseasesLang === 'en' ? longCodeListOptions : defaultRenderOptionFunction}
          defaultChipLabelFunction={medicalAdmissionChipLabel}
          sortByTranslation={!backgroundDiseasesLang === 'en'}
          virtual
        />
      )}
    </StyleBackgroundDiseases>
  );
};
export default BackgroundDiseases;
