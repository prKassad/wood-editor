import Command from '../Command';

export default class SetScaleCommand extends Command {
    constructor(object, newScale, optionalOldScale) {
        super();
        this.object = object;
        if (object !== undefined && newScale !== undefined) {
            this.oldScale = object.scale.clone();
            this.newScale = newScale.clone();
        }
        if (optionalOldScale !== undefined) {
            this.oldScale = optionalOldScale.clone();
        }
    }

    execute() {
        this.object.scale.copy(this.newScale);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }

    undo() {
        this.object.scale.copy(this.oldScale);
        this.object.updateMatrixWorld(true);
        this.editor.signals.objectChanged.dispatch(this.object);
    }
}
