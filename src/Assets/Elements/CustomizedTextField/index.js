import React from 'react';
import StyledTextField from './Style';
import { useSelector } from 'react-redux';
import { KeyboardArrowDown } from '@material-ui/icons';
/**
 * @author Idan Gigi idangi@matrix.co.il
 * @param {String} iconColor
 * @param {String} width
 * @param {String} lang_dir 'ltr' | 'rtl' in case the component doesn't have access to the reducer like in Login component
 * @param {MuiTextFieldProps} MuiTextFieldProps
 * @returns {ReactElement}
 */
const CustomizedTextField = ({
  width,
  iconColor,
  lang_dir,
  ...MuiTextFieldProps
}) => {
  const direction = useSelector((state) => state.settings.lang_dir);
  const { select } = MuiTextFieldProps;
  if (select) {
    MuiTextFieldProps['SelectProps'] = {
      IconComponent: KeyboardArrowDown,
    };
  }

  return (
    <StyledTextField
      direction={direction || lang_dir}
      {...MuiTextFieldProps}
      width={width}
      iconcolor={iconColor}
    />
  );
};

export default CustomizedTextField;
