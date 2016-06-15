importScripts('handlebars-v4.0.5.js');

function HandlerBarsView(source) {
  let template = Handlebars.compile(source);
  this.render = (viewModel) => template(viewModel);
}

context.viewEngine = HandlerBarsView;
context.viewEngine.factory = (data) => {
  return new context.viewEngine(data.template);
};
