const switcher = document.createElement('div');
let switched = false;
let logo;
let logoSrc;

chrome.storage.sync.get(['oldStyleEnabled'], (store) => {
  switched = store.oldStyleEnabled || false;
  updateStyled();
});

switcher.className = 'old-style-switcher';

const updateStyled = () => {
  if (!logo || !logoSrc) {
    logo = document.querySelector('.head-section-wrapper img');
    logoSrc = (logo || {}).src;
  }

  if (switched) {
    if (logo) {
      logo.src = '';
    }

    switcher.classList.add('old-style-switcher--switched');
    document.body.classList.add('old-style-apply');
  } else {
    if (logo) {
      logo.src = logoSrc;
    }

    switcher.classList.remove('old-style-switcher--switched');
    document.body.classList.remove('old-style-apply');
  }
};

switcher.onclick = () => {
  switched = !switched;

  chrome.storage.sync.set({ oldStyleEnabled: switched }, () => {
    console.log('success');
  });

  updateStyled();
};

document.body.appendChild(switcher);
