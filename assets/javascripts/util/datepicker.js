var LEFT_ARROW = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAIVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABt0UjBAAAACnRSTlMAAQOUl5q3vMDcYnh4SwAAADtJREFUCJljYEAGjB5QhugqqEDUKpjAKpjAKpgAhGEFY2TBGOowBlMVlAESYoAJMcCEoAymSpj1QgwMAGVDE81FChz9AAAAAElFTkSuQmCCcnmx5tud6fi5jyiqpzefskf5t2snhynvsaj7ioqwfvu5nza";
var RIGHT_ARROW = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAIVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABt0UjBAAAACnRSTlMAAQOUl5q3vMDcYnh4SwAAAEFJREFUCFtjYIADDkcog2upAJSxKhDGgApxrYIKARkQISBjlQGMkQBlLFeAMoqgiiECQEYR1ECoAAMnVICBCWIBAIEPE827Ja8hAAAAAElFTkSuQmCC";

function DatePicker (config) {

    var self = this,
    elements,
    createInstance;

    this.instances = {};

    this.config = config;

    DatePicker.prototype = DatePicker.init.prototype;

    documentClick = function (event) {
 
        if (event.target.classList.contains('datepickr-prev-month') ||
            event.target.classList.contains('datepickr-next-month')) {
            return;
        }

        var keys = Object.keys(self.instances);

        for (var key in keys) {
            if (event.target.id == keys[key]) {
                self.instances[event.target.id].show();
            } else {
               self.instances[keys[key]].close();
            }       
        }

    };
 
    document.addEventListener( 'click', documentClick, false);
 
    createInstance = function (element) {
        if (element._datepickr) {
            element._datepickr.destroy();
        }

        console.log(`Adding : ${element.id}`);

        element._datepickr = new DatePicker.init(self.instances, element, config);
        
        self.instances[element.id] = element._datepickr;

    }; 

    this.decorate = function(selector) {

        if (selector.nodeName) {
            createInstance(selector);
            return self.instances;
        }
    
        for (var iElement = 0; i < elements.length; i++) {
            createInstance(elements[i]);
        }
    
        return instances;
    
    }

}

/**
 * @constructor
 */
