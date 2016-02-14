// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // Constructor
    function TransformControls(camera, domElement) {
        THREE.TransformControls.call(this, camera, domElement);

        var self = this;
        var endEvent = { type: 'end' };

        self.change = false;

        function onChange() {
            self.change = true;
        }

        function onEnd() {
            setTimeout(function() {
                self.change = false;
                self.dispatchEvent(endEvent);
            }, 10);
        }

		this.addEventListener('objectChange', onChange, false);
        this.addEventListener('mouseUp', onEnd, false);
    };

    // extends
    TransformControls.prototype = Object.create(THREE.TransformControls.prototype);
    TransformControls.prototype.constructor = TransformControls;

    // export module
    MeshesJS.TransformControls = TransformControls;

})();
