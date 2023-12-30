(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

const {
  removeStorage,
  setStorage,
  getStorage,
  addContactData,
} = require('./serviceStorage');

const {
  createRow,
} = require('./render.js');


const modalControl = (btnAdd, formOverlay) => {
  const openModal = () => {
    formOverlay.classList.add('is-visible');
  };

  const closeModal = () => {
    formOverlay.classList.remove('is-visible');
  };

  btnAdd.addEventListener('click', () => openModal());

  formOverlay.addEventListener('click', e => {
    const target = e.target;
    if (target === formOverlay || target.closest('.close')) {
      closeModal();
    }
  });

  return {closeModal};
};

const deleteControl = (btnDel, list) => {
  btnDel.addEventListener('click', () => {
    document.querySelectorAll('.delete').forEach(del => {
      del.classList.toggle('is-visible');
    });
  });

  list.addEventListener('click', e => {
    const target = e.target;
    // todo: возможно есть способ получать это значение получше
    const phone = target.parentNode?.parentNode
        ?.querySelector('.phone a')
        ?.innerText;

    removeStorage(phone);

    if (target.closest('.del-icon')) {
      target.closest('.contact').remove();
    }
  });
};

const sortRows = () => {
  const sort = getStorage('sort');
  if (!sort) {
    return;
  }

  const {index, order} = sort;
  const tbody = document.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const toggler = order === 'asc' ? -1 : 1;

  rows.sort((a, b) => {
    const nameA = a.cells[index].textContent.trim();
    const nameB = b.cells[index].textContent.trim();
    return nameA.localeCompare(nameB) * toggler;
  });

  tbody.innerHTML = '';
  rows.forEach(row => {
    tbody.appendChild(row);
  });
};

const sortControl = (thead) => {
  thead.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('filterable')) {
      const order = target.dataset.currentOrder === 'desc' ? 'asc' : 'desc';
      target.dataset.currentOrder = order;

      const parent = target.parentNode;
      const columns = parent.querySelectorAll('th');
      let index;
      for (let i = 0; i < columns.length; i++) {
        if (target === columns[i]) {
          index = i;
          break;
        }
      }

      setStorage('sort', {index, order});
      sortRows();
    }
  });
};


const addContactPage = (contact, list) => {
  list.append(createRow(contact));
};

const formControl = (form, list, closeModal) => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newContact = Object.fromEntries(formData);
    addContactPage(newContact, list);
    addContactData(newContact);

    form.reset();
    closeModal();
  });
};

const hoverRow = (allRow, logo) => {
  const text = logo.textContent;

  allRow.forEach(contact => {
    contact.addEventListener('mouseenter', () => {
      logo.textContent = contact.phoneLink.textContent;
    });
    contact.addEventListener('mouseleave', () => {
      logo.textContent = text;
    });
  });
};

