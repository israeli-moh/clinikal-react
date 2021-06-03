

export const ParseQuestionnaireResponseBoolean = (normalizedResponse, linkId) => {
  const item = normalizedResponse.items.find(
      (i) => i.linkId === linkId,
  );
  if (typeof item === "undefined") return undefined;
  return Boolean(
      +item['answer'][0]['valueBoolean'],
  );
}

export const ParseQuestionnaireResponseText = (normalizedResponse, linkId) => {
  const item = normalizedResponse.items.find(
      (i) => i.linkId === linkId,
  );
  if (typeof item === "undefined" || typeof item.answer === "undefined" )return undefined;
  return  item.answer[0].valueString;
}

export const ParseQuestionnaireResponseInt = (normalizedResponse, linkId) => {
  const item = normalizedResponse.items.find(
    (i) => i.linkId === linkId,
  );
  if (typeof item === "undefined" || typeof item.answer === "undefined" )return undefined;
  return  item.answer[0].valueInteger;
}


// answer for QuestionnaireResponse
  export const answerType = (type, data) => {
  if (type === 'string') {
    return [
      {
        valueString: data,
      },
    ];
  }
  else if (type === 'boolean') {
    return [
      {
        valueBoolean: data,
      },
    ];
  }
  else if (type === 'integer') {
    return [
      {
        valueInteger: data,
      },
    ];
  } else {
    console.error(`No such type: ${type}`);
  }
};