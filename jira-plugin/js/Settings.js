const defaultSettings = {
  turnCount: 1,
  showImpactModal: true,
  branchNameWordsCount: 5,
};

chrome.storage.sync.get(['jiraPluginSettings'], (storage) => {
  console.log(storage);

  if (Object.keys(storage).length === 0) {
    chrome.storage.sync.set({
      jiraPluginSettings: defaultSettings,
    }, () => {
      console.log('default settings used');
    });
  }
});
