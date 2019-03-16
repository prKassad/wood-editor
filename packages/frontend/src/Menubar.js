import UI from './UI';
import * as THREE from 'three';
import AddObjectCommand from './commands/AddObjectCommand';
import RemoveObjectCommand from './commands/RemoveObjectCommand';

const File = function (editor) {
    const strings = editor.strings;

    const container = new UI.Panel();
    container.setClass('menu');

    const title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/file'));
    container.add(title);

    const options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    // New

    const option = new UI.Row();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/file/new'));
    option.onClick(function () {
        if (confirm('Все несохраненные данные будут потеряны. Вы уверены?')) {
            editor.clear();
        }
    });
    options.add(option);
    return container;
};


const Edit = function (editor) {
    const strings = editor.strings;

    const container = new UI.Panel();
    container.setClass('menu');

    const title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/edit'));
    container.add(title);

    const options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    // Undo

    const undo = new UI.Row();
    undo.setClass('option');
    undo.setTextContent(strings.getKey('menubar/edit/undo'));
    undo.onClick(function () {

        editor.undo();

    });
    options.add(undo);

    // Redo

    const redo = new UI.Row();
    redo.setClass('option');
    redo.setTextContent(strings.getKey('menubar/edit/redo'));
    redo.onClick(function () {
        editor.redo();
    });
    options.add(redo);

    editor.signals.historyChanged.add(function () {
        const history = editor.history;
        undo.setClass('option');
        redo.setClass('option');
        if (history.undos.length == 0) {
            undo.setClass('inactive');
        }
        if (history.redos.length == 0) {
            redo.setClass('inactive');
        }
    });

    // ---

    options.add(new UI.HorizontalRule());

    // Clone

    let option = new UI.Row();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/clone'));
    option.onClick(function () {
        let object = editor.selected;
        if (object.parent === null) return; // avoid cloning the camera or scene
        object = object.clone();
        editor.execute(new AddObjectCommand(object));
    });
    options.add(option);

    // Delete

    option = new UI.Row();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/edit/delete'));
    option.onClick(function () {
        const object = editor.selected;
        const parent = object.parent;
        if (parent === undefined) return; // avoid deleting the camera or scene
        editor.execute(new RemoveObjectCommand(object));
    });
    options.add(option);
    return container;
};


const Add = function (editor) {
    const strings = editor.strings;

    const container = new UI.Panel();
    container.setClass('menu');

    const title = new UI.Panel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/add'));
    container.add(title);

    const options = new UI.Panel();
    options.setClass('options');
    container.add(options);

    // Box

    let option = new UI.Row();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/box'));
    option.onClick(function () {
        const geometry = new THREE.BoxBufferGeometry(5, 5, 0.1, 1, 1, 1);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
        mesh.name = strings.getKey('menubar/add/box');
        mesh.position.y += 2.5;
        editor.execute(new AddObjectCommand(mesh));
    });
    options.add(option);
    options.add(new UI.HorizontalRule());

    // PointLight

    option = new UI.Row();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/add/pointlight'));
    option.onClick(function () {
        const color = 0xffffff;
        const intensity = 1;
        const distance = 0;
        const light = new THREE.PointLight(color, intensity, distance);
        light.name = strings.getKey('menubar/add/box');
        editor.execute(new AddObjectCommand(light));
    });
    options.add(option);
    return container;
};


const Menubar = function (editor) {
    const container = new UI.Panel();
    container.setId('menubar');
    container.add(new File(editor));
    container.add(new Edit(editor));
    container.add(new Add(editor));
    return container;
};
export default Menubar;