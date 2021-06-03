

export const getNormalizeEncounterStatus = (encounter) => {
  return  typeof encounter.extensionSecondaryStatus !== "undefined" && encounter.extensionSecondaryStatus.length > 0
    ? encounter.extensionSecondaryStatus
    : encounter.status
}