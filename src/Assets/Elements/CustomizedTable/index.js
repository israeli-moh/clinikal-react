import React from 'react';
import TableHead from '@material-ui/core/TableHead';
import { useTranslation } from 'react-i18next';
import TableBody from '@material-ui/core/TableBody';
import CustomizedTableHeaderRow from './CustomizedTableHeaderRow';
import CustomizedTableHeaderCell from './CustomizedTableHeaderCell';
import StyledCustomizedTable from './Style';
import CustomizedTablePersonalInformationCell from './CustomizedTablePersonalInformationCell';
import CustomizedTableContainer from './CustomizedTableContainer';
import CustomizedTableLabelCell from './CustomizedTableLabelCell';
import CustomizedTableButtonCell from './CustomizedTableButtonCell';
import CustomizedTableBadgeCell from './CustomizedTableBadgeCell';
import CustomizedTableSelectCell from './CustomizedTableSelectCell';
import CustomizedTableRow from './CustomizedTableRow';
import NoContentTable from './NoContentTable';
import {
  SELECT_CELL,
  BADGE_CELL,
  BUTTON_CELL,
  LABEL_CELL,
  PERSONAL_INFORMATION_CELL,
} from './CustomizedTableComponentsTypes';

const CustomizedTable = ({ tableHeaders, tableData }) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      {Array.isArray(tableData) && tableData.length ? (
        <CustomizedTableContainer>
          <StyledCustomizedTable stickyHeader>
            <TableHead>
              <CustomizedTableHeaderRow>
                {tableHeaders.map((tableHeader, tableHeaderIndex) => (
                  <CustomizedTableHeaderCell
                    key={tableHeaderIndex}
                    align={tableHeader.align}>
                    {tableHeader.hideTableHeader
                      ? null
                      : t(tableHeader.tableHeader)}
                  </CustomizedTableHeaderCell>
                ))}
              </CustomizedTableHeaderRow>
            </TableHead>
            <TableBody>
              {tableData.map((tableRow, tableRowIndex) => {
                return (
                  <CustomizedTableRow key={tableRowIndex}>
                    {tableHeaders.map((tableCellItem, tableCellItemIndex) => {
                      let rowData = tableRow[tableCellItemIndex];
                      switch (tableCellItem.component) {
                        case BUTTON_CELL:
                          return (
                            <CustomizedTableButtonCell
                              label={rowData.label}
                              align={rowData.align}
                              padding={rowData.padding}
                              color={rowData.color}
                              variant={rowData.variant}
                              onClickHandler={rowData.onClickHandler}
                              key={tableCellItemIndex}
                              mode={rowData.mode}
                            />
                          );
                        case LABEL_CELL:
                          return (
                            <CustomizedTableLabelCell
                              padding={rowData.padding}
                              align={rowData.align}
                              color={rowData.color}
                              label={rowData.label}
                              key={tableCellItemIndex}
                            />
                          );
                        case BADGE_CELL:
                          return (
                            <CustomizedTableBadgeCell
                              badgeContent={rowData.badgeContent}
                              align={rowData.align}
                              padding={rowData.padding}
                              key={tableCellItemIndex}
                            />
                          );
                        case SELECT_CELL:
                          return (
                            <CustomizedTableSelectCell
                              onChange={rowData.onChange}
                              text_color={rowData.text_color}
                              padding={rowData.padding}
                              defaultValue={rowData.defaultValue}
                              icon_color={rowData.icon_color}
                              background_color={rowData.background_color}
                              align={rowData.align}
                              options={rowData.options}
                              langDirection={rowData.langDirection}
                              key={`changeableKey${Math.floor(Math.random() * 100)}`}
                              mode={rowData.mode}
                            />
                          );
                        case PERSONAL_INFORMATION_CELL:
                          return (
                            <CustomizedTablePersonalInformationCell
                              priority={rowData.priority}
                              align={rowData.align}
                              gender={rowData.gender}
                              id={rowData.id}
                              idType={rowData.idType}
                              firstName={rowData.firstName}
                              lastName={rowData.lastName}
                              padding={rowData.padding}
                              key={tableCellItemIndex}
                            />
                          );
                        default:
                          console.log(
                            'Not supported component check your components name',
                          );
                          return null;
                      }
                    })}
                  </CustomizedTableRow>
                );
              })}
            </TableBody>
          </StyledCustomizedTable>
        </CustomizedTableContainer>
      ) : (
        <NoContentTable />
      )}
    </React.Fragment>
  );
};

export default CustomizedTable;
