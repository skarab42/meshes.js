// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var userData = {
        size: {
            x: 100,
            y: 100
        },
        smallCell: {
            size: 10,
            color: 0x333333
        },
        bigCell: {
            size: 100,
            color: 0x444444
        }
    };

    // Constructor
    function Grid(settings) {
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        });

        THREE.LineSegments.call(this, geometry, material);

        this.userData = _.defaultsDeep(settings || {}, Grid.userData);

        this.draw();
    };

    // extends
    Grid.prototype = Object.create(THREE.LineSegments.prototype);
    Grid.prototype.constructor = Grid;

    // methods
    Grid.prototype.setSize = function(size) {
        this.draw({ size: size });
    };

    Grid.prototype.setX = function(value) {
        this.setSize({ x: value });
    };

    Grid.prototype.setY = function(value) {
        this.setSize({ y: value });
    };

    Grid.prototype.draw = function(settings) {
        this.userData = _.defaultsDeep(settings || {}, this.userData);

        var geometry = new THREE.Geometry();
        var color1 = new THREE.Color(this.userData.smallCell.color);
        var color2 = new THREE.Color(this.userData.bigCell.color);
        var color = null;

        for (var i = 0; i <= this.userData.size.x; i += this.userData.smallCell.size) {
            geometry.vertices.push(
                new THREE.Vector3(i, 0, 0),
                new THREE.Vector3(i, this.userData.size.y, 0)
            );
            color = ((i % this.userData.bigCell.size) == 0) ? color2 : color1;
            geometry.colors.push(color, color);
        }

        for (var i = 0; i <= this.userData.size.y; i += this.userData.smallCell.size) {
            geometry.vertices.push(
                new THREE.Vector3(0, i, 0),
                new THREE.Vector3(this.userData.size.x, i, 0)
            );
            color = ((i % this.userData.bigCell.size) == 0) ? color2 : color1;
            geometry.colors.push(color, color);
        }

        this.geometry.dispose();
        this.geometry = geometry;
    };

    // global settings
    Grid.userData = userData;

    // export module
    MeshesJS.Grid = Grid;

})();
