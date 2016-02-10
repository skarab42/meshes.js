// create 3D viewer instance
var viewer3d = new MeshesJS.Viewer3D({
    size: { width: 600, height: 300 }
});

// add viewer canvas to DOM
var $viewer3d = $('#viewer3d').html(viewer3d.canvas);

// file input
var $fileInput = $('#file input:file');
var fileInput  = $fileInput.get(0);

// on file selected
$fileInput.change(function(event) {
    for (var i = 0; i < fileInput.files.length; i++) {
        loadFile(fileInput.files[i]);
    }
});


function loadFile(file) {
    // empty file...
    if (file.size == 0) {
        return console.error('empty file: ' + file.name);
    }

    // file reader instance
    var reader = new FileReader();

    // on file loaded
    reader.onloadend = function(event) {
        // if error/abort
        if (this.error) {
            return console.error(this.error, file.name);
        }

        // STL parser
        var parser = new Worker('js/lib/meshes.js/workers/stl.js');

        // start parsing
        parser.postMessage(this.result, [ this.result ]);

        // on message received
        parser.onmessage = function(event) {
            // if an error occured
            if (event.data.error) {
                return console.error(event.data.error, file.name);
            }

            // build the mesh
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(event.data.vertices), 3));
            geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(event.data.normals) , 3));

            var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
            mesh.name = file.name;

            viewer3d.addObject(mesh.uuid, mesh);
            viewer3d.render();

            console.log('loaded', file.name, mesh);
        };
    };

    // start reading file as array buffer
    reader.readAsArrayBuffer(file);
}




/*
// load a file
function loadFile(file) {
    // file reader instance
    var reader = new FileReader();

    // on file loaded
    reader.onloadend = function(event) {
        // if error/abort
        if (this.error) {
            return console.error(this.error);
        }

        // get array buffer
        loadSTL(this.result, function(geometry) {
            console.log(geometry.vertices);
        });
    };

    // start reading file as array buffer
    reader.readAsArrayBuffer(file);
}

// parse/load STL from array buffer
function loadSTL(buffer, onGeometry) {
    // onload event
    var onGeometry = onGeometry || function(geometry) {};

    var timeout = setTimeout(function() {
        // buffer reader
        var reader = new DataView(buffer);

        // is binary STL
        var total = reader.getUint32(80, true);
        var binary = reader.byteLength == (80 + 4 + 50 * total);

        // new geometry
        var geometry = new THREE.Geometry();

        if (binary) {
            var dataOffset = 84;
        	var faceLength = 12 * 4 + 2;
            var face, start, vertexstart, i, j;

            var faces = [];

            for (i = 0; i < total; i ++) {
                start = dataOffset + i * faceLength;

                for (j = 1; j <= 3; j ++ ) {
                    vertexstart = start + j * 12;
                    geometry.vertices.push(new THREE.Vector3(
                        reader.getFloat32(vertexstart, true),
                        reader.getFloat32(vertexstart + 4, true),
                        reader.getFloat32(vertexstart + 8, true)
                    ));
                }

                length = geometry.vertices.length;

                geometry.faces.push(new THREE.Face3(
                    length - 3,
                    length - 2,
                    length - 1,
                    new THREE.Vector3(
                        reader.getFloat32(start, true),
                        reader.getFloat32(start + 4, true),
                        reader.getFloat32(start + 8, true)
                    )
                ));
            }

            //clearTimeout(timeout);
            //onGeometry(geometry);
            //return geometry;
        }

        // debugage
        //console.log(file.name, 'loaded', binary, reader.byteLength);
    }, 1);
}
*/

// debugage/tests...
//viewer3d.hideObject('grid');
//viewer3d.showObject('grid');
//viewer3d.toggleObjectVisibility('grid');
//viewer3d.render();

/*var redBox = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50),
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
);

var greenBox = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50),
    new THREE.MeshLambertMaterial({ color: 0x00ff00 })
);

redBox.castShadow = true;
redBox.receiveShadow = true;

greenBox.position.x = 50;
greenBox.position.y = 50;
greenBox.scale.x = 2;
greenBox.scale.y = 1.5;
greenBox.scale.z = 2.5;
greenBox.castShadow = true;
greenBox.receiveShadow = true;

//viewer3d.setBuildVolume({ x: 50, z: 50});
//viewer3d.setView('front');

viewer3d.addObject('redBox', redBox);
viewer3d.addObject('greenBox', greenBox);
viewer3d.render();

console.log(greenBox.position.x);
console.log(viewer3d);
*/
