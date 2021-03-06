const denormalizeFhirMedicationStatement = (medicationStatement) => {
  const denormalizedFhirMedicationStatement = {};
  const category = { coding: [{}] };
  const effectivePeriod = {};
  for (const medicationStatementKey in medicationStatement) {
    if (medicationStatement.hasOwnProperty(medicationStatementKey)) {
      const element = medicationStatement[medicationStatementKey];
      switch (medicationStatementKey) {
        case 'status':
          denormalizedFhirMedicationStatement['status'] = element;
          break;
        case 'categoryCode':
          category.coding[0]['code'] = element;
          break;
        case 'categorySystem':
          category.coding[0]['system'] = element;
          break;
        case 'categoryText':
          category['text'] = element;
          break;
        case 'medicationCodeableConceptCode':
          denormalizedFhirMedicationStatement['medicationCodeableConcept'] = {
            coding: [
              {
                system: medicationStatement.medicationCodeableConceptSystem,
                code: element,
              },
            ],
          };
          break;
        case 'patient':
          denormalizedFhirMedicationStatement['subject'] = {
            reference: `Patient/${element}`,
          };
          break;
        case 'effectivePeriodStart':
          effectivePeriod['start'] = element;
          break;
        case 'effectivePeriodEnd':
          effectivePeriod['end'] = element;
          break;
        case 'dateAsserted':
          denormalizedFhirMedicationStatement['dateAsserted'] = element;
          break;
        case 'informationSource':
          denormalizedFhirMedicationStatement['informationSource'] = {
            reference: element,
          };
          break;
        case 'note':
          denormalizedFhirMedicationStatement['note'] = [
            {
              text: element,
            },
          ];
          break;
        case 'encounter':
          denormalizedFhirMedicationStatement['context'] = {
            reference: `Encounter/${element}`,
          };
          break;
        default:
          break;
      }
    }
  }

  if (Object.keys(category).length)
    denormalizedFhirMedicationStatement['category'] = category;

  if (Object.keys(effectivePeriod).length)
    denormalizedFhirMedicationStatement['effectivePeriod'] = effectivePeriod;

  return denormalizedFhirMedicationStatement;
};

export default denormalizeFhirMedicationStatement;
