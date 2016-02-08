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

    Viewer3D.prototype.getMesh = function(uuid) {
        if (this.objects[uuid]) {
            return this.objects[uuid];
        }
        if (this[uuid] && (this[uuid] instanceof THREE.Object3D)) {
            return this[uuid];
        }
        return null;
    };

    Viewer3D.prototype.toggleMeshVisibility = function(uuid, visible) {
        var mesh = this.getMesh(uuid);
        mesh.visible = visible !== undefined ? (!! visible) : (! mesh.visible);
    };

    Viewer3D.prototype.showMesh = function(uuid) {
        this.toggleMeshVisibility(uuid, true);
    };

    Viewer3D.prototype.hideMesh = function(uuid) {
        this.toggleMeshVisibility(uuid, false);
    };

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
