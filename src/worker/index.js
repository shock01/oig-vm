'use strict';

// maybe we can also have like handlebars view etc that can be included
// Create a watcher / and factory and crap like that
// createObjectURL for loading scripts...https://gist.github.com/willywongi/5780151

let context,
  factory,
  observer,
  viewEngine;

let load = (options) => {
  // test if we can use Proxy then use Proxy Observer....
  observer = new DirtyObserver(() => {
    // remove all methods from the object
    context.render();
  });
  let loader = new Loader(self, options.baseUrl);
  options.scripts.forEach(script => loader.load(script));
  if (Array.isArray(options.plugins)) {
    options.plugins.forEach(script => loader.load(script));
  }

  let mvvm = factory(),
    viewModel = mvvm.viewModel || mvvm,
    view = mvvm.view || viewEngine(options);

  self.context = context = new Context(self, viewModel, view);
  context.initialize();
}

self.addEventListener('message', function (event) {
  switch (event.data.name) {
    case "suspend":
      observer.terminate();
      break;
    case "resume":
      observer.observe(context.viewModel);
      break;
    case "exec":
      context.execute(event.data.method, event.data.args);
      break;
    case "created":
      load(event.data);
      break;
    case "attached":
      // initial render
      context.render();
      observer.observe(context.viewModel);
      break;
    case "detached":
      close();
      break;
    default:
  }
});

self.oig = {
  factory: function (value) {
    factory = value;
  },
  viewEngine: function (value) {
    viewEngine = value;
  }
};