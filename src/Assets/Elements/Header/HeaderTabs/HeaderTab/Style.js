import styled from 'styled-components';
import Tab from '@material-ui/core/Tab';
export default styled(Tab)`
  height: 88px;
  padding: 0;
  min-width: 80px;

  @media (min-width: 1025px) {
    min-width: 120px;
  }
`;
