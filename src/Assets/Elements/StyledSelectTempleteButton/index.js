import { StyledButton } from 'Assets/Elements/StyledButton';
import React from 'react';
import { connect } from 'react-redux';
import isAllowed from 'Utils/Helpers/isAllowed';

 const StyledSelectTemplateButton = ({
  width,
  height,
  color,
  margin,
  variant,
  size,
  lang_code,
  ...rest
}) => {
  return (<StyledButton
    width={lang_code === 'en' ? '130px' : '113px'}
    height='32px'
    color='primary'
    margin={margin ? margin : '0 16px'}
    variant='outlined'
    size='small'
    fontSize={lang_code === 'en' ? '12px' : null}
    {...rest}
  />
  );
};

const mapStateToProps = (state) => {
  return {
    lang_code: state.settings.lang_code,
  };
};

export default connect(mapStateToProps, null)(StyledSelectTemplateButton);
