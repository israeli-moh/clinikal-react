import React, { useEffect, useState } from 'react';
import { StyledSVG, StyleLoaderBox } from './style';
import { useTranslation } from 'react-i18next';
import { getToken } from 'Utils/Helpers/getToken';
import { LOGIN_LANGUAGES } from 'Components/Login/loginLanguages';

/*
 * Temporary component for login loader, until the translations do not return from server
 *
 * */
const LoginLoader = () => {

  const [langDir, setLangDir] = useState(null);
  const [langCode, setLangCode] = useState(null);
  const [translation, setTranslation] = useState([]);

  useEffect(() => {
    const languageCode = getToken('langCode');
    const languageDir = getToken('langDir');
    setLangCode(languageCode.length > 0 ? languageCode : 'en');
    setLangDir(languageDir.length > 0 ? languageDir : 'ltr');
    setTranslation(LOGIN_LANGUAGES[languageCode]);

  },[]);

    return (
    <>
      { langCode && (
          <StyleLoaderBox>
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
      <h3 dir={langDir} >{`${translation['please_wait']}...`}</h3>
    </StyleLoaderBox>
        )
      }
    </>
  );
};

export default LoginLoader;
