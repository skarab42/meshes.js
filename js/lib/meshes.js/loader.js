// namespace
var MeshesJS = MeshesJS || {};

;(function() {

    // global settings
    var globalSettings = {
        loaders: {
            stl: MeshesJS.STLLoader
        }
    };

    // Constructor
    function Loader(settings) {
        this.defaults = _.defaultsDeep({}, settings || {}, Loader.globalSettings);
        this.settings = _.defaults({}, this.defaults);
    }

    // methods
    Loader.prototype.loadFile = function(file, options) {
        var settings = _.defaults(options || {}, {
            onGeometry: function(geometry) {},
            onError: function(error) {}
        });

        // empty file...
        if (file.size == 0) {
            settings.onError({ message: 'Empty file', file: file.name });
            return false;
        }

        // file type based on extension
        var type = file.name.split('.').pop().toLowerCase();

        // test if file type as an loader
        var loader = this.settings.loaders[type];

        if (! loader) {
            settings.onError({ message: 'Unknown file type', file: file.name });
            return false;
        }

        // loader instance
        loader = new loader();
        loader.onGeometry = settings.onGeometry;
        loader.onError = settings.onError;
        loader.loadFile(file);
    };

    Loader.prototype.load = function(input, options) {
        if (input instanceof File) {
            this.loadFile(input, options);
        }
        else if (input instanceof FileList) {
            for (var i = 0; i < input.length; i++) {
                this.loadFile(input[i], options);
            }
        }
        else {
            throw 'Unknown input type';
        }
    };

    // global settings
    Loader.globalSettings = globalSettings;

    // export module
    MeshesJS.Loader = Loader;

})();
