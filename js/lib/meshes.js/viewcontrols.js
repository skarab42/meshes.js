// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        view: 'default',
        target: null,
        controls: null,
        camera: null,
        margin: 10
    };

    // Constructor
    function ViewControls(settings) {
        var settings = _.defaults(settings || {}, ViewControls.globalSettings);

        this.view = null;
        this.defaultView = settings.view;
        this.controls = settings.controls;
        this.target = settings.target;
        this.camera = settings.camera;
        this.margin = settings.margin;
        this.focusPoint = new THREE.Object3D();

        this.update();
    };

    // methods
    ViewControls.prototype.update = function() {
        this.target.geometry.computeBoundingBox();
        var box = this.target.geometry.boundingBox;
        this.box = {
            size: new THREE.Vector3(
                Math.abs(box.max.x - box.min.x) * this.target.scale.x,
                Math.abs(box.max.y - box.min.y) * this.target.scale.y,
                Math.abs(box.max.z - box.min.z) * this.target.scale.z
            ),
            position: this.target.position
        };
        this.setFocusAtCenter();
    };

    ViewControls.prototype.setFocusAt = function(point) {
        _.assign(this.focusPoint.position, point || {});
    };

    ViewControls.prototype.setFocusAtCenter = function() {
        this.setFocusAt({
            x: this.box.position.x + (this.box.size.x / 2),
            y: this.box.position.y + (this.box.size.y / 2),
            z: this.box.position.z + (this.box.size.z / 2)
        });
    };

    ViewControls.prototype.getVisibleDistance = function(width, height) {
        var margin = this.margin * 2;
        var size   = height + margin;
        var aspect = width / height;

        // landscape or portrait orientation
        if (this.camera.aspect < aspect) {
            size = (width + margin) / this.camera.aspect;
        }

        return size / 2 / Math.tan(Math.PI * this.camera.fov / 360);
    };

    ViewControls.prototype.lookAtFocusPoint = function() {
        // set camera target to center of build volume
        this.controls.target  = this.focusPoint.position.clone();
        this.controls.target0 = this.controls.target.clone();

        // update controls
        this.controls.update();
    };

    ViewControls.prototype.set = function(view) {
        // reset camera position
        this.controls.reset();

        // set new position
        var x = 0;
        var y = 0;
        var z = 0;
        var w, h;

        var size = this.box.size;
        var view = view || this.defaultView;

        this.view = view;

        if (view == 'default' || view == 'front') {
            x = size.x / 2;
            z = size.z / 2;
            w = size.x;
            h = size.z;
        }
        else if (view == 'right') {
            x = size.x;
            y = size.y / 2;
            z = size.z / 2;
            w = size.y;
            h = size.z;
        }
        else if (view == 'back') {
            x = size.x / 2;
            y = size.y;
            z = size.z / 2;
            w = size.x;
            h = size.z;
        }
        else if (view == 'left') {
            y = size.y / 2;
            z = size.z / 2;
            w = size.y;
            h = size.z;
        }
        else if (view == 'top') {
            x = size.x / 2;
            y = size.y / 2;
            z = size.z;
            w = size.x;
            h = size.y;
        }
        else if (view == 'bottom') {
            x = size.x / 2;
            y = size.y / 2;
            w = size.x;
            h = size.y;
        }

        // ensure the build volume is visible
        var distance = this.getVisibleDistance(w, h);

        if (view == 'default' || view == 'front') {
            y = y - distance;
        }
        else if (view == 'right') {
            x = x + distance;
        }
        else if (view == 'back') {
            y = y + distance;
        }
        else if (view == 'left') {
            x = x - distance;
        }
        else if (view == 'top') {
            z = z + distance;
        }
        else if (view == 'bottom') {
            z = z - distance;
        }

        // set default view
        if (view == 'default') {
            z = z * 2.5;
            x = x * 2.5;
        }

        // set new camera position
        this.camera.position.set(x, y, z);

        // set the camera look at focus point
        this.lookAtFocusPoint();
    };

    // global settings
    ViewControls.globalSettings = globalSettings;

    // export module
    MeshesJS.ViewControls = ViewControls;

})();
