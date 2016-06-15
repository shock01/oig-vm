(function (root, factory) {
  // define a global plugins config
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OIGVM = factory();
  }
} (this, function () {
  'use strict';
  const views = new Set();
  let workerScript;

  // get a reference to the worker script
  (function () {
    var scripts = document.getElementsByTagName('script'),
      script = scripts[scripts.length - 1];
    workerScript = script.src.substring(0, script.src.lastIndexOf('/') + 1) + 'worker.js';
  } ())

  // send a pause to the webworker to stop the intervals and resume will call render
  document.addEventListener('visibilitychange', (event) => {
    for (let view of views) {
      event.target.hidden ? view.suspend() : view.resume();
    }
  });
  /**
   * Worker
   */
  var OIGWorker = function () { };
  OIGWorker.create = function () {
    return new Worker(workerScript);
  };

  OIGWorker.dispose = function (worker) {
    worker.terminate();
  };
  /**
    * Custom HTML Element (WebComponent)
    */
  document.registerElement('oig-view', {
    prototype: Object.create(HTMLElement.prototype, {
      'context': {
        value: {}
      },
      'domRenderer': {
        value: new OIGDomRenderer()
      },
      'suspend': {
        value: function () {
          this.classList.add('oig-viewsuspended');
          this.worker.postMessage({
            name: 'suspend'
          });
        }
      },
      'resume': {
        value: function () {
          this.classList.remove('oig-viewsuspended');
          this.worker.postMessage({
            name: 'resume'
          });
        }
      },
      'handlers': {
        value: {
          'ready': function (data) {
            this.classList.add('oig-viewready');
            data.methods.forEach((method) => {
              this.context[method] = (...args) => {
                this.worker.postMessage({
                  name: 'exec',
                  method: method,
                  args: args
                });
              }
            });
          },
          'render': function (data) {
            requestAnimationFrame(() => {
              var template = this.template,
                current,
                element = template ? template.nextElementSibling : this.firstElementChild;
              if (!element) {
                this.insertAdjacentHTML('beforeend', data.html);
              } else {
                this.domRenderer.render(data.html, element);
              }
            });
          }
        }
      },
      'createdCallback': {
        value: function () {
          var worker = this.worker = OIGWorker.create(),
            name = this.name = this.getAttribute('name'),
            template = this.template = this.querySelector('template'),
            element = this;

          this.classList.add('oig-viewcreated');
          worker.postMessage({
            name: 'created',
            scripts: this.hasAttribute('scripts') ? this.getAttribute('scripts').split(',') : '',
            plugins: this.hasAttribute('plugins') ? this.getAttribute('plugins').split(',') : '',
            template: template ? template.innerHTML : null
          });
          worker.addEventListener('message', (event) => {
            let name = event.data.name;
            element.handlers[name] && element.handlers[name].call(element, event.data);
          });
        }
      },
      'attachedCallback': {
        value: function () {
          views.add(this);
          Object.defineProperty(window, this.name, {
            configurable: true,
            get: () => this.context
          });
          this.worker.postMessage({
            name: 'attached'
          });
        }
      },
      'detachedCallback': {
        value: function () {
          views.delete(this);
          delete window[this.name];
          OIGWorker.dispose(this.worker);
        }
      }
    })
  });

  var factory = function () { };
  return factory;
}));
