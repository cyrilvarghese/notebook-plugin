// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function setupContextMenu() {
  chrome.contextMenus.create({
    id: 'define-word',
    title: 'Add To Notes',
    contexts: ['link', 'selection']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  // Store the last word in chrome.storage.session.
  console.log(data)
  if (data.linkUrl)
    chrome.runtime.sendMessage({ title: data.linkUrl,text:"" });
  // chrome.storage.session.set({ info: data.linkUrl});
  else if (data.selectionText)
    chrome.runtime.sendMessage({ title: data.pageUrl, text: data.selectionText });
  // chrome.storage.session.set({ info: data.selectionText});
  // Make sure the side panel is open.
  chrome.sidePanel.open({ tabId: tab.id });
});


