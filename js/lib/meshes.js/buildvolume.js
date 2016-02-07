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
        alpha: 0.1,
        color: 0xffaa00
    };

    // Constructor
    function BuildVolume(settings) {
        var geometry = new THREE.BoxGeometry();
        var material = new THREE.MeshLambertMaterial();

        THREE.Mesh.call(this, geometry, material, THREE.Mesh);

        this.userData = _.defaultsDeep(settings || {}, BuildVolume.userData);

        this.draw(settings);
    };

    // extends
    BuildVolume.prototype = Object.create(THREE.Mesh.prototype);
    BuildVolume.prototype.constructor = BuildVolume;

    // methods
    BuildVolume.prototype.setSize = function(value) {
        this.draw({ size: value });
    };

    BuildVolume.prototype.setX = function(value) {
        this.setSize({ x: value });
    };

    BuildVolume.prototype.setY = function(value) {
        this.setSize({ y: value });
    };

    BuildVolume.prototype.setZ = function(value) {
        this.setSize({ z: value });
    };

    BuildVolume.prototype.setAlpha = function(value) {
        this.draw({ alpha: value });
    };

    BuildVolume.prototype.setColor = function(value) {
        this.draw({ color: value });
    };

    BuildVolume.prototype.draw = function(settings) {
        var s = settings || {};
        this.userData = _.defaultsDeep(settings || {}, this.userData);

        if (s.size !== undefined) {
            this.geometry.dispose();
            this.geometry = new THREE.BoxGeometry(
                this.userData.size.x,
                this.userData.size.y,
                this.userData.size.z
            )
            this.geometry.translate(
                this.userData.size.x / 2,
                this.userData.size.y / 2,
                this.userData.size.z / 2
            );
        }

        if (s.color !== undefined || s.alpha !== undefined) {
            this.material.dispose();
            this.material = new THREE.MeshLambertMaterial({
                transparent: true,
                color      : this.userData.color,
                opacity    : this.userData.alpha
            });
        }
    };

    // global settings
    BuildVolume.userData = userData;

    // export module
    MeshesJS.BuildVolume = BuildVolume;

})();
