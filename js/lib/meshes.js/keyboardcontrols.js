// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        enabled: true,
        actions: {
            remove: 'd',
            translate: 't',
            rotate: 'r',
            scale: 's',
            group: 'j',
            ungroup: 'e',
            selectAll: 'a',
            snapToGrid: 'g',
            hideHelper: 'h',
            wireframe: 'w',
            applyTransformation: 'x',
            exportBinarySTL: 'n',
            exportAsciiSTL: 'm',
            dropSelectedObjects: 'f',
            packAllObjects: 'p',
            setView: {
                default: '0',
                front: '2',
                right: '6',
                back: '8',
                left: '4',
                top: '9',
                bottom: '3'
            }
        }
    };

    // -------------------------------------------------------------------------

    // Constructor
    function KeyboardControls(viewer, settings) {
        // viewer alias
        var self = this;

        // local settings
        self.settings = _.defaultsDeep(settings || {}, KeyboardControls.globalSettings);

        // keyboard events
        window.addEventListener('keypress', function(event) {
            if (! self.settings.enabled) {
                return true;
            }

            var render = true;
            var actions = self.settings.actions;
            var char = String.fromCharCode(event.which || event.keyCode);

            switch (char) {
                case actions.hideHelper:
                    if (! viewer.currentObject) break;
                    if (viewer.currentObject.userData.transform) {
                        viewer.currentObject.userData.transform = false;
                        viewer.transform.detach();
                    } else {
                        viewer.currentObject.userData.transform = true;
                        viewer.transform.attach(viewer.currentObject);
                    }
                    break;

                case actions.selectAll:
                    if (Object.keys(viewer.selectedObjects).length > 0) {
                        viewer.unselectAllObjects();
                    } else {
                        viewer.selectAllObjects();
                    }
                    break;

                case actions.translate:
                    viewer.transform.setMode('translate');
                    break;

                case actions.rotate:
                    viewer.transform.setMode('rotate');
                    break;

                case actions.scale:
                    viewer.transform.setMode('scale');
                    break;

                case actions.snapToGrid:
                    if (viewer.transform.translationSnap) {
                        viewer.transform.setTranslationSnap(null);
                        viewer.transform.setRotationSnap(null);
                    } else {
                        viewer.transform.setTranslationSnap(viewer.settings.grid.smallCell.size);
                        viewer.transform.setRotationSnap(THREE.Math.degToRad(10));
                    }
                    break;

                case actions.group:
                    viewer.groupSelectedObjects();
                    break;

                case actions.ungroup:
                    viewer.ungroupSelectedObjects();
                    break;

                case actions.applyTransformation:
                    viewer.transformSelectedObjects();
                    break;

                case actions.remove:
                    viewer.removeSelectedObjects();
                    break;

                case actions.wireframe:
                    viewer.wireframeSelectedObjects();
                    break;

                case actions.exportBinarySTL:
                    viewer.exportSelectedObjects({ outputType: 'binary' });
                    break;

                case actions.exportAsciiSTL:
                    viewer.exportSelectedObjects({ outputType: 'ascii' });
                    break;

                case actions.dropSelectedObjects:
                    viewer.dropSelectedObjects();
                    break;

                case actions.packAllObjects:
                    viewer.packAllObjects();
                    break;

                // views
                case actions.setView.default: viewer.setView(); break;
                case actions.setView.front: viewer.setView('front'); break;
                case actions.setView.right: viewer.setView('right'); break;
                case actions.setView.back: viewer.setView('back'); break;
                case actions.setView.left: viewer.setView('left'); break;
                case actions.setView.top: viewer.setView('top'); break;
                case actions.setView.bottom: viewer.setView('bottom'); break;

                // nothing to do, no render
                default: render = false;
            }

            viewer.higlightIntersectedObjects();

            render && viewer.render();
        });
    }

    // global settings
    KeyboardControls.globalSettings = globalSettings;

    // export module
    MeshesJS.KeyboardControls = KeyboardControls;

})();
