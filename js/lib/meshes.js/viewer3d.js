// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        view: 'default',
        size: {
            width: 800,
            height: 600
        },
        antialias: true,
        color: 0x111111,
        ambientLight: {
            color: 0x404040,
            visible: true
        },
        directionalLights: {
            1: { color: 0xefefff, opacity: 0.2, position: { x:  1, y:  1, z: 1 }, visible: true },
            2: { color: 0xefefff, opacity: 0.4, position: { x:  1, y: -1, z: 1 }, visible: true },
            3: { color: 0xefefff, opacity: 0.6, position: { x: -1, y: -1, z: 1 }, visible: true },
            4: { color: 0xefefff, opacity: 0.8, position: { x: -1, y:  1, z: 1 }, visible: true }
        },
        buildVolume: {
            size: {
                x: 200,
                y: 200,
                z: 200
            },
            opacity: 0.1,
            color: 0xffaa00,
            visible: true
        },
        floor: {
            margin: 10,
            color: 0x000000,
            visible: true
        },
        grid: {
            smallCell: {
                size: 10,
                color: 0x333333
            },
            bigCell: {
                size: 100,
                color: 0x444444
            },
            visible: true
        },
        axis: {
            visible: true
        },
        materials: {
            default: {
                material: THREE.MeshLambertMaterial,
                settings: {
                    color: 'random'
                }
            }
        },
        colors: {
            selected: 0xff0000,
            current: 0x00ff00
        },
        keyboard: {
            enabled: true
        }
    };

    // -------------------------------------------------------------------------

    // Constructor
    function Viewer3D(settings) {
        // self alias
        var self = this;

        // objects collection
        self.selectedObjects = {};
        self.currentObject = null;
        self.objects = {};

        // local settings
        self.defaults = _.defaultsDeep({}, settings || {}, Viewer3D.globalSettings);

        // init defaults settings
        self.defaults.floor.size = self.defaults.buildVolume.size;
        self.defaults.grid.size = self.defaults.buildVolume.size;

        // clone settings from defaults
        self.settings = _.defaults({}, self.defaults);

        // create main objects
        self.scene = new THREE.Scene();
        self.camera = new THREE.PerspectiveCamera();
        self.renderer = new THREE.WebGLRenderer({ antialias: self.defaults.antialias });
        self.canvas = self.renderer.domElement;

        // set camera orbit around Z axis
        self.camera.up = new THREE.Vector3(0, 0, 1);
        self.camera.near = 10;
        self.camera.far = 10000;

        // transform controls
        self.transform = new MeshesJS.TransformControls(self.camera, self.canvas);
        self.transform.setTranslationSnap(self.settings.grid.smallCell.size);
        self.transform.setRotationSnap(THREE.Math.degToRad(10));

        self.transform.setMode('scale'); // dirty bug fix for axis alignement
        self.transform.setMode('translate');

        var lastTransformation;

        function backupLastTransformation() {
            lastTransformation = {
                position: self.currentObject.position.clone(),
                rotation: self.currentObject.rotation.clone(),
                scale: self.currentObject.scale.clone()
            };
        }

        self.transform.addEventListener('mouseDown', function() {
            backupLastTransformation();
        });

        self.transform.addEventListener('objectChange', function() {

            var difference = {
                position: {
                    x: self.currentObject.position.x - lastTransformation.position.x,
                    y: self.currentObject.position.y - lastTransformation.position.y,
                    z: self.currentObject.position.z - lastTransformation.position.z
                },
                rotation: {
                    x: self.currentObject.rotation.x - lastTransformation.rotation.x,
                    y: self.currentObject.rotation.y - lastTransformation.rotation.y,
                    z: self.currentObject.rotation.z - lastTransformation.rotation.z
                },
                scale: {
                    x: self.currentObject.scale.x - lastTransformation.scale.x,
                    y: self.currentObject.scale.y - lastTransformation.scale.y,
                    z: self.currentObject.scale.z - lastTransformation.scale.z
                }
            };

            var object;

            for (var name in self.selectedObjects) {
                if (self.currentObject.name === name) {
                    continue;
                }
                object = self.selectedObjects[name];
                object.position.x += difference.position.x;
                object.position.y += difference.position.y;
                object.position.z += difference.position.z;
                object.rotation.x += difference.rotation.x;
                object.rotation.y += difference.rotation.y;
                object.rotation.z += difference.rotation.z;
                object.scale.x += difference.scale.x;
                object.scale.y += difference.scale.y;
                object.scale.z += difference.scale.z;
                object.userData.box.update(object);
            }

            backupLastTransformation();

            self.currentObject.userData.box.update(self.currentObject);
            self.higlightIntersectedObjects();
            self.render();
        });

        // orbit controls
        self.controls = new THREE.OrbitControls(self.camera, self.canvas);
        self.controls.change = false;
        self.controls.noKeys = true;

        self.controls.addEventListener('change', function() {
            self.controls.change = true;
            self.transform.update();
            self.render();
        });

        self.controls.addEventListener('end', function() {
            self.controls.change = false;
        });

        // keyboard controls
        self.keyboard = new MeshesJS.KeyboardControls(self, self.settings.keyboard);

        // dom events (mouse)
        self.events = new THREEx.DomEvents(self.camera, self.canvas);

        // built in objects
        self.ambientLight = new THREE.AmbientLight(self.defaults.ambientLight.color);
        self.floor = new MeshesJS.Floor(self.defaults.floor);
        self.grid = new MeshesJS.Grid(self.defaults.grid);
        self.axis = new MeshesJS.Axis(self.defaults.buildVolume);
        self.buildVolume = new MeshesJS.BuildVolume(self.defaults.buildVolume);

        // views controls
        self.view = new MeshesJS.ViewControls({
            target: self.buildVolume,
            controls: self.controls,
            camera: self.camera,
            margin: self.floor.userData.margin
        });

        // lightning
        self.directionalLights = {};
        self.scene.add(self.ambientLight);

        for(var num in self.defaults.directionalLights) {
            var d = self.defaults.directionalLights[num];
            var o = new THREE.DirectionalLight(d.color, d.opacity);
            var n = 'directionalLight' + num;
            _.assign(o.position, d.position);
            o.visible = !! d.visible;
            self.scene.add(o);
            self[n] = o;
        }

        // compose the scene
        self.scene.add(self.floor);
        self.scene.add(self.grid);
        self.scene.add(self.axis);
        self.scene.add(self.buildVolume);
        self.scene.add(self.transform);

        // set visibility
        self.floor.visible = !! self.defaults.floor.visible;
        self.grid.visible = !! self.defaults.grid.visible;
        self.axis.visible = !! self.defaults.axis.visible;
        self.buildVolume.visible = !! self.defaults.buildVolume.visible;

        // set default parameters
        self.setSize(self.defaults.size);
        self.setColor(self.defaults.color);
        self.setView(self.defaults.view);

        // Loader
        self.loader = new MeshesJS.Loader();

        // render
        self.render();
    }

    // -------------------------------------------------------------------------

    // public events
    Viewer3D.prototype.onObjectAdded = function(object) {};
    Viewer3D.prototype.onObjectRemoved = function(name) {};
    Viewer3D.prototype.onObjectSelected = function(object, selected) {};

    // -------------------------------------------------------------------------

    // methods
    Viewer3D.prototype.setSize = function(size) {
        // default size
        var size = size !== undefined ? size : this.defaults.size;
        this.settings.size = _.defaults(size, this.settings.size);

        // resize the renderer
        this.renderer.setSize(this.settings.size.width, this.settings.size.height);

        // update camera aspect
        this.camera.aspect = this.settings.size.width / this.settings.size.height;
        this.camera.updateProjectionMatrix();

        // update controls
        this.controls.update();
    };

    Viewer3D.prototype.setWidth = function(width) {
        this.setSize({ width: width });
    };

    Viewer3D.prototype.setHeight = function(height) {
        this.setSize({ height: height });
    };

    Viewer3D.prototype.setColor = function(color) {
        this.settings.color = color !== undefined ? color : this.defaults.color;
        this.renderer.setClearColor(this.settings.color);
    };

    Viewer3D.prototype.setView = function(view) {
        this.settings.view = view !== undefined ? view : this.defaults.view;
        this.view.set(this.settings.view);
        this.controls.change = false;
    };

    Viewer3D.prototype.setBuildVolume = function(size) {
        this.settings.buildVolume.size = size !== undefined ? size : this.defaults.buildVolume.size;
        this.floor.setSize(this.settings.buildVolume.size);
        this.grid.setSize(this.settings.buildVolume.size);
        this.axis.setSize(this.settings.buildVolume.size);
        this.buildVolume.setSize(this.settings.buildVolume.size);
        this.view.update();
        this.setView(this.settings.view);
    };

    Viewer3D.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.getObject = function(name) {
        if (this.objects[name]) {
            return this.objects[name];
        }
        if (this[name] && (this[name] instanceof THREE.Object3D)) {
            return this[name];
        }
        throw 'Undefined object: ' + name;
    };

    Viewer3D.prototype.removeObject = function(name) {
        if (this.objects[name]) {
            // unselect object
            this.setObjectSelected(name, false);

            // remove frome the scene
            this.scene.remove(this.objects[name]);

            // free memory
            this.objects[name].geometry.dispose();
            this.objects[name].material.dispose();

            // remove events listeners
            this.events.removeEventListener(this.objects[name], 'mouseup', true);

            // remove bounding box helper
            this.scene.remove(this.objects[name].userData.box);

            // reset/delete reference
            this.objects[name] = null;
            delete this.objects[name];

            // public callback
            this.onObjectRemoved(name);

            return true;
        }
        return false;
    };

    Viewer3D.prototype.removeSelectedObjects = function() {
        for (var name in this.selectedObjects) {
            this.removeObject(name);
        }
    };

    Viewer3D.prototype.getUniqueName = function(name) {
        while (this.objects[name]) {
            var pattern = /\(([0-9]+)\)$/;
            var matches = name.match(pattern);
            if (matches && matches[1]) {
                var id = parseInt(matches[1]);
                name = name.replace(pattern, '(' + (id + 1) + ')');
            }
            else {
                name += ' (1)';
            }
        }
        return name;
    };

    Viewer3D.prototype.setObjectSelected = function(object, selected) {
        var selected = selected === undefined ? true : selected;
        var object = object.uuid ? object : this.getObject(object);

        if (selected) {
            if (this.currentObject) {
                this.currentObject.userData.transform = false;
            }
            this.currentObject = object;
            this.selectedObjects[object.name] = object;
            //object.material.color.setHex(this.settings.colors.current);
            object.userData.box.visible = true;
            object.userData.transform = true;
            object.userData.selected = true;
            this.transform.attach(object);
        }
        else {
            this.currentObject = null;
            this.selectedObjects[object.name] = null;
            delete this.selectedObjects[object.name];
            //object.material.color.setHex(object.userData.color);
            object.userData.box.visible = false;
            object.userData.transform = false;
            object.userData.selected = false;
            this.transform.detach();
            var names = Object.keys(this.selectedObjects);
            if (names.length) {
                this.setObjectSelected(names.pop());
            }
        }

        object.userData.selected = !! selected;
        object.renderOrder = this.zIndex++; // force on top

        // public event
        this.onObjectSelected(object, selected);
    };

    Viewer3D.prototype.unselectAllObjects = function() {
        for (var name in this.selectedObjects) {
            this.setObjectSelected(this.selectedObjects[name], false);
        }
    };

    Viewer3D.prototype.selectAllObjects = function() {
        for (var name in this.objects) {
            this.setObjectSelected(this.objects[name], true);
        }
    };

    Viewer3D.prototype.addObject = function(name, object, options) {
        // invalid object type
        if (! (object instanceof THREE.Object3D)) {
            throw 'Object "' + name + '" must be an instance of THREE.Object3D.';
        }

        // merge user and defaults options
        var options = _.defaults(options || {}, {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            replace: false,
            unique: false,
            render: true
        });

        // object name already set
        if (this.objects[name]) {
            if (options.replace) {
                this.removeObject(name);
            }
            else if (options.unique) {
                throw 'Object name "' + name + '" already set.';
            }
            else {
                name = this.getUniqueName(name);
            }
        }

        // force object name
        object.name = name;

        // normalize geometry
        if (object.geometry instanceof THREE.BufferGeometry) {
            object.geometry = new THREE.Geometry().fromBufferGeometry(object.geometry);
            object.geometry.computeBoundingSphere();
            object.geometry.computeBoundingBox();
        }

        // normalize geometry position
        this.fixObjectOrigin(object);

        // set object position and rotation
        object.position = _.assign(object.position, options.position);
        object.rotation = _.assign(object.rotation, options.rotation);

        // set object up to Z
        object.up = THREE.Vector3(0, 0, 1);

        // set object unselected by default
        object.userData.selected = false;

        // backup original color
        object.userData.color = object.material.color.getHex();

        // bounding box
        var box = new THREE.BoxHelper(object);
        box.material.color.setHex(object.userData.color);
        box.material.emissive = new THREE.Color(255, 255, 255);
        object.userData.box = box;
        box.visible = false;
        this.scene.add(box);

        // events listeners
        var self = this;
        self.events.addEventListener(object, 'mouseup', function(event) {
            if (! self.transform.change && ! self.controls.change) {
                if (object.userData.selected && ! object.userData.transform) {
                    object.userData.selected = false;
                }
                self.setObjectSelected(object, ! object.userData.selected)
                self.render();
            }
        }, false);

        // register and add object to scene
        this.objects[name] = object;
        this.scene.add(object);

        // auto render ?
        options.render && this.render();

        // public callback
        this.onObjectAdded(object);
    };

    Viewer3D.prototype.toggleObjectVisibility = function(name, visible) {
        var mesh = this.getObject(name);
        mesh.visible = visible !== undefined ? (!! visible) : (! mesh.visible);
    };

    Viewer3D.prototype.showObject = function(name) {
        this.toggleObjectVisibility(name, true);
    };

    Viewer3D.prototype.hideObject = function(name) {
        this.toggleObjectVisibility(name, false);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.dropObject = function(name) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);
        var offset =  object.userData.box.geometry.attributes.position.array[23];
        //console.log(object.position.z, offset);
        object.position.z -= offset;
        object.userData.box.update(object);
        this.transform.update();
    };

    Viewer3D.prototype.dropSelectedObjects = function() {
        for (var name in this.selectedObjects) {
            this.dropObject(this.selectedObjects[name]);
        }
    };

    // -------------------------------------------------------------------------

    var sort = {
        w: function(a, b) { return b.w - a.w; },
        h: function(a, b) { return b.h - a.h; },
        a: function(a, b) { return b.area - a.area; },
        msort: function(a, b, criteria) {
            var diff, n;
            for (n = 0 ; n < criteria.length ; n++) {
                diff = sort[criteria[n]](a, b);
                if (diff != 0) {
                    return diff;
                }
            }
            return 0;
        },
        area: function(a, b) { return sort.msort(a, b, ['a', 'h', 'w']); }
    };

    Viewer3D.prototype.packAllObjects = function(center) {
        var name, object, size;
        var objects = [];
        var margins = 5;
        for (name in this.objects) {
            object = this.objects[name];
            this.transformObject(object);
            size = this.getObjectSize(object);
            size.x += margins;
            size.y += margins;
            objects.push({
                w: size.x,
                h: size.y,
                name: object.name,
                area: size.x * size.y
            });
        }
        objects.sort(sort.area);
        var packer = new GrowingPacker();
        packer.fit(objects);
        var i, result;
        size = { x: 0, y: 0 };
        for (i = 0; i < objects.length; i++) {
            result = objects[i];
            object = this.objects[result.name];
            object.position.x = result.fit.x;
            object.position.y = result.fit.y;
            size.x = Math.max(size.x, result.fit.x + result.w);
            size.y = Math.max(size.y, result.fit.y + result.h);
            object.userData.box.update(object);
            this.dropObject(object);
        }
        if (center !== undefined && ! center) {
            return null;
        }
        var difference = {
            x: (this.settings.buildVolume.size.x - size.x) / 2,
            y: (this.settings.buildVolume.size.y - size.y) / 2
        };
        for (name in this.objects) {
            object = this.objects[name];
            object.position.x += difference.x;
            object.position.y += difference.y;
            object.userData.box.update(object);
        }
        //console.log(width, height);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.higlightIntersectedObjects = function() {
        var results = this.intersectObjects(this.objects);
        var result, objects, object;

        for (var i = 0; i < results.length; i++) {
            result = results[i];
            object = result.object;
            objects = result.objects;
            if (! objects.length) {
                object.userData.box.visible = object.userData.selected;
                object.userData.box.material.color.setHex(
                    object.userData.color
                );
                continue;
            }
            for (var y = 0; y < objects.length; y++) {
                objects[y].userData.box.visible = true;
                objects[y].userData.box.material.color.setHex(0xff0000);
            }
        }
    }

    Viewer3D.prototype.intersectObject = function(name) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);

        var results = [];

        var targetObject;
        var targetBox = new THREE.Box3();
        var sourceBox = new THREE.Box3();

        sourceBox = sourceBox.setFromObject(object);

        for (var name in this.objects) {
            if (object.name === name) {
                continue;
            }

            targetObject = this.objects[name];
            targetBox = targetBox.setFromObject(targetObject);

            if (targetBox.isIntersectionBox(sourceBox)) {
                results.push(targetObject);
            }
        }

        return results;
    };

    Viewer3D.prototype.intersectObjects = function(objects, flatten) {
        var results = [];
        var object, result;

        for (var name in objects) {
            object = objects[name];
            result = this.intersectObject(object);
            if (flatten) {
                if (result.length) {
                    results.push(object);
                    results.concat(result);
                }
            }
            else {
                results.push({ object: object, objects: result });
            }
        }

        return results;
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.exportSelectedObjects = function(settings) {
        var names = Object.keys(this.selectedObjects);
        if (! names.length) {
            return null;
        }
        var writer = new MeshesJS.STLWriter(this.selectedObjects, settings);
        writer.save();
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.wireframeObject = function(name, wireframe) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);
        var wireframe = wireframe === undefined ? ! object.material.wireframe : wireframe;
        object.material.wireframe = wireframe;
    };

    Viewer3D.prototype.wireframeSelectedObjects = function() {
        for (var name in this.selectedObjects) {
            this.wireframeObject(this.selectedObjects[name]);
        }
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.getObjectSize = function(name) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);
        var box = object.geometry.boundingBox;

        return new THREE.Vector3(
            Math.abs(box.max.x - box.min.x),
            Math.abs(box.max.y - box.min.y),
            Math.abs(box.max.z - box.min.z)
        );
    };

    Viewer3D.prototype.getObjectCenter = function(name) {
        var size = this.getObjectSize(name);
        return new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2);
    };

    Viewer3D.prototype.fixObjectOrigin = function(name) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);
        var size = this.getObjectSize(name);
        var offsets = object.geometry.center();

        object.geometry.translate(size.x / 2, size.y / 2, size.z / 2);
        object.position.x -= offsets.x + (size.x / 2);
        object.position.y -= offsets.y + (size.y / 2);
        object.position.z -= offsets.z + (size.z / 2);
    };

    Viewer3D.prototype.transformObject = function(name) {
        var object = name instanceof THREE.Object3D ? name : this.getObject(name);

        object.updateMatrix();
        object.geometry.applyMatrix(object.matrix);
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
        object.updateMatrix();

        this.fixObjectOrigin(name);
        this.transform.update();
    };

    Viewer3D.prototype.transformSelectedObjects = function() {
        for (var name in this.selectedObjects) {
            this.transformObject(name);
        }
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.ungroupSelectedObjects = function() {
        for (var name in this.selectedObjects) {
            this.ungroupObject(name);
        }
    };

    Viewer3D.prototype.groupSelectedObjects = function() {
        var names = Object.keys(this.selectedObjects);

        if (names.length < 2) {
            return null;
        }

        if (this.intersectObjects(this.selectedObjects, true).length) {
            throw 'Do not group colliding objects, instead use union.';
        }

        var geometry = new THREE.Geometry();
        var name = names[0];
        var groups = [];
        var offset = 0;
        var groupLength, mesh;

        for (var n in this.selectedObjects) {
            mesh = this.selectedObjects[n];
            mesh.updateMatrix();

            groupLength = mesh.geometry.vertices.length;
            groups.push([offset, groupLength]);
            offset += groupLength;

            geometry.merge(mesh.geometry, mesh.matrix);

            this.setObjectSelected(n, false);
            this.removeObject(n);
        }

        mesh = new THREE.Mesh(geometry, this.getMaterial());
        mesh.userData.groups = groups;

        var move = mesh.geometry.center();
        var box = mesh.geometry.boundingBox;
        var size = new THREE.Vector3(
            Math.abs(box.max.x - box.min.x),
            Math.abs(box.max.y - box.min.y),
            Math.abs(box.max.z - box.min.z)
        );

        this.addObject(name, mesh, { position: {
            x: Math.abs(move.x) - (size.x / 2) + mesh.position.x,
            y: Math.abs(move.y) - (size.y / 2) + mesh.position.y,
            z: Math.abs(move.z) - (size.z / 2) + mesh.position.z
        }});

        //this.addObject(name, mesh);
        this.setObjectSelected(name, true);
    };

    Viewer3D.prototype.groupFaces = function(faces, vertices) {
        // groups of faces
        var faces_groups = [];

        // groups of vertex hashs
        var vertex_groups = [];

        // return a vertex hash
        function vertexHash(vertex) {
            return vertex.x + '|' + vertex.y + '|' + vertex.z;
        }

        // return group ids
        function findHashGroups() {
            var groups = [];
            for (var i = 0; i < vertex_groups.length; i++) {
                if (vertex_groups[i][h1]
                ||  vertex_groups[i][h2]
                ||  vertex_groups[i][h3]) {
                    groups.push(i);
                }
            }
            return _.uniq(groups);
        }

        // push the face in group id
        function pushFaceInGroup(id) {
            vertex_groups[id] || (vertex_groups[id] = []);
            faces_groups[id]  || (faces_groups[id]  = []);
            vertex_groups[id][h1] = true;
            vertex_groups[id][h2] = true;
            vertex_groups[id][h3] = true;
            faces_groups[id].push(face);
        }

        var face, h1, h2, h3, g;
        var groupId = -1;

        // for each face
        for (var i = 0; i < faces.length; i++) {
            // current face
            face = faces[i];

            // vertex hashs
            h1 = vertexHash(vertices[face.a]);
            h2 = vertexHash(vertices[face.b]);
            h3 = vertexHash(vertices[face.c]);

            // find owner groups
            g = findHashGroups();

            // no group found
            if (! g.length) {
                // increment group id
                groupId++;

                // add face to group
                pushFaceInGroup(groupId);
            }

            // only in one group
            else if (g.length == 1) {
                // add face to group
                pushFaceInGroup(g[0]);
            }

            // share two group
            else if (g.length == 2) {
                // add face to first group
                pushFaceInGroup(g[0]);

                // merge the two group
                faces_groups[g[0]]  = faces_groups[g[0]].concat(faces_groups[g[1]]);
                vertex_groups[g[0]] = _.merge(vertex_groups[g[0]], vertex_groups[g[1]]);

                // reset the second group
                faces_groups[g[1]]  = [];
                vertex_groups[g[1]] = [];
            }
        }

        // reset vertex group
        vertex_groups = null;

        // remove empty group
        faces_groups = _.filter(faces_groups, function(o) { return o.length; });

        // return grouped faces
        return faces_groups;
    };

    Viewer3D.prototype.ungroupObject = function(name) {
        var mesh = this.getObject(name);

        this.transformObject(mesh);

        var vertices = mesh.geometry.vertices;
        var groups = this.groupFaces(mesh.geometry.faces, vertices);

        // no group found
        if (groups.length < 2) {
            return null;
        }

        // current group
        var group, face, v1, v2, v3, faces;
        var geometry, length, normal, newName;

        for (var n = 0; n < groups.length; n++) {
            geometry = new THREE.Geometry();
            group = groups[n];
            faces = [];
            for (var i = 0; i < group.length; i++) {
                face = group[i];
                v1 = vertices[face.a];
                v2 = vertices[face.b];
                v3 = vertices[face.c];

                geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, v1.z));
                geometry.vertices.push(new THREE.Vector3(v2.x, v2.y, v2.z));
                geometry.vertices.push(new THREE.Vector3(v3.x, v3.y, v3.z));

                length = geometry.vertices.length;
                normal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
                geometry.faces.push(new THREE.Face3(length-3, length-2, length-1, normal));
            }

            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();

            newName = this.getUniqueName(mesh.name + ' (' + n + ')');
            object = new THREE.Mesh(geometry, this.getMaterial());

            this.transformObject(object);
            this.addObject(newName, object, { position: {
                x: object.position.x + mesh.position.x,
                y: object.position.y + mesh.position.y,
                z: object.position.z + mesh.position.z
            }});
        }

        this.setObjectSelected(name, false);
        this.removeObject(name);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.getMaterial = function(name) {
        var selected = this.settings.materials[name || 'default'];
        var settings = _.defaults({}, selected.settings);
        if (settings.color == 'random') {
            if (typeof randomColor == 'function') {
                settings.color = randomColor();
            }
            else {
                settings.color = ((1<<24)*Math.random()|0);
            }
        }
        return new selected.material(settings);
    };

    // -------------------------------------------------------------------------

    Viewer3D.prototype.load = function(input, options) {
        var settings = _.defaults({}, options || {}, {
            onLoaded: function(mesh) {},
            onError: function(error) {},
            name: null,
            materialName: 'default'
        });
        var name = settings.name;
        if (! name) {
             name = (input.name && input.name.length) ? input.name : 'mesh';
        }
        if (input instanceof THREE.Object3D) {
            try{
                this.addObject(name, input, options);
                settings.onLoaded(input);
            }
            catch(error) {
                settings.onError(error);
            }
        }
        else {
            var self = this;
            self.loader.load(input, {
                onGeometry: function(geometry) {
                    var material = self.getMaterial(settings.materialName);
                    var mesh = new THREE.Mesh(geometry, material);
                    self.addObject(name, mesh);
                    settings.onLoaded(mesh);
                },
                onError: function(error) {
                    settings.onError(error);
                }
            });
        }
    };

    // -------------------------------------------------------------------------

    // global settings
    Viewer3D.globalSettings = globalSettings;

    // export module
    MeshesJS.Viewer3D = Viewer3D;

})();
