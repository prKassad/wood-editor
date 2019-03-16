import * as THREE from 'three';
import { Signal } from 'signals';
import History from './History';
import Strings from './Strings';

export default class Editor {
    constructor() {
        this.DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
        this.DEFAULT_CAMERA.name = 'Camera';
        this.DEFAULT_CAMERA.position.set(0, 5, 10);
        this.DEFAULT_CAMERA.lookAt(new THREE.Vector3());

        this.signals = {
            editorCleared: new Signal(),
            transformModeChanged: new Signal(),
            rendererChanged: new Signal(),
            sceneGraphChanged: new Signal(),
            cameraChanged: new Signal(),
            geometryChanged: new Signal(),
            objectSelected: new Signal(),
            objectFocused: new Signal(),
            objectAdded: new Signal(),
            objectChanged: new Signal(),
            objectRemoved: new Signal(),
            helperAdded: new Signal(),
            helperRemoved: new Signal(),
            windowResize: new Signal(),
            historyChanged: new Signal()
        };

        this.history = new History(this);
        this.strings = new Strings();

        this.camera = this.DEFAULT_CAMERA.clone();

        this.scene = new THREE.Scene();
        this.scene.name = 'Scene';
        this.scene.background = new THREE.Color(0xaaaaaa);

        this.sceneHelpers = new THREE.Scene();

        this.object = {};
        this.geometries = {};
        this.materials = {};

        this.selected = null;
        this.helpers = {};
    };


    setScene(scene) {
        this.scene.uuid = scene.uuid;
        this.scene.name = scene.name;

        if (scene.background !== null) this.scene.background = scene.background.clone();
        if (scene.fog !== null) this.scene.fog = scene.fog.clone();

        this.scene.userData = JSON.parse(JSON.stringify(scene.userData));
        this.signals.sceneGraphChanged.active = false;
        while (scene.children.length > 0) {
            this.addObject(scene.children[0]);
        }
        this.signals.sceneGraphChanged.active = true;
        this.signals.sceneGraphChanged.dispatch();
    }

    //

    addObject(object) {
        object.traverse((child) => {
            if (child.geometry !== undefined) this.addGeometry(child.geometry);
            if (child.material !== undefined) this.addMaterial(child.material);
            this.addHelper(child);
        });

        this.scene.add(object);

        this.signals.objectAdded.dispatch(object);
        this.signals.sceneGraphChanged.dispatch();
    }

    moveObject(object, parent, before) {
        if (parent === undefined) {
            parent = this.scene;
        }

        parent.add(object);

        // sort children array
        if (before !== undefined) {
            const index = parent.children.indexOf(before);
            parent.children.splice(index, 0, object);
            parent.children.pop();
        }
        this.signals.sceneGraphChanged.dispatch();
    }

    nameObject(object, name) {
        object.name = name;
        this.signals.sceneGraphChanged.dispatch();
    }

    removeObject(object) {
        if (object.parent === null) return; // avoid deleting the camera or scene
        object.traverse((child) => {
            this.removeHelper(child);
        });
        object.parent.remove(object);
        this.signals.objectRemoved.dispatch(object);
        this.signals.sceneGraphChanged.dispatch();
    }

    addGeometry(geometry) {
        this.geometries[geometry.uuid] = geometry;
    }

    addMaterial(material) {
        this.materials[material.uuid] = material;
    }

    addHelper() {
        const geometry = new THREE.SphereBufferGeometry(2, 4, 2);
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, visible: false});

        return function (object) {
            let helper;
            if (object instanceof THREE.Camera) {
                helper = new THREE.CameraHelper(object, 1);
            } else if (object instanceof THREE.PointLight) {
                helper = new THREE.PointLightHelper(object, 1);
            } else if (object instanceof THREE.SkinnedMesh) {
                helper = new THREE.SkeletonHelper(object);
            } else {
                // no helper for this object type
                return;
            }
            const picker = new THREE.Mesh(geometry, material);
            picker.name = 'picker';
            picker.userData.object = object;
            helper.add(picker);
            this.sceneHelpers.add(helper);
            this.helpers[object.id] = helper;
            this.signals.helperAdded.dispatch(helper);
        };
    }

    removeHelper(object) {
        if (this.helpers[object.id] !== undefined) {
            const helper = this.helpers[object.id];
            helper.parent.remove(helper);
            delete this.helpers[object.id];
            this.signals.helperRemoved.dispatch(helper);
        }
    }

    select(object) {
        if (this.selected === object) return;
        let uuid = null;
        if (object !== null) {
            uuid = object.uuid;
        }
        this.selected = object;
        this.signals.objectSelected.dispatch(object);
    }

    selectById(id) {
        if (id === this.camera.id) {
            this.select(this.camera);
            return;
        }
        this.select(this.scene.getObjectById(id, true));
    }

    selectByUuid(uuid) {
        this.scene.traverse((child) => {
            if (child.uuid === uuid) {
                this.select(child);
            }
        });
    }

    deselect() {
        this.select(null);
    }

    focus(object) {
        this.signals.objectFocused.dispatch(object);
    }

    focusById(id) {
        this.focus(this.scene.getObjectById(id, true));
    }

    clear() {
        this.history.clear();

        this.camera.copy(this.DEFAULT_CAMERA);
        this.scene.background.setHex(0xaaaaaa);
        const objects = this.scene.children;
        while (objects.length > 0) {
            this.removeObject(objects[0]);
        }
        this.deselect();
        this.signals.editorCleared.dispatch();
    }

    objectByUuid(uuid) {
        return this.scene.getObjectByProperty('uuid', uuid, true);
    }

    execute(cmd, optionalName) {
        cmd.setEditor(this);
        this.history.execute(cmd, optionalName);
    }

    undo() {
        this.history.undo();
    }

    redo() {
        this.history.redo();
    }
};
