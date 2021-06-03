import React, { useEffect, useState } from 'react';
import StyledFilterBox, { StyledCustomizedSelect } from './Style';
import { connect } from 'react-redux';
import CustomizedSelect from 'Assets/Elements/CustomizedSelect';
import CustomizedDatePicker from 'Assets/Elements/CustomizedDatePicker';
import { useTranslation } from 'react-i18next';
import { getHealhcareService, getValueSet } from 'Utils/Services/FhirAPI';
import {
  normalizeHealthCareServiceValueData,
  normalizeValueData,
} from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeValueData';
import ListItemText from '@material-ui/core/ListItemText';
import errorHandler from 'Utils/Helpers/errorHandler';
import {
  setFilterOrganizationAction,
  setFilterServiceTypeAction,
} from 'Store/Actions/FilterActions/FilterActions';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { FHIR } from 'Utils/Services/FHIR';
import { emptyArrayAll } from 'Utils/Helpers/emptyArray';

/**
 * @author Yuriy Gershem yuriyge@matrix.co.il
 * @param languageDirection
 * @param facility
 * @param props
 * @returns {*}
 * @constructor
 */

const FilterBox = ({
  languageDirection,
  facility,
  selectFilterOrganization,
  selectFilterServiceType,
  setFilterOrganizationAction,
  setFilterServiceTypeAction,
  selectFilterIsSet,
  serviceTypes,
  clinicsList
}) => {
  const { t } = useTranslation();

  const [optionsOrganization, setLabelOrganization] = useState([]);
  const [optionsServiceType, setLabelServiceType] = useState([]);
  const [defaultServiceType, setDefaultServiceType] = useState([]);

  //Gets organizations list data
  useEffect(() => {
    (async () => {
      try {
        //Array for list options with default element (All).
        let array = emptyArrayAll(t('All'));
        //Nested destructuring from Promise. ES6 new syntax.
        //const {data: {entry: dataOrganization}} = await getOrganization();
        const {
          entry: dataOrganization
        } = clinicsList;

        for (let entry of dataOrganization) {
          if (entry.resource !== undefined) {
            const labelOrganizationData = normalizeValueData(entry.resource);
            array.push(labelOrganizationData);
          }
        }
        setLabelOrganization(array);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [t]);

  useEffect(() => {
    (async () => {
      try {
        const {
            expansion: { contains },
        } = serviceTypes;
        let options = emptyArrayAll(t('All'));
        for (let status of contains) {
          options.push(normalizeFhirValueSet(status));
        }
        setLabelServiceType(options);
        setDefaultServiceType(options);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [t]);
  //Auto set current facility
  useEffect(() => {
    if (selectFilterIsSet === 0) {
      organizationOnChangeHandler(
        facility !== 0 && selectFilterOrganization === 0
          ? facility
          : selectFilterOrganization,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const organizationOnChangeHandler = (code) => {
    setFilterOrganizationAction(code);
    if (code > 0) {
      //Array for list options with default element (All).
      let array = emptyArrayAll(t('All'));

      (async () => {
        try {
          //Nested destructuring from Promise. ES6 new syntax.
          const {
            data: { entry: dataServiceType },
          } = await getHealhcareService(code);

          for (let entry of dataServiceType) {
            if (entry.resource !== undefined) {
              const setLabelServiceType = normalizeHealthCareServiceValueData(
                entry.resource,
              );
              array.push(setLabelServiceType);
            }
          }
          setFilterServiceTypeAction(0);
          setLabelServiceType(array);
        } catch (err) {
          errorHandler(err);
        }
      })();
    } else {
      setFilterServiceTypeAction(0);
      setLabelServiceType(
        defaultServiceType.length > 0
          ? defaultServiceType
          : emptyArrayAll(t('All')),
      );
    }
    return true;
  };

  const serviceTypeOnChangeHandler = (code) => {
    setFilterServiceTypeAction(code);
    return true;
  };

  return (
    <StyledFilterBox>
      <CustomizedDatePicker iconColor={'#076ce9'} iconSize={'27px'} />
      <StyledCustomizedSelect>
        <ListItemText>{t('Branch name')}</ListItemText>
        <CustomizedSelect
          background_color={'#c6e0ff'}
          background_menu_color={'#edf8ff'}
          icon_color={'#076ce9'}
          text_color={'#002398'}
          defaultValue={selectFilterOrganization}
          options={optionsOrganization}
          onChange={organizationOnChangeHandler}
          langDirection={languageDirection}
        />
      </StyledCustomizedSelect>
      <StyledCustomizedSelect>
        <ListItemText>{t('Service type')}</ListItemText>
        <CustomizedSelect
          background_color={'#c6e0ff'}
          background_menu_color={'#edf8ff'}
          icon_color={'#076ce9'}
          text_color={'#002398'}
          defaultValue={selectFilterServiceType}
          options={optionsServiceType}
          onChange={serviceTypeOnChangeHandler}
          langDirection={languageDirection}
        />
      </StyledCustomizedSelect>
    </StyledFilterBox>
  );
};

const mapStateToProps = (state) => {
  return {
    languageDirection: state.settings.lang_dir,
    facility: parseInt(state.settings.facility),
    selectFilterOrganization: state.filters.filter_organization,
    selectFilterServiceType: state.filters.filter_service_type,
    selectFilterIsSet: state.filters.filter_is_set,
    tabValue: state.filters.statusFilterBoxValue,
    serviceTypes: state.listsBox.service_types,
    clinicsList: state.listsBox.clinicsList
  };
};

export default connect(mapStateToProps, {
  setFilterOrganizationAction,
  setFilterServiceTypeAction,
})(FilterBox);
