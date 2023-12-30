import {
  loadContactsFromStorage,
} from './modules/serviceStorage.js';

import * as renderer from './modules/render.js';
import phoneBook from './modules/render.js';

import {
  modalControl,
  hoverRow,
  deleteControl,
  sortControl,
  formControl,
} from './modules/control.js';

{
  const init = (selectorApp, title) => {
    const app = document.querySelector(selectorApp);

    const {
      thead,
      list,
      logo,
      btnAdd,
      btnDel,
      formOverlay,
      form,
    } = phoneBook(app, title);

    const contacts = loadContactsFromStorage();
    const allRow = renderer.contacts(list, contacts);

    const {closeModal} = modalControl(btnAdd, formOverlay);
    hoverRow(allRow, logo);

    deleteControl(btnDel, list);
    sortControl(thead);
    formControl(form, list, closeModal);
  };

  window.phoneBookInit = init;
}
