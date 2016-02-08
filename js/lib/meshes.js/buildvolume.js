// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var userData = {
        size: {
            x: 100,
            y: 100,
            z: 100
        },
        opacity: 0.1,
        color: 0xffaa00
    };

    // Constructor
    function BuildVolume(settings) {
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshLambertMaterial({ transparent: true });

        geometry.translate(0.5, 0.5, 0.5);

        THREE.Mesh.call(this, geometry, material, THREE.Mesh);

        this.userData = _.defaultsDeep(settings || {}, BuildVolume.userData);

        this.setSize();
        this.setColor();
        this.setOpacity();
    };

    // extends
    BuildVolume.prototype = Object.create(THREE.Mesh.prototype);
    BuildVolume.prototype.constructor = BuildVolume;

    // methods
    BuildVolume.prototype.setSize = function(size) {
        this.userData.size = _.defaultsDeep(size || {}, this.userData.size);
        this.scale = _.assign(this.scale, this.userData.size);
    };

    BuildVolume.prototype.setX = function(x) {
        this.setSize({ x: x });
    };

    BuildVolume.prototype.setY = function(y) {
        this.setSize({ y: y });
    };

    BuildVolume.prototype.setZ = function(z) {
        this.setSize({ z: z });
    };

    BuildVolume.prototype.setColor = function(color) {
        this.userData.color = color !== undefined ? color : this.userData.color;
        this.material.color.setHex(this.userData.color);
    };

    BuildVolume.prototype.setOpacity = function(opacity) {
        this.userData.opacity = opacity !== undefined ? opacity : this.userData.opacity;
        this.material.opacity = this.userData.opacity;
    };

    // global settings
    BuildVolume.userData = userData;

    // export module
    MeshesJS.BuildVolume = BuildVolume;

})();
