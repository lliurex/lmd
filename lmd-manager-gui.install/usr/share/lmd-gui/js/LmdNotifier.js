function LmdNotifier() {

    this.notify_number = 0;
    var self = this;

    this.addNotification = function addNotification(type, title, desc) {
        // Check if is shown
        if ($("#notifications_wrapper").length > 0) {
            $("#notifications_wrapper").hide(200, function() {
                $("#notifications_wrapper").remove();
            });
        }

        // Adding notification
        $.xmlrpc({
            url: 'https://' + sessionStorage.server + ':9779',
            methodName: 'addNotification',
            params: [
                [sessionStorage.username, sessionStorage.password], "LmdNotifier", type, title, desc
            ],
            success: function(response, status, jqXHR) {
                // Update button
                self.notify_number++;
                if (self.notify_number == 1) {
                    $("#notification_bt_text").css("background-image", "url(css/img/info1.png)");
                    $("#notification_bt").addClass("notification_bt_animated");
                } else if (self.notify_number == 2) {
                    $("#notification_bt_text").css("background-image", "url(css/img/info2.png)");
                    $("#notification_bt").addClass("notification_bt_animated");
                } else if (self.notify_number >= 3) {
                    $("#notification_bt_text").css("background-image", "url(css/img/info3.png)");
                    $("#notification_bt").addClass("notification_bt_animated");
                }


            },
            error: function(jqXHR, status, error) {
                response = "Unknown error. Server disconnected?"
                alert(response);

            }
        });

    }

    this.notify_translate = function notify_translate(text) {
        strings = text.split("+");
        retstring = "";
        for (j in strings) {
            if (strings[j][0] == "_") // is translateable
                retstring = retstring + i18n.gettext(strings[j]) + " ";
            else
                retstring = retstring + strings[j] + " ";
        }
        return retstring;
    }

    this.build_notify_div = function build_notify_div(date, type, title, desc, new_notification) {
        icon_img = "";
        if (type == "warning") {
            icon_img = "./css/img/warning.png";
        } else if (type == "info") {
            icon_img = "./css/img/info.png";
        } else if (type == "error") {
            icon_img = "./css/img/error.png";
        }

        var div_img = $(document.createElement('img')).addClass("notificationIcon").attr("src", icon_img);
        var div_title = $(document.createElement('div')).addClass("notificationTitle").html(this.notify_translate(title) + " (" + date + ")");
        var div_desc = $(document.createElement('div')).addClass("notificationDesc").html(this.notify_translate(desc));
        var div_title_and_desc = $(document.createElement('div')).addClass("notificationTitleAndDesc");

        div_title_and_desc.append(div_title);
        div_title_and_desc.append(div_desc);

        if (new_notification)
            var notification = $(document.createElement('div')).addClass("notification_new");
        else
            var notification = $(document.createElement('div')).addClass("notification");


        notification.append(div_img);
        notification.append(div_title_and_desc);

        return notification;
    }

    this.CleanLog = function CleanLog() {
        $.xmlrpc({
            url: 'https://' + sessionStorage.server + ':9779',
            methodName: 'cleanLog',
            params: [
                [sessionStorage.username, sessionStorage.password], "LmdNotifier"
            ],
            success: function(response, status, jqXHR) {
                $("#notifications_wrapper").hide(200, function() {
                    $("#notifications_wrapper").remove();
                });
            },
            error: function(jqXHR, status, error) {
                response = "Unknown error. Server disconnected?"
                alert(response);

            }
        })


    }


    this.show = function show() {

        if ($("#notifications_wrapper").length > 0) {
            $("#notifications_wrapper").hide(200, function() {
                $("#notifications_wrapper").remove();
            });
            return false;
        }

        var notificationsContainer = $(document.createElement('div')).attr("id", "notifications_wrapper");
        $("body").append(notificationsContainer);

        // get all notifications

        $.xmlrpc({
            url: 'https://' + sessionStorage.server + ':9779',
            methodName: 'getLog',
            params: ['', "LmdNotifier"],
            success: function(response, status, jqXHR) {
                // Clean Notification button
                count_news = self.notify_number;
                self.notify_number = 0;
                $("#notification_bt_text").css("background-image", "url(css/img/info0.png)");
                $("#notification_bt").removeClass("notification_bt_animated");

                if (count_news > 0) // There are new notifications
                    start_value = response[0].length - count_news
                else start_value = 0;
                if (typeof(response[0][0]) == "object")
                    for (i = start_value; i < response[0].length; i++) {
                        if (i >= response[0].length - count_news) new_notification = true;
                        else new_notification = false;
                        date = response[0][i].data;
                        type = response[0][i].type;
                        title = response[0][i].title;
                        desc = response[0][i].desc;
                        notification = self.build_notify_div(date, type, title, desc, new_notification);
                        //notification=self.build_notify_div(date, type, title, desc);
                        $(notificationsContainer).append(notification);
                        $(notification).show(200);
                    }

                if (typeof(response[0][0]) == "object") {
                    hide_log = $(document.createElement('div')).attr("id", "clean_log");
                    clean_log = $(document.createElement('div')).attr("id", "delete_log");
                    control_line = $(document.createElement('div')).attr("id", "control_line");
                    control_line.append(clean_log);
                    control_line.append(hide_log);

                    $(hide_log).unbind("click");
                    $(hide_log).bind("click", function() {
                        $("#notifications_wrapper").hide(200, function() {
                            $("#notifications_wrapper").remove();
                        });

                    });

                    $(clean_log).bind("click", function() {
                        self.CleanLog()
                    });

                    $(notificationsContainer).append(control_line);
                }
            },
            error: function(jqXHR, status, error) {
                response = "Unknown error. Server disconnected?"
                alert(response);

            }
        }) // End of xmlrpc call


        return true;
    }

    this.DisplayTopImageButtons = function DisplayTopImageButtons() {}
}