var Widget = {};

Widget.initWidget = function($el) {
    var config = $el.data();
    var widgetPath = config.widget;

    $el.find('[data-role]').each(function() {
        var roleName = '$' + $(this).data('role');
        if (config[roleName]) {
            config[roleName].push($(this));
        } else {
            config[roleName] = $(this);
        }
    });
    config.$el = $el;

    var url = widgetPath.split('#');
    var method = url[1];
    url = url[0];

    GJ.use(url, function(widget) {
        if (method) {
            widget = widget[method];
        }
        try {
            widget = new widget(config);
        } catch (err) {
            throw new Error(err);
        }

        $el.data('widget', widget);

        if ($el.data('widget-callback')) {
            $.each($el.data('widget-callback'), function(cb) {
                cb(widget);
            });
        }
    });
};

Widget.initWidgets = function() {
    $('[data-widget]').each(function() {
        Widget.initWidget($(this));
    });
};

Widget.define = function(def) {
    var widget = function(config) {
        var self = GJ.mix({}, def);
        self.$el = config.$el;

        (function () {
            if (def.events) {
                $.each(def.events, function(event, cb) {
                    if (typeof cb === 'function') {
                        cb = $.proxy(cb, self);
                    } else {
                        cb = $.proxy(self[cb], self);
                    }
                    self.$el.on(event, cb);
                });
            }
        })();

        if (self.init) {
            self.init();
        }
        return self;
    };

    return widget;
};

Widget.ready = function($el, cb) {
    if (!$el.length) {
        throw new Error('not exists!');
    }

    if (typeof $el.data('widget') !== 'string') {
        cb($el.data('widget'));
    } else {
        if ($el.data('widget-callback')) {
            $el.data('widget-callback').push(cb);
        } else {
            $el.data('widget-callback', [cb]);
        }
    }
};

Widget.template = function(str, data) {
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'") + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
};