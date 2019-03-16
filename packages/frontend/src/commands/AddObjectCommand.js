import Command from '../Command';

export default class AddObjectCommand extends Command {
    constructor(object) {
        super();
        this.object = object;
    }

    execute() {
        this.editor.addObject(this.object);
        this.editor.select(this.object);
    }

    undo() {
        this.editor.removeObject(this.object);
        this.editor.deselect();
    }
}
