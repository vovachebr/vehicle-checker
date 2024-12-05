import { JSONFilePreset } from 'lowdb/node'

const defaultData = {
  users: [],
  blacklist: []
};

export async function addVehicldeData(vehicleData) {
  const db = await JSONFilePreset('db.json', defaultData);
  await db.update(({ users }) => users.push(vehicleData));
}

export async function removeVehicldeData(vehicleNumberToRemove) {
  const db = await JSONFilePreset('db.json', defaultData);
  const findObj = db.data.users.find(({ carNumber }) => carNumber === vehicleNumberToRemove);
  if(!findObj) {
    return;
  }
  
  db.read();
  db.data.users = db.data.users.filter(({ carNumber }) => carNumber !== vehicleNumberToRemove);
  db.write();
  return findObj;
}

export async function addBlackListData(vehicleData) {
  const db = await JSONFilePreset('db.json', defaultData);
  await db.update(({ blacklist }) => blacklist.push(vehicleData));
}

export async function removeBlackListData(vehicleNumberToRemove) {
  const db = await JSONFilePreset('db.json', defaultData);
  const findObj = db.data.blacklist.find(({ carNumber }) => carNumber === vehicleNumberToRemove);
  if(!findObj) {
    return;
  }
  
  db.read();
  db.data.blacklist = db.data.blacklist.filter(({ carNumber }) => carNumber !== vehicleNumberToRemove);
  db.write();
  return findObj;
}

export async function getUsers() {
  const db = await JSONFilePreset('db.json', defaultData);
  db.read();
  return db.data.users.map((user) => `${user.carNumber}: ${user.userName}, ${user.phoneNumber}`).join('\n');
}

export async function getBlacklist() {
  const db = await JSONFilePreset('db.json', defaultData);
  db.read();
  return db.data.blacklist.map(({carNumber}) => carNumber).join('\n');
}

export async function checkVehicldeData(vehicleNumberPattert) {
  const db = await JSONFilePreset('db.json', defaultData);
  db.read();
  const allowed = db.data.users.filter(({ carNumber }) => carNumber.includes(vehicleNumberPattert));
  const forbidden = db.data.blacklist.filter(({ carNumber }) => carNumber.includes(vehicleNumberPattert));

  return buildMessage({ allowed, forbidden });
}

function buildMessage({ allowed, forbidden }) {
  let message = "";
  if(allowed.length === 0) {
    message += "Машин из нашего дома не найдено. \n"
  } 

  if(allowed.length > 0) {
    message += allowed.map(car => `✅ Это с нашего двора: ${car.carNumber} ! (${car.userName})`).join('\n');
  } 

  if(forbidden.length > 0) {
    message += '\n' + forbidden.map(car => `❌ Точно не с нашего двора: ${car.carNumber}! Такую впускать не стоит.`).join('\n');
  } 

  return message;
}