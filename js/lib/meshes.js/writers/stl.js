// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        outputType: 'binary',
        filename: 'output.stl'
    };

    // Constructor
    function STLWriter(objects, settings) {
        this.objects = objects;
        this.multiple = Object.keys(objects).length > 1;
        this.settings = _.defaults(settings || {}, STLWriter.globalSettings);
    }

    // methods
    function vertexToString(vertex, offset) {
        return (vertex.x + (offset.x || 0)) + ' '
             + (vertex.y + (offset.y || 0)) + ' '
             + (vertex.z + (offset.z || 0)) + '\n';
    }

    STLWriter.prototype.toASCII = function() {
        var object, faces, vertices, stl, x, y, z;

        stl = 'solid MeshesJS\n';

        for (var name in this.objects) {
            object = this.objects[name];
            faces = object.geometry.faces;
            vertices = object.geometry.vertices;

            var offsets = { x: 0, y: 0, z:0 };

            if (this.multiple) {
                _.assign(offsets, object.position);
            }

            for (var i = 0; i < faces.length; i++) {
                stl += 'facet normal ' + vertexToString(faces[i].normal, {});
                stl += 'outer loop\n';
                stl += 'vertex ' + vertexToString(vertices[faces[i].a], offsets);
                stl += 'vertex ' + vertexToString(vertices[faces[i].b], offsets);
                stl += 'vertex ' + vertexToString(vertices[faces[i].c], offsets);
                stl += 'endloop \nendfacet \n';
            }
        }

        return stl += 'endsolid\n';
    };

    function writeVector(view, offset, vertex) {
        view.setFloat32(offset, vertex.x, true);
        offset = offset + 4;
        view.setFloat32(offset, vertex.y, true);
        offset = offset + 4;
        view.setFloat32(offset, vertex.z, true);
        return offset + 4;
    };

    STLWriter.prototype.toBinary = function() {
        var geometry = new THREE.Geometry();
        var _geometry;

        for (var name in this.objects) {
            object = this.objects[name];
            _geometry = object.geometry.clone();

            if (this.multiple) {
                _geometry.translate(
                    object.position.x,
                    object.position.y,
                    object.position.z
                );
            }

            geometry.merge(_geometry, object.matrix);
        }

        var bufferSize = 84 + (50 * geometry.faces.length);
        var buffer = new ArrayBuffer(bufferSize);
        var view = new DataView(buffer);
        var offset = 80;
        var face;

        view.setUint32(offset, geometry.faces.length, true);
        offset += 4;

        for(var n = 0; n < geometry.faces.length; n++) {
            face = geometry.faces[n];
            offset = writeVector(view, offset, face.normal);
            offset = writeVector(view, offset, geometry.vertices[face.a]);
            offset = writeVector(view, offset, geometry.vertices[face.b]);
            offset = writeVector(view, offset, geometry.vertices[face.c]);
            offset += 2;
        }

        return view;
    };

    STLWriter.prototype.save = function(filename) {
        var filename = filename || this.settings.filename;
        if (this.settings.outputType === 'ascii') {
            var blob = new Blob([this.toASCII()], { type: 'text/plain' });
        } else {
            var blob = new Blob([this.toBinary()], { type: 'application/octet-binary' });
        }
        saveAs(blob, filename);
    };

    // global settings
    STLWriter.globalSettings = globalSettings;

    // export module
    MeshesJS.STLWriter = STLWriter;

})();
