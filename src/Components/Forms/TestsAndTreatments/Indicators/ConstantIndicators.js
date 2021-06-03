/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param {object} ConstantIndicators
 * @returns UI DRAW OF ConstantIndicators
 */

import {
  StyledConstantForm,
  StyledConstantHeaders,
} from 'Components/Forms/TestsAndTreatments/Style';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ConstantIndicators = ({ constantIndicators, setFormDirty }) => {
  const { t } = useTranslation();
  if (!constantIndicators) {
    return null;
  } else {
    return constantIndicators ? (
      <React.Fragment>
        <StyledConstantHeaders>
          {t('Constant indicators')}
        </StyledConstantHeaders>
        <hr />
        <StyledConstantForm autoComplete='off'>
          {Object.entries(constantIndicators).map(([key, value]) => {
            return value ? (
              <value.componentType
                key={key}
                inputProps={{ pattern: value.pattern }}
                onChange={value.handleOnChange}
                id={value.value}
                label={t(value.label) + ' (' + t(value.unit) + ')'}
                value={value.value}
                placeholder={value.placeholder}
                name={value.name}
                componenttype={value.componenttype}
                disabled={value.disabled}
                onKeyUp={() => setFormDirty(true)}
              />
            ) : null;
          })}
        </StyledConstantForm>
      </React.Fragment>
    ) : null;
  }
};
export default ConstantIndicators;
