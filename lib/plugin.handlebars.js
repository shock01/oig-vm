// @FIXME
importScripts('../lib/handlebars-v4.0.5.js');

function HandlerBarsView(source) {
  let template = Handlebars.compile(source);
  this.render = (viewModel) => template(viewModel);
}

// plugins should not be loaded AFTER the context is created
oig.viewEngine((data) => {
  return new HandlerBarsView(data.template);
});