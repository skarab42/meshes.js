// create 3D viewer instance
var viewer3d = new MeshesJS.Viewer3D();

// add viewer to DOM
var $viewer3d = $('#viewer3d').html(viewer3d.canvas);

// debugage/tests...
viewer3d.setSize({ width: 400, height: 400 });
viewer3d.render();

console.log(viewer3d);
