odoo.define('attendance_state.systray_attendance', function (require) {
    "use strict";

    var core = require('web.core');
    var SystrayMenu = require('web.SystrayMenu');
    var Widget = require('web.Widget');
    var rpc = require('web.rpc');
    var session = require('web.session');
    var field_utils = require('web.field_utils');

    var _t = core._t;

    var AttendanceIndicator = Widget.extend({
        template: 'attendance_state.SystrayAttendance',
        events: {
            'click .o_attendance_toggle': '_onToggleAttendance',
        },
        init: function () {
            this._super.apply(this, arguments);
            this.attendance_state = 'checked_out';
            this.last_check_in = false;
            this.total_today = 0.0;
            this.elapsed_time = "00:00";
            this.total_today_display = "00:00";
            this._timer = null;
        },
        willStart: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                return self._updateAttendanceState();
            });
        },
        start: function () {
            this._startTimer();
            return this._super.apply(this, arguments);
        },
        destroy: function () {
            this._stopTimer();
            this._super.apply(this, arguments);
        },
        _updateAttendanceState: function () {
            var self = this;
            return rpc.query({
                model: 'hr.employee',
                method: 'get_attendance_data',
                args: [],
                context: session.user_context,
            }).then(function (result) {
                if (result) {
                    self.attendance_state = result.attendance_state;
                    self.last_check_in = result.last_check_in ? field_utils.parse.datetime(result.last_check_in) : false;
                    self.total_today = result.total_today;
                    self._updateTimerValues();
                    if (self.$el) {
                        self.$el.show();
                    }
                } else {
                    if (self.$el) {
                        self.$el.hide();
                    }
                }
            });
        },
        _startTimer: function () {
            var self = this;
            this._timer = setInterval(function () {
                if (self.attendance_state === 'checked_in') {
                    self._updateTimerValues();
                    self._updateUI();
                }
            }, 10000); // Update every 10 seconds
        },
        _stopTimer: function () {
            if (this._timer) {
                clearInterval(this._timer);
            }
        },
        _updateTimerValues: function () {
            if (this.attendance_state === 'checked_in' && this.last_check_in) {
                var now = new Date();
                var diff = (now - this.last_check_in) / 1000 / 3600; // in hours
                this.elapsed_time = this._formatDuration(diff);
                this.total_today_display = this._formatDuration(this.total_today + diff);
            } else {
                this.elapsed_time = "00:00";
                this.total_today_display = this._formatDuration(this.total_today);
            }
        },
        _formatDuration: function (hours) {
            var h = Math.floor(hours);
            var m = Math.floor((hours - h) * 60);
            return _.str.pad(h, 2, '0') + ":" + _.str.pad(m, 2, '0');
        },
        _updateUI: function () {
            if (this.$el) {
                this.$('.o_elapsed_time').text(this.elapsed_time);
                this.$('.o_total_today').text(this.total_today_display);
            }
        },
        _onToggleAttendance: function (ev) {
            ev.preventDefault();
            var self = this;
            return rpc.query({
                model: 'hr.employee',
                method: 'systray_attendance_toggle',
                args: [],
            }).then(function () {
                self._updateAttendanceState().then(function () {
                    self.renderElement();
                });
            });
        },
    });

    SystrayMenu.Items.push(AttendanceIndicator);

    return AttendanceIndicator;
});
