import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';

import { 
  addVehicldeData,
  removeVehicldeData,
  checkVehicldeData,
  addBlackListData,
  removeBlackListData,
  getUsers,
  getBlacklist,
} from './core.js';

config();

const {TELEGRAM_BOT_TOKEN, LOG_CHAT_ID} = process.env;
const myChatId = Number(LOG_CHAT_ID);

const commands = [
  'create_data',
  'remove_data',
  'create_black_list_data',
  'remove_black_list_data',
  'start',
  'help',
  'users',
  'blacklist'
];

export const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true
});

export default function startTelegramBot() {
  bot.onText(/\/create_data/, async (message) => {
    if(message.chat.id !== myChatId) {
      bot.sendMessage(message.chat.id, 'Недоступно!');
      return;
    }

    const [_, carNumber, userName, phoneNumber] = message.text.split(' ');
    const userObject = {
      carNumber, userName: userName?.replace('_', ' '), phoneNumber
    };
 
    await addVehicldeData(userObject);
    bot.sendMessage(message.chat.id, 'Добавлено. \n' + JSON.stringify(userObject, null, 2));
  });
  
  bot.onText(/\/remove_data/, async (message) => {
    if(message.chat.id !== myChatId) {
      bot.sendMessage(message.chat.id, 'Недоступно!');
      return;
    }

    const removedItem = await removeVehicldeData(message.text.split(' ')[1]);
    bot.sendMessage(message.chat.id, removedItem ? 'Удалено. \n' + JSON.stringify(removedItem, null, 2) : 'Ничего не найдено для удаления');
  });

  bot.onText(/\/create_black_list_data/, async (message) => {
    if(message.chat.id !== myChatId) {
      bot.sendMessage(message.chat.id, 'Недоступно!');
      return;
    }

    const [_, carNumber] = message.text.split(' ');
    const userObject = {
      carNumber
    };
 
    await addBlackListData(userObject);
    bot.sendMessage(message.chat.id, 'Добавлено в черный список. \n' + JSON.stringify(userObject, null, 2));
  });
  
  bot.onText(/\/remove_black_list_data/, async (message) => {
    if(message.chat.id !== myChatId) {
      bot.sendMessage(message.chat.id, 'Недоступно!');
      return;
    }

    const removedItem = await removeBlackListData(message.text.split(' ')[1]);
    bot.sendMessage(message.chat.id, removedItem ? 'Удалено из чёрного списка. \n' + JSON.stringify(removedItem, null, 2) : 'Ничего не найдено для удаления');
  });

  bot.onText(/\/users/, async (message) => {
    bot.sendMessage(message.chat.id, await getUsers() || "Данные отсутствуют");
  });

  bot.onText(/\/blacklist/, async (message) => {
    bot.sendMessage(message.chat.id, await getBlacklist() || "Данные отсутствуют");
  });

  bot.onText(/\/help/, async (message) => {
    bot.sendMessage(message.chat.id, `
/create_data хх999х Василий_Иванов +79999999999
/remove_data хх999х

/create_black_list_data хх999х
/remove_black_list_data хх999х

/users
/blacklist
/help
      `);
  });
  
  bot.on('message', async (message) => {
    logMessage(bot, `${message.from.first_name || 'first_name'} ${message.from.last_name || 'last_name'} (${message.from.username || 'username'}): ${message.text}`)
    if(commands.some(command => message.text.includes(command))) {
      return;
    }

    const responseText = await checkVehicldeData(message.text);
    bot.sendMessage(message.chat.id, responseText);
  });
}

function logMessage(bot, message) {
  bot.sendMessage(myChatId, message);
}