export default class Command {
    constructor() {
        if (new.target === Command) {
            throw new TypeError('Невозможно создать экземпляр абстрактной команды!');
        }
    }

    setEditor(editor) {
        if (editor !== undefined) {
            this.editor = editor;
        }
    }
}