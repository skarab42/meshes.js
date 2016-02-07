// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var userData = {
        size: {
            x: 100,
            y: 100,
            z: 100
        }
    };

    // Constructor
    function Axis(settings) {
        var vertices = new Float32Array([
            0, 0, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,
            0, 0, 0,  0, 0, 1
        ] );

        var colors = new Float32Array([
            1, 0, 0,  1, 0.6, 0,
            0, 1, 0,  0.6, 1, 0,
            0, 0, 1,  0, 0.6, 1
        ] );

        var geometry = new THREE.BufferGeometry();
        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        });

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        THREE.LineSegments.call(this, geometry, material, THREE.LineSegments);

        this.userData = _.defaultsDeep(settings || {}, Axis.userData);

        this.draw();
    };

    // extends
    Axis.prototype = Object.create(THREE.LineSegments.prototype);
    Axis.prototype.constructor = Axis;

    // methods
    Axis.prototype.setX = function(value) {
        this.draw({ size: { x: value } });
    };

    Axis.prototype.setY = function(value) {
        this.draw({ size: { y: value } });
    };

    Axis.prototype.setZ = function(value) {
        this.draw({ size: { z: value } });
    };

    Axis.prototype.setSize = function(size) {
        this.draw({ size: size });
    };

    Axis.prototype.draw = function(settings) {
        this.userData = _.defaultsDeep(settings || {}, this.userData);
        this.scale = _.assign(this.scale, this.userData.size);
    };

    // global settings
    Axis.userData = userData;

    // export module
    MeshesJS.Axis = Axis;

})();
