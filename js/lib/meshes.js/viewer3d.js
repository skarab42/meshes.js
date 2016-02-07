// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
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
            }
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
        this.settings = _.defaultsDeep(settings || {}, Viewer3D.globalSettings);

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

        // set default parameters
        self.setSize(settings.size);
        self.setColor(settings.color);

        // built in objects
        self.ambientLight = new THREE.AmbientLight(settings.ambientLight);
        self.floor = new MeshesJS.Floor(settings.floor);
        self.grid = new MeshesJS.Grid(settings.grid);
        self.axis = new MeshesJS.Axis(settings.buildVolume);

        // compose the scene
        self.scene.add(self.ambientLight);
        self.scene.add(self.floor);
        self.scene.add(self.grid);
        self.scene.add(self.axis);

        // debugage/tests...
        self.camera.position.z = 100;

        self.floor.setX(50);
        self.axis.setX(50);
        self.grid.setX(50);

        console.log(self.floor.position);
        console.log(self.axis.position);
        console.log(self.grid.position);

        // render
        self.render();
    };

    // set viewer size
    Viewer3D.prototype.setSize = function(size) {
        // default size
        var size = _.defaults(size, this.renderer.getSize());

        // resize the renderer
        this.renderer.setSize(size.width, size.height);

        // update camera aspect
        this.camera.aspect = size.width / size.height;
        this.camera.updateProjectionMatrix();
    };

    // set viewer color
    Viewer3D.prototype.setColor = function(color) {
        this.renderer.setClearColor(color);
    };

    // (re)render viewer
    Viewer3D.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
