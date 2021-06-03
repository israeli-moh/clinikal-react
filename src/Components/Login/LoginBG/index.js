import React from 'react';
import StyledBG, { BGImage, CenteredText } from './Style';
import Typography from '@material-ui/core/Typography';
const LoginBG = ({ src, translation }) => {
  return (
    <StyledBG url={src}>
      <CenteredText>
        <Typography variant={'h1'} align={'center'}>
          {translation['welcome_back']}
        </Typography>
        <Typography variant={'h2'} align={'center'}>
          {translation['clinikal']}
        </Typography>
        <Typography variant={'h3'} align={'center'}>
          {translation['administrative_and_clinical_management_in_one_product']}
        </Typography>
      </CenteredText>
    </StyledBG>
  );
};

export default LoginBG;
