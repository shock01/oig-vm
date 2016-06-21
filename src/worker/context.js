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

