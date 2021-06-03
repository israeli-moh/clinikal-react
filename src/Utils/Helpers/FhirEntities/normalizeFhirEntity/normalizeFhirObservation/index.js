/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param {object} observation
 * @returns {object}
 */

const normalizeFhirObservation = (observation, indicators, performers) => {
  /*
  *
    id: id,
    category: category,
    categoryText: categoryText,
    categorySystem: categorySystem,
    performer: performer,
    performerName: performerName,
    status: observation.status,
    encounter: encounter,
    patient: patient,
    issued: issued,
    note: note,
    observation: returnedObservation,
    *
  * */
  if (!indicators)
    //In order to normalize observation we need indicators list
    return null;
  let indicatorsList = null;
  const id = observation.id;
  const performerID =
    observation.performer && observation.performer[0].reference.split('/')[1]
      ? observation.performer[0].reference.split('/')[1]
      : null;
  const performerName =
    performerID && performers[performerID]
      ? `${performers[performerID][0]}`
      : null;
  const patient = observation.subject
    ? observation.subject.reference.split('/')[1]
    : null;
  const encounter = observation.encounter
    ? observation.encounter.reference.split('/')[1]
    : null;
  const issued = observation.issued ? observation.issued : null;
  const category =
    observation.category &&
    observation.category[0] &&
    observation.category[0].coding &&
    observation.category[0].coding[0] &&
    observation.category[0].coding[0].code
      ? observation.category[0].coding[0].code
      : null;

  const categorySystem =
    observation.category &&
    observation.category[0] &&
    observation.category[0].coding &&
    observation.category[0].coding[0] &&
    observation.category[0].coding[0].system
      ? observation.category[0].coding[0].system
      : null;

  const categoryText =
    observation.category &&
    observation.category[0] &&
    observation.category[0].text
      ? observation.category[0].text
      : null;

  const note =
    observation.note && observation.note.text ? observation.note.text : null;

  let returnedObservation = [];

  if (!category) return null;
  if (observation.component && observation.component.length > 0) {
    observation.component.map((observed, indexQuantity) => {
      let mergeObjects = null;
      if (observed.valueQuantity && indicators[observed.valueQuantity.code]) {
        //clean zeros from the end of the number
        if (/\d+\.[0-9]+$/.test(observed.valueQuantity.value)) {
          observed.valueQuantity.value = observed.valueQuantity.value.replace(/0+$/,'').replace(/\.$/,'');
        }
        mergeObjects = {
          ...observed.valueQuantity,
          ...indicators[observed.valueQuantity.code],
        };
        returnedObservation[
          indicators[observed.valueQuantity.code].description
        ] = mergeObjects;
      } else if (
        observed.valueCodeableConcept &&
        indicators[
          observed.valueCodeableConcept.coding[0].system.split(
            'http://loinc.org/',
          )[1]
        ]
      ) {
        console.log(observed.valueCodeableConcept.text)
        mergeObjects = {
          ...{
            value: observed.valueCodeableConcept.text,
            system: observed.valueCodeableConcept.coding[0].system.split(
              'http://loinc.org/',
            )[0],
            code: observed.valueCodeableConcept.coding[0].system.split(
              'http://loinc.org/',
            )[1],
          },
          ...indicators[
            observed.valueCodeableConcept.coding[0].system.split(
              'http://loinc.org/',
            )[1]
          ],
        };
        returnedObservation[
          indicators[
            observed.valueCodeableConcept.coding[0].system.split(
              'http://loinc.org/',
            )[1]
          ].description
        ] = mergeObjects;
      }

      returnedObservation.length++;
    });
  }


  return {
    id: id,
    category: category,
    categoryText: categoryText,
    categorySystem: categorySystem,
    performer: performerID,
    performerName: performerName,
    status: observation.status,
    encounter: encounter,
    patient: patient,
    issued: issued,
    note: note,
    observation: returnedObservation,
  };
};

export default normalizeFhirObservation;
