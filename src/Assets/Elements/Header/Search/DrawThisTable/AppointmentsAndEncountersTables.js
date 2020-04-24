import React from 'react';
import TitleValueComponent from "./TitleValueComponent";
import {useTranslation} from "react-i18next";
import {
    StyledBottomLinks,
    StyledBox, StyledHeaderTableAppointment, StyledHrefButton, StyledHrefTableButton,
    StyledLabelAppointment,
    StyledLabelName, StyledLabelServiceTypeAppointment,
    StyledLabelStatusAppointment,
    StyledLinkWithIconComponent, StyledTableTextCell
} from "./Style";
import moment from "moment";
import normalizeFhirAppointment
    from "Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirAppointment";
import normalizeFhirEncounter
    from "Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirEncounter";
import LinkComponentWithIcon from "./LinkComponentWithIcon";

import ListItem from "@material-ui/core/ListItem";
import Header from "../../index";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import {normalizeFhirAppointmentsWithPatients} from "../../../../../Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirAppointmentsWithPatients";





const AppointmentsAndEncountersTables = ({nextAppointments, curEncounters, prevEncounters, patientTrackingStatuses, encounterStatuses}) => {

    const {t} = useTranslation();

    const prevEncountersEntry = prevEncounters && prevEncounters.data && prevEncounters.data.total > 0 ? prevEncounters.data.entry[1].resource : null;
    const nextAppointmentsElem = nextAppointments && nextAppointments.data && nextAppointments.data.total >0  ? nextAppointments.data.entry[1].resource : null;
    const curEncountersElem = curEncounters ? curEncounters : null;
    const nextAppointmentEntry = nextAppointmentsElem ? normalizeFhirAppointment(nextAppointmentsElem) : null;
    const normalizedPrevEncounter = prevEncountersEntry ? normalizeFhirEncounter(prevEncountersEntry) : null;

    let normalizedCurEncounters = [];
    let normalizedNextAppointments = [];
    let normalizedPrevEncounters = [];

    const getAppointmentWithTimeOrNot =(nextAppointmentEntry)=>{
        let isThisAppToday = moment(nextAppointmentEntry.startTime).format("DD/MM/YYYY") === moment().format("DD/MM/YYYY") ? true : false;
        return  (isThisAppToday ? moment(nextAppointmentEntry.startTime).format("DD/MM/YYYY HH:mm") :moment().format("DD/MM/YYYY")  );
    }


    const handleChartClickOpen = ()=> {
            //TODO:
    }

    const handleAdmissionClickOpen = () => {
            //TODO:
    }

    if (curEncounters && curEncounters.data && curEncounters.data.total > 0) {
        let entry = curEncounters.data.entry;
        entry.map((response, resourceIndex) => {
            if (response && response.resource && response.resource.resourceType === "Encounter") {
                let normalizedCurEncounterElem = normalizeFhirEncounter(response.resource);
                normalizedCurEncounters.push(normalizedCurEncounterElem);
            }


        });
    }
debugger;
    if (nextAppointments && nextAppointments.data && nextAppointments.data.total > 0) {
        let entry = nextAppointments.data.entry;
        entry.map((response, resourceIndex) => {
            if (response && response.resource && response.resource.resourceType === "Appointment") {
                let normalizedNextAppointmentElem = normalizeFhirAppointmentsWithPatients(response.resource);
                normalizedNextAppointments.push(normalizedNextAppointmentElem);
            }


        });
    }

    if (prevEncounters && prevEncounters.data && prevEncounters.data.total > 0) {
        let entry = prevEncounters.data.entry;
        entry.map((response, resourceIndex) => {
            if (response && response.resource && response.resource.resourceType === "Encounter") {
                let normalizedPrevEncounterElem = normalizeFhirEncounter(response.resource);
                normalizedPrevEncounters.push(normalizedPrevEncounterElem);
            }


        });
    }





 debugger;
    return (
        <React.Fragment>
            {normalizedCurEncounters.length > 0 ?
                <React.Fragment>
                    <br/>
                    <StyledHeaderTableAppointment>{t("Current encounter")}</StyledHeaderTableAppointment>
                    <ul></ul>
                    <TableContainer component={Paper}>
                        <Table    aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="right">{t("Encounter's hour")}</TableCell>
                                    <TableCell align="right">{t("Lab test type")}</TableCell>
                                    <TableCell align="center">{t("Status")}</TableCell>
                                    <TableCell align="right"></TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {normalizedCurEncounters.map((encounter, encounterID) => {
                                    return(
                                    <TableRow key={encounterID}>
                                        <TableCell  align="right" omponent="th" scope="row">
                                            <StyledTableTextCell> {moment(encounter.startTime).format("HH:mm")} </StyledTableTextCell>
                                        </TableCell>
                                        <TableCell align="right">
                                            <StyledTableTextCell>{t(encounter.serviceType)} {encounter.serviceType?'-':''} {t(encounter.examination)}</StyledTableTextCell>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StyledLabelStatusAppointment>
                                                <TitleValueComponent
                                                    name={encounterStatuses && encounter ? t(encounterStatuses[encounter.status]) : ''}/>
                                            </StyledLabelStatusAppointment>
                                        </TableCell>
                                        <TableCell align="right">
                                            <StyledHrefTableButton size={'small'} variant="outlined" color="primary"
                                                              href="#contained-buttons"
                                                             /* disabled={curEncounters && curEncounters.data && curEncounters.data.total > 0 ? true : false}*/
                                                              /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                               >
                                                              {t("navigate to encounter sheet")}
                                            </StyledHrefTableButton>
                                        </TableCell>
                                        <TableCell align="right">
                                            <StyledHrefTableButton size={'large'} variant="outlined" color="primary"
                                                              href="#contained-buttons"
                                                             /* disabled={curEncounter && curEncounter.data && curEncounter.data.total > 0 ? true : false}*/
                                                              /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                              >
                                                             {t("Admission form")}
                                            </StyledHrefTableButton>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                                </TableBody>
                                </Table>
                                </TableContainer>
                                </React.Fragment>
                        :

                        null
            }
            {

                        normalizedNextAppointments ?

                            <React.Fragment>
                                <br/>
                                <StyledHeaderTableAppointment>{t("Future encounters")}</StyledHeaderTableAppointment>
                                <ul></ul>
                                <TableContainer component={Paper}>
                                    <Table    aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="right">{t("Encounter's date")}</TableCell>
                                                <TableCell align="right">{t("Lab test type")}</TableCell>
                                                <TableCell align="center">{t("Status")}</TableCell>
                                                <TableCell align="right"></TableCell>
                                                <TableCell align="right"></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        {normalizedNextAppointments.map((appointment, appointmentID) => {
                                            return(
                                                <TableRow key={appointmentID}>
                                                    <TableCell  align="right" omponent="th" scope="row">
                                                        <StyledTableTextCell> {moment(appointment.startTime).format("HH:mm")} </StyledTableTextCell>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledTableTextCell>{t(appointment.serviceType)} {appointment.serviceType?'-':''} {t(appointment.examination)}</StyledTableTextCell>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <StyledLabelStatusAppointment>
                                                            <TitleValueComponent
                                                                name={patientTrackingStatuses && appointment ? t(patientTrackingStatuses[appointment.status]) : ''}/>
                                                        </StyledLabelStatusAppointment>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledHrefTableButton size={'small'} variant="outlined" color="primary"
                                                                               href="#contained-buttons"
                                                            /* disabled={curEncounters && curEncounters.data && curEncounters.data.total > 0 ? true : false}*/
                                                            /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                        >
                                                            {t("navigate to encounter sheet")}
                                                        </StyledHrefTableButton>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledHrefTableButton size={'large'} variant="outlined" color="primary"
                                                                               href="#contained-buttons"
                                                            /* disabled={curEncounter && curEncounter.data && curEncounter.data.total > 0 ? true : false}*/
                                                            /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                        >
                                                            {t("Admission form")}
                                                        </StyledHrefTableButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                    </Table>
                                </TableContainer>
                            </React.Fragment>




                            :


                              null


                    }
                    {
                        normalizedPrevEncounters !== null ?
                        <React.Fragment>
                            <br/>
                            <StyledHeaderTableAppointment>{t("Previous encounter")}</StyledHeaderTableAppointment>
                            <ul></ul>
                            <TableContainer component={Paper}>
                                <Table    aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="right">{t("Encounter's hour")}</TableCell>
                                            <TableCell align="right">{t("Lab test type")}</TableCell>
                                            <TableCell align="center">{t("Status")}</TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            normalizedPrevEncounters.map((encounter, encounterID) => {
                                            return(
                                                <TableRow key={encounterID}>
                                                    <TableCell  align="right" omponent="th" scope="row">
                                                        <StyledTableTextCell> {moment(encounter.startTime).format("HH:mm")} </StyledTableTextCell>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledTableTextCell>{t(encounter.serviceType)} {encounter.serviceType?'-':''} {t(encounter.examination)}</StyledTableTextCell>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <StyledLabelStatusAppointment>
                                                            <TitleValueComponent
                                                                name={encounterStatuses && encounter ? t(encounterStatuses[encounter.status]) : ''}/>
                                                        </StyledLabelStatusAppointment>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledHrefTableButton size={'small'} variant="outlined" color="primary"
                                                                               href="#contained-buttons"
                                                            /* disabled={curEncounters && curEncounters.data && curEncounters.data.total > 0 ? true : false}*/
                                                            /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                        >
                                                            {t("navigate to encounter sheet")}
                                                        </StyledHrefTableButton>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <StyledHrefTableButton size={'large'} variant="outlined" color="primary"
                                                                               href="#contained-buttons"
                                                            /* disabled={curEncounter && curEncounter.data && curEncounter.data.total > 0 ? true : false}*/
                                                            /*onClick={() => handleCreateAppointment(patient, nextAppointment)}>*/
                                                        >
                                                            {t("Admission form")}
                                                        </StyledHrefTableButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </React.Fragment>
                        :

                        null
                    }



        </React.Fragment>
    );

};


export default AppointmentsAndEncountersTables;
