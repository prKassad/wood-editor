let UI = {};

UI.Element = class Element {
    constructor(dom) {
        this.dom = dom;
    };

    add() {
        for (let i = 0; i < arguments.length; i++) {
            const argument = arguments[i];
            if (argument instanceof UI.Element) {
                this.dom.appendChild(argument.dom);
            } else {
                console.error(argument, 'должен быть экземпляром Element');
            }
        }
        return this;
    }

    remove() {
        for (let i = 0; i < arguments.length; i++) {
            const argument = arguments[i];
            if (argument instanceof UI.Element) {
                this.dom.removeChild(argument.dom);
            } else {
                console.error(argument, 'должен быть экземпляром Element');
            }
        }
        return this;
    }

    clear() {
        while (this.dom.children.length) {
            this.dom.removeChild(this.dom.lastChild);
        }
    }

    setId(id) {
        this.dom.id = id;
        return this;
    }

    setClass(name) {
        this.dom.className = name;
        return this;
    }

    setStyle(style, array) {
        for (let i = 0; i < array.length; i++) {
            this.dom.style[style] = array[i];
        }
        return this;
    }

    setDisabled(value) {
        this.dom.disabled = value;
        return this;
    }

    setTextContent(value) {
        this.dom.textContent = value;
        return this;
    }
};

// properties

const properties = [
    'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'border', 'borderLeft',
    'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'display', 'overflow',
    'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'color',
    'background', 'backgroundColor', 'opacity', 'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex'
];

properties.forEach(function (property) {
    const method = 'set' + property.substr(0, 1).toUpperCase() + property.substr(1, property.length);
    UI.Element.prototype[method] = function () {
        this.setStyle(property, arguments);
        return this;
    };
});

// events

const events = ['KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change'];

events.forEach(function (event) {
    const method = 'on' + event;
    UI.Element.prototype[method] = function (callback) {
        this.dom.addEventListener(event.toLowerCase(), callback.bind(this), false);
        return this;
    };
});


///

UI.Div = class Div extends UI.Element {
    constructor() {
        super();
        this.dom = document.createElement('div');
        return this;
    }
};


UI.Row = class Row extends UI.Element {
    constructor() {
        super();
        const dom = document.createElement('div');
        dom.className = 'Row';
        this.dom = dom;
        return this;
    };
};

UI.Panel = class Panel extends UI.Element {
    constructor() {
        super();
        const dom = document.createElement('div');
        dom.className = 'Panel';
        this.dom = dom;
        return this;
    }
};


UI.HorizontalRule = class HorizontalRule extends UI.Element {
    constructor() {
        super();
        const dom = document.createElement('hr');
        dom.className = 'HorizontalRule';
        this.dom = dom;
        return this;
    }
};

UI.Button = class Button extends UI.Element {
    constructor(value) {
        super();
        const dom = document.createElement('button');
        dom.className = 'Button';
        this.dom = dom;
        this.dom.textContent = value;
        return this;
    };

    setLabel(value) {
        this.dom.textContent = value;
        return this;
    }
};

export default UI;