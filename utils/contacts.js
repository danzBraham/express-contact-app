import * as fs from "node:fs";

const dirPath = "./data";
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const dataPath = "./data/contacts.json";
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, "[]", "utf-8");
}

export const loadContacts = () => {
  const fileBuffer = fs.readFileSync(dataPath, "utf-8");
  const contacts = JSON.parse(fileBuffer);
  return contacts;
};

const saveContacts = (contacts) => {
  return fs.writeFileSync(dataPath, JSON.stringify(contacts));
};

export const addContact = (contact) => {
  const contacts = loadContacts();
  contacts.push(contact);
  saveContacts(contacts);
};

export const checkDuplicate = (nama) => {
  const contacts = loadContacts();
  return contacts.find((contact) => contact.nama === nama);
};

export const deleteContact = (nama) => {
  const contacts = loadContacts();
  const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
  saveContacts(filteredContacts);
};

export const updateContacts = (newContact) => {
  const contacts = loadContacts();
  const contactIndex = contacts.findIndex(
    (contact) => contact.nama === newContact.oldNama
  );
  const filteredContacts = contacts.filter(
    (contact) => contact.nama !== newContact.oldNama
  );
  delete newContact.oldNama;
  filteredContacts.splice(contactIndex, 0, newContact);
  saveContacts(filteredContacts);
};
