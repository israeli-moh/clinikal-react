import React from 'react';
import StyledButton from './Style';
import { useTranslation } from 'react-i18next';

const CustomizedTableButton = ({
  variant,
  color,
  label,
  onClickHandler,
  mode,
  fontWeight,
  backGroundColor,
  width,
  height,
  other,
}) => {
  const { t } = useTranslation();
  /*  debugger;
    console.log("--------------------");
    console.log("mode Customized table button = "+ mode);
    console.log("--------------------");*/
  return (
    <StyledButton
      fontWeight={fontWeight}
      variant={variant}
      color={color}
      onClick={onClickHandler}
      backgroundcolor={backGroundColor}
      disabled={mode === 'view'}
      width={width}
      height={height}
      {...other}>
      {t(label)}
    </StyledButton>
  );
};

export default CustomizedTableButton;
