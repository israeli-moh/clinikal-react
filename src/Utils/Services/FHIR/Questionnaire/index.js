/**
 * @author Idan Gigi - idangi@matrix.co.il
 */

import { CRUDOperations } from '../CRUDOperations/index';

const QuestionnaireStats = {
  doWork: (parameters = null) => {
    let componentFhirURL = '/Questionnaire';
    parameters.url = componentFhirURL;
    return QuestionnaireStats[parameters.functionName](parameters);
  },
  getQuestionnaire: (params) => {
    return CRUDOperations(
      'search',
      `${params.url}?name=${params.functionParams.QuestionnaireName}&status=active`,
    );
  },
};

export default function Questionnaire(action = null, params = null) {
  if (action) {
    const transformer =
      QuestionnaireStats[action] ?? QuestionnaireStats.__default__;
    return transformer(params);
  }
}
