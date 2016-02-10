function loadFile(file, onLoaded) {
    // empty file...
    if (file.size == 0) {
        return console.error(['Empty file', file.name]);
    }

    // file reader instance
    var reader = new FileReader();

    // on file loaded
    reader.onloadend = function(event) {
        // if error/abort
        if (this.error) {
            console.error([this.error.message, file.name]);
            return;
        }

        if (typeof this.result === 'string' ) {
            onLoaded(parseASCII(this.result));
            return;
        }

        // buffer reader
        var view = new DataView(this.result);

        // get faces number
        try {
            var faces = view.getUint32(80, true);
        }
        catch(error) {
            console.error([error.message, file.name]);
            return;
        }

        // is binary ?
        var binary = view.byteLength == (80 + 4 + 50 * faces);

        if (! binary) {
            reader.readAsText(file);
            return;
        }

        onLoaded(parseBinary(view, faces));
    };

    // start reading file
    reader.readAsArrayBuffer(file);
}

// -----------------------------------------------------------------------------

function parseASCII(data) {
    var length, normal, patternNormal, patternVertex, result, text;
    var geometry = new THREE.Geometry();
    var patternFace = /facet([\s\S]*?)endfacet/g;

    while((result = patternFace.exec(data)) !== null) {
        text = result[0];

        patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
        patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

        while((result = patternNormal.exec(text)) !== null) {
            normal = new THREE.Vector3(
                parseFloat(result[1]),
                parseFloat(result[3]),
                parseFloat(result[5])
            );
        }

        while((result = patternVertex.exec(text)) !== null) {
            geometry.vertices.push(new THREE.Vector3(
                parseFloat(result[1]),
                parseFloat(result[3]),
                parseFloat(result[5])
            ));
        }

        length = geometry.vertices.length;

        geometry.faces.push(new THREE.Face3(length-3, length-2, length-1, normal));
    }

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
}

// -----------------------------------------------------------------------------

function parseBinary(view, faces) {
    var dataOffset = 84;
    var faceLength = 12 * 4 + 2;
    var offset = 0;
    var geometry = new THREE.BufferGeometry();
    var vertices = new Float32Array( faces * 3 * 3 );
    var normals = new Float32Array( faces * 3 * 3 );

    for ( var face = 0; face < faces; face ++ ) {
        var start = dataOffset + face * faceLength;
        var normalX = view.getFloat32( start, true );
        var normalY = view.getFloat32( start + 4, true );
        var normalZ = view.getFloat32( start + 8, true );

        for (var i = 1; i <= 3; i ++) {
            var vertexstart = start + i * 12;

            normals[ offset ] = normalX;
            normals[ offset + 1 ] = normalY;
            normals[ offset + 2 ] = normalZ;

            vertices[ offset ] = view.getFloat32( vertexstart, true );
            vertices[ offset + 1 ] = view.getFloat32( vertexstart + 4, true );
            vertices[ offset + 2 ] = view.getFloat32( vertexstart + 8, true );

            offset += 3;
        }
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));

    return geometry;
}
