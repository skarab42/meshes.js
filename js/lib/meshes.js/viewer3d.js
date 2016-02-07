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
            },
            alpha: 0.1,
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
        self.buildVolume = new MeshesJS.BuildVolume(settings.buildVolume);

        // compose the scene
        self.scene.add(self.ambientLight);
        self.scene.add(self.floor);
        self.scene.add(self.grid);
        self.scene.add(self.axis);
        self.scene.add(self.buildVolume);

        // debugage/tests...
        self.camera.position.z = settings.buildVolume.size.z * 2;
        //self.floor.setColor(0x222222);
        //self.floor.setX(50);
        //self.axis.setX(50);
        //self.grid.setX(50);
        //self.buildVolume.setX(100);
        //self.buildVolume.setColor(100);
        //self.buildVolume.setAlpha(1);

        //console.log(self.floor.position);
        //console.log(self.axis.position);
        //console.log(self.grid.position);
        //console.log(self.buildVolume.position);

        // render
        self.render();
    };

    // methods
    Viewer3D.prototype.setSize = function(size) {
        // default size
        this.settings.size = _.defaults(size, this.renderer.getSize());

        // resize the renderer
        this.renderer.setSize(size.width, size.height);

        // update camera aspect
        this.camera.aspect = size.width / size.height;
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
        this.settings.color = color;
        this.renderer.setClearColor(color);
    };

    Viewer3D.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
