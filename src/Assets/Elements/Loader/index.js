import React from 'react';
import { StyledSVG, StyleLoaderBox } from './style';
import { useTranslation } from 'react-i18next';

const Loader = ({ opacity }) => {
  const { t } = useTranslation();

  return (
    <StyleLoaderBox opacity={opacity ? opacity : null}>
      <StyledSVG
        xmlns='http://www.w3.org/2000/svg'
        width='189'
        height='186'
        viewBox='0 0 189 186'>
        <defs>
          <radialGradient
            id='prefix__a'
            cx='95.262%'
            cy='124.405%'
            r='260.51%'
            fx='95.262%'
            fy='124.405%'>
            <stop offset='0%' stopColor='#79FFC0' />
            <stop offset='100%' stopColor='#2EE8FC' />
          </radialGradient>
        </defs>
        <g fill='url(#prefix__a)' fillRule='evenodd'>
          <circle cx='149.204' cy='37.752' r='17.424' fillOpacity='.2' />
          <circle cx='170.984' cy='95.832' r='17.424' fillOpacity='.3' />
          <circle cx='144.848' cy='149.556' r='17.424' fillOpacity='.5' />
          <circle cx='94.028' cy='168.432' r='17.424' fillOpacity='.6' />
          <circle cx='94.028' cy='17.424' r='17.424' fillOpacity='.1' />
          <g transform='matrix(-1 0 0 1 59.18 20.328)'>
            <circle
              cx='18.876'
              cy='17.424'
              r='17.424'
              fillOpacity='.8'
              opacity='.9'
            />
            <circle cx='40.656' cy='75.504' r='17.424' fillOpacity='.7' />
            <circle cx='17.424' cy='129.228' r='17.424' fillOpacity='.7' />
          </g>
        </g>
      </StyledSVG>
      <h3>{t('Please wait')}...</h3>
    </StyleLoaderBox>
  );
};

export default Loader;
