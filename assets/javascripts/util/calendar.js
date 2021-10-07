function Calendar(container, height) {
    const l10n = {
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

    this.container = container;
    this.height = height;

    this.activeDates = {};
 
    this.date = new Date();

    this.createSimpleElement = function(type, id, className) {
        element = document.createElement(type);
        if (id != undefined) {
            element.id = id;
        }

        if (className != undefined) {
            element.className = className;
        }

        return element;
        
    }

    this.createEntryNode = function(height, date, dayInMonth, dayOfWeek, activeDates) {
        var today = new Date();
        var colour = date.getFullYear() == today.getFullYear() && date.getDate() == today.getDate() 
                   ? "rgba(255,0,0,1.0)" 
                   : "rgba(255,0,0,0.5)";
                   
        var active = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` in activeDates;
        var html = `<div style="display:inline-block; position: relative; width:70px; height:${height}px; border:1px solid rgba(0,0,0,0.5); margin:10px;">` + 
            `<div style="display:inline-block; position: absolute; left:0px; top:0px;  width:70px; height:26px; color:white; background-color:${colour}; text-align:center">` +
            `<label>${dayInMonth}</label>` +
            `</div>` +
            `<div style="display:inline-block; position: absolute; top:25px; font-size:10px; left:0px; width:70px; height:20px; color:white; background-color:${colour};` + 
                ` text-align:center; border-top:dotted 1px white; padding-top: 2px;">` +
            `<label>${dayOfWeek}</label>` +
            `</div>` +
            `<div id="" style="display:inline-block; position: absolute; top:64px; font-size:10px; right:2px; height:10px; color:black; background-color:white; cursor:pointer;"` +
                `onclick="Calendar.display('${date.getFullYear()}','${dayInMonth}');"> ` +
                `<div class="fas ${active ? 'fa-eye' : 'fa-eye-slash'}"></div>` +
            `</div>` +
         `</div>`;
        
         return new DOMParser().parseFromString(html, 'text/html').body.childNodes[0];

    }

    this.daysInMonth = function (month, year) {
        return new Date(year, month, 0).getDate();
    }

    this.dayDayOfWeek = function (day, month, year) {
        return l10n.weekdays.longhand[(new Date(year, month, day).getDay())];
    }

    Calendar.display = function(year, dayInMonth) {
        alert(`${year}, ${dayInMonth}`);
    }

    Calendar.prototype.getMonthLong = function() {
        return `${l10n.months.longhand[this.date.getMonth()]}`;
    }

    Calendar.prototype.getYear = function () {
        return this.date.getFullYear();
    }

    Calendar.prototype.setup = function() {

        this.activeDates[`${this.date.getFullYear()}-${this.date.getMonth()}-${this.date.getDate()}`] = 0;

        var daysInMonth = this.daysInMonth(this.date.getMonth(), this.date.getFullYear());

        for (var dayOfMonth = 1; dayOfMonth < daysInMonth + 1; dayOfMonth++) {
            var node = this.createEntryNode(this.height,
                                            new Date(this.date.getFullYear(), this.date.getMonth(), dayOfMonth),
                                            dayOfMonth, 
                                            this.dayDayOfWeek(dayOfMonth, 
                                                              this.date.getMonth(), 
                                                              this.date.getFullYear()),
                                            this.activeDates);
            
            this.container.appendChild(node);

        }

    }

}
