/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param {object} observation
 * @returns {object}
 * remark not yet completed since never tested or used.
 */

const denormalizeFhirObservation = (observation) => {
  const denormalizedObservation = {};
  denormalizedObservation['component'] = [];

  const extensions = [];
  denormalizedObservation['resourceType'] = 'Observation';
  for (const observationKey in observation) {
    if (observation.hasOwnProperty(observationKey)) {
      switch (observationKey) {
        case 'status':
          denormalizedObservation['status'] = observation[observationKey];
          break;
        case 'subject':
          denormalizedObservation['subject'] = {
            reference: `Patient/${observation[observationKey]}`,
          };
          break;
        case 'encounter':
          denormalizedObservation['encounter'] = {
            reference: `Encounter/${observation[observationKey]}`,
          };
          break;
        case 'category':
          denormalizedObservation['category'] = [
            {
              coding: [
                {
                  system: observation.category.system,
                  code: observation.category.code,
                },
              ],
              text: observation.categoryText,
            },
          ];
          break;
        case 'issued':
          denormalizedObservation['issued'] = observation[observationKey];
          break;
        case 'performer':
          denormalizedObservation['performer'] = [
            {
              reference: `Practitioner/${observation[observationKey]}`,
            },
          ];

          break;
        case 'note':
          denormalizedObservation['note'] = {
            text: observation[observationKey],
          };
          break;
        case 'component':
          for (const observed in observation[observationKey]) {
            if (observation[observationKey][observed].code) {
              denormalizedObservation['component'].push({
                valueQuantity: {
                  value: observation[observationKey][observed].value
                    ? observation[observationKey][observed].value
                    : null,
                  system: 'http://loinc.org',
                  code: observation[observationKey][observed].code,
                },
              });
            }
          }

          break;
        default:
          break;
      }
    }
  }

  if (extensions.length) denormalizedObservation['extension'] = extensions;
  return denormalizedObservation;
};

export default denormalizeFhirObservation;
