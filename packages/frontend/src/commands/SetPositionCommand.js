import Command from '../Command';

export default class SetPositionCommand extends Command {
    constructor(object, newPosition, optionalOldPosition) {
        super();
        this.object = object;
        if (object !== undefined && newPosition !== undefined) {
            this.oldPosition = object.position.clone();
            this.newPosition = newPosition.clone();
        }
        if (optionalOldPosition !== undefined) {
            this.oldPosition = optionalOldPosition.clone();
        }
    }

    execute() {
        this.object.position.copy(this.newPosition);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    undo() {
        this.object.position.copy(this.oldPosition);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }
}
