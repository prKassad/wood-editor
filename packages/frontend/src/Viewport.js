import UI from './UI';
import * as THREE from 'three';
import TransformControls from './controls/TransformControls';
import EditorControls from './controls/EditorControls';
import SetPositionCommand from './commands/SetPositionCommand';
import SetRotationCommand from './commands/SetRotationCommand';
import SetScaleCommand from './commands/SetScaleCommand';

class Viewport {

    constructor(editor) {
        const signals = editor.signals;

        const container = new UI.Panel();
        container.setId('viewport');
        container.setPosition('absolute');

        let renderer = null;

        const camera = editor.camera;
        const scene = editor.scene;
        const sceneHelpers = editor.sceneHelpers;

        const objects = [];

        // helpers

        const grid = new THREE.GridHelper(30, 30, 0x444444, 0x888888);
        sceneHelpers.add(grid);

        const array = grid.geometry.attributes.color.array;
        for (let i = 0; i < array.length; i += 60) {
            for (let j = 0; j < 12; j++) {
                array[i + j] = 0.26;
            }
        }


        const box = new THREE.Box3();

        const selectionBox = new THREE.BoxHelper();
        selectionBox.material.depthTest = false;
        selectionBox.material.transparent = true;
        selectionBox.visible = false;
        sceneHelpers.add(selectionBox);

        let objectPositionOnDown = null;
        let objectRotationOnDown = null;
        let objectScaleOnDown = null;

        const transformControls = new TransformControls(camera, container.dom);
        transformControls.addEventListener('change', function () {

            let object = transformControls.object;

            if (object !== undefined) {
                selectionBox.setFromObject(object);
                if (editor.helpers[object.id] !== undefined) {
                    editor.helpers[object.id].update();
                }
            }
            render();
        });
        transformControls.addEventListener('mouseDown', function () {

            let object = transformControls.object;

            objectPositionOnDown = object.position.clone();
            objectRotationOnDown = object.rotation.clone();
            objectScaleOnDown = object.scale.clone();

            controls.enabled = false;

        });
        transformControls.addEventListener('mouseUp', function () {
            let object = transformControls.object;
            if (object !== undefined) {
                switch (transformControls.getMode()) {
                    case 'translate':
                        if (!objectPositionOnDown.equals(object.position)) {
                            editor.execute(new SetPositionCommand(object, object.position, objectPositionOnDown));
                        }
                        break;
                    case 'rotate':
                        if (!objectRotationOnDown.equals(object.rotation)) {
                            editor.execute(new SetRotationCommand(object, object.rotation, objectRotationOnDown));
                        }
                        break;
                    case 'scale':
                        if (!objectScaleOnDown.equals(object.scale)) {
                            editor.execute(new SetScaleCommand(object, object.scale, objectScaleOnDown));
                        }
                        break;
                }
            }
            controls.enabled = true;
        });

        sceneHelpers.add(transformControls);

        // object picking

        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();

        // events

        function getIntersects(point, objects) {
            mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
            raycaster.setFromCamera(mouse, camera);
            return raycaster.intersectObjects(objects);
        }

        let onDownPosition = new THREE.Vector2();
        let onUpPosition = new THREE.Vector2();
        let onDoubleClickPosition = new THREE.Vector2();

        function getMousePosition(dom, x, y) {
            let rect = dom.getBoundingClientRect();
            return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
        }

        function handleClick() {
            if (onDownPosition.distanceTo(onUpPosition) === 0) {
                let intersects = getIntersects(onUpPosition, objects);
                if (intersects.length > 0) {
                    let object = intersects[0].object;
                    if (object.userData.object !== undefined) {
                        // helper
                        editor.select(object.userData.object);
                    } else {
                        editor.select(object);
                    }
                } else {
                    editor.select(null);
                }
                render();
            }
        }

        function onMouseDown(event) {
            event.preventDefault();
            let array = getMousePosition(container.dom, event.clientX, event.clientY);
            onDownPosition.fromArray(array);
            document.addEventListener('mouseup', onMouseUp, false);
        }

        function onMouseUp(event) {
            let array = getMousePosition(container.dom, event.clientX, event.clientY);
            onUpPosition.fromArray(array);
            handleClick();
            document.removeEventListener('mouseup', onMouseUp, false);
        }

        function onTouchStart(event) {
            let touch = event.changedTouches[0];
            let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
            onDownPosition.fromArray(array);
            document.addEventListener('touchend', onTouchEnd, false);
        }

        function onTouchEnd(event) {
            let touch = event.changedTouches[0];
            let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
            onUpPosition.fromArray(array);
            handleClick();
            document.removeEventListener('touchend', onTouchEnd, false);
        }

        function onDoubleClick(event) {
            let array = getMousePosition(container.dom, event.clientX, event.clientY);
            onDoubleClickPosition.fromArray(array);
            let intersects = getIntersects(onDoubleClickPosition, objects);
            if (intersects.length > 0) {
                let intersect = intersects[0];
                signals.objectFocused.dispatch(intersect.object);
            }
        }

        container.dom.addEventListener('mousedown', onMouseDown, false);
        container.dom.addEventListener('touchstart', onTouchStart, {passive: true});
        container.dom.addEventListener('dblclick', onDoubleClick, false);


        let controls = new EditorControls(camera, container.dom);
        controls.addEventListener('change', function () {
            signals.cameraChanged.dispatch(camera);
        });

        // signals

        signals.editorCleared.add(function () {
            controls.center.set(0, 0, 0);
            render();
        });

        signals.transformModeChanged.add(function (mode) {
            transformControls.setMode(mode);
        });


        signals.rendererChanged.add((newRenderer) => {
            if (renderer !== null) {
                container.dom.removeChild(renderer.domElement);
            }

            renderer = newRenderer;
            renderer.autoClear = false;
            renderer.autoUpdateScene = false;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
            container.dom.appendChild(renderer.domElement);
            render();
        });

        signals.sceneGraphChanged.add(function () {
            render();
        });

        signals.cameraChanged.add(function () {
            render();
        });

        signals.objectSelected.add(function (object) {

            selectionBox.visible = false;
            transformControls.detach();

            if (object !== null && object !== scene && object !== camera) {
                box.setFromObject(object);
                if (box.isEmpty() === false) {
                    selectionBox.setFromObject(object);
                    selectionBox.visible = true;
                }
                transformControls.attach(object);
            }
            render();
        });

        signals.objectFocused.add(function (object) {

            controls.focus(object);

        });

        signals.geometryChanged.add(function (object) {
            if (object !== undefined) {
                selectionBox.setFromObject(object);
            }
            render();
        });

        signals.objectAdded.add(function (object) {
            object.traverse(function (child) {
                objects.push(child);
            });
        });

        signals.objectChanged.add(function (object) {
            if (editor.selected === object) {
                selectionBox.setFromObject(object);
            }
            if (object instanceof THREE.PerspectiveCamera) {
                object.updateProjectionMatrix();
            }
            if (editor.helpers[object.id] !== undefined) {
                editor.helpers[object.id].update();
            }
            render();
        });

        signals.objectRemoved.add(function (object) {
            if (object === transformControls.object) {
                transformControls.detach();
            }
            object.traverse(function (child) {
                objects.splice(objects.indexOf(child), 1);
            });
        });

        signals.helperAdded.add(function (object) {
            objects.push(object.getObjectByName('picker'));
        });

        signals.helperRemoved.add(function (object) {
            objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
        });

        signals.windowResize.add(function () {
            editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
            editor.DEFAULT_CAMERA.updateProjectionMatrix();
            camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);
            render();
        });


        function render() {
            sceneHelpers.updateMatrixWorld();
            scene.updateMatrixWorld();
            renderer.render(scene, camera);
            renderer.render(sceneHelpers, camera);
        }

        return container;
    }
}

export default Viewport;