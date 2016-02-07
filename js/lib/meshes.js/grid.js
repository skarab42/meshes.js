// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // Constructor
    function Grid(size, options) {
        this.size = _.defaults(size, { x: 100, y: 100 });

        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

        THREE.LineSegments.call(this, geometry, material, THREE.LineSegments);

        this.setSize(this.size, options);
    };

    Grid.prototype = Object.create(THREE.LineSegments.prototype);
    Grid.prototype.constructor = Grid;

    Grid.prototype.setX = function(value, options) { this.setSize({ x: value }, options); };
    Grid.prototype.setY = function(value, options) { this.setSize({ y: value }, options); };
    Grid.prototype.setZ = function(value, options) { this.setSize({ z: value }, options); };

    Grid.prototype.setSize = function(size, options) {
        var size = _.defaults(size, this.size);
        var options = _.defaults(options || {}, {
            smallCell: {
                size: 10,
                color: 0x333333
            },
            bigCell: {
                size: 100,
                color: 0x444444
            }
        });

        var geometry = new THREE.Geometry();
        var color1 = new THREE.Color(options.smallCell.color);
        var color2 = new THREE.Color(options.bigCell.color);
        var color = null;

        for (var i = 0; i <= size.x; i += options.smallCell.size) {
            geometry.vertices.push(
                new THREE.Vector3(i, 0, 0),
                new THREE.Vector3(i, size.y, 0)
            );
            color = ((i % options.bigCell.size) == 0) ? color2 : color1;
            geometry.colors.push(color, color);
        }

        for (var i = 0; i <= size.y; i += options.smallCell.size) {
            geometry.vertices.push(
                new THREE.Vector3(0, i, 0),
                new THREE.Vector3(size.x, i, 0)
            );
            color = ((i % options.bigCell.size) == 0) ? color2 : color1;
            geometry.colors.push(color, color);
        }

        this.geometry.dispose();
        this.geometry = geometry;
    };

    // export module
    MeshesJS.Grid = Grid;

})();
