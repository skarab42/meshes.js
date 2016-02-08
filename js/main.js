// create 3D viewer instance
var viewer3d = new MeshesJS.Viewer3D();

// add viewer canvas to DOM
var $viewer3d = $('#viewer3d').html(viewer3d.canvas);

// debugage/tests...
viewer3d.hideMesh('grid');
viewer3d.showMesh('grid');
viewer3d.toggleMeshVisibility('grid');
viewer3d.render();

console.log(viewer3d);
