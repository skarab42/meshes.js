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
        var geometry = new THREE.PlaneBufferGeometry(1, 1);
        var material = new THREE.MeshLambertMaterial();

        geometry.translate(0.5, 0.5, -0.2);

        THREE.Mesh.call(this, geometry, material);

        this.userData = _.defaultsDeep(settings || {}, Floor.userData);

        this.setSize();
        this.setColor();
    };

    // extends
    Floor.prototype = Object.create(THREE.Mesh.prototype);
    Floor.prototype.constructor = Floor;

    // methods
    Floor.prototype.setSize = function(size) {
        this.userData.size = _.defaultsDeep(size || {}, this.userData.size);
        var margins = this.userData.margin * 2;
        this.scale.x = this.userData.size.x + margins;
        this.scale.y = this.userData.size.y + margins;
        this.position.x = -this.userData.margin;
        this.position.y = -this.userData.margin;
    };

    Floor.prototype.setMargin = function(margin) {
        this.userData.margin = margin !== undefined ? margin : this.userData.margin;
        this.setSize();
    };

    Floor.prototype.setX = function(x) {
        this.setSize({ x: x });
    };

    Floor.prototype.setY = function(y) {
        this.setSize({ y: y });
    };

    Floor.prototype.setColor = function(color) {
        this.userData.color = color !== undefined ? color : this.userData.color;
        this.material.color.setHex(this.userData.color);
    };

    // global settings
    Floor.userData = userData;

    // export module
    MeshesJS.Floor = Floor;

})();
