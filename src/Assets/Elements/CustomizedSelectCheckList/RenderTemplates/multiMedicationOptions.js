import React from "react";
import {Checkbox, Grid, Typography} from "@material-ui/core";
import {CheckBox, CheckBoxOutlineBlankOutlined} from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import {StyleLTRTypography} from "../Style";

export const multiMedicationsOptions = (option, state) => {
  return (
    <React.Fragment>
      <Grid container justify='flex-start' alignItems='center'>
        <Grid item xs={1}>
          <Checkbox
            color='primary'
            icon={<CheckBoxOutlineBlankOutlined/>}
            checkedIcon={<CheckBox/>}
            checked={state.selected}
          />
        </Grid>
        {/*option.reasonCode && option.reasonCode.code && (
          <Grid item xs={2}>
            <Typography noWrap>{option.reasonCode.code}</Typography>
            {/!* <ListItemText>{option.reasonCode.code}</ListItemText> *!/}
          </Grid>
        )*/}
        {option.reasonCode && option.reasonCode.name && (
          <Grid item xs={11}>
            <Tooltip title={option.reasonCode.name} aria-label={option.reasonCode.name}>
              <StyleLTRTypography noWrap>{option.reasonCode.name}</StyleLTRTypography>
            </Tooltip>
            {/* <ListItemText primary={t(option.reasonCode.name)} /> */}
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  )
}