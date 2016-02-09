onmessage = function(event) {
    try {
        loadSTL(event.data);
    }
    catch(error) {
        postMessage({ error: error.message });
    }
    close();
};

function loadSTL(buffer) {
    // buffer reader
    var reader = new DataView(buffer);

    // is binary STL
    var faces = reader.getUint32(80, true);
    var binary = reader.byteLength == (80 + 4 + 50 * faces);

    // geometry variables
    var vertices, normals;

    // parse
    if (binary) {
        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var bufferLength = faces * 3 * 3;

        var vertices = new Float32Array(bufferLength);
        var normals = new Float32Array(bufferLength);

        var offset = 0;

        for (var face = 0; face < faces; face ++) {
            var start = dataOffset + face * faceLength;
            var normalX = reader.getFloat32(start, true);
            var normalY = reader.getFloat32(start + 4, true);
            var normalZ = reader.getFloat32(start + 8, true);

            for ( var i = 1; i <= 3; i ++ ) {
                var vertexstart = start + i * 12;

                vertices[offset] = reader.getFloat32(vertexstart, true);
                vertices[offset + 1] = reader.getFloat32(vertexstart + 4, true);
                vertices[offset + 2] = reader.getFloat32(vertexstart + 8, true);

                normals[offset] = normalX;
                normals[offset + 1] = normalY;
                normals[offset + 2] = normalZ;

                offset += 3;
            }
        }

        postMessage({
            normals: normals.buffer,
            vertices: vertices.buffer
        }, [ vertices.buffer, normals.buffer ]);
    }

}
