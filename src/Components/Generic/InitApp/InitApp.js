import React, {Suspense, useEffect, useState} from 'react';
import { connect } from 'react-redux';
import VerticalRoute from 'Components/Routes/VerticalRoute';
import GlobalStyle from 'Assets/Themes/GlobalStyle';
import CircularProgress from '@material-ui/core/CircularProgress';
import GenericRoute from 'Components/Routes/GenericRoute';
import { Switch, Route } from 'react-router-dom';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import Loader from 'Assets/Elements/Loader/loginLoader';
import ToastMessage from "Assets/Elements/ToastMessage";
import { useIdleTimer } from "react-idle-timer";
import PopUpSessionTimeout from "Assets/Elements/PopUpSessionTimeout"
import { restoreTokenAction } from 'Store/Actions/LoginActions/LoginActions';
import * as moment from "moment";
import { getToken } from 'Utils/Helpers/getToken';
// import PrivateRoute from 'Components/PrivateRoute/PrivateRoute';

const InitApp = ({ lang_id, lang_code, languageDirection, restoreTokenAction}) => {

  const [popupTimeoutIsOpen, setPopupTimeoutIsOpen] = useState(false);
  const MINUTES_BEFORE_EXPIRED = 10;
  const POPUP_TIMEOUT_AFTER_MINUTES = 45;

  useEffect(() => {
    let interval =  setInterval(() => {
        let tokenExpired = getToken('tokenExpired');
        let isInTheLastMinutes = tokenExpired - moment().unix() < MINUTES_BEFORE_EXPIRED * 60
        if (!isIdle() && isInTheLastMinutes) {
          restoreTokenAction();
        }
    },  1000 * 60 * 5) //refresh token interval - check every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const handleOnIdle = event => {
    setPopupTimeoutIsOpen(true);
  }

  const { isIdle } = useIdleTimer({
    timeout: 1000 * 60 * POPUP_TIMEOUT_AFTER_MINUTES,
    onIdle: handleOnIdle,
    debounce: 1000
  })

  return (
    <React.Fragment>
      <Suspense fallback={<Loader/>}>
        <GlobalStyle
          lang_id={lang_id}
          language_direction={languageDirection}
          lang_code={lang_code}
        />
        <Switch>
          {/* TODO not sure if this needs to be a PrivateRoute or not */}
          {/* Since the components that gets rendered are PrivateComponents */}
          <Route
            exact
            component={GenericRoute}
            path={`${baseRoutePath()}/generic/:page`}
          />
          <Route
            exact
            component={VerticalRoute}
            path={`${baseRoutePath()}/:subRoute/:page`}
          />
        </Switch>
        <PopUpSessionTimeout isOpen={popupTimeoutIsOpen} setIsOpen={setPopupTimeoutIsOpen}/>
      </Suspense>
      <ToastMessage  language_direction={languageDirection}/>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    lang_id: state.settings.lang_id,
    languageDirection: state.settings.lang_dir,
    lang_code: state.settings.lang_code
  };
};
export default connect(mapStateToProps, { restoreTokenAction })(InitApp);
