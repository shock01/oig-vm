;(function(self) {
"use strict";

function DirtyObserver(/**Function */callback) {
    
    let interval_;
    let current_;

    function clear() {
        clearInterval(interval_);
    }

    this.observe = function (/**Object */context) {
        interval_ = setInterval(() => {
            if (!current_ || current_ !== JSON.stringify(context)) {
                current_ = JSON.stringify(context);
                callback(context);
            }

        }, 0)
        return context;
    };

    this.terminate = function () {
        clearInterval(interval_);
        current_ = null;
    };
}


function Context(/**Object*/self, /**Object*/viewModel, /**Object*/view) {

    var dispatch = (message) => {
        self.postMessage(Object.assign(message, {
            time: Date.now()
        }));
    };

    var methods = ()/**Array.<String> */ => {
        return Object.keys(viewModel).filter(key => typeof viewModel[key] === 'function');
    };

    this.execute = (method, args) => {
        viewModel[method].apply(viewModel, args);
    };

    this.render = () => {
        dispatch({
            name: 'render',
            content: view.render(viewModel)
        });
    };

    this.initialize = () => {
        dispatch({
            name: 'ready',
            methods: methods()
        });
    };
}


function Loader(/**Object */self, /**String */baseUrl) {
    this.load = function (script) {
        self.importScripts(script);
    };
}
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
}(self));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRpcnR5X29ic2VydmVyLmpzIiwiY29udGV4dC5qcyIsImxvYWRlci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InZtLXdvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5mdW5jdGlvbiBEaXJ0eU9ic2VydmVyKC8qKkZ1bmN0aW9uICovY2FsbGJhY2spIHtcclxuICAgIFxyXG4gICAgbGV0IGludGVydmFsXztcclxuICAgIGxldCBjdXJyZW50XztcclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhcigpIHtcclxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsXyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vYnNlcnZlID0gZnVuY3Rpb24gKC8qKk9iamVjdCAqL2NvbnRleHQpIHtcclxuICAgICAgICBpbnRlcnZhbF8gPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudF8gfHwgY3VycmVudF8gIT09IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50XyA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soY29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSwgMClcclxuICAgICAgICByZXR1cm4gY29udGV4dDtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy50ZXJtaW5hdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbF8pO1xyXG4gICAgICAgIGN1cnJlbnRfID0gbnVsbDtcclxuICAgIH07XHJcbn1cclxuXHJcbiIsImZ1bmN0aW9uIENvbnRleHQoLyoqT2JqZWN0Ki9zZWxmLCAvKipPYmplY3QqL3ZpZXdNb2RlbCwgLyoqT2JqZWN0Ki92aWV3KSB7XHJcblxyXG4gICAgdmFyIGRpc3BhdGNoID0gKG1lc3NhZ2UpID0+IHtcclxuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKE9iamVjdC5hc3NpZ24obWVzc2FnZSwge1xyXG4gICAgICAgICAgICB0aW1lOiBEYXRlLm5vdygpXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbWV0aG9kcyA9ICgpLyoqQXJyYXkuPFN0cmluZz4gKi8gPT4ge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh2aWV3TW9kZWwpLmZpbHRlcihrZXkgPT4gdHlwZW9mIHZpZXdNb2RlbFtrZXldID09PSAnZnVuY3Rpb24nKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5leGVjdXRlID0gKG1ldGhvZCwgYXJncykgPT4ge1xyXG4gICAgICAgIHZpZXdNb2RlbFttZXRob2RdLmFwcGx5KHZpZXdNb2RlbCwgYXJncyk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucmVuZGVyID0gKCkgPT4ge1xyXG4gICAgICAgIGRpc3BhdGNoKHtcclxuICAgICAgICAgICAgbmFtZTogJ3JlbmRlcicsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IHZpZXcucmVuZGVyKHZpZXdNb2RlbClcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplID0gKCkgPT4ge1xyXG4gICAgICAgIGRpc3BhdGNoKHtcclxuICAgICAgICAgICAgbmFtZTogJ3JlYWR5JyxcclxuICAgICAgICAgICAgbWV0aG9kczogbWV0aG9kcygpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59XHJcblxyXG4iLCJmdW5jdGlvbiBMb2FkZXIoLyoqT2JqZWN0ICovc2VsZiwgLyoqU3RyaW5nICovYmFzZVVybCkge1xyXG4gICAgdGhpcy5sb2FkID0gZnVuY3Rpb24gKHNjcmlwdCkge1xyXG4gICAgICAgIHNlbGYuaW1wb3J0U2NyaXB0cyhzY3JpcHQpO1xyXG4gICAgfTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIG1heWJlIHdlIGNhbiBhbHNvIGhhdmUgbGlrZSBoYW5kbGViYXJzIHZpZXcgZXRjIHRoYXQgY2FuIGJlIGluY2x1ZGVkXHJcbi8vIENyZWF0ZSBhIHdhdGNoZXIgLyBhbmQgZmFjdG9yeSBhbmQgY3JhcCBsaWtlIHRoYXRcclxuLy8gY3JlYXRlT2JqZWN0VVJMIGZvciBsb2FkaW5nIHNjcmlwdHMuLi5odHRwczovL2dpc3QuZ2l0aHViLmNvbS93aWxseXdvbmdpLzU3ODAxNTFcclxuXHJcbmxldCBjb250ZXh0LFxyXG4gIGZhY3RvcnksXHJcbiAgb2JzZXJ2ZXIsXHJcbiAgdmlld0VuZ2luZTtcclxuXHJcbmxldCBsb2FkID0gKG9wdGlvbnMpID0+IHtcclxuICAvLyB0ZXN0IGlmIHdlIGNhbiB1c2UgUHJveHkgdGhlbiB1c2UgUHJveHkgT2JzZXJ2ZXIuLi4uXHJcbiAgb2JzZXJ2ZXIgPSBuZXcgRGlydHlPYnNlcnZlcigoKSA9PiB7XHJcbiAgICAvLyByZW1vdmUgYWxsIG1ldGhvZHMgZnJvbSB0aGUgb2JqZWN0XHJcbiAgICBjb250ZXh0LnJlbmRlcigpO1xyXG4gIH0pO1xyXG4gIGxldCBsb2FkZXIgPSBuZXcgTG9hZGVyKHNlbGYsIG9wdGlvbnMuYmFzZVVybCk7XHJcbiAgb3B0aW9ucy5zY3JpcHRzLmZvckVhY2goc2NyaXB0ID0+IGxvYWRlci5sb2FkKHNjcmlwdCkpO1xyXG4gIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMucGx1Z2lucykpIHtcclxuICAgIG9wdGlvbnMucGx1Z2lucy5mb3JFYWNoKHNjcmlwdCA9PiBsb2FkZXIubG9hZChzY3JpcHQpKTtcclxuICB9XHJcblxyXG4gIGxldCBtdnZtID0gZmFjdG9yeSgpLFxyXG4gICAgdmlld01vZGVsID0gbXZ2bS52aWV3TW9kZWwgfHwgbXZ2bSxcclxuICAgIHZpZXcgPSBtdnZtLnZpZXcgfHwgdmlld0VuZ2luZShvcHRpb25zKTtcclxuXHJcbiAgc2VsZi5jb250ZXh0ID0gY29udGV4dCA9IG5ldyBDb250ZXh0KHNlbGYsIHZpZXdNb2RlbCwgdmlldyk7XHJcbiAgY29udGV4dC5pbml0aWFsaXplKCk7XHJcbn1cclxuXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gIHN3aXRjaCAoZXZlbnQuZGF0YS5uYW1lKSB7XHJcbiAgICBjYXNlIFwic3VzcGVuZFwiOlxyXG4gICAgICBvYnNlcnZlci50ZXJtaW5hdGUoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwicmVzdW1lXCI6XHJcbiAgICAgIG9ic2VydmVyLm9ic2VydmUoY29udGV4dC52aWV3TW9kZWwpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgXCJleGVjXCI6XHJcbiAgICAgIGNvbnRleHQuZXhlY3V0ZShldmVudC5kYXRhLm1ldGhvZCwgZXZlbnQuZGF0YS5hcmdzKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiY3JlYXRlZFwiOlxyXG4gICAgICBsb2FkKGV2ZW50LmRhdGEpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgXCJhdHRhY2hlZFwiOlxyXG4gICAgICAvLyBpbml0aWFsIHJlbmRlclxyXG4gICAgICBjb250ZXh0LnJlbmRlcigpO1xyXG4gICAgICBvYnNlcnZlci5vYnNlcnZlKGNvbnRleHQudmlld01vZGVsKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiZGV0YWNoZWRcIjpcclxuICAgICAgY2xvc2UoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gIH1cclxufSk7XHJcblxyXG5zZWxmLm9pZyA9IHtcclxuICBmYWN0b3J5OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIGZhY3RvcnkgPSB2YWx1ZTtcclxuICB9LFxyXG4gIHZpZXdFbmdpbmU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgdmlld0VuZ2luZSA9IHZhbHVlO1xyXG4gIH1cclxufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
