/**
 * @author Idan Gigi - idangi@matrix.co.il
 */

import { CRUDOperations } from '../CRUDOperations/index';
import denormalizeFhirQuestionnaireResponse from 'Utils/Helpers/FhirEntities/denormalizeFhirEntity/denormalizeFhirQuestionnaireResponse';

const QuestionnaireResponseStats = {
  doWork: (parameters = null) => {
    let componentFhirURL = '/QuestionnaireResponse';
    parameters.url = componentFhirURL;
    return QuestionnaireResponseStats[parameters.functionName](parameters);
  },
  getQuestionnaireResponse: (params) => {
    return CRUDOperations(
      'search',
      `${params.url}?encounter=${params.functionParams.encounterId}&patient=${params.functionParams.patientId}&questionnaire=${params.functionParams.questionnaireId}`,
    );
  },
  createQuestionnaireResponse: (params) => {
    const denormalizedQuestionnaireResponse = denormalizeFhirQuestionnaireResponse(
      params.functionParams.questionnaireResponse,
    );
    return CRUDOperations(
      'create',
      `${params.url}`,
      denormalizedQuestionnaireResponse,
    );
  },
  patchQuestionnaireResponse: (params) => {
    //[{ "op":"replace","path":"/item/0/answer/0","value": {"valueInteger": "345345345345"} } ]
    const patchArr = [];
    for (const dataKey in params.questionnaireResponseParams) {
      if (params.questionnaireResponseParams.hasOwnProperty(dataKey)) {
        const element = params.questionnaireResponseParams[dataKey];
        switch (dataKey) {
          case 'item':
            element.forEach((item) => {
              if (item.answer) {
                const itemObj = {
                  op: 'replace',
                  path: `/item/${item.linkId - 1}/answer/0`,
                  value: item.answer[0],
                };
                patchArr.push(itemObj);
              }
            });
            break;
          case 'author' :
            patchArr.push({
              op: 'replace',
              path: `/author`,
              value: {
                reference:
                    'Practitioner/' + element,
              }
            });
            break;
          case 'authored' :
            patchArr.push({
              op: 'replace',
              path: `/authored`,
              value: element,
            });
            break;

          default:
            break;
        }
      }
    }
    return CRUDOperations(
      'patch',
      `${params.url}/${params.questionnaireResponseId}`,
      patchArr,
    );
  },
};

export default function QuestionnaireResponse(action = null, params = null) {
  if (action) {
    const transformer =
      QuestionnaireResponseStats[action] ??
      QuestionnaireResponseStats.__default__;
    return transformer(params);
  }
}
