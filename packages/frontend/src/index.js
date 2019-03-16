import Editor from './Editor';
import Viewport from './Viewport';
import Toolbar from './Toolbar';
import Menubar from './Menubar';
import * as THREE from 'three';
import './css/main.css';

const editor = new Editor();

const viewport = new Viewport(editor);
document.body.appendChild(viewport.dom);

const toolbar = new Toolbar(editor);
document.body.appendChild(toolbar.dom);

const menubar = new Menubar(editor);
document.body.appendChild(menubar.dom);

const renderer = new THREE.WebGLRenderer({antialias: true});
editor.signals.rendererChanged.dispatch(renderer);

const onWindowResize = e => editor.signals.windowResize.dispatch();
window.addEventListener('resize', onWindowResize, false);
setTimeout(onWindowResize, 0);