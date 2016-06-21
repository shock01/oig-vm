;(function(self) {
"use strict";

const views = new Set();
  let workerScript;

  // get a reference to the worker script
  // to unit test move this out and call it on bootstrap or when factory is called
  (function () {
    var scripts = document.getElementsByTagName('script'),
      script = scripts[scripts.length - 1];
    workerScript = script.src.substring(0, script.src.lastIndexOf('/') + 1) + 'vm-worker.js';
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
                // will not work when we actually render it so stupid
              if (!element) {
                this.insertAdjacentHTML('beforeend', data.content);
              } else {
                this.domRenderer.render(data.content, element);
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
}(self));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InZtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiICBjb25zdCB2aWV3cyA9IG5ldyBTZXQoKTtcclxuICBsZXQgd29ya2VyU2NyaXB0O1xyXG5cclxuICAvLyBnZXQgYSByZWZlcmVuY2UgdG8gdGhlIHdvcmtlciBzY3JpcHRcclxuICAvLyB0byB1bml0IHRlc3QgbW92ZSB0aGlzIG91dCBhbmQgY2FsbCBpdCBvbiBib290c3RyYXAgb3Igd2hlbiBmYWN0b3J5IGlzIGNhbGxlZFxyXG4gIChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKSxcclxuICAgICAgc2NyaXB0ID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdO1xyXG4gICAgd29ya2VyU2NyaXB0ID0gc2NyaXB0LnNyYy5zdWJzdHJpbmcoMCwgc2NyaXB0LnNyYy5sYXN0SW5kZXhPZignLycpICsgMSkgKyAndm0td29ya2VyLmpzJztcclxuICB9ICgpKVxyXG5cclxuICAvLyBzZW5kIGEgcGF1c2UgdG8gdGhlIHdlYndvcmtlciB0byBzdG9wIHRoZSBpbnRlcnZhbHMgYW5kIHJlc3VtZSB3aWxsIGNhbGwgcmVuZGVyXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIChldmVudCkgPT4ge1xyXG4gICAgZm9yIChsZXQgdmlldyBvZiB2aWV3cykge1xyXG4gICAgICBldmVudC50YXJnZXQuaGlkZGVuID8gdmlldy5zdXNwZW5kKCkgOiB2aWV3LnJlc3VtZSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIC8qKlxyXG4gICAqIFdvcmtlclxyXG4gICAqL1xyXG4gIHZhciBPSUdXb3JrZXIgPSBmdW5jdGlvbiAoKSB7IH07XHJcbiAgT0lHV29ya2VyLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBuZXcgV29ya2VyKHdvcmtlclNjcmlwdCk7XHJcbiAgfTtcclxuXHJcbiAgT0lHV29ya2VyLmRpc3Bvc2UgPSBmdW5jdGlvbiAod29ya2VyKSB7XHJcbiAgICB3b3JrZXIudGVybWluYXRlKCk7XHJcbiAgfTtcclxuICAvKipcclxuICAgICogQ3VzdG9tIEhUTUwgRWxlbWVudCAoV2ViQ29tcG9uZW50KVxyXG4gICAgKi9cclxuICBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ29pZy12aWV3Jywge1xyXG4gICAgcHJvdG90eXBlOiBPYmplY3QuY3JlYXRlKEhUTUxFbGVtZW50LnByb3RvdHlwZSwge1xyXG4gICAgICAnY29udGV4dCc6IHtcclxuICAgICAgICB2YWx1ZToge31cclxuICAgICAgfSxcclxuICAgICAgJ2RvbVJlbmRlcmVyJzoge1xyXG4gICAgICAgIHZhbHVlOiBuZXcgT0lHRG9tUmVuZGVyZXIoKVxyXG4gICAgICB9LFxyXG4gICAgICAnc3VzcGVuZCc6IHtcclxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdvaWctdmlld3N1c3BlbmRlZCcpO1xyXG4gICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBuYW1lOiAnc3VzcGVuZCdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgJ3Jlc3VtZSc6IHtcclxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdvaWctdmlld3N1c3BlbmRlZCcpO1xyXG4gICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBuYW1lOiAncmVzdW1lJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAnaGFuZGxlcnMnOiB7XHJcbiAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICdyZWFkeSc6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnb2lnLXZpZXdyZWFkeScpO1xyXG4gICAgICAgICAgICBkYXRhLm1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jb250ZXh0W21ldGhvZF0gPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnZXhlYycsXHJcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgICdyZW5kZXInOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUsXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LFxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHRlbXBsYXRlID8gdGVtcGxhdGUubmV4dEVsZW1lbnRTaWJsaW5nIDogdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcclxuICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBkYXRhLmNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvbVJlbmRlcmVyLnJlbmRlcihkYXRhLmNvbnRlbnQsIGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAnY3JlYXRlZENhbGxiYWNrJzoge1xyXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgd29ya2VyID0gdGhpcy53b3JrZXIgPSBPSUdXb3JrZXIuY3JlYXRlKCksXHJcbiAgICAgICAgICAgIG5hbWUgPSB0aGlzLm5hbWUgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ3RlbXBsYXRlJyksXHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnb2lnLXZpZXdjcmVhdGVkJyk7XHJcbiAgICAgICAgICB3b3JrZXIucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBuYW1lOiAnY3JlYXRlZCcsXHJcbiAgICAgICAgICAgIHNjcmlwdHM6IHRoaXMuaGFzQXR0cmlidXRlKCdzY3JpcHRzJykgPyB0aGlzLmdldEF0dHJpYnV0ZSgnc2NyaXB0cycpLnNwbGl0KCcsJykgOiAnJyxcclxuICAgICAgICAgICAgcGx1Z2luczogdGhpcy5oYXNBdHRyaWJ1dGUoJ3BsdWdpbnMnKSA/IHRoaXMuZ2V0QXR0cmlidXRlKCdwbHVnaW5zJykuc3BsaXQoJywnKSA6ICcnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUgPyB0ZW1wbGF0ZS5pbm5lckhUTUwgOiBudWxsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gZXZlbnQuZGF0YS5uYW1lO1xyXG4gICAgICAgICAgICBlbGVtZW50LmhhbmRsZXJzW25hbWVdICYmIGVsZW1lbnQuaGFuZGxlcnNbbmFtZV0uY2FsbChlbGVtZW50LCBldmVudC5kYXRhKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgJ2F0dGFjaGVkQ2FsbGJhY2snOiB7XHJcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZpZXdzLmFkZCh0aGlzKTtcclxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3csIHRoaXMubmFtZSwge1xyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGdldDogKCkgPT4gdGhpcy5jb250ZXh0XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgbmFtZTogJ2F0dGFjaGVkJ1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAnZGV0YWNoZWRDYWxsYmFjayc6IHtcclxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmlld3MuZGVsZXRlKHRoaXMpO1xyXG4gICAgICAgICAgZGVsZXRlIHdpbmRvd1t0aGlzLm5hbWVdO1xyXG4gICAgICAgICAgT0lHV29ya2VyLmRpc3Bvc2UodGhpcy53b3JrZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
