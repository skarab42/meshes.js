// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // Constructor
    function Axis(size) {
        var size = _.defaults(size, { x: 100, y: 100, z: 100 });

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
        var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        THREE.LineSegments.call(this, geometry, material, THREE.LineSegments);

        this.setSize(size);
    };

    Axis.prototype = Object.create(THREE.LineSegments.prototype);
    Axis.prototype.constructor = Axis;

    Axis.prototype.setX = function(value) { this.scale.x = value; };
    Axis.prototype.setY = function(value) { this.scale.y = value; };
    Axis.prototype.setZ = function(value) { this.scale.z = value; };

    Axis.prototype.setSize = function(size) {
        this.scale = _.assign(this.scale, size);
    };

    // export module
    MeshesJS.Axis = Axis;

})();
