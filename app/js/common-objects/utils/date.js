/*global _,$,define,App*/
define([
    'moment',
    'momentTimeZone',
    'common-objects/log'
], function (moment, momentTimeZone, Logger) {

    'use strict';

    var timeZone = App.config.timeZone || 'CET';

    Logger.log('DATE', 'Using timezone ' + timeZone + ' and locale ' + App.config.locale);

    moment.locale(App.config.locale);

    return {

        /**
         * Format a given date (date or timestamp value) with user timeZone
         * */
        formatTimestamp: function (format, timestamp) {
            if (!timestamp) {
                return '';
            }
            try {
                // set the timezone to be the current one (problem with daylight saving time)
                // and return the string with the format specified
                var timestampOffset = moment(timestamp).tz(timeZone).utcOffset();
                return moment.utc(timestamp).utcOffset(timestampOffset).format(format);
            } catch (error) {
                console.error('date.formatTimestamp(' + format + ', ' + timestamp + ')', error);
                return timestamp;
            }
        },

        /**
         * get date object from HTML date input
         * */
        getDateFromDateInput: function (value) {
            return moment(value, 'YYYY-MM-DD').toDate();
        },

        formatShort: function (input) {
            return input ? moment(input).format('YYYY-MM-DD') : null;
        },

        getMainZonesDates: function (timestamp) {
            var mainZones = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Europe/Moscow', 'Asia/Tokyo'];
            var mainZonesDates = [];

            _(mainZones).each(function (zone) {
                mainZonesDates.push({
                    name: zone,
                    date: moment.utc(timestamp).tz(zone).format(App.config.i18n._DATE_FORMAT)
                });
            });

            mainZonesDates.push({
                name: timeZone + ' (yours)',
                date: moment.utc(timestamp).tz(timeZone).format(App.config.i18n._DATE_FORMAT)
            });

            mainZonesDates.push({
                name: 'locale',
                date: moment(timestamp).format(App.config.i18n._DATE_FORMAT)
            });

            mainZonesDates.push({
                name: 'utc',
                date: moment.utc(timestamp).format(App.config.i18n._DATE_FORMAT)
            });

            return mainZonesDates;
        },

        dateHelper: function ($querySelector) {
            this.dateHelperWithPlacement($querySelector, 'top');
        },

        dateHelperWithPlacement: function ($querySelector, placement) {

            $querySelector.each(function () {
                var _date = $(this).text();

                //var dateUTCWithOffset = moment.utc(_date, App.config.i18n._DATE_FORMAT).toDate().getTime();
                //moment(dateUTCWithOffset).utc();

                var utcDate = moment(_date, App.config.i18n._DATE_FORMAT).utc();
                var fromNow = utcDate.fromNow();

                $(this).popover({
                    title: '<b>' + timeZone + '</b><br /><i class="fa fa-clock-o"></i> ' + _date + '<br />' + fromNow,
                    html: true,
                    content: '<b>UTC</b><br /><i class="fa fa-clock-o"></i>  ' + utcDate.format(App.config.i18n._DATE_FORMAT),
                    trigger: 'manual',
                    placement: placement
                }).click(function (e) {
                    $(this).popover('show');
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            });
        }

    };
});
