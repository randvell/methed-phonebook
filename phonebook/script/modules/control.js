import {
  removeStorage,
  setStorage,
  getStorage,
  addContactData as saveContactToStorage,
} from './serviceStorage.js';

import {createRow} from './createElements.js';


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
    saveContactToStorage(newContact);

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

export {
  sortRows,
  sortControl,
  modalControl,
  deleteControl,
  formControl,
  hoverRow,
};
