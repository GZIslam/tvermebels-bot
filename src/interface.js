const nameMap = {
    "editItems": "Добавить/Удалить ITEM",
    "removeItem": "Удалить ITEM",
    "addItem": "Добавить ITEM",
    "confirm": "Подтверждаю",
    "showFormulas": "Посчитать цену",
    "cancel": "Отмена/назад",
    "editFormulas": "Добавить/Удалить формулы",
    "removeFormula": "Удалить формулу",
    "addFormula": "Добавить формулу",
    "addVariable": "Добавить переменную",
    "finish": "Готово",
    "admin": "Меню Админа",
    "game": "/game",
    "addAdmin": "Сделать Админом",
    "showAdmins": "Список Адинов",
    "removeAdmin": "Убрать права Админа",
    "removeChats": "Удалить все чаты (обновить)",
    "users": "Пользователи",
    "id": "/id",
    "start": "/start",
}

const createButtons = (buttons, type = "keyboard", game = false) => {
    let keyboard = buttons.map(b => {
        const res = {text: b};
        if(type !== "keyboard") {
            if(b.callback_data) {
                return [b];
            } else {
                return [{callback_data: b, text: b}];
            }
        };
        return [res]
    });
    if(game) keyboard = [[...keyboard[0], ...keyboard[1]], [...keyboard[2], ...keyboard[3]], [...keyboard[4]]];
    return {
        reply_markup: JSON.stringify({
            [type]: keyboard
        })
    };
};

const generateStartQuestion = (flag = false, type, game) => {
    const a = Math.ceil(Math.random() * 10);
    const b = Math.ceil(Math.random() * 10);
    const c = a + b;
    const randomIndex = Math.floor(Math.random() * 3);
    const buttons = [c];
    while(buttons.length !== 4) {
        const random = Math.ceil(Math.random() * 15)
        if(!buttons.includes(random)) {
            buttons.push(random);
        }
    }
    const index = Math.random() > 0.5 ? 3 - randomIndex : randomIndex
    buttons[0] = buttons[index];
    buttons[index] = c;
    const keyboard = [buttons[0], buttons[1], buttons[2], buttons[3]]
    if(flag) {
        keyboard.push(nameMap.cancel);
    }
    return {
        answer: c,
        question: `${flag ? "" : "Чтобы начать пройдите тест"}\nСколько будет ${a} + ${b} = ?`,
        buttons: createButtons(keyboard, type, game)
    }
};

const mainButtons = ({list = [], type, permision}) => {
    const buttons = [...list, nameMap.showFormulas];
    if(permision >= 300) buttons.push(nameMap.editItems);
    if(permision >= 700) buttons.push(nameMap.admin);

    return createButtons(
        buttons,
        type
    )
}

const editItems = (type) => createButtons(
    [
        nameMap.addItem,
        nameMap.removeItem,
        nameMap.cancel,
    ],
    type
);

const confirmation = (type) => createButtons(
    [
        nameMap.confirm,
        nameMap.cancel,
    ],
    type
);

const formulasButtons = ({list = [], type, permision}) => {
    if(permision >= 300) list.push(nameMap.editFormulas)
    list.push(nameMap.cancel)
    return createButtons(
        list,
        type
    );
};

const editFormulas = (type) => createButtons(
    [
        nameMap.addFormula,
        nameMap.removeFormula,
        nameMap.cancel,
    ],
    type
);

const adminButtons = () => createButtons(
    [
        nameMap.showAdmins,
        nameMap.addAdmin,
        nameMap.removeAdmin,
        nameMap.removeChats,
        nameMap.users,
    ],
    "inline_keyboard",
)

const addVariables = (type) => createButtons(
    [
        nameMap.addVariable,
        nameMap.finish,
        nameMap.cancel,
    ],
    type
);

const commands = [
    {command: nameMap.start, description: "Начать"},
    {command: nameMap.id, description: "Мой ID"},
    {command: nameMap.game, description: "Игра"},
];

module.exports = {
    commands,
    generateStartQuestion,
    mainButtons,
    nameMap,
    editItems,
    adminButtons,
    confirmation,
    formulasButtons,
    editFormulas,
    addVariables,
    createButtons,
};