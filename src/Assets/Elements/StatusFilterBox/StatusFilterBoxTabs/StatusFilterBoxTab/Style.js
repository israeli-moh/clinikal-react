import styled from 'styled-components';
import Tab from '@material-ui/core/Tab';

export default styled(Tab)`
  min-width: 150px;
  max-width: 270px;
  font-size: 14px;
  color: ${(props) => (props.selected ? null : '#000d37')};

  & .MuiTab-wrapper {
    flex-direction: row-reverse;
    justify-content: space-between;
    margin: 0px 40px;
  }
`;
