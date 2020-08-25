import React, { Component, Suspense, useEffect } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { StyledTabContainer } from './Style';
import { useTranslation } from 'react-i18next';
import LazyLoadComponentsToArray from '../../../../Utils/Helpers/lazyLoadComponentsToArray';

function TabPanel(props) {
  const { children, value, index, dir, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index ? (
        <Box p={3}>
          <div dir={dir}>{children}</div>
        </Box>
      ) : null}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function allyProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}
/*[{"component":"MedicalAdmissionForm","form_name":"Medical Admission","order":"1","permission":"write"},{"component":"MedicalAdmissionForm","form_name":"Tests and Treatments","order":"2","permission":"write"},{"component":"MedicalAdmissionForm","form_name":"Diagnosis and Recommendations","order":"3","permission":"write"}]*/
const FormsContainer = ({ tabs, dir }) => {
  const { t } = useTranslation();

  const [value, setValue] = React.useState(0);
  let formComponents = [];

  // Instruction for how to work with validations this tab forms
  // Overview when a tab is changing these following steps will happen:
  //  validationFunctionToRun -> shouldTabChange -> functionToRunOnTabChange -> setValue
  // If shouldTabChange is false the steps after it won't be executed
  // -------------------------------------------------------
  // 1. Each component is going to be getting in their props
  // {functionToRunOnTabChange,
  // validationFunction,
  // permission}
  // 2. Inside your from  you'll have to use useEffect and initialize the props with their co-responding functions or values(Setting these values won't cause a re-render since it's a ref).
  // Added ',' and '{}' so you can just copy paste these rows into your props
  // 3. You can't be using the embedded rules that react-hook-form is providing you.
  //    Because from the last standup the solution was to not use the handleSubmit from react-hook-form
  //    which means you'll have to create a state for your validations and set your own validation function (Until a better solution will be available).
  // 4. Your validation function should return true or false. True if validation passed and false when validation failed.
  // 5. Your functionToRunOnChange needs to return an array with all of the promises(unresolved - for more information go to DiagnosisAndRecommendation search for onSubmit function);
  // 6. Make sure that where you initialize functionToRunOnTabChange and validationFunction make sure to create an 'unMount' function inside the useEffect to set validationFunction to return true and functionToRunOnTabChange to return an empty array
  // Sorry for this long description. Hopefully it will be easy to understand.

  const validationFunctionToRun = React.useRef(() => true);
  const functionToRunOnTabChange = React.useRef(() => []);

  const handleChange = async (event, newValue) => {
    if (validationFunctionToRun.current()) {
      const shouldBeArray = functionToRunOnTabChange.current();
      if (Array.isArray(shouldBeArray)) {
        await Promise.all(shouldBeArray);
      }
      await shouldBeArray;
      setValue(newValue);
    }
  };
  if (tabs && tabs.data) {
    formComponents = LazyLoadComponentsToArray(tabs.data, formComponents);
  }
  return (
    <StyledTabContainer>
      <AppBar position='sticky' color='default'>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
          aria-label='full width tabs example'>
          {tabs.data.map((tab, key) => {
            return (
              <Tab
                key={'tab_' + key}
                label={t(tab.form_name)}
                {...allyProps(tab.order)}
              />
            );
          })}
        </Tabs>
      </AppBar>
      {tabs.data.map((tab, key) => {
        let FormComponent = formComponents[tab.component];
        return key === value ? (
          <TabPanel
            key={'tab_panel_' + key}
            value={value}
            index={key}
            dir={dir}>
            <Suspense fallback={<span>Loading...</span>}>
              <FormComponent
                functionToRunOnTabChange={functionToRunOnTabChange}
                validationFunction={validationFunctionToRun}
                permission={tab.permission}
              />
            </Suspense>
          </TabPanel>
        ) : (
          <TabPanel
            key={'tab_panel_' + key}
            value={value}
            index={key}
            dir={dir}
          />
        );
      })}
    </StyledTabContainer>
  );
};

export default FormsContainer;
