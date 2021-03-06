const normalizeFhirEncounter = (encounter) => {
  const patient = encounter.subject
    ? encounter.subject.reference.split('/')[1]
    : null;

  const appointment = encounter.appointment
    ? encounter.appointment.map(
        (appointmentObj) => appointmentObj.reference.split('/')[1],
      )
    : null;
  let serviceType = null;
  let serviceTypeCode = null;
  let examinationCode = null;
  let examination = null;
  let relatedPerson = '';
  let practitioner = '';
  let practitionerIndex = '';
  let extensionReasonCodeDetails = '';
  let extensionArrivalWay = '';
  let extensionSecondaryStatus = '';
  let extensionSecondaryStatusIndex = '';
  let extensionStatusUpdateDate = '';
  let extensionArrivalWayIndex = '';
  let extensionStatusUpdateDateIndex = '';
  let extensionReasonCodeDetailsIndex = '';

  if (encounter.extension && encounter.extension.length) {
    encounter.extension.forEach((extension, index) => {
      if (extension.url.includes('reasonCodesDetail')) {
        extensionReasonCodeDetails = extension.valueString;
        extensionReasonCodeDetailsIndex = index;
      }
      if (extension.url.includes('arrivalWay')) {
        extensionArrivalWay = extension.valueString;
        extensionArrivalWayIndex = index;
      }
      if (extension.url.includes('secondaryStatus')) {
        extensionSecondaryStatus = extension.valueString;
        extensionSecondaryStatusIndex = index;
      }
      if (extension.url.includes('statusUpdateDate')) {
        extensionStatusUpdateDate = extension.valueDateTime;
        extensionStatusUpdateDateIndex = index;
      }
    });
  }

  if (encounter.participant && encounter.participant.length) {
    encounter.participant.forEach((participantObj, participantIndex) => {
      if (participantObj.individual) {
        if (participantObj.individual.reference) {
          if (participantObj.individual.reference.includes('RelatedPerson')) {
            relatedPerson = participantObj.individual.reference.split('/')[1];
          }
          if (participantObj.individual.reference.includes('Practitioner')) {
            practitioner = participantObj.individual.reference.split('/')[1];
            practitionerIndex = participantIndex;
          }
        }
      }
    });
  }
  if (encounter.reasonCode && encounter.reasonCode.length > 0) {
    if (encounter.reasonCode.every((reasonCodeObj) => reasonCodeObj.coding)) {
      examinationCode = encounter.reasonCode.map(
        (reasonCodeObj) => reasonCodeObj.coding[0].code,
      );
      examination = encounter.reasonCode.map(
        (reasonCodeObj) => reasonCodeObj.text,
      );
    }
  }
  // let startTime = null;
  // let date = null;

  // if(encounter.period){
  //     if(encounter.period.start){
  //         const isPeriodValid = encounter.period.start.split(' ');
  //         if(isPeriodValid.length > 1){
  //             date = isPeriodValid[0];
  //             startTime = isPeriodValid[1];
  //         }
  //     }
  // }

  const serviceProvider = encounter.serviceProvider
    ? encounter.serviceProvider.reference.split('/')[1]
    : null;

  if (encounter.serviceType) {
    if (encounter.serviceType.coding) {
      serviceTypeCode = encounter.serviceType.coding[0].code;
      serviceType = encounter.serviceType.text;
    }
  }

  return {
    id: encounter.id,
    priority: encounter.priority ? encounter.priority.coding[0].code : null,
    status: encounter.status,
    startTime:
      encounter.period && encounter.period.start
        ? encounter.period.start
        : null,
    patient,
    appointment,
    serviceProvider,
    serviceType,
    examinationCode,
    examination,
    serviceTypeCode,
    relatedPerson,
    practitioner,
    practitionerIndex,
    extensionReasonCodeDetails,
    extensionArrivalWay,
    extensionSecondaryStatus,
    extensionStatusUpdateDate,
    extensionSecondaryStatusIndex,
    extensionArrivalWayIndex,
    extensionStatusUpdateDateIndex,
    extensionReasonCodeDetailsIndex,
  };
};

export default normalizeFhirEncounter;
