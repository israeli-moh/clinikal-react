import Tabs from "@material-ui/core/Tabs";
import styled from "styled-components";
import React from "react";

export default styled(({...other}) => <Tabs {...other} />)`
  margin: 0;
  & .MuiTabs-indicator {
    color: #ffffff;
    border: solid 2px #ffffff;
    background-color: #ffffff;
    border-radius: 5px;
  }

  @media (min-width: 1025px){
      margin: 0 60px;

  }
`;