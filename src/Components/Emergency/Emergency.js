import React from 'react';
import { Switch } from 'react-router-dom';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import PatientTracking from 'Components/Generic/PatientTracking';
import PrivateRoute from 'Components/PrivateRoute/PrivateRoute';
import { connect } from 'react-redux';

const Emergency = ({ isAuth }) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        path={`${baseRoutePath()}/emergency/patientTracking`}
        component={PatientTracking}
        isAuth={isAuth}
      />
    </Switch>
  );
};

const mapStateToProps = (state) => ({ isAuth: state.login.isAuth });

export default connect(mapStateToProps, null)(Emergency);
