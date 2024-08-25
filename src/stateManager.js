const { generateStartQuestion, mainButtons, nameMap, createButtons, confirmation, editItems, formulasButtons, editFormulas, addVariables, adminButtons } = require("./interface");
const variablesName = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const admins = {"860131994": 777};

const isNumber = (num) => {
	return typeof num === 'number' && !isNaN(num);
}

const stateManager = (bot) => {
    let chats = {};
    const items = {};
    const formulas = {};
    const type = "keyboard";
    const getUser = (chatId) => chats[chatId];
    const updateUser = (chatId, data) => {
        const user = chats[chatId];
        if(user){
            chats[chatId] = { ...user, ...data };
        } else {
            chats[chatId] = data;
        }
        return user;
    };

    const checkPermision = (chatId, level) => {
        const user = getUser(chatId);
        if(!user) return false;
        if(user.permision >= level) {
            return true;
        } else {
            return false;
        }
    }

    const onCallbackQuery = async (msg) => {
        // console.log(msg)
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const route = data.split("_");
        const user = getUser(chatId);
        if(!user) return
        switch (route[0]) {
            case "removeItems":
                if(items.length < 1) {
                    await bot.sendMessage(chatId, "Ошибка");
                } else {
                    await bot.sendMessage(chatId, `Вы выбрали:\n${route[1]}\n${items[route[1]]}\nУверены, что хотите удалить?`, {parse_mode : "HTML", ...confirmation(type)});
                    updateUser(chatId, {removeItemIndex: route[1]});
                }
                break;
            case "removeFormulas":
                if(formulas.length < 1) {
                    await bot.sendMessage(chatId, "Ошибка");
                } else {
                    await bot.sendMessage(chatId, `Вы выбрали:\n${route[1]}\n${formulas[route[1]].description}\nУверены, что хотите удалить?`, {parse_mode : "HTML", ...confirmation(type)});
                    updateUser(chatId, {removeFormulaIndex: route[1]});
                }
                break;
        }
        switch (data) {
            case nameMap.addAdmin:
                if(checkPermision(chatId, 700)) {
                    await bot.sendMessage(chatId, "Добавить права Админа (ID LEVEL)");
                    updateUser(chatId, {status: "addAdmin"});
                } else {
                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                }
                break;
            case nameMap.removeAdmin:
                if(checkPermision(chatId, 700)) {
                    await bot.sendMessage(chatId, "Удалить права Админа (ID)");
                    updateUser(chatId, {status: "removeAdmin"});
                } else {
                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                }
                break;
            case nameMap.showAdmins:
                if(checkPermision(chatId, 700)) {
                    await bot.sendMessage(chatId, `Admins:\n${JSON.stringify(admins)}`);
                } else {
                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                }
                break;
            case nameMap.users:
                if(checkPermision(chatId, 700)) {
                    await bot.sendMessage(chatId, `Users:\n${Object.keys(chats).map((c, i) =>`${i+1}. ID: ${chats[c].id} (${chats[c].name})`).join("\n")}`);
                } else {
                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                }
                break;
            case nameMap.removeChats:
                if(checkPermision(chatId, 700)) {
                    chats = {};
                    await bot.sendMessage(chatId, `Все чаты удалены!`);
                } else {
                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                }
                break;
        }
    }
    const onMessage = async (msg) => {
        // console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
        const user = getUser(chatId);
        if(!user) {
            const {question, buttons, answer} = generateStartQuestion(false, type);
            const permision = admins[msg.from.id] || 1;
            await bot.sendMessage(chatId, question, {parse_mode : "HTML", ...buttons});
            updateUser(chatId, {question, buttons, answer, authorized: false, permision});
        } else {
            if(!user.authorized) {
                if(text != user.answer) {
                    await bot.sendMessage(chatId, user.question, {parse_mode : "HTML", ...user.buttons});
                }
                if(user.answer == text) {
                    await bot.sendMessage(chatId, "Правильно!\nВы вошли.", {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                    delete chats[chatId].question;
                    delete chats[chatId].answer;
                    delete chats[chatId].buttons;
                    updateUser(chatId, {authorized: true, status: "home", id: msg.from.id, name: msg.from.username || `Нету username(${msg.from.id})`});
                }
            } else {
                switch (text) {
                    case nameMap.admin:
                        if(checkPermision(chatId, 700)) {
                            await bot.sendMessage(chatId, "Панель Админа", {parse_mode : "HTML", ...adminButtons()});
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.editItems:
                        if(checkPermision(chatId, 300)) {
                            await bot.sendMessage(chatId, "Тут вы можете изменить ваше главное меню в приложении.", {parse_mode : "HTML", ...editItems(type)});
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.removeItem:
                        if(checkPermision(chatId, 300)) {
                            if(Object.keys(items).length < 1) {
                                await bot.sendMessage(chatId, "У вас пока нету ITEMS!", {parse_mode : "HTML", ...editItems(type)});
                            } else {
                                await bot.sendMessage(chatId, "Ваши ITEMS:\nВыберите то, что хотите удалить.", {parse_mode : "HTML", ...createButtons(Object.keys(items).map(i => ({callback_data: "removeItems_" + i, text: i})), "inline_keyboard")});
                            }
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.addItem:
                        if(checkPermision(chatId, 300)) {
                            await bot.sendMessage(chatId, "Введите название нового ITEM.");
                            updateUser(chatId, {status: "addItem", step: "name"});
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.showFormulas:
                        await bot.sendMessage(chatId, "Расчет стоимости.\nВыберите тот вариант, который подходит вам.", {parse_mode : "HTML", ...formulasButtons({list: Object.keys(formulas), type, permision: user.permision})});
                        break;
                    case nameMap.editFormulas:
                        if(checkPermision(chatId, 300)) {
                            await bot.sendMessage(chatId, "Тут вы можете добавлять/удалять формулы в приложении.", {parse_mode : "HTML", ...editFormulas(type)});
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.addFormula:
                        if(checkPermision(chatId, 300)) {
                            await bot.sendMessage(chatId, "Введите название новой Формулы.");
                            updateUser(chatId, {status: "addFormula", step: "name"});
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.removeFormula:
                        if(checkPermision(chatId, 300)) {
                            if(Object.keys(formulas).length < 1) {
                                await bot.sendMessage(chatId, "У вас пока нету Формул!", {parse_mode : "HTML", ...editFormulas(type)});
                            } else {
                                await bot.sendMessage(chatId, "Ваши Формулы:\nВыберите то, что хотите удалить.", {parse_mode : "HTML", ...createButtons(Object.keys(formulas).map(i => ({callback_data: "removeFormulas_" + i, text: i})), "inline_keyboard")});
                            }
                        } else {
                            await bot.sendMessage(chatId, "У вас недостаточно прав!");
                        }
                        break;
                    case nameMap.game:
                        const {question, buttons, answer} = generateStartQuestion(true, type, true);
                        await bot.sendMessage(chatId, "Автогенерация (сумма)\n" + question, {parse_mode : "HTML", ...buttons});
                        updateUser(chatId, {question, buttons, answer, ...chats[chatId], status: "game"});
                        break;
                    case nameMap.id:
                        await bot.sendMessage(chatId, `Ваш ID: ${user.id}`, {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        break;
                    case nameMap.cancel:
                    case nameMap.start:
                        await bot.sendMessage(chatId, "Главное меню.", {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        delete chats[chatId].score;
                        delete chats[chatId].item;
                        delete chats[chatId].formula;
                        updateUser(chatId, {status: "home"});
                        break;
                    case nameMap.confirm:
                        if(user.item) {
                            items[user.item.name] = user.item.content;
                            await bot.sendMessage(chatId, `Вы добавили ITEM ${user.item.name} в меню.`, {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        } else if(user.formula) {
                            formulas[user.formula.name] = JSON.parse(JSON.stringify(user.formula));
                            await bot.sendMessage(chatId, `Вы добавили Формулу ${user.formula.name} в меню.`, {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        } else if(user.removeItemIndex) {
                            delete items[user.removeItemIndex];
                            await bot.sendMessage(chatId, `Вы удалили ${user.removeItemIndex}.`, {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        } else if(user.removeFormulaIndex){
                            delete formulas[user.removeFormulaIndex];
                            await bot.sendMessage(chatId, `Вы удалили ${user.removeFormulaIndex}.`, {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                        }
                        delete chats[chatId].removeItemIndex
                        delete chats[chatId].removeFormulaIndex
                        delete chats[chatId].formula;
                        delete chats[chatId].item;
                        delete chats[chatId].step;
                        updateUser(chatId, {status: "home"});
                        break;
                    default:
                        if(Object.keys(items).includes(text)) {
                            await bot.sendMessage(chatId, items[text]);
                            return;
                        } else if(Object.keys(formulas).includes(text)) {
                            user.formula = formulas[text];
                            const variables = user.formula.variables;
                            await bot.sendMessage(chatId, `Вы выбрали ${formulas[text].name}:\n${formulas[text].description}\n\nДля того чтобы посчитать цену заполните параметры:\n"${variables[Object.keys(variables)[0]].name}" равна/равен/равно = ?`);
                            updateUser(chatId, {status: "variable", step: 0});
                            return;
                        }
                        switch (user.status) {
                            case "addItem":
                                switch (user.step) {
                                    case "name":
                                        user.item = {name: text};
                                        await bot.sendMessage(chatId, `Название: ${user.item.name}\nТеперь задайте контент по нажатию`);
                                        user.step = "content";
                                        break;
                                    case "content":
                                        user.item.content = text;
                                        await bot.sendMessage(chatId, `Название: ${user.item.name}\nКонтент:\n${user.item.content}\nВсе верно?`, {parse_mode : "HTML", ...confirmation()});
                                        break;
                                }
                                break;
                            case "addFormula":
                                switch (user.step) {
                                    case "name":
                                        user.formula = {name: text, variable_index: 0, variables: {}};
                                        await bot.sendMessage(chatId, `Название: ${user.formula.name}\nТеперь напишите описание`);
                                        user.step = "description";
                                        break;
                                    case "description":
                                        user.formula.description = text;
                                        await bot.sendMessage(chatId, `Описание:\n${user.formula.description}\nТеперь напишите Имя для переменной "${variablesName[user.formula.variable_index]}"`);
                                        user.step = "variable";
                                        break;
                                    case "variable":
                                        user.formula.variables[variablesName[user.formula.variable_index]] = {name: text};
                                        await bot.sendMessage(chatId, `Название для переменной "${variablesName[user.formula.variable_index]}": ${text}\nВыберете дальнейшее действие`, {parse_mode: "HTML", ...addVariables()}); 
                                        user.step = "next_action";
                                        user.formula.variable_index = user.formula.variable_index + 1;
                                        break;
                                    case "formula":
                                        user.formula.formula = text;
                                        await bot.sendMessage(chatId, `Формула: ${user.formula.formula}\nИмя: ${user.formula.name}\nОписание: ${user.formula.description}\nПеременные: ${JSON.stringify(user.formula.variables)}верно? `, {parse_mode: "HTML", ...confirmation()}); 
                                        break;
                                    case "next_action":
                                        if(text === nameMap.addVariable) {
                                            await bot.sendMessage(chatId, `Напишите Имя для переменной "${variablesName[user.formula.variable_index]}"`);
                                            user.step = "variable";
                                        } else if (text === nameMap.finish) {
                                            await bot.sendMessage(chatId, `Теперь напишите формулу используя заданные переменные (${Object.keys(user.formula.variables).join(", ")})\nнапример так: (A + B) * C`);
                                            user.step = "formula";
                                        }
                                        break;
                                }
                                break;
                            case "variable":
                                const variables = user.formula.variables;
                                if(!isNumber(+text)) {
                                    return await bot.sendMessage(chatId, `Введите пожалуйста число, "${text}" - не число`);
                                }
                                variables[Object.keys(variables)[user.step]].value = text;
                                const variable = Object.keys(variables)[user.step];
                                await bot.sendMessage(chatId, `${variables[variable].name} задан/задана/задано!`);
                                
                                if(Object.keys(variables).length > user.step + 1) {
                                    const nextVariable = Object.keys(variables)[user.step + 1];
                                    await bot.sendMessage(chatId, `"${variables[nextVariable].name}" равен/равна/равно = ?`);
                                    updateUser(chatId, {step: user.step + 1});
                                } else {
                                    // let resFormula = user.formula.formula || "";
                                    // Object.keys(variables).forEach(v => resFormula = resFormula.replaceAll(v, variables[v].value));
                                    let res = Object.keys(variables).map(v => `const ${v} = ${variables[v].value};`).join('\n');
                                    await bot.sendMessage(chatId, `Стоимость "${chats[chatId].formula.name}" приблизительно составит:\n${eval(res + "\n" + user.formula.formula)} рублей`);
                                    updateUser(chatId, {status: "home"});
                                    delete chats[chatId].step;
                                    delete chats[chatId].formula;
                                }
                                break;
                            case "game":
                                if(text == chats[chatId].answer) {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score += 1;
                                    } else {
                                        chats[chatId].score = 1;
                                    }
                                    const {question, buttons, answer} = generateStartQuestion(true, type, true);
                                    await bot.sendMessage(chatId, "Правильно!\nОЧКИ: " + chats[chatId].score + "\n" + question, {parse_mode : "HTML", ...buttons});
                                    chats[chatId] = {...chats[chatId], question, buttons, answer}
                                } else {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score -= 1;
                                    } else {
                                        chats[chatId].score = 0;
                                    }
                                    await bot.sendMessage(chatId, "Неправильно!\nОЧКИ: " + chats[chatId].score + "\n" + chats[chatId].question, {parse_mode : "HTML", ...chats[chatId].buttons});
                                }
                                break;
                            case "addAdmin":
                                if(checkPermision(chatId, 700)) {
                                    const [user, level] = text.split(" ");
                                    admins[user] = level;
                                    await bot.sendMessage(chatId, `Admin ${user} с уровнем ${level} успешно добавлен`);
                                    Object.keys(chats).forEach(c => {
                                        if(chats[c].id == user) {
                                            chats[c].permision = level;
                                        }
                                    });
                                    updateUser(chatId, {status: "home"});
                                } else {
                                    await bot.sendMessage(chatId, "У вас недостаточно прав!");
                                }
                                break;
                            case "removeAdmin":
                                if(checkPermision(chatId, 700)) {
                                    if(chats[text]) {
                                        Object.keys(chats).forEach(c => {
                                            if(chats[c].id == text) {
                                                chats[c].permision = 1;
                                            }
                                        });
                                        delete admins[text];
                                        await bot.sendMessage(chatId, `Admin (${text}) успешно удален`);
                                    } else {
                                        await bot.sendMessage(chatId, `Admin с id: ${text} не найден!`);
                                    }
                                    updateUser(chatId, {status: "home"});
                                }
                                break;
                            default:
                                await bot.sendMessage(chatId, "Выбери комманду!", {parse_mode : "HTML", ...mainButtons({list: Object.keys(items), type, permision: user.permision})});
                                break;
                        }
                        break;
                }
            }
        }
    };

    return {
        onMessage,
        onCallbackQuery
    }
}

module.exports = stateManager