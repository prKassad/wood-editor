import Command from '../Command';

export default class RemoveObjectCommand extends Command {
    constructor(object) {
        super();
        this.object = object;
        this.parent = (object !== undefined) ? object.parent : undefined;
        if (this.parent !== undefined) {
            this.index = this.parent.children.indexOf(this.object);
        }
    }

    execute() {
        this.object.traverse(child => {
            this.editor.removeHelper(child);
        });
        this.parent.remove(this.object);
        this.editor.select(this.parent);
        this.editor.signals.objectRemoved.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();
    }

    undo() {
        this.object.traverse(child => {
            if (child.geometry !== undefined) this.editor.addGeometry(child.geometry);
            if (child.material !== undefined) this.editor.addMaterial(child.material);
            this.editor.addHelper(child);
        });
        this.parent.children.splice(this.index, 0, this.object);
        this.object.parent = this.parent;
        this.editor.select(this.object);
        this.editor.signals.objectAdded.dispatch(this.object);
        this.editor.signals.sceneGraphChanged.dispatch();
    }
}
