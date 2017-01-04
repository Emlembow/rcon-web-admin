"use strict";
View.register("index", function (messageData) {

    var c = $("#content");
    var pickServer = c.find(".pick-server");
    var addWidget = c.find(".add-widget");
    var rowContainer = c.find(".grid-row-container");

    /**
     * load all new widgets and remove deprecated ones
     */
    var loadAllWidgets = function () {
        if (!messageData.server) {
            return;
        }
        Socket.send("view", {
            "view": "index",
            "action": "widget",
            "type": "list",
            "server": messageData.server
        }, function (data) {
            if (!pingDataCheck(data)) return;
            // set max attribute for layout position
            $(".widget-layout .option").filter("[data-id='position']").find("input").attr("max", data.myWidgets.length - 1);
            var allWidgets = c.find(".widget");
            // sort widgets by the position
            data.myWidgets.sort(function (a, b) {
                if (a.position > b.position) {
                    return 1;
                } else if (a.position < b.position) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // after all widgets have been loaded, align it all correctly
            var widgetLoadedCallback = function () {
                widgetLoadedCallback.count++;
                if (widgetLoadedCallback.count >= data.myWidgets.length) {
                    // for each type we must begin a new row
                    // for large type we have only one column per row
                    // for medium we have two columns per row
                    // for small we have three columns per row
                    var count = 1;
                    var lastSize = null;
                    var container = null;
                    for (var j = 0; j < data.myWidgets.length; j++) {
                        var widget = data.myWidgets[j];
                        var max = 1;
                        if (widget.size == "medium") max = 2;
                        if (widget.size == "small") max = 3;
                        if (lastSize !== widget.size || count >= max) {
                            count = 1;
                            container = $('.templates .grid-row.' + widget.size).clone();
                            rowContainer.append(container);
                        }
                        // append the widget to the grid
                        container.find(".grid-column").eq(count - 1).append($("#widget-" + widget.id));
                        lastSize = widget.size;
                        count++;
                    }
                    collapsable(c);
                }
            };
            widgetLoadedCallback.count = 0;
            for (var i in data.myWidgets) {
                (function () {
                    var widgetData = data.myWidgets[i];
                    allWidgets = allWidgets.not("#widget-" + widgetData.id);
                    if (typeof Widget.widgets[widgetData.id] != "undefined") {
                        var widget = Widget.widgets[widgetData.id];
                        widget.data = widgetData;
                        widgetLoadedCallback();
                    } else {
                        // a fix to catch non existing script file errors
                        var loadTo = setTimeout(function () {
                            widgetLoadedCallback();
                        }, 1000);
                        $.getScript("widgets/" + widgetData.id + "/frontend.js", function () {
                            clearTimeout(loadTo);
                            var widget = new Widget(widgetData.id);
                            Widget.widgets[widgetData.id] = widget;
                            widget.id = widgetData.id;
                            widget.server = messageData.server;
                            widget.serverData = messageData.myServers[messageData.server];
                            widget.data = widgetData;
                            if (!widgetData.id.match(/^[a-z]/) || widgetData.id.match(/[^a-z0-9-_]/)) {
                                Modal.alert(t("index.widget.error.id"));
                            }
                            widget.container = c.find(".templates .widget").clone();
                            widget.container.attr("data-id", widget.id).attr("id", "widget-" + widget.id);
                            widget.container.addClass("widget-" + widget.id);
                            widget.container.find(".widget-title")
                                .attr("data-collapsable-target", "widget.content." + widget.id)
                                .append($('<span>').text(widget.t("title")));
                            widget.container.find(".widget-content")
                                .attr("data-collapsable-id", "widget.content." + widget.id);

                            $.get("widgets/" + widgetData.id + "/README.md", function (data) {
                                widget.container.find(".widget-readme").html(new showdown.Converter().makeHtml(data));
                            });
                            // copy to hidden widgets form, set position later
                            $(".widgets-unsorted").append(widget.container);
                            widget.content = widget.container.find(".widget-content");

                            // fill layout option values
                            var values = {"size": widget.data.size, "position": widget.data.position};
                            $.each(values, function (valueKey, valueValue) {
                                var input = widget.container.find(".widget-layout .option")
                                    .filter("[data-id='" + valueKey + "']").find(":input");
                                // limit to select only compatible sizes
                                if (valueKey == "size") {
                                    $.each(widget.data.manifest.compatibleSizes, function (sizeKey, sizeValue) {
                                        input.append($('<option>').attr("value", sizeValue)
                                            .html(t("index.widget.size.value." + sizeValue)));
                                    });
                                }
                                // set default value
                                input.val(valueValue);
                                // instantiate selectpicker
                                if (input.is("select")) input.selectpicker();
                            });

                            var options = widget.data.manifest.options;
                            // create options html
                            var optionsEl = widget.container.find(".widget-options .options");
                            for (var optionIndex in options) {
                                if (options.hasOwnProperty(optionIndex)) {
                                    var optionRow = options[optionIndex];
                                    optionsEl.append(
                                        option.createHtmlFromData(
                                            optionIndex,
                                            widget.t("option." + optionIndex + ".title"),
                                            widget.t("option." + optionIndex + ".info"),
                                            widget.options.get(optionIndex),
                                            optionRow
                                        )
                                    );
                                }
                            }

                            widgetLoadedCallback();
                            $("head").append('<link type="text/css" href="widgets/' + widgetData.id + '/style.css" ' +
                                'rel="stylesheet" media="all" id="css-' + widgetData.id + '">');
                            Widget.registerCallback(widget);
                            Widget.registerCallback = null;
                            widget.onInit();
                        });
                    }
                })();
            }
            // remove all widgets that are not in mywidgets list anymore
            allWidgets.each(function () {
                var widget = Widget.widgets[$(this).attr("id")];
                if (widget) {
                    widget.remove();
                }
            });
        });
    };

    /**
     * helper for click on options or layout icons
     * @param {Widget} widget
     * @param {string} area
     */
    var showArea = function (widget, area) {
        var lastArea = widget.container.data("area");
        if (lastArea === area) {
            area = "content";
        }
        widget.container.find(".widget-content, .widget-options, .widget-layout, .widget-readme").addClass("hidden");
        widget.container.find(".widget-" + area).removeClass("hidden");
        widget.container.data("area", area);
        widget.container.attr("data-area", area);
    };

    /**
     * Check the data we've got from ping
     * @param {object} data
     */
    var pingDataCheck = function (data) {
        // if server is down for some reason, reload view
        if (!data.server) {
            Storage.set("server", null);
            View.changeHash("index");
            View.load("index");
            note("index.serveroffline", "danger", -1);
            Interval.destroy("index.server.ping");
            return false;
        }
        if (!data.myWidgets) {
            rowContainer.html(t("index.nowidgets"));
            return false;
        }
        return true;
    };

    // ping the server each 10 seconds for some checks
    Interval.create("index.server.ping", function () {
        if (View.current != "index") return;
        Socket.send("view", {
            "view": "index",
            "action": "widget",
            "type": "ping",
            "server": messageData.server
        }, pingDataCheck);
    }, 10000);

    // bind some events
    c.off(".index").on("change.index", ".pick-server", function () {
        if ($(this).val().length) {
            Storage.set("server", $(this).val());
            View.changeHash("index-" + View.getAttributeMessage({"server": $(this).val()}));
            View.load("index", {"server": $(this).val()});
        }
    }).on("change.index", ".add-widget", function () {
        if (messageData.server && $(this).val().length) {
            Socket.send("view", {
                "view": "index",
                "action": "widget",
                "type": "add",
                "server": messageData.server,
                "widget": $(this).val()
            }, function () {
                loadAllWidgets();
            });
            $(this).val('').selectpicker("refresh");
        }
    }).on("click.index", ".widget-delete", function () {
        if (messageData.server && confirm(t("sure"))) {
            var widget = Widget.getByElement(this);
            if (widget) {
                Socket.send("view", {
                    "view": "index",
                    "action": "widget",
                    "type": "remove",
                    "server": messageData.server,
                    "widget": widget.id
                }, function () {
                    widget.remove();
                });
            }
        }
    }).on("click.index", ".widget .widget-icons .icon", function (ev) {
        ev.stopPropagation();
        showArea(Widget.getByElement(this), $(this).attr("data-id"));
    }).on("input.index change.index", ".widget-options .option :input", function () {
        var e = $(this);
        clearTimeout(e.data("optionTimeout"));
        e.data("optionTimeout", setTimeout(function () {
            var widget = Widget.getByElement(e);
            var o = e.closest(".option");
            var id = o.attr("data-id");
            widget.options.set(id, option.htmlValueToDb(o.attr("data-type"), e.val()));
            note("saved", "success");
        }, 600));
    }).on("click.index", ".widget-layout .save-layout", function () {
        var widget = Widget.getByElement(this);
        note("index.widget.layout.save", "success");
        var options = widget.container.find(".widget-layout .option");
        Socket.send("view", {
            "view": "index",
            "action": "widget",
            "type": "layout",
            "server": messageData.server,
            "widget": widget.id,
            "values": {
                "size": options.filter("[data-id='size']").find("select").val(),
                "position": parseInt(options.filter("[data-id='position']").find("input").val()),
            }
        });
    });

    // list all my servers
    if (messageData.myServers) {
        for (var i in messageData.myServers) {
            var server = messageData.myServers[i];
            pickServer.append($('<option></option>').attr("value", server.id).text(server.name));
        }
    }

    // check if server is selected via hash
    var hashData = View.getViewDataByHash();
    if (!hashData.messageData || !hashData.messageData.server) {
        var savedServer = Storage.get("server");
        if (savedServer) {
            View.changeHash("index-" + View.getAttributeMessage({server: savedServer}));
            View.load("index", {"server": savedServer});
            return;
        }
    } else {
        pickServer.val(hashData.messageData.server);
    }

    // if server is selected
    if (messageData.server) {
        loadAllWidgets();
    } else {
        rowContainer.html(t(!hashData.messageData ? "index.noserver" : "index.serveroffline"));
    }

    // add widgets to the selectbox
    if (messageData.widgets && messageData.server) {
        for (var i in messageData.widgets) {
            // create fake widget to get some helpful methods
            var widget = new Widget("");
            widget.data = {};
            widget.data.manifest = messageData.widgets[i];
            // check if widget is compatible with this server
            if (
                widget.data.manifest.compatibleGames !== "all"
                && widget.data.manifest.compatibleGames.indexOf(messageData.myServers[messageData.server].game) === -1
            ) {
                continue;
            }
            addWidget.append($('<option></option>').attr("value", i).text(widget.t("title")));
        }
    }
});