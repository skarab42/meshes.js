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
    var vertices, normals, normalX, normalY, normalZ;

    // parse binary
    if (binary) {
        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var bufferLength = faces * 3 * 3;

        vertices = new Float32Array(bufferLength);
        normals = new Float32Array(bufferLength);

        var offset = 0;
        var face, start, vertexstart;

        for (face = 0; face < faces; face ++) {
            start = dataOffset + face * faceLength;
            normalX = reader.getFloat32(start, true);
            normalY = reader.getFloat32(start + 4, true);
            normalZ = reader.getFloat32(start + 8, true);

            for ( var i = 1; i <= 3; i ++ ) {
                vertexstart = start + i * 12;

                normals[offset] = normalX;
                normals[offset + 1] = normalY;
                normals[offset + 2] = normalZ;

                vertices[offset] = reader.getFloat32(vertexstart, true);
                vertices[offset + 1] = reader.getFloat32(vertexstart + 4, true);
                vertices[offset + 2] = reader.getFloat32(vertexstart + 8, true);

                offset += 3;
            }
        }
    }

    // parse ASCII
    else {
        vertices = [];
        normals = [];

        var code, args;
        var line = '';

        var startTime = Date.now();

        for (var i = 0; i < reader.byteLength; i++) {
            // concact chars until new line
            code = reader.getUint8(i);
            if (code !== 10) {
                line += String.fromCharCode(code);
                continue;
            }

            // reduce spaces/tabs and trim witespaces
            line = line.replace(/\s\s+/g, ' ').trim();

            // skip line shorter than 12 chars (vertex 0 0 0)
            if (line.length < 12) {
                line = '';
                continue;
            }

            // split line on spaces
            args = line.split(' ');

            // extract faces
            if (args[0] === 'facet') {
                normalX = parseFloat(args[2]);
                normalY = parseFloat(args[3]);
                normalZ = parseFloat(args[4]);
            }
            else if (args[0] === 'vertex') {
                normals.push(normalX);
                normals.push(normalY);
                normals.push(normalZ);

                vertices.push(parseFloat(args[1]));
                vertices.push(parseFloat(args[2]));
                vertices.push(parseFloat(args[3]));
            }

            // reset line
            line = '';
        }

        var suffix = 'ms';
        var time = Date.now() - startTime;
        if (time > 1000) {
            suffix = 's';
            time /= 1000;
        }
        console.log('-> ' + time + suffix);

        normals = new Float32Array(normals);
        vertices = new Float32Array(vertices);
    }

    // send buffers
    postMessage({
        normals: normals.buffer,
        vertices: vertices.buffer
    }, [ vertices.buffer, normals.buffer ]);
}
