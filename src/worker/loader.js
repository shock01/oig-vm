function Loader(/**Object */self, /**String */baseUrl) {
    this.load = function (script) {
        self.importScripts(script);
    };
}