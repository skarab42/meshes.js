// namespace
var MeshesJS = MeshesJS || {};

;(function() {
    // global settings
    var globalSettings = {
        size: {
            width : 800,
            height: 600
        }
    };

    // Viewer3D constructor
    function Viewer3D(settings) {
        // local settings
        var settings  = _.defaultsDeep(settings || {}, Viewer3D.globalSettings);

        // self alias
        var self = this;

        // create scene
        self.scene = new THREE.Scene();

        // create camera
        self.camera = new THREE.PerspectiveCamera();

        // create renderer
        self.renderer = new THREE.WebGLRenderer();

        // render dom element alias
        self.canvas = self.renderer.domElement;

        // initialize defaults values
        //this.setSize(settings.size);

        // debugage...
        console.log(this);
    };

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;
})();
