export default class Strings {
    constructor() {
        this.language = 'ru';

        this.values = {
            ru: {
                'menubar/file': 'Проект',
                'menubar/file/new': 'Новый',

                'menubar/edit': 'Правка',
                'menubar/edit/undo': 'Отменить',
                'menubar/edit/redo': 'Повторить',
                'menubar/edit/clone': 'Клонировать',
                'menubar/edit/delete': 'Удалить',

                'menubar/add': 'Добавить',
                'menubar/add/group': 'Группа',
                'menubar/add/box': 'ЛДСП',
                'menubar/add/pointlight': 'Точечный свет',


                'toolbar/translate': 'Перемещение',
                'toolbar/rotate': 'Поворот',
                'toolbar/scale': 'Масштаб'
            }
        };
    }

    getKey(key) {
        return this.values[this.language][key] || '???';
    }
}
