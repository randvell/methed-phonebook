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

export {
  getStorage,
  setStorage,
  removeStorage,
  addContactData,
  loadContactsFromStorage,
};

