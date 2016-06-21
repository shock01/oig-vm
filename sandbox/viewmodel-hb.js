/** global: factory */
'use strict';
function ViewModel() {
  this.name = 'whatever';
  this.action = function(time) {
    console.log('execute!!');
    this.timeFromYou = time;
  };
  this.init = function() {
    this.time = Date.now();
    setInterval(() => {
      this.time = Date.now();
    }, 1000)
  };
}

oig.factory(function() {
  return new ViewModel();
});
