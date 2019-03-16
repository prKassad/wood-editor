class History {
    constructor(editor) {
        this.editor = editor;
        this.undos = [];
        this.redos = [];
    }

    execute(cmd) {
        this.undos.push(cmd);
        cmd.execute();
        this.redos = [];
        this.editor.signals.historyChanged.dispatch(cmd);
    }

    undo() {
        if (!this.undos.length) return;
        const cmd = this.undos.pop();
        cmd.undo();
        this.redos.push(cmd);
        this.editor.signals.historyChanged.dispatch(cmd);
        return cmd;
    }

    redo() {
        if (!this.redos.length) return;
        const cmd = this.redos.pop();
        cmd.execute();
        this.undos.push(cmd);
        this.editor.signals.historyChanged.dispatch(cmd);
        return cmd;
    }

    clear() {
        this.undos = [];
        this.redos = [];
    }
}

export default History;