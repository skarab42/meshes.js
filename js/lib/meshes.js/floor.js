// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var userData = {
        size: {
            x: 100,
            y: 100
        },
        margin: 10,
        color: 0x000000
    };

    // Constructor
    function Floor(settings) {
        var geometry = new THREE.PlaneBufferGeometry();
        var material = new THREE.MeshLambertMaterial();

        THREE.Mesh.call(this, geometry, material, THREE.Mesh);

        this.userData = _.defaultsDeep(settings || {}, Floor.userData);

        this.draw(settings);
    };

    // extends
    Floor.prototype = Object.create(THREE.Mesh.prototype);
    Floor.prototype.constructor = Floor;

    // methods
    Floor.prototype.setX = function(value) {
        this.draw({ size: { x: value } });
    };

    Floor.prototype.setY = function(value) {
        this.draw({ size: { y: value } });
    };

    Floor.prototype.setColor = function(value) {
        this.draw({ color: value });
    };

    Floor.prototype.setSize = function(value) {
        this.draw({ size: value });
    };

    Floor.prototype.draw = function(settings) {
        var s = settings || {};
        this.userData = _.defaultsDeep(settings || {}, this.userData);

        if (s.size !== undefined || s.margin !== undefined) {
            this.geometry.dispose();
            var margins = this.userData.margin * 2;
            this.userData.width = this.userData.size.x + margins;
            this.userData.height = this.userData.size.y + margins;
            this.geometry = new THREE.PlaneBufferGeometry(
                this.userData.width, this.userData.height
            );
            this.geometry.translate(
                (this.userData.width / 2) - this.userData.margin,
                (this.userData.height / 2) - this.userData.margin,
                0
            );
        }

        if (s.color !== undefined) {
            this.material.dispose();
            this.material = new THREE.MeshLambertMaterial({
                color: this.userData.color
            });
        }
    };

    // global settings
    Floor.userData = userData;

    // export module
    MeshesJS.Floor = Floor;

})();
