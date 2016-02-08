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

        this.setSize();
    };

    // extends
    Axis.prototype = Object.create(THREE.LineSegments.prototype);
    Axis.prototype.constructor = Axis;

    // methods
    Axis.prototype.setSize = function(size) {
        this.userData.size = _.defaultsDeep(size || {}, this.userData.size);
        this.scale = _.assign(this.scale, this.userData.size);
    };

    Axis.prototype.setX = function(x) {
        this.setSize({ x: x });
    };

    Axis.prototype.setY = function(y) {
        this.setSize({ y: y });
    };

    Axis.prototype.setZ = function(z) {
        this.setSize({ z: z });
    };

    // global settings
    Axis.userData = userData;

    // export module
    MeshesJS.Axis = Axis;

})();