module.exports = {
  sortRows,
  sortControl,
  modalControl,
  deleteControl,
  formControl,
  hoverRow,
};

},{"./render.js":3,"./serviceStorage":4}],2:[function(require,module,exports){
'use strict';

const createContainer = () => {
  const container = document.createElement('div');
  container.classList.add('container');
  return container;
};

const createHeader = () => {
  const header = document.createElement('header');
  header.classList.add('header');

  const headerContainer = createContainer();
  header.append(headerContainer);
  header.headerContainer = headerContainer;

  return header;
};

const createLogo = title => {
  const h1 = document.createElement('h1');
  h1.classList.add('logo');
  h1.textContent = `Телефонный справочник. ${title}`;

  return h1;
};

const createMain = () => {
  const main = document.createElement('main');
  const mainContainer = createContainer();
  main.append(mainContainer);
  main.mainContainer = mainContainer;

  return main;
};

const createButton = ({className, type, text}) => {
  const button = document.createElement('button');
  button.type = type;
  button.textContent = text;
  button.className = className;

  return button;
};

const createButtonsGroup = params => {
  const btnWrapper = document.createElement('div');
  btnWrapper.classList.add('btn-wrapper');

  const btns = params.map(buttonParams => createButton(buttonParams));

  btnWrapper.append(...btns);

  return {
    btnWrapper,
    btns,
  };
};

const createTable = () => {
  const table = document.createElement('table');
  table.classList.add('table', 'table-stripped');

  const thead = document.createElement('thead');
  thead.insertAdjacentHTML('beforeend', `
    <tr>
      <th class="delete">Удалить</th>
      <th class="filterable">Имя</th>
      <th class="filterable">Фамилия</th>
      <th>Телефон</th>
      <th></th>
    </tr>
  `);
  const tbody = document.createElement('tbody');

  table.append(thead, tbody);
  table.tbody = tbody;
  table.thead = thead;

  return table;
};

const createForm = () => {
  const overlay = document.createElement('div');
  overlay.classList.add('form-overlay');

  const form = document.createElement('form');
  const closeButton = createButton({
    className: 'close',
    type: 'button',
  });

  form.closeButton = closeButton;
  form.append(closeButton);

  form.classList.add('form');
  form.insertAdjacentHTML('beforeend', `
    <h2 class"form-title">Добавить контакт</h2>
    <div class="form-group">
      <label class="form-label" for="name">Имя:</label>
      <input class="form-input" name="name" 
      id="name" type="text" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="surname">Фамилия:</label>
      <input class="form-input" name="surname" 
      id="surname" type="text" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="phone">Телефон:</label>
      <input class="form-input" name="phone" 
      id="phone" type="number" required>
    </div>
  `);

  const buttonGroup = createButtonsGroup([
    {
      className: 'btn btn-primary mr-3',
      type: 'submit',
      text: 'Добавить',
    },
    {
      className: 'btn btn-danger',
      type: 'reset',
      text: 'Отмена',
    },
  ]);

  form.append(...buttonGroup.btns);
  overlay.append(form);

  return {
    overlay,
    form,
  };
};

const createFooter = (title) => {
  const footer = document.createElement('footer');
  footer.classList.add('footer');
  const copyright = document.createElement('p');
  copyright.textContent = 'Все права защищены ©' + title;

  footer.append(copyright);

  return footer;
};

const createRow = ({name: firstName, surname, phone}) => {
  const tr = document.createElement('tr');
  tr.classList.add('contact');

  const tdDel = document.createElement('td');
  tdDel.classList.add('delete');
  const buttonDel = document.createElement('button');
  buttonDel.classList.add('del-icon');
  tdDel.append(buttonDel);

  const tdName = document.createElement('td');
  tdName.textContent = firstName;
  const tdSurname = document.createElement('td');
  tdSurname.textContent = surname;

  const tdPhone = document.createElement('td');
  tdPhone.classList.add('phone');

  const phoneLink = document.createElement('a');
  phoneLink.href = `tel:${phone}`;
  phoneLink.textContent = phone;
  tr.phoneLink = phoneLink;
  tdPhone.append(phoneLink);

  const editButton = createButton({
    className: 'btn btn-primary bi bi-pencil-square',
    type: 'button',
    text: '',
  });

  editButton.innerHTML = (`
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
  class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 
  3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 
  2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 
  .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"></path>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 
  15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 
  1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 
  0-1H2.5A1.5 1.5 0 0 0 1 2.5z"></path>
  </svg>
  Edit
  `);

  const tdEdit = document.createElement('td');
  tdEdit.append(editButton);

  tr.append(tdDel, tdName, tdSurname, tdPhone, tdEdit);

  return tr;
};

module.exports = {
  createHeader,
  createLogo,
  createMain,
  createButton,
  createButtonsGroup,
  createTable,
  createForm,
  createFooter,
  createRow,
};

},{}],3:[function(require,module,exports){
'use strict';

const {
  sortRows,
} = require('./control.js');

const {
  createRow,
  createHeader,
  createLogo,
  createMain,
  createButtonsGroup,
  createTable,
  createForm,
  createFooter,
} = require('./createElements.js');

const renderPhoneBook = (app, title) => {
  const header = createHeader();
  const logo = createLogo(title);
  const main = createMain();
  const buttonGroup = createButtonsGroup([
    {
      className: 'btn btn-primary mr-3',
      type: 'button',
      text: 'Добавить',
    },
    {
      className: 'btn btn-danger',
      type: 'button',
      text: 'Удалить',
    },
  ]);

  const table = createTable();
  const {form, overlay} = createForm();

  header.headerContainer.append(logo);
  main.mainContainer.append(buttonGroup.btnWrapper, table, overlay);

  const footer = createFooter(title);

  app.append(header, main, footer);

  return {
    list: table.tbody,
    thead: table.thead,
    logo,
    btnAdd: buttonGroup.btns[0],
    btnDel: buttonGroup.btns[1],
    formOverlay: overlay,
    form,
  };
};

const renderContacts = (elem, contacts) => {
  const allRow = contacts.map(createRow);
  elem.append(...allRow);
  sortRows();

  return allRow;
};

module.exports = {
  renderPhoneBook,
  renderContacts,
};

},{"./control.js":1,"./createElements.js":2}],4:[function(require,module,exports){
'use strict';

const getStorage = (key) => {
  const value = localStorage.getItem(key);

  try {
    return JSON.parse(value);
  } catch {
    return value || [];
  }
};

const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorage = (key) => {
  localStorage.removeItem(key);
};

const addContactData = contact => {
  setStorage(contact.phone, contact);
  console.log();
};

const loadContactsFromStorage = () => {
  const contacts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = getStorage(key);
    if (value.phone) {
      contacts.push(value);
    }
  }

  return contacts;
};

module.exports = {
  getStorage,
  setStorage,
  removeStorage,
  addContactData,
  loadContactsFromStorage,
};


},{}],5:[function(require,module,exports){
'use strict';

const {
  loadContactsFromStorage,
} = require('./modules/serviceStorage');

const {
  renderContacts,
  renderPhoneBook,
} = require('./modules/render.js');

const {
  modalControl,
  hoverRow,
  deleteControl,
  sortControl,
  formControl,
} = require('./modules/control.js');

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
    } = renderPhoneBook(app, title);

    const contacts = loadContactsFromStorage();
    const allRow = renderContacts(list, contacts);

    const {closeModal} = modalControl(btnAdd, formOverlay);
    hoverRow(allRow, logo);

    deleteControl(btnDel, list);
    sortControl(thead);
    formControl(form, list, closeModal);
  };

  window.phoneBookInit = init;
}

},{"./modules/control.js":1,"./modules/render.js":3,"./modules/serviceStorage":4}]},{},[5]);
