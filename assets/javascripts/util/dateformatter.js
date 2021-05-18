function DateFormatter(dateFormat, milliseconds) {
    var self = this;
    this.formattedDate = '';
        
    var l10n = {
        weekdays: {
            shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        months: {
            shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        firstDayOfWeek: 0
    };

    var monthToStr = function (date, shorthand) {
        if (shorthand === true) {
            return l10n.months.shorthand[date];
        }

        return l10n.months.longhand[date];
    };

    var dateObj = new Date(milliseconds),
        forEach = function (items, callback) { [].forEach.call(items, callback); },
        formats = {
            d: function () {
                var day = formats.j();
                return (day < 10) ? '0' + day : day;
            },
            D: function () {
                return self.l10n.weekdays.shorthand[formats.w()];
            },
            j: function () {
                return dateObj.getDate();
            },
            l: function () {
                return self.l10n.weekdays.longhand[formats.w()];
            },
            w: function () {
                return dateObj.getDay();
            },
            F: function () {
                return monthToStr(formats.n() - 1, false);
            },
            m: function () {
                var month = formats.n();
                return (month < 10) ? '0' + month : month;
            },
            M: function () {
                return monthToStr(formats.n() - 1, true);
            },
            n: function () {
                return dateObj.getMonth() + 1;
            },
            U: function () {
                return dateObj.getTime() / 1000;
            },
            y: function () {
                return String(formats.Y()).substring(2);
            },
            Y: function () {
                return dateObj.getFullYear();
            }
        },
        formatPieces = dateFormat.split('');

        forEach(formatPieces, function (formatPiece, index) {
                if (formats[formatPiece] && formatPieces[index - 1] !== '\\') {
                    self.formattedDate += formats[formatPiece]();
                } else {
                    if (formatPiece !== '\\') {
                        self.formattedDate += formatPiece;
                    }
                }
        });

};

DateFormatter.prototype.getFormattedDate = function() {
    
    return this.formattedDate;

};
