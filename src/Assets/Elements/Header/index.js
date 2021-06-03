import React, { useState } from 'react';
import StyledAppBar from './Style';
import HeaderTabs from './HeaderTabs';
import Search from './Search';
import HeaderIcon from './HeaderIcon';
import VerticalLine from './VerticalLine';
import notifications from 'Assets/Images/notifications.png';
import Logo from 'Assets/Images/logo.svg';
import { connect } from 'react-redux';
import { logoutAction } from 'Store/Actions/LoginActions/LoginActions';
import { useTranslation } from 'react-i18next';
import normalizeFhirUser from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirUser';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import { StyledListItem } from './Style';
import ListItemText from '@material-ui/core/ListItemText';
import IconWrapper from 'Assets/Elements/Header/IconWrapper';

const Header = ({ Items, logoutAction, activeUser }) => {
  const { t } = useTranslation();

  const userDetails = normalizeFhirUser(activeUser);

  const arrowDropDownItems = [
    /*{
      Label: t('Change Password'),
      func: null,
    },*/
    {
      Label: t('Disconnect'),
      func: logoutAction,
    },
  ];

  const [anchorEl, setAnchorEl] = useState(null);

  const handleArrowClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleArrowClose = () => {
    setAnchorEl(null);
  };
  const arrowOpen = Boolean(anchorEl);

  const id = arrowOpen ? 'arrow-popover' : undefined;
  return (
    <StyledAppBar>
      <HeaderIcon alt='Logo' img={Logo} />
      <HeaderTabs Items={Items} />
      <Search />
      {/*<HeaderIcon alt='notifications icon' img={notifications} /> */}
      {/*<VerticalLine />*/}
      <span>{userDetails.name[0]}</span>
      <IconWrapper onClick={handleArrowClick} open={arrowOpen}>
        {arrowOpen ? (
          <ExpandLess style={{ cursor: 'pointer' }} aria-describedby={id} />
        ) : (
          <ExpandMore />
        )}
      </IconWrapper>
      <Popover
        id={id}
        open={arrowOpen}
        anchorEl={anchorEl}
        onClose={handleArrowClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>
        <List aria-label='list drop down'>
          {arrowDropDownItems.map((item, itemIndex) => {
            return (
              <StyledListItem
                button
                onClick={item.func}
                key={itemIndex}
                divider={itemIndex !== arrowDropDownItems.length - 1}>
                <ListItemText primary={item.Label} />
              </StyledListItem>
            );
          })}
        </List>
      </Popover>
    </StyledAppBar>
  );
};

const mapStateToProps = (state) => {
  return {
    activeUser: state.active.activeUser,
  };
};

export default connect(mapStateToProps, { logoutAction })(Header);
