'use strict';

// maybe we can also have like handlebars view etc that can be included
const WATCH_INTERVAL = 0;

let context,
  interval_,
  current_,
  factory_;

let register = (factory) => {
  factory_ = factory;
}

let dispatch = (message) => {
  self.postMessage(Object.assign(message, {
    time: Date.now()
  }));
}

let render = () => {
  dispatch({
    name: 'render',
    html: context.view.render(context.viewModel)
  });
};

let watch = () => {
  let i = 0;
  let viewModel = context.viewModel;

  if (interval_) {
    clearInterval(interval_);
  }
  interval_ = setInterval(() => {
    i++;
    if (false && i === 2) {
      clearInterval(interval_);
    }
    if (!current_ || current_ !== JSON.stringify(viewModel)) {
      render();
      current_ = JSON.stringify(viewModel);
    }
  }, WATCH_INTERVAL);
};

let unwatch = () => {
  clearInterval(interval_);
};

let load = (options) => {
  self.importScripts(options.scripts.join(','));
  context = factory_();
  if (Array.isArray(options.plugins)) {
    options.plugins.forEach(plugin => {
      self.importScripts(`plugin.${plugin}.js`);
    });
  }
  if (context.viewEngine && typeof context.viewEngine.factory === 'function') {
    context.view = context.viewEngine.factory(options);
  }
}

let setup = () => {
  var methods = [];
  for (let key in context.viewModel) {
    if (typeof context.viewModel[key] === 'function') {
      methods.push(key)
    }
  }
  dispatch({
    name: 'ready',
    methods: methods
  });
}

// create a Job or something that will run....

self.addEventListener('message', function (event) {
  switch (event.data.name) {
    case "suspend":
      unwatch();
      break;
    case "resume":
      watch();
      break;
    case "exec":
      context.viewModel[event.data.method].apply(context.viewModel, event.data.args);
      break;
    case "created":
      load(event.data);
      setup();
      break;
    case "attached":
      render();
      watch();
      break;
    case "detached":
      // kill the world
      break;
    default:
  }
});
