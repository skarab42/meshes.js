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
        ambientLight: 0x404040,
        buildVolume: {
            size: {
                x: 200,
                y: 200,
                z: 200
            },
            opacity: 0.1,
            color: 0xffaa00
        },
        floor: {
            margin: 10,
            color: 0x000000
        },
        grid: {
            smallCell: {
                size: 10,
                color: 0x333333
            },
            bigCell: {
                size: 100,
                color: 0x444444
            }
        }
    };

    // Constructor
    function Viewer3D(settings) {
        // local settings
        var settings = settings || {};
        this.settings = _.defaultsDeep(settings, Viewer3D.globalSettings);

        // init defaults settings
        settings.floor.size = settings.buildVolume.size;
        settings.grid.size = settings.buildVolume.size;

        // self alias
        var self = this;

        // create main objects
        self.scene = new THREE.Scene();
        self.camera = new THREE.PerspectiveCamera();
        self.renderer = new THREE.WebGLRenderer({ antialias: settings.antialias });
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
        self.ambientLight = new THREE.AmbientLight(settings.ambientLight);
        self.floor = new MeshesJS.Floor(settings.floor);
        self.grid = new MeshesJS.Grid(settings.grid);
        self.axis = new MeshesJS.Axis(settings.buildVolume);
        self.buildVolume = new MeshesJS.BuildVolume(settings.buildVolume);

        // views controls
        self.view = new MeshesJS.ViewControls({
            target: self.buildVolume,
            controls: self.controls,
            camera: self.camera,
            margin: self.floor.userData.margin
        });

        // compose the scene
        self.scene.add(self.ambientLight);
        self.scene.add(self.floor);
        self.scene.add(self.grid);
        self.scene.add(self.axis);
        self.scene.add(self.buildVolume);

        // set default parameters
        self.setSize(settings.size);
        self.setColor(settings.color);
        self.setView(settings.view);

        // objects collection
        self.objects = {};

        // render
        self.render();
    };

    // methods
    Viewer3D.prototype.setSize = function(size) {
        // default size
        var size = size !== undefined ? size : this.settings.size;
        this.currentSize = _.defaults(size, this.currentSize);

        // resize the renderer
        this.renderer.setSize(this.currentSize.width, this.currentSize.height);

        // update camera aspect
        this.camera.aspect = this.currentSize.width / this.currentSize.height;
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
        this.currentColor = color !== undefined ? color : this.settings.color;
        this.renderer.setClearColor(this.currentColor);
    };

    Viewer3D.prototype.setView = function(view) {
        this.currentView = view !== undefined ? view : this.settings.view;
        this.view.set(this.currentView);
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

        // normalize geometry position:
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