DatePicker.init = function (instances, element, instanceConfig) {

    this.instances = instances;
    this.element = element;
    this.id = element.id;

    this.calendar = document.createElement('table');
    this.calendar.id =`calendar-${element.id}`;
    this.calendarBody = document.createElement('tbody');
    this.navigationCurrentMonth = document.createElement('span');
 
    var self = this,
        defaultConfig = {
            dateFormat: 'F j, Y',
            altFormat: null,
            altInput: null,
            minDate: null,
            maxDate: null,
            shorthandCurrentMonth: false
        },
        currentDate = new Date(),
        date,
        formatDate,
        monthToStr,
        isSpecificDay,
        calendarClick,
        destroy;

    self.calendarContainer = document.createElement('div'),
    self.calendarContainer.id = `calendar-container-${element.id}`;
    self.calendarContainer.className = 'datepickr-calendar';
    self.navigationCurrentMonth.className = 'datepickr-current-month';

    instanceConfig = instanceConfig || {};

    self.wrap = function () {
        self.wrapperElement = document.createElement('div');
        self.wrapperElement.id = `wrapper-${self.element.id}`;
        self.wrapperElement.className = 'datepickr-wrapper';
        self.element.parentNode.insertBefore(self.wrapperElement, self.element);
        self.wrapperElement.appendChild(self.element);
    };

    date = {
        current: {
            year: function () {
                return currentDate.getFullYear();
            },
            month: {
                integer: function () {
                    return currentDate.getMonth();
                },
                string: function (shorthand) {
                    var month = currentDate.getMonth();
                    return monthToStr(month, shorthand);
                }
            },
            day: function () {
                return currentDate.getDate();
            }
        },
        month: {
            string: function () {
                return monthToStr(self.currentMonthView, self.config.shorthandCurrentMonth);
            },
            numDays: function () {
                // checks to see if february is a leap year otherwise return the respective # of days
                return self.currentMonthView === 1 && (((self.currentYearView % 4 === 0) && (self.currentYearView % 100 !== 0)) || (self.currentYearView % 400 === 0)) ? 29 : self.l10n.daysInMonth[self.currentMonthView];
            }
        }
    };

    formatDate = function (dateFormat, milliseconds) {
        var formattedDate = '',
            dateObj = new Date(milliseconds),
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

        self.forEach(formatPieces, function (formatPiece, index) {
            if (formats[formatPiece] && formatPieces[index - 1] !== '\\') {
                formattedDate += formats[formatPiece]();
            } else {
                if (formatPiece !== '\\') {
                    formattedDate += formatPiece;
                }
            }
        });

        return formattedDate;
    };

    monthToStr = function (date, shorthand) {
        if (shorthand === true) {
            return self.l10n.months.shorthand[date];
        }

        return self.l10n.months.longhand[date];
    };

    isSpecificDay = function (day, month, year, comparison) {
        return day === comparison && self.currentMonthView === month && self.currentYearView === year;
    };

    self.buildWeekdays = function () {
        var weekdayContainer = document.createElement('thead'),
            firstDayOfWeek = self.l10n.firstDayOfWeek,
            weekdays = self.l10n.weekdays.shorthand;

        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
            weekdays = [].concat(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
        }

        weekdayContainer.innerHTML = '<tr><th>' + weekdays.join('</th><th>') + '</th></tr>';
        self.calendar.appendChild(weekdayContainer);
    };

    self.buildDays = function (calendarBody) {
        var firstOfMonth = new Date(self.currentYearView, self.currentMonthView, 1).getDay(),
            numDays = date.month.numDays(),
            calendarFragment = document.createDocumentFragment(),
            row = document.createElement('tr'),
            dayCount,
            dayNumber,
            today = '',
            selected = '',
            disabled = '',
            currentTimestamp;

        // Offset the first day by the specified amount
        firstOfMonth -= self.l10n.firstDayOfWeek;
        if (firstOfMonth < 0) {
            firstOfMonth += 7;
        }

        dayCount = firstOfMonth;

        calendarBody.innerHTML = '';

        // Add spacer to line up the first day of the month correctly
        if (firstOfMonth > 0) {
            row.innerHTML += '<td colspan="' + firstOfMonth + '">&nbsp;</td>';
        }

        // Start at 1 since there is no 0th day
        for (dayNumber = 1; dayNumber <= numDays; dayNumber++) {
            // if we have reached the end of a week, wrap to the next line
            if (dayCount === 7) {
                calendarFragment.appendChild(row);
                row = document.createElement('tr');
                dayCount = 0;
            }

            today = isSpecificDay(date.current.day(), date.current.month.integer(), date.current.year(), dayNumber) ? ' today' : '';
            
            if (self.selectedDate) {
                selected = isSpecificDay(self.selectedDate.day, self.selectedDate.month, self.selectedDate.year, dayNumber) ? ' selected' : '';
            }

            if (self.config.minDate || self.config.maxDate) {
                currentTimestamp = new Date(self.currentYearView, self.currentMonthView, dayNumber).getTime();
                disabled = '';

                if (self.config.minDate && currentTimestamp < self.config.minDate) {
                    disabled = ' disabled';
                }

                if (self.config.maxDate && currentTimestamp > self.config.maxDate) {
                    disabled = ' disabled';
                }
            }

            row.innerHTML += '<td class="' + today + selected + disabled + '"><span class="datepickr-day">' + dayNumber + '</span></td>';
            dayCount++;
        }

        calendarFragment.appendChild(row);
        calendarBody.appendChild(calendarFragment);

    };

    self.updateNavigationCurrentMonth = function (navigationCurrentMonth) {
         navigationCurrentMonth.innerHTML = date.month.string() + ' ' + self.currentYearView;
     };

    self.buildMonthNavigation = function () {
        var months = document.createElement('div'),
            monthNavigation;

        monthNavigation  = `<span class="datepickr-prev-month">&lt;</span>`;
        monthNavigation += '<span class="datepickr-next-month">&gt;</span>';

        months.className = 'datepickr-months';
        months.innerHTML = monthNavigation;

        months.appendChild(self.navigationCurrentMonth);
        
        self.updateNavigationCurrentMonth(self.navigationCurrentMonth);
        self.calendarContainer.appendChild(months);
    };

    self.handleYearChange = function () {
        if (self.currentMonthView < 0) {
            self.currentYearView--;
            self.currentMonthView = 11;
        }

        if (self.currentMonthView > 11) {
            self.currentYearView++;
            self.currentMonthView = 0;
        }
    };

    calendarClick = function (event) {
        var target = event.target,
            targetClass = target.className,
            currentTimestamp;

        console.log(`CalendarClick: ${targetClass}`);

        if (targetClass) {
            if (targetClass === 'datepickr-prev-month' || targetClass === 'datepickr-next-month') {
                if (targetClass === 'datepickr-prev-month') {
                    self.currentMonthView--;
                } else {
                    self.currentMonthView++;
                }

                self.handleYearChange();
     
                self.updateNavigationCurrentMonth(document.getElementById(self.wrapperElement.id).
                                                  getElementsByClassName('datepickr-current-month')[0]);
    
                self.buildDays(document.getElementById(self.wrapperElement.id).getElementsByTagName('tbody')[0]);

            } else if (targetClass === 'datepickr-day' && !self.hasClass(target.parentNode, 'disabled')) {
                self.selectedDate = {
                    day: parseInt(target.innerHTML, 10),
                    month: self.currentMonthView,
                    year: self.currentYearView
                };

                currentTimestamp = new Date(self.currentYearView, self.currentMonthView, self.selectedDate.day).getTime();

                if (self.config.altInput) {
                    if (self.config.altFormat) {
                        self.config.altInput.value = formatDate(self.config.altFormat, currentTimestamp);
                    } else {
                        // I don't know why someone would want to do this... but just in case?
                        self.config.altInput.value = formatDate(self.config.dateFormat, currentTimestamp);
                    }
                }
                
                document.getElementById(self.id).value = formatDate(self.config.dateFormat, currentTimestamp);
  
                self.close();

            }
        }
    };

    self.buildCalendar = function () {
        self.buildMonthNavigation();
        self.buildWeekdays();
        self.buildDays(self.calendarBody);

        self.calendar.appendChild(self.calendarBody);
        self.calendarContainer.appendChild(self.calendar);

        self.wrapperElement.appendChild(self.calendarContainer);

    };

    this.show = function () {
        document.getElementById(self.wrapperElement.id).classList.add('open');
        document.getElementById(self.calendarContainer.id).addEventListener('mousedown', calendarClick, false);

        console.log(`${self.wrapperElement.className} : ${self.wrapperElement.id}`);
    };

    this.close = function () {
        
        if (document.getElementById(self.wrapperElement.id)) {
            document.getElementById(self.wrapperElement.id).classList.remove('open');
        }

    };

    destroy = function () {
        var parent,
            element;

        self.removeEventListener(self.element, 'focus', self.show, false);
        self.removeEventListener(self.element, 'blur', close, false);
        self.removeEventListener(self.element, 'click',  self.show, false);

        parent = self.element.parentNode;
        parent.removeChild(self.calendarContainer);
        element = parent.removeChild(self.element);
        parent.parentNode.replaceChild(element, parent);
        
    };

    self.init = function () {
        var config,
            parsedDate;

        self.config = {};
        self.destroy = destroy;

        for (config in defaultConfig) {
            self.config[config] = instanceConfig[config] || defaultConfig[config];
        }

        self.element = element;

        if (self.element.value) {
            parsedDate = Date.parse(self.element.value);
        }

        if (parsedDate && !isNaN(parsedDate)) {
            parsedDate = new Date(parsedDate);
            self.selectedDate = {
                day: parsedDate.getDate(),
                month: parsedDate.getMonth(),
                year: parsedDate.getFullYear()
            };
            self.currentYearView = self.selectedDate.year;
            self.currentMonthView = self.selectedDate.month;
            self.currentDayView = self.selectedDate.day;
        } else {
            self.selectedDate = null;
            self.currentYearView = date.current.year();
            self.currentMonthView = date.current.month.integer();
            self.currentDayView = date.current.day();
        }

        self.wrap();
        self.buildCalendar();
    };

    self.init();

    return self;
};

DatePicker.init.prototype = {
    hasClass: function (element, className) { return element.classList.contains(className); },
    addClass: function (element, className) { element.classList.add(className); },
    removeClass: function (element, className) { element.classList.remove(className); },
    forEach: function (items, callback) { [].forEach.call(items, callback); },
    isArray: Array.isArray,
    addEventListener: function (element, type, listener, useCapture) {
        element.addEventListener(type, listener, useCapture);
    },
    removeEventListener: function (element, type, listener, useCapture) {
        console.log('removeEventListener');
 //       element.removeEventListener(type, listener, useCapture);
    },
    l10n: {
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
    }
    
};