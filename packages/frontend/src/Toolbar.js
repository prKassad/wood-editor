import UI from './UI';

export default class Toolbar {
    constructor(editor) {
        const signals = editor.signals;
        const strings = editor.strings;

        const container = new UI.Panel();
        container.setId('toolbar');
        container.setDisplay('none');

        const buttons = new UI.Panel();
        container.add(buttons);

        const translate = new UI.Button(strings.getKey('toolbar/translate'));
        translate.dom.className = 'Button selected';
        translate.onClick(function () {
            signals.transformModeChanged.dispatch('translate');
        });
        buttons.add(translate);

        const rotate = new UI.Button(strings.getKey('toolbar/rotate'));
        rotate.onClick(function () {
            signals.transformModeChanged.dispatch('rotate');
        });
        buttons.add(rotate);

        const scale = new UI.Button(strings.getKey('toolbar/scale'));
        scale.onClick(function () {
            signals.transformModeChanged.dispatch('scale');
        });
        buttons.add(scale);

        signals.objectSelected.add(function (object) {
            container.setDisplay(object === null ? 'none' : '');
        });

        signals.transformModeChanged.add(function (mode) {
            translate.dom.classList.remove('selected');
            rotate.dom.classList.remove('selected');
            scale.dom.classList.remove('selected');
            switch (mode) {
                case 'translate':
                    translate.dom.classList.add('selected');
                    break;
                case 'rotate':
                    rotate.dom.classList.add('selected');
                    break;
                case 'scale':
                    scale.dom.classList.add('selected');
                    break;
            }
        });
        return container;
    }
}