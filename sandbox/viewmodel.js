/** global: factory */
'use strict';
function ViewModel() {
  this.init = function() {
    this.time = Date.now();
    setInterval(() => {
      this.time = Date.now();
    }, 1000)
  };
}


function View(viewModel) {
  this.viewModel = viewModel;
}

View.prototype.render = function(data) {
  return `<div>${data.time}</div>`;
};

oig.factory(function() {
  var viewModel = new ViewModel(),
    view = new View(viewModel);

  viewModel.init();
  // or just return a view
  return {
    view: view,
    viewModel: viewModel
  };
});
