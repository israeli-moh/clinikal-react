/**
 * @author Yuriy Gershem yuriyge@matrix.co.il
 * @returns {*}
 * @constructor
 */

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Divider from '@material-ui/core/Divider';
import {
  StyledDiv,
  StyledTitleTypography,
  StyledTypography,
  StyledChip,
  StyledContentBlock,
  StyledGrid
} from './Style';
import { useTranslation } from 'react-i18next';
import { Grid } from '@material-ui/core';
import Tooltip from "@material-ui/core/Tooltip";



const MedicalIssue = ({ title, items, currResponse, prevResponse, linkId , langDirection}) => {
  const { t } = useTranslation();

  return (
    <StyledDiv>
      <StyledTitleTypography variant='h6' gutterBottom>
        {title}
      </StyledTitleTypography>
      <Divider />
      <StyledContentBlock>
        {items === null ? (
          <StyledTypography>{t('Not known')}</StyledTypography>
        ) : items.length ? (
          <Grid container spacing={2}>
            <StyledGrid item>
              <Grid container spacing={2}>
                {items.map((issue, index) => (
                  <StyledGrid item key={index}>
                    <Tooltip title={t(issue)} aria-label={t(issue)}>
                      <StyledChip color='primary' label={t(issue)} dir={langDirection ? langDirection : 'inherit'} />
                    </Tooltip>
                  </StyledGrid>
                ))}
              </Grid>
            </StyledGrid>
          </Grid>
        ) : null}
      </StyledContentBlock>
    </StyledDiv>
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    props: ownProps,
  };
};
export default connect(mapStateToProps, null)(MedicalIssue);
