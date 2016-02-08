// create 3D viewer instance
var viewer3d = new MeshesJS.Viewer3D();

// add viewer canvas to DOM
var $viewer3d = $('#viewer3d').html(viewer3d.canvas);

// debugage/tests...
//viewer3d.hideObject('grid');
//viewer3d.showObject('grid');
//viewer3d.toggleObjectVisibility('grid');
//viewer3d.render();

var redBox = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50),
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
);

var greenBox = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50),
    new THREE.MeshLambertMaterial({ color: 0x00ff00 })
);

greenBox.position.x = 20;
greenBox.scale.x = 2;

viewer3d.addObject('redBox', redBox);
viewer3d.addObject('redBox', greenBox, { replace: true });
viewer3d.render();

console.log(greenBox.position.x);
console.log(viewer3d);
