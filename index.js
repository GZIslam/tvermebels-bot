require('dotenv').config();
const bot_token = process.env.BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
const {commands} = require("./src/interface");
const stateManager = require("./src/stateManager");

const launchBot = () => {
    const bot = new TelegramBot(bot_token, {polling: true});
    const {onMessage, onCallbackQuery} = stateManager(bot);

    bot.setMyCommands(commands);

    bot.on("message", async (msg) => {
        await onMessage(msg);
    });

    bot.on("callback_query", async (msg) => {
        await onCallbackQuery(msg);
    });
}

launchBot();