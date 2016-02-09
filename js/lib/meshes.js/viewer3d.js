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
        }
    };

    // Constructor
    function Viewer3D(settings) {
        // self alias
        var self = this;

        // local settings
        var settings = settings || {};
        self.defaults = _.defaultsDeep({}, settings, Viewer3D.globalSettings);

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

        self.controls.addEventListener('change', function() {
            self.render();
        });

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

        // set visibility
        self.floor.visible = !! self.defaults.floor.visible;
        self.grid.visible = !! self.defaults.grid.visible;
        self.axis.visible = !! self.defaults.axis.visible;
        self.buildVolume.visible = !! self.defaults.buildVolume.visible;

        // set default parameters
        self.setSize(self.defaults.size);
        self.setColor(self.defaults.color);
        self.setView(self.defaults.view);

        // objects collection
        self.objects = {};

        // render
        self.render();
    };

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

            // reset/delete reference
            this.objects[name] = null;
            delete this.objects[name];

            return true;
        }
        return false;
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
            replace: false
        });

        // object name already set
        if (this.objects[name]) {
            if (! options.replace) {
                throw 'Object name "' + name + '" already set.';
            }
            // else remove old object
            this.removeObject(name);
        }

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

        // register and add object to scene
        this.objects[name] = object;
        this.scene.add(object);
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

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
