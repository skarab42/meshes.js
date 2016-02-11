// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        view: 'default',
        size: {
            width: 800,
            height: 600
        },
        antialias: true,
        color: 0x111111,
        ambientLight: {
            color: 0x404040,
            visible: true
        },
        directionalLights: {
            1: { color: 0xefefff, opacity: 0.2, position: { x:  1, y:  1, z: 1 }, visible: true },
            2: { color: 0xefefff, opacity: 0.4, position: { x:  1, y: -1, z: 1 }, visible: true },
            3: { color: 0xefefff, opacity: 0.6, position: { x: -1, y: -1, z: 1 }, visible: true },
            4: { color: 0xefefff, opacity: 0.8, position: { x: -1, y:  1, z: 1 }, visible: true }
        },
        buildVolume: {
            size: {
                x: 200,
                y: 200,
                z: 200
            },
            opacity: 0.1,
            color: 0xffaa00,
            visible: true
        },
        floor: {
            margin: 10,
            color: 0x000000,
            visible: true
        },
        grid: {
            smallCell: {
                size: 10,
                color: 0x333333
            },
            bigCell: {
                size: 100,
                color: 0x444444
            },
            visible: true
        },
        axis: {
            visible: true
        },
        materials: {
            default: {
                material: THREE.MeshLambertMaterial,
                settings: {
                    color: 'random'
                }
            }
        },
        colors: {
            selected: 0xff0000,
            current: 0x00ff00
        }
    };

    // -------------------------------------------------------------------------

    // Constructor
    function Viewer3D(settings) {
        // self alias
        var self = this;

        // local settings
        self.defaults = _.defaultsDeep({}, settings || {}, Viewer3D.globalSettings);

        // init defaults settings
        self.defaults.floor.size = self.defaults.buildVolume.size;
        self.defaults.grid.size = self.defaults.buildVolume.size;

        // clone settings from defaults
        self.settings = _.defaults({}, self.defaults);

        // create main objects
        self.scene = new THREE.Scene();
        self.camera = new THREE.PerspectiveCamera();
        self.renderer = new THREE.WebGLRenderer({ antialias: self.defaults.antialias });
        self.canvas = self.renderer.domElement;

        // set camera orbit around Z axis
        self.camera.up = new THREE.Vector3(0, 0, 1);

        // orbit controls
        self.controls = new THREE.OrbitControls(self.camera, self.canvas);
        self.controls.noKeys = true;

        self.controlsChange = false;

        self.controls.addEventListener('change', function() {
            self.controlsChange = true;
            self.transform.update();
            self.render();
        });

        self.controls.addEventListener('end', function() {
            self.controlsChange = false;
        });

        // transform controls
        var transformTimer = null;
        var transformChangeTime = null;
        self.transformChange = false;
        self.transform = new THREE.TransformControls(self.camera, self.canvas);
        self.transform.addEventListener('change', function() {
            transformChangeTime = Date.now();
            self.transformChange = true;
            self.render();
            // fake end events
            if (! transformTimer) {
                transformTimer = setInterval(function() {
                    if (Date.now() - transformChangeTime > 500) {
                        self.transformChange = false;
                        clearInterval(transformTimer);
                        transformTimer = null;
                    }
                }, 100);
            }
        });

        self.currentObject = null;

        window.addEventListener('keydown', function(event) {
            //console.log(event.keyCode);
            switch (event.keyCode) {
                case 69: // e = transformation mode
                    if (! self.currentObject) break;
                    if (self.currentObject.userData.transform) {
                        self.currentObject.userData.transform = false;
                        self.transform.detach();
                    } else {
                        self.currentObject.userData.transform = true;
                        self.transform.attach(self.currentObject);
                    }
                    self.render();
                    break;

                case 65: // a = (un)select all
                    if (Object.keys(self.selectedObjects).length > 0) {
                        self.unselectAllObjects();
                    } else {
                        self.selectAllObjects();
                    }
                    self.render();
                    break;

                case 84: // t = translate
                    self.transform.setMode('translate');
                    break;

                case 82: // r = rotate
                    self.transform.setMode('rotate');
                    break;

                case 83: // s = scale
                    self.transform.setMode('scale');
                    break;

                case 17: // Ctrl = snap to grid
                    self.transform.setTranslationSnap(self.settings.grid.smallCell.size);
                    self.transform.setRotationSnap(THREE.Math.degToRad(10));
                    break;
            }
            self.render();
        });

        window.addEventListener('keyup', function(event) {
            switch (event.keyCode) {
                case 17: // Ctrl = reset snap to grid
                    self.transform.setTranslationSnap(null);
                    self.transform.setRotationSnap(null);
                    break;
            }
            self.render();
        });

        // dom events (mouse)
        self.events = new THREEx.DomEvents(self.camera, self.canvas);

        // built in objects
        self.ambientLight = new THREE.AmbientLight(self.defaults.ambientLight.color);
        self.floor = new MeshesJS.Floor(self.defaults.floor);
        self.grid = new MeshesJS.Grid(self.defaults.grid);
        self.axis = new MeshesJS.Axis(self.defaults.buildVolume);
        self.buildVolume = new MeshesJS.BuildVolume(self.defaults.buildVolume);

        // views controls
        self.view = new MeshesJS.ViewControls({
            target: self.buildVolume,
            controls: self.controls,
            camera: self.camera,
            margin: self.floor.userData.margin
        });

        // lightning
        self.directionalLights = {};
        self.scene.add(self.ambientLight);

        for(var num in self.defaults.directionalLights) {
            var d = self.defaults.directionalLights[num];
            var o = new THREE.DirectionalLight(d.color, d.opacity);
            var n = 'directionalLight' + num;
            _.assign(o.position, d.position);
            o.visible = !! d.visible;
            self.scene.add(o);
            self[n] = o;
        }

        // compose the scene
        self.scene.add(self.floor);
        self.scene.add(self.grid);
        self.scene.add(self.axis);
        self.scene.add(self.buildVolume);
        self.scene.add(self.transform);

        // set visibility
        self.floor.visible = !! self.defaults.floor.visible;
        self.grid.visible = !! self.defaults.grid.visible;
        self.axis.visible = !! self.defaults.axis.visible;
        self.buildVolume.visible = !! self.defaults.buildVolume.visible;

        // set default parameters
        self.setSize(self.defaults.size);
        self.setColor(self.defaults.color);
        self.setView(self.defaults.view);

        // Loader
        self.loader = new MeshesJS.Loader();

        // objects collection
        self.selectedObjects = {};
        self.objects = {};

        // render
        self.render();
    }

    // -------------------------------------------------------------------------

    // public events
    Viewer3D.prototype.onObjectAdded = function(object) {};
    Viewer3D.prototype.onObjectRemoved = function(name) {};
    Viewer3D.prototype.onObjectSelected = function(object, selected) {};

    // -------------------------------------------------------------------------

    // methods
    Viewer3D.prototype.setSize = function(size) {
        // default size
        var size = size !== undefined ? size : this.defaults.size;
        this.settings.size = _.defaults(size, this.settings.size);

        // resize the renderer
        this.renderer.setSize(this.settings.size.width, this.settings.size.height);

        // update camera aspect
        this.camera.aspect = this.settings.size.width / this.settings.size.height;
        this.camera.updateProjectionMatrix();

        // update controls
        this.controls.update();
    };

    Viewer3D.prototype.setWidth = function(width) {
        this.setSize({ width: width });
    };

    Viewer3D.prototype.setHeight = function(height) {
        this.setSize({ height: height });
    };

    Viewer3D.prototype.setColor = function(color) {
        this.settings.color = color !== undefined ? color : this.defaults.color;
        this.renderer.setClearColor(this.settings.color);
    };

    Viewer3D.prototype.setView = function(view) {
        this.settings.view = view !== undefined ? view : this.defaults.view;
        this.view.set(this.settings.view);
        this.controlsChange = false;
    };

    Viewer3D.prototype.setBuildVolume = function(size) {
        this.settings.buildVolume.size = size !== undefined ? size : this.defaults.buildVolume.size;
        this.floor.setSize(this.settings.buildVolume.size);
        this.grid.setSize(this.settings.buildVolume.size);
        this.axis.setSize(this.settings.buildVolume.size);
        this.buildVolume.setSize(this.settings.buildVolume.size);
        this.view.update();
        this.setView(this.settings.view);
    };

    Viewer3D.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.getObject = function(name) {
        if (this.objects[name]) {
            return this.objects[name];
        }
        if (this[name] && (this[name] instanceof THREE.Object3D)) {
            return this[name];
        }
        return null;
    };

    Viewer3D.prototype.removeObject = function(name) {
        if (this.objects[name]) {
            // remove frome the scene
            this.scene.remove(this.objects[name]);

            // free memory
            this.objects[name].geometry.dispose();
            this.objects[name].material.dispose();

            // remove events listeners
            this.events.removeEventListener(this.objects[name], 'mouseup', true);
            this.events.removeEventListener(this.objects[name], 'dblclick', true);

            // reset/delete reference
            this.objects[name] = null;
            delete this.objects[name];

            // public callback
            this.onObjectRemoved(name);

            return true;
        }
        return false;
    };

    Viewer3D.prototype.getUniqueName = function(name) {
        while (this.objects[name]) {
            var pattern = /\(([0-9]+)\)$/;
            var matches = name.match(pattern);
            if (matches && matches[1]) {
                var id = parseInt(matches[1]);
                name = name.replace(pattern, '(' + (id + 1) + ')');
            }
            else {
                name += ' (1)';
            }
        }
        return name;
    };

    Viewer3D.prototype.setObjectSelected = function(object, selected) {
        var selected = selected === undefined ? true : selected;
        var object = object.uuid ? object : this.getObject(object);

        if (! object) {
            throw 'Undefined object';
        }

        if (selected) {
            if (this.currentObject) {
                this.currentObject.userData.transform = false;
            }
            this.currentObject = object;
            this.selectedObjects[object.name] = object;
            object.material.color.setHex(this.settings.colors.current);
            object.userData.transform = true;
            this.transform.attach(object);
        }
        else {
            this.currentObject = null;
            this.selectedObjects[object.name] = null;
            delete this.selectedObjects[object.name];
            object.material.color.setHex(object.userData.color);
            object.userData.transform = false;
            this.transform.detach();
            var names = Object.keys(this.selectedObjects);
            if (names.length) {
                this.setObjectSelected(names.pop());
            }
        }

        object.userData.selected = !! selected;
        object.renderOrder = this.zIndex++; // force on top

        // public event
        this.onObjectSelected(object, selected);
    };

    Viewer3D.prototype.unselectAllObjects = function() {
        for (var name in this.selectedObjects) {
            this.setObjectSelected(this.selectedObjects[name], false);
        }
    };

    Viewer3D.prototype.selectAllObjects = function() {
        for (var name in this.objects) {
            this.setObjectSelected(this.objects[name], true);
        }
    };

    Viewer3D.prototype.addObject = function(name, object, options) {
        // invalid object type
        if (! (object instanceof THREE.Object3D)) {
            throw 'Object "' + name + '" must be an instance of THREE.Object3D.';
        }

        // merge user and defaults options
        var options = _.defaults(options || {}, {
            position: {},
            rotation: {},
            replace: false,
            unique: false,
            render: true
        });

        // object name already set
        if (this.objects[name]) {
            if (options.replace) {
                this.removeObject(name);
            }
            else if (options.unique) {
                throw 'Object name "' + name + '" already set.';
            }
            else {
                name = this.getUniqueName(name);
            }
        }

        // force object name
        object.name = name;

        // set object position and rotation
        object.position = _.assign(object.position, options.position);
        object.rotation = _.assign(object.rotation, options.rotation);

        // normalize geometry position
        object.geometry.center();
        var box = object.geometry.boundingBox;
        var size = new THREE.Vector3(
            Math.abs(box.max.x - box.min.x),
            Math.abs(box.max.y - box.min.y),
            Math.abs(box.max.z - box.min.z)
        );
        object.geometry.translate(size.x / 2, size.y / 2, size.z / 2);

        // set object up to Z
        object.up = THREE.Vector3(0, 0, 1);

        // set object unselected by default
        object.userData.selected = false;

        // backup original color
        object.userData.color = object.material.color.getHex();

        // events listeners
        var self = this;
        self.events.addEventListener(object, 'mouseup', function(event) {
            if (! self.transformChange) {
                if (object.userData.selected && ! object.userData.transform) {
                    object.userData.selected = false;
                }
                self.setObjectSelected(object, ! object.userData.selected)
                self.render();
            }
        }, false);

        // register and add object to scene
        this.objects[name] = object;
        this.scene.add(object);

        // auto render ?
        options.render && this.render();

        // public callback
        this.onObjectAdded(object);
    };

    Viewer3D.prototype.toggleObjectVisibility = function(name, visible) {
        var mesh = this.getObject(name);
        mesh.visible = visible !== undefined ? (!! visible) : (! mesh.visible);
    };

    Viewer3D.prototype.showObject = function(name) {
        this.toggleObjectVisibility(name, true);
    };

    Viewer3D.prototype.hideObject = function(name) {
        this.toggleObjectVisibility(name, false);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.getMaterial = function(name) {
        var selected = this.settings.materials[name || 'default'];
        var settings = _.defaults({}, selected.settings);
        if (settings.color == 'random') {
            if (typeof randomColor == 'function') {
                settings.color = randomColor();
            }
            else {
                settings.color = ((1<<24)*Math.random()|0);
            }
        }
        return new selected.material(settings);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.load = function(input, options) {
        var settings = _.defaults({}, options || {}, {
            onLoaded: function(mesh) {},
            onError: function(error) {},
            name: null,
            materialName: 'default'
        });
        var name = settings.name;
        if (! name) {
             name = (input.name && input.name.length) ? input.name : 'mesh';
        }
        if (input instanceof THREE.Object3D) {
            try{
                this.addObject(name, input, options);
                settings.onLoaded(input);
            }
            catch(error) {
                settings.onError(error);
            }
        }
        else {
            var self = this;
            self.loader.load(input, {
                onGeometry: function(geometry) {
                    var material = self.getMaterial(settings.materialName);
                    var mesh = new THREE.Mesh(geometry, material);
                    self.addObject(name, mesh);
                    settings.onLoaded(mesh);
                },
                onError: function(error) {
                    settings.onError(error);
                }
            });
        }
    };

    // -------------------------------------------------------------------------

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
