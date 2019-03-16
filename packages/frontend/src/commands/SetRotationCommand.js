import Command from '../Command';

export default class SetRotationCommand extends Command {
    constructor(object, newRotation, optionalOldRotation) {
        super();
        this.object = object;
        if (object !== undefined && newRotation !== undefined) {
            this.oldRotation = object.rotation.clone();
            this.newRotation = newRotation.clone();
        }
        if (optionalOldRotation !== undefined) {
            this.oldRotation = optionalOldRotation.clone();
        }
    }

    execute() {
        this.object.rotation.copy(this.newRotation);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    undo() {
        this.object.rotation.copy(this.oldRotation);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }
}
