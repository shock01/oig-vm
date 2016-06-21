
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

