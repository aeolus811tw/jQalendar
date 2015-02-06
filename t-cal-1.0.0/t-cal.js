$.widget("aekt.tcalendar", {
	options: {
		date: new Date(),
		mode: "m",
		debug: false,
		agenda: []
	},
	_millisec_day: 86400000,
	_weekCellWidth: [0, 0, 0, 0, 0, 0, 0],
	_todayDatePicker: null,
	_modeChanger: null,
	_weekNameFull: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	_weekNameShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	_monthNameFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	_monthNameShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
	_mode: {
		y: {
			name: "Year",
			func: {
				grid: "_yearGrid",
				dimension: "_yearDimension",
				date: "_yearDate",
				refresh: "_yearRefresh",
				next: "_yearNext",
				prev: "_yearPrev"
			}
		},
		m: {
			name: "Month",
			func: {
				grid: "_monthGrid",
				dimension: "_monthDimension",
				date: "_monthDate",
				refresh: "_monthRefresh",
				next: "_monthNext",
				prev: "_monthPrev"
			}
		},
		w: {
			name: "Week",
			func: {
				grid: "_weekGrid",
				dimension: "_weekDimension",
				date: "_weekDate",
				refresh: "_weekRefresh",
				next: "_weekNext",
				prev: "_weekPrev"
			}
		},
		d: {
			name: "Day",
			func: {
				grid: "_dayGrid",
				dimension: "_dayDimension",
				date: "_dayDate",
				refresh: "_dayRefresh",
				next: "_monthNext",
				prev: "_monthPrev"
			}
		},
		a: {
			name: "Agenda",
			func: {
				grid: "_agendaGrid",
				dimension: "_agendaDimension",
				refresh: "_agendaRefresh",
				next: "_agendaNext",
				prev: "_agendaPrev"
			}
		}
	},
	_create: function() {
		var $this = this;
		$this.element.children().remove(); //remove everything within the target
		$this.element.addClass("tcal-caledar"); //setup plugin class
		$this.element.data("index", $(".tcal-calendar").length + 1);
		//add the header grid
		//setup base structure
		var index = $this.element.data("index");
		var $header = $("<div/>", {
			"class": "tcal-header",
			"id": "tcal-header-" + index
		}); //the header space
		//header title
		var $titleWrapper = $("<div/>", {
			'class': 'tcal-header-title-container'
		});
		var $primaryTitle = $("<span/>", {
			'class': 'tcal-header-primary-title',
			html: 'Month'
		});
		var $secondaryTitle = $("<span/>", {
			'class': 'tcal-header-secondary-title',
			html: 'Year'
		});
		$titleWrapper.append($primaryTitle).append($secondaryTitle);
		//next month button
		var $nextBtn = $("<button/>", {
			'class': 'tcal-next-btn',
			html: '>'
		}).button().click(function(e) {
			$this.next();
		});
		//previous month button
		var $prevBtn = $("<button/>", {
			'class': 'tcal-prev-btn',
			html: '<'
		}).button().click(function(e) {
			$this.prev();
		});
		//today button
		var $todayBtn = $("<button/>", {
			'class': 'tcal-today-btn',
			html: 'Today'
		}).button().click(function(e) {
			$this.options.date = new Date();
			$this.datefix();
			$this.refresh();
			$this._trigger("today");
		});
		this._todayDatePicker = $("<input/>", {
			'class': 'tcal-today-field',
			placeholder: 'MM/DD/YYYY'
		});
		this._todayDatePicker.datepicker({
			constrainInput: true,
			dateFormat: "mm/dd/yy",
			numberOfMonths: 1,
			onSelect: function(dateText, pickerInst) {
				$this.options.date = $todayField.datepicker("getDate");
				$this.datefix();
				$this.refresh();
				$this._trigger("today");
			}
		}).datepicker("setDate", $this.options.date);



		var $grid = $("<div/>", {
			"class": "tcal-grid",
			"id": "tcal-grid-" + index
		}); //the grid space
		var headerExt = $("<div/>", {
			"class": "tcal-header-ext"
		}); //this is used for adding extra info between header and the grid
		$this.element.append($header).append(headerExt).append($grid); //compose the structure

		//setup mode changer
		$this._modeChanger = $("<span/>", {
			"class": "tcal-header-modechanger",
			id: "tcal-header-modechanger-" + index,
			html: ""
		});
		for (var i in $this._mode) {
			var $input = $("<input/>", {
				type: "radio",
				id: "tcal-header-" + index + "-" + i,
				name: "tcal-header-" + index + "-modechanger",
				value: i
			}).data("mode", i);
			var $label = $("<label/>", {
				"for": "tcal-header-" + index + "-" + i,
				html: $this._mode[i].name
			});
			$this._modeChanger.append($input).append($label);
			if (i === $this.options.mode) {
				$input.prop("checked", true);
			} else {
				$input.prop("checked", false);
			}
		}
		$this._modeChanger.buttonset();
		$this._modeChanger.find(":input").change(function(e) {
			$this.changeMode($(this).data("mode"));
		});

		//more function button
		//setup the more function menu
		var $moreMenu = $("<ul/>");
		var $printOption = $("<li/>", {
			html: "Print"
		});
		var $refreshOption = $("<li/>", {
			html: "Refresh"
		});
		$moreMenu.append($printOption).append($refreshOption);
		$moreMenu.hide().menu();
		var $moreBtn = $("<button/>", {
				'class': 'tcal-more-func-btn',
				html: 'More'
			}).button({
				icons: {
					secondary: "ui-icon-triangle-1-s"
				}
			})
			.click(function() {
				var menu = $moreMenu.show().position({
					my: "right top",
					at: "right bottom",
					of: this
				});
				$(document).one("click", function() {
					$moreMenu.hide();
				});
				return false;
			});
		$header.append($todayBtn).append(this._todayDatePicker).append($prevBtn).append($nextBtn).append($moreBtn)
			.append($moreMenu).append($this._modeChanger).append($titleWrapper);
		$header.append($("<div/>"));

		$this.gridfix();
		$this.datefix();
		$this.refresh();

		$(window).resize(function(e) { //setup grid size
			var viewport_h = $(window).height();
			var header_h = $header.height();
			$grid.css("height", (viewport_h - header_h - 40) + "px");
			$this.dimensionfix();
		}).resize();
	},
	_setOption: function(key, value) {
		this.options[key] = value;
	},
	//the destroy function
	destroy: function() {
		this.element.children().remove();
		this.element.removeClass("tcal-caledar");
		this.element.data("index", "");
		$.Widget.prototype.destroy.call(this);
	},
	//main public functions
	addAgenda: function(data) {
		//verify basic information exists
		try {
			if (this._verifyAgenda(data)) {
				if (this.options.debug) {
					console.log("addAgenda:" + data.startDate.toString() + " to " + data.endDate.toString());
				}
				//we have verified basic information now we add the agenda into the list and refresh the view
				this.options.agenda.push(data);
			}
			this.refresh(); //reresh the view
		} catch (err) {
			if (this.options.debug)
				console.log(err);
		}
	},
	getAgendaById: function(id) {
		var agenda;
		$.each(this.options.agenda, function(index, val) {
			if (val.id == id)
				agenda = val;
		});
		return agenda;
	},
	updateAgendaById: function(id, data) {
		var agendaIndex = -1;
		$.each(this.options.agenda, function(index, val) {
			if (val.id == data.id)
				agendaIndex = index;
		});
		if (agendaIndex >= 0) {
			$.extend(true, this.options.agenda[agendaIndex], data);
			if (this.options.debug) {
				console.log("updateAgendaById: updated Agenda with Id " + id);
			}
			return this.options.agenda[agendaIndex];
		}
		if (this.options.debug) {
			console.log("updateAgendaById: no agenda with Id " + id + " was found.");
		}

	},
	changeMode: function(mode){
		if (this._mode[mode]){
			this._modeChanger.find("input").prop("checked", false);
			this._modeChanger.find("input[value="+mode+"]").prop("checked", true);
			this._modeChanger.buttonset("refresh");
			this.options.mode = mode;
			this.gridfix();
			this.dimensionfix();
			this.datefix();
			this.refresh();
		}
	},
	refresh: function() {
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.refresh) {
			this[this._mode[this.options.mode].func.refresh]();
		}
	},
	gridfix: function() {
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.grid) {
			this[this._mode[this.options.mode].func.grid]();
		}
	},
	dimensionfix: function() {
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.dimension) {
			this[this._mode[this.options.mode].func.dimension]();
		}
	},
	datefix: function() {
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.date) {
			this[this._mode[this.options.mode].func.date]();
		}
	},
	next: function() {
		var $this = this;
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.next) {
			this[this._mode[this.options.mode].func.next]();
		}
		$this.datefix();
		$this.refresh();
	},
	prev: function() {
		var $this = this;
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.prev) {
			this[this._mode[this.options.mode].func.prev]();
		}
		$this.datefix();
		$this.refresh();
	},
	//event callback methods
	_onAgendaClick: function(srcObj) {
		var $srcObj = $(srcObj);
		this._trigger("agendaClick", null, [$(srcObj), this.getAgendaById($srcObj.data("id"))]);
	},
	_onAgendaMouseEnter: function(srcObj) {
		var $srcObj = $(srcObj);
		this._trigger("agendaMouseEnter", null, [$(srcObj), this.getAgendaById($srcObj.data("id"))]);
		this.dimensionfix();
	},
	_onAgendaMouseExit: function(srcObj) {
		var $srcObj = $(srcObj);
		this._trigger("agendaMouseExit", null, [$(srcObj), this.getAgendaById($srcObj.data("id"))]);
	},
	//basic utility function
	_isToday: function(date) {
		var today = new Date();
		var result = ((date.getMonth() == today.getMonth()) && (date.getFullYear() == today.getFullYear()) && (date.getDate() == today.getDate()));
		return result;
	},
	_isSameDay: function(dateA, dateB) {
		var result = ((dateA.getMonth() == dateB.getMonth()) && (dateA.getFullYear() == dateB.getFullYear()) && (dateA.getDate() == dateB.getDate()));
		return result;
	},
	_sortAgendaByDate: function(a, b) {
		var aStartTime = a.startDate.getTime();
		var bStartTime = b.startDate.getTime();
		var aEndTime = a.endDate.getTime();
		var bEndTime = b.endDate.getTime();
		return ((aStartTime < bStartTime) ? -1 : ((aStartTime > bStartTime) ? 1 : ((aEndTime < bEndTime) ? -1 : ((aEndTime > bEndTime) ? 1 : 0))));
	},
	_verifyAgenda: function(data) {
		if (typeof data.id === "undefined") {
			throw "missing id field";
		} else {
			$.each(this.options.agenda, function(index, val) {
				if (val.id == data.id)
					throw "cannot have duplicated id, each id must be unique";
			});
		}
		if (data.startDate) {
			if (typeof data.startDate == "string")
				data.startDate = new Date(data.startDate);
			else if (typeof data.startDate == "object")
				1 == 1; //do nothing because we are all good
			else
				throw "invalid startDate detected";

		} else {
			throw "missing startDate field";
		}
		if (typeof data.title === "undefined") {
			throw "missing title field";
		}
		if (data.endDate) {
			if (typeof data.endDate == "string")
				data.endDate = $.datepicker.parseDate("yy-mm-dd", data.endDate);
			else if (typeof data.endDate == "object")
				1 == 1; //do nothing because we are all good
			else
				throw "invalid endDate field detected";
		} else {
			throw "missing endDate field";
		}
		if (data.endDate.getTime() <= data.startDate.getTime())
			throw "endDate must be greater than startDate";
		if (typeof data.allDay !== "boolean") {
			throw "invalid allDay field field, must be a boolean value";
		}
		if (typeof data.repeat != "object") {
			throw "invalid repeat field detected";
		}
		if (typeof data.color !== "string") {
			throw "invalid color field detected, must be a valid CSS color string";
		}
		if (typeof data.calendar != "string") {
			throw "invalid calendar field detected, must be a string value";
		}
		return true;
	},
	//main utility private function for agenda view
	_agendaGrid: function(){
		var $grid = this.element.find(".tcal-grid");
		var $scrollpanel = $("<div/>", {"class": "tcal-grid-agenda-scrollpanel"}).css("overflow", "auto");
		var $staticpanel_content = $("<div/>", {"class": "tcal-grid-agenda-content"});
		var $headerExt = this.element.find(".tcal-header-ext");
		$grid.children().remove();
		$grid.append($scrollpanel);
		$scrollpanel.append($staticpanel_content);
		$headerExt.children().remove(); // clear header ext
	},
	_agendaDimension: function(){
		var $_this = this;
		var $grid = this.element.find(".tcal-grid").css("width", $_this.element.width() - 20);
		var actual_height = $grid.height();
		var $scrollpanel_content = $grid.find(".tcal-grid-agenda-content");
		var $scrollpanel = $grid.find(".tcal-grid-agenda-scrollpanel");
		$scrollpanel.css("width", $grid.width() + 15).css("height", actual_height);
		$scrollpanel_content.find(".tcal-view-agenda").css("width", $grid.width());
	},
	_agendaPrev: function(){
		
	},
	_agendaNext: function(){
		
	},
	_agendaRefresh: function(){
		var $this = this;
		var $grid = this.element.find(".tcal-grid");
		var $scrollpanel_content = $grid.find(".tcal-grid-agenda-content");
		var todayYear = $this.options.date.getFullYear();
		var todayDate = $this.options.date.getDate();
		var todayMonth = $this.options.date.getMonth();
		var firstDayOfList = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0);
		var dayAfterLastFilterDay = new Date(firstDayOfList.getTime() + $this._millisec_day * 120); // we display agenda that is operating for the next 120 days
		var filteredAgenda = $.grep($this.options.agenda, function(agenda, index) {
			var startInRange = (agenda.startDate.getTime() < dayAfterLastFilterDay.getTime() && agenda.startDate.getTime() >= firstDayOfList.getTime());
			var endInRange = (agenda.endDate.getTime() < dayAfterLastFilterDay.getTime() && agenda.endDate.getTime() > firstDayOfList.getTime());
			var crossedInRange = (agenda.startDate.getTime() < firstDayOfList.getTime() && agenda.endDate.getTime() > dayAfterLastFilterDay.getTime());
			return (startInRange || endInRange || crossedInRange);
		});
		$.each(filteredAgenda, function(index, agenda){
			//for every agenda we generate the agenda cell and put it into scrollpanel
			var $agenda = $("<div/>", {"class": "tcal-view-agenda"});
			$agenda.css("width", $grid.width());
			var $agendaStartDate = $("<div/>", {"class": "tcal-view-agenda-startdate"});
			var $agendaStartDateSpan = $("<span/>", {html: agenda.startDate.toDateString()})
				.data("year", agenda.startDate.getFullYear())
				.data("month", (agenda.startDate.getMonth() + 1))
				.data("day", agenda.startDate.getDate())
				.click(function(e){
					var _$this = $(this);
					$this._todayDatePicker.datepicker("setDate", _$this.data("month")+"/"+_$this.data("day")+"/"+_$this.data("year"));
					$this.changeMode("d");
				});
			$agendaStartDate.append($agendaStartDateSpan);
			var $agendaEndDate = $("<div/>", {"class":"tcal-view-agenda-enddate"});
			$agendaEndDate.html(agenda.allDay?"All Day": agenda.endDate.toLocaleTimeString() + " - " + agenda.startDate.toLocaleTimeString());
			var $agendaLabel = $("<div/>", {"class" : "tcal-view-agenda-label"});
			var $agendaLabelSpan = $("<span/>", {html: agenda.title}).data("id", agenda.id);
			$agendaLabelSpan.click(function(e) {
				$this._onAgendaClick(this);
			}).hover(function() {
				$this._onAgendaMouseEnter(this);
			}, function() {
				$this._onAgendaMouseExit(this);
			});
			$agendaLabel.append($agendaLabelSpan);
			$agenda.append($agendaStartDate).append($agendaEndDate).append($agendaLabel);
			$scrollpanel_content.append($agenda);
		});
	},
	//main utility private function for day view
	_dayGrid: function(){
		var $grid = this.element.find(".tcal-grid");
		var $scrollpanel = $("<div/>", {
			"class": "tcal-grid-day-scrollpanel"
		}).css("overflow", "auto");
		var $staticpanel = $("<div/>", {
			"class": "tcal-grid-day-alldaypanel"
		}).css("position", "fixed").css("margin-top", "-1px");
		var $staticpanel_content = $("<div/>", {
			"class": "tcal-grid-day-content"
		});
		$grid.children().remove(); //clear grid
		$grid.append($scrollpanel);
		$scrollpanel.append($staticpanel).append($staticpanel_content);
		var $headerExt = this.element.find(".tcal-header-ext");
		$headerExt.children().remove(); // clear header ext
		//we need to generate a week header that marks out SUN to SAT
		$headerExt.append($("<div/>", {
			"class": "tcal-day-label-cell",
			html: "&nbsp;"
		}).css("border", "none"));
		$staticpanel.append($("<div/>", {
			"class": "tcal-day-label-cell",
			html: "<span class='tcal-day-label-text'></span>"
		}));
		var $cell = $("<div/>", {
			"class": "tcal-day-allday-cell"
		});
		$staticpanel.append($cell);
		$cell = $("<div/>", {
			"class": "tcal-day-header-cell",
			html: "<span class='tcal-day-header-cell-weekday'>" + this._weekNameShort[this.options.date.getDay()] + "</span><span class='tcal-day-header-cell-date'></span>"
		});
		$headerExt.append($cell);
		$headerExt.append($("<div/>", {
			"style": "clear:both;"
		})); //a empty div to clear the float
		//we need to generate total of 48x2 cells
		var hour = 0;
		for (var i = 0; i < 96; i++) {
			var $cell;
			if (i % 2 != 0) {
				$cell = $("<div/>", {
					"class": "tcal-day-halfhour-cell"
				});
			} else {
				if (i % 4 == 0) {
					if (hour < 10)
						$cell = $("<div/>", {
							"class": "tcal-day-label-cell",
							html: "<span class='tcal-day-label-text'>0" + hour + ":00</span>"
						});
					else
						$cell = $("<div/>", {
							"class": "tcal-day-label-cell",
							html: "<span class='tcal-day-label-text'>" + hour + ":00</span>"
						});
					hour = (hour + 1) % 24;
				} else {
					$cell = $("<div/>", {
						"class": "tcal-day-label-cell"
					});
				}
			}
			$staticpanel_content.append($cell);
		}
		$staticpanel_content.append($("<div/>").css("clear", "both"));
	},
	_dayDimension: function(){
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		$grid.css("width", $_this.element.width() - 20);
		var $scrollpanel = $_this.element.find(".tcal-grid-day-scrollpanel");
		var $staticpanel_content = $_this.element.find(".tcal-grid-day-content").css("width", $grid.width() + 1);
		var $alldaypanel = $scrollpanel.find(".tcal-grid-day-alldaypanel").css("width", $grid.width() + 1);
		var $headerExt = this.element.find(".tcal-header-ext");
		var actual_height = ($grid.height());
		var label_width = 52;
		var actual_width = ($grid.width() - label_width);
		var cell_height = Math.trunc(actual_height * 2.5 / 48);
		$scrollpanel.css("width", ($grid.width() + 15)).css("height", actual_height);
		$staticpanel_content.css("margin-top", (cell_height * 4 - 1))
		$headerExt.find(".tcal-day-header-cell").css("width", actual_width - 2);
		$headerExt.find(".tcal-day-label-cell").css("width", label_width);
		$scrollpanel.find(".tcal-day-label-cell").each(function(index) {
			var $this = $(this);
			var actualIndex = index - 1;
			$this.css("width", label_width).css("margin-right", "-1px");
			if (actualIndex < 0) {
				$this.css("height", cell_height * 4);
			} else {
				if (actualIndex % 2 == 0) {
					$this.css("border-bottom", "none");
				} else {
					$this.css("border-top", "none");
				}
				$this.css("height", cell_height);
			}
		});
		$scrollpanel.find(".tcal-day-allday-cell").css("width", actual_width).css("border-right", "1px solid #dedede").css("height", cell_height * 4);
		$scrollpanel.find(".tcal-day-halfhour-cell").css("width", actual_width).css("height", cell_height).css("border-right", "1px solid #dedede");
		$scrollpanel.find(".tcal-day-agenda-actual").each(function(index) {
			var $this = $(this);
			var $startCell = $this.parent();
			var attr = $this.data("width");
			var marginTop = $startCell.height() / 30 * attr.marginTopOffset;
			var width_pixel = (actual_width - 5 - attr.intersectCount * 4) / attr.intersectCount;
			$this.css("width", width_pixel)
				.css("margin-top", marginTop) //set the margin based on time offset
				.css("height", $startCell.height() * attr.numberCellHeight + (attr.numberCellHeight - 1) * 2) //set the height of the agenda
				.css("margin-left", attr.startedWidthUnit * (width_pixel + 4));
		});
	},
	_dayDate: function(){
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		var $headerExt = $_this.element.find(".tcal-header-ext");
		var dateMonth = $_this.options.date.getMonth(); //get today's month
		var dateDay = $_this.options.date.getDate(); //get today's day
		$headerExt.find(".tcal-day-header-cell-date").each(function(index, cell) {
			var $this = $(this);
			$(cell).html((dateMonth + 1) + "/" + (dateDay));
			if ($_this._isToday($_this.options.date)) {
				$this.addClass("tcal-day-today");
			} else {
				$this.removeClass("tcal-day-today");
			}
		});
		$grid.find(".tcal-day-halfhour-cell, .tcal-day-allday-cell").each(function() {
			var $this = $(this);
			$this.removeClass("tcal-day-halfhour-allday");
			$this.children().remove();
		});
	},
	_dayPrev: function(){
		this.options.date.setTime(this.options.date.getTime() - this._millisec_day);
	},
	_dayNext: function(){
		this.options.date.setTime(this.options.date.getTime() + this._millisec_day);
	},
	_dayRefresh: function(){
		var $this = this;
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var dateDay = $this.options.date.getDate();
		var firstDayOfWeek = new Date(dateYear, dateMonth, dateDay, 0, 0, 0, 0);
		var dayAfterLastDayOfWeek = new Date(firstDayOfWeek.getTime() + $this._millisec_day);
		var $grid = $this.element.find(".tcal-grid");
		$grid.find(".tcal-day-agenda").remove();
		var $scrollpanel = $this.element.find(".tcal-grid-day-scrollpanel");
		var $allDayCells = $($scrollpanel.find(".tcal-day-allday-cell"));
		var sameDayAgenda = [];
		var halfdayCells = $(".tcal-grid-day-content .tcal-day-halfhour-cell");
		var filteredAgenda = $.grep($this.options.agenda, function(agenda, index) {
			var startInRange = (agenda.startDate.getTime() < dayAfterLastDayOfWeek.getTime() && agenda.startDate.getTime() >= firstDayOfWeek.getTime());
			var endInRange = (agenda.endDate.getTime() < dayAfterLastDayOfWeek.getTime() && agenda.endDate.getTime() > firstDayOfWeek.getTime());
			var crossedInRange = (agenda.startDate.getTime() < firstDayOfWeek.getTime() && agenda.endDate.getTime() > dayAfterLastDayOfWeek.getTime());
			if ($this._isSameDay(agenda.startDate, agenda.endDate) && agenda.allDay == false) {
				if (startInRange || endInRange){
					sameDayAgenda.push(agenda);
				}
				return false;
			} else {
				return (startInRange || endInRange || crossedInRange);
			}
		});
		var markAllDay = function(date) {
			$scrollpanel.find(".tcal-day-halfhour-cell").addClass("tcal-day-halfhour-allday");
		};
		//sort the filtered agenda by start date
		filteredAgenda.sort($this._sortAgendaByDate);
		sameDayAgenda.sort($this._sortAgendaByDate);
		$.each(filteredAgenda, function(index, agenda) {
			//if startdate and end date are both within the same day
			if ($this._isSameDay(agenda.startDate, agenda.endDate)) {
				//it can only be all day because we have filtered out the same day but not all day in this list
				//if it's all day
				var $div = $("<div/>", {
					"class": "tcal-day-allday-agenda tcal-day-allday-agenda-used tcal-day-allday-actual"
				}).css("background-color", agenda.color);
				var $label = $("<div/>", {
					html: agenda.title,
					"class": "tcal-day-agenda-title"
				});
				$div.append($label).css("width", $allDayCells.width() - 5).data("id", agenda.id);
				$allDayCells.append($div).addClass("tcal-day-halfhour-allday");
				markAllDay(agenda.startDate);
				$div.click(function(e) {
					$this._onAgendaClick(this);
				}).hover(function() {
					$this._onAgendaMouseEnter(this);
				}, function() {
					$this._onAgendaMouseExit(this);
				});
				//attach tooltip callback if exist
				if ($this.options.agendaTooltip) {
					$this.options.agendaTooltip($div, agenda);
				}
			} else {
				//they span out across multiple days
				//we put a cross multiple day all day block and highlight the background
				var attr = {
					startedHeight: 0,
					firstday: null
				};
				var $div;
				var $label = $("<div/>", {
					html: agenda.title,
					"class": "tcal-day-agenda-title"
				});
				attr.firstday = new Date(agenda.startDate.getFullYear(), agenda.startDate.getMonth(), agenda.startDate.getDate(), 0, 0, 0, 0);
				if (attr.firstday.getTime() < firstDayOfWeek.getTime()) {
					attr.firstday.setTime(firstDayOfWeek.getTime());
				}
				var cellChildren = $allDayCells.children();
				//figure out if we have spots available
				if (cellChildren.length > 0) {
					//there is something existing already
					$.each(cellChildren, function(height, child) {
						if ($(child).hasClass("tcal-day-allday-agenda-used"))
							attr.startedHeight = height + 1;
						else {
							return false;
						}
					});
					//at this point startedHeight would be the height that the cell should be in
					if (cellChildren.length > attr.startedHeight) {
						$div = $(cellChildren[attr.startedHeight]);
					} else {
						$div = $("<div/>");
						$allDayCells.append($div);
					}
				} else {
					$div = $("<div/>"); //the div for agenda
					$allDayCells.append($div);
				}
				$div.data("id", agenda.id).addClass("tcal-day-allday-agenda tcal-day-allday-agenda-used tcal-day-allday-actual").css("background-color", agenda.color);
				$div.click(function(e) {
					$this._onAgendaClick(this);
				}).hover(function() {
					$this._onAgendaMouseEnter(this);
				}, function() {
					$this._onAgendaMouseExit(this);
				});
				//attach tooltip callback if exist
				if ($this.options.agendaTooltip) {
					$this.options.agendaTooltip($div, agenda);
				}
				if (agenda.endDate.getTime() < dayAfterLastDayOfWeek) {
					attr.upToDate = new Date(agenda.endDate.getFullYear(), agenda.endDate.getMonth(), agenda.endDate.getDate(), 0, 0, 0, 0);
					attr.upToDate.setTime(attr.upToDate.getTime() + $this._millisec_day);
				} else {
					attr.upToDate = new Date(dayAfterLastDayOfWeek.getTime());
				}
				$div.css("width",$allDayCells.width() - 5);
				$allDayCells.append($div).addClass("tcal-day-halfhour-allday");
				markAllDay(attr.firstday);
				var dateCounter = new Date(attr.firstday.getTime());
				for (; dateCounter.getTime() < attr.upToDate.getTime(); dateCounter.setTime(dateCounter.getTime() + $this._millisec_day)) {
					if ($allDayCells.children().length <= attr.startedHeight) {
						for (var i = $allDayCells.children().length; i <= attr.startedHeight; i++) {
							$allDayCells.append($("<div/>", {
								"class": "tcal-day-allday-agenda tcal-day-allday-agenda-used"
							}).css("width", $allDayCells.width() - 5));
						}
					} else {
						$($allDayCells.children()[attr.startedHeight]).addClass("tcal-day-allday-agenda-used");
					}
					$allDayCells.addClass("tcal-day-halfhour-allday");
					markAllDay(dateCounter);
				}
				//put place holder
				var start = $("<div/>", {
					"class": "tcal-day-agenda-allday-start-time"
				});
				if (firstDayOfWeek.getTime() <= agenda.startDate.getTime()) {
					//add start time
					var hour = agenda.startDate.getHours();
					var minute = agenda.startDate.getMinutes();
					start.html(((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute));
				} else {
					start.addClass("tcal-day-not-start-here");
				}

				var end = $("<div/>", {
					"class": "tcal-day-agenda-allday-end-time"
				});
				if (dayAfterLastDayOfWeek.getTime() > agenda.endDate.getTime()) {
					//add end time
					var hour = agenda.endDate.getHours();
					var minute = agenda.endDate.getMinutes();
					end.html(((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute));
				} else {
					end.addClass("tcal-day-not-end-here");
				}
				$div.append(start).append($label).append(end);
			}
		});
		//now we do the same day but not all day agenda
		$.each(sameDayAgenda, function(index, agenda) {
			//for each agenda we get a list of agenda that is intersecting the agenda so we get the width
			var attr = {
				column: 0,
				start_loc: {
					y: agenda.startDate.getMinutes() > 29 ? 1 : 0
				},
				end_loc: {
					y: agenda.endDate.getMinutes() > 29 ? 1 : 0
				},
				started: false,
				startedWidthUnit: 0,
				intersectCount: 0,
				numberCellHeight: 0,
				marginTopOffset: agenda.startDate.getMinutes() % 30
			};
			attr.start_loc.y += (agenda.startDate.getHours() * 2);
			attr.end_loc.y += (agenda.endDate.getHours() * 2);
			var startIndex = attr.start_loc.y;
			var $startCell = $(halfdayCells[startIndex]);
			attr.numberCellHeight = (((agenda.endDate.getTime() - agenda.startDate.getTime()) / 1800000));
			var intersects = $.grep(sameDayAgenda, function(_agenda, _index) {
				var startAfter = false;
				var endBefore = false;
				if (_agenda.startDate.getTime() >= agenda.endDate.getTime()) {
					startAfter = true;
				}
				if (_agenda.endDate.getTime() <= agenda.startDate.getTime()) {
					endBefore = true;
				}
				if (endBefore == startAfter && _index < index) attr.startedWidthUnit++;
				return (endBefore == startAfter); //impossible for both to be true, the only case that we have them to be equal is when intersection occured
			});
			//length of the intersects is the width
			attr.intersectCount = intersects.length;
			var marginTop = $startCell.height() / 30 * attr.marginTopOffset;
			var width_pixel = ($startCell.width() - (attr.startedWidthUnit) * 4 - 5) / intersects.length;
			var $div = $("<div/>", {
					"class": "tcal-day-agenda tcal-day-agenda-used tcal-day-agenda-actual"
				})
				.css("background-color", agenda.color)
				.css("width", width_pixel)
				.data("width", attr) //now we mark the width on the cell
				.css("margin-top", marginTop) //set the margin based on time offset
				.css("height", $startCell.height() * attr.numberCellHeight + (attr.numberCellHeight - 1) * 2) //set the height of the agenda
				.css("margin-left", attr.startedWidthUnit * (width_pixel + 4));
			var $label = $("<div/>", {
				html: agenda.title,
				"class": "tcal-day-agenda-title"
			});
			$div.append($label).data("id", agenda.id);
			$startCell.append($div);
			$div.click(function(e) {
				$this._onAgendaClick(this);
			}).hover(function() {
				$this._onAgendaMouseEnter(this);
			}, function() {
				$this._onAgendaMouseExit(this);
			});
			//attach tooltip callback if exist
			if ($this.options.agendaTooltip) {
				$this.options.agendaTooltip($div, agenda);
			}
		});
	},
	//main utility private function for week view
	_weekGrid: function() {
		var $grid = this.element.find(".tcal-grid");
		var $scrollpanel = $("<div/>", {
			"class": "tcal-grid-week-scrollpanel"
		}).css("overflow", "auto");
		var $staticpanel = $("<div/>", {
			"class": "tcal-grid-week-alldaypanel"
		}).css("position", "fixed").css("margin-top", "-1px");
		var $staticpanel_content = $("<div/>", {
			"class": "tcal-grid-week-content"
		});
		$grid.children().remove(); //clear grid
		$grid.append($scrollpanel);
		$scrollpanel.append($staticpanel).append($staticpanel_content);
		var $headerExt = this.element.find(".tcal-header-ext");
		$headerExt.children().remove(); // clear header ext
		//we need to generate a week header that marks out SUN to SAT
		$headerExt.append($("<div/>", {
			"class": "tcal-week-label-cell",
			html: "&nbsp;"
		}).css("border", "none"));
		$staticpanel.append($("<div/>", {
			"class": "tcal-week-label-cell",
			html: "<span class='tcal-week-label-text'></span>"
		}));
		for (var i = 0; i < 7; i++) {
			var $cell = $("<div/>", {
				"class": "tcal-week-allday-cell"
			});
			$staticpanel.append($cell);
			$cell = $("<div/>", {
				"class": "tcal-week-header-cell",
				html: "<span class='tcal-week-header-cell-day'>" + this._weekNameShort[i] + "</span><span class='tcal-week-header-cell-date'></span>"
			});
			$headerExt.append($cell);
		}
		$headerExt.append($("<div/>", {
			"style": "clear:both;"
		})); //a empty div to clear the float
		//we need to generate total of 48x8 cells
		var hour = 0;
		for (var i = 0; i < 384; i++) {
			var $cell;
			if (i % 8 != 0) {
				$cell = $("<div/>", {
					"class": "tcal-week-halfhour-cell"
				});
			} else {
				if (i % 16 == 0) {
					if (hour < 10)
						$cell = $("<div/>", {
							"class": "tcal-week-label-cell",
							html: "<span class='tcal-week-label-text'>0" + hour + ":00</span>"
						});
					else
						$cell = $("<div/>", {
							"class": "tcal-week-label-cell",
							html: "<span class='tcal-week-label-text'>" + hour + ":00</span>"
						});
					hour = (hour + 1) % 24;
				} else {
					$cell = $("<div/>", {
						"class": "tcal-week-label-cell"
					});
				}
			}
			$staticpanel_content.append($cell);
		}
		$staticpanel_content.append($("<div/>").css("clear", "both"));
	},
	_weekDimension: function() {
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		$grid.css("width", $_this.element.width() - 20);
		var $scrollpanel = $_this.element.find(".tcal-grid-week-scrollpanel");
		var $staticpanel_content = $_this.element.find(".tcal-grid-week-content");
		var $headerExt = this.element.find(".tcal-header-ext");
		var actual_height = ($grid.height());
		var label_width = 52;
		var actual_width = ($grid.width() - label_width + 1);
		var cell_width = Math.trunc(actual_width / 7);
		var cell_height = Math.trunc(actual_height * 2.5 / 48);
		var first_n_last_cell_w = (actual_width - cell_width * 7) / 2 + cell_width;
		$scrollpanel.css("width", ($grid.width() + 15)).css("height", actual_height);
		$staticpanel_content.css("margin-top", (cell_height * 4 - 1))
		$headerExt.find(".tcal-week-header-cell").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0)
				$this.css("width", first_n_last_cell_w - 1);
			else
				$this.css("width", cell_width - 1);
		});
		$headerExt.find(".tcal-week-label-cell").css("width", label_width);
		$scrollpanel.find(".tcal-week-label-cell").each(function(index) {
			var $this = $(this);
			var actualIndex = index - 1;
			$this.css("width", label_width).css("margin-right", "-1px");
			if (actualIndex < 0) {
				$this.css("height", cell_height * 4);
			} else {
				if (actualIndex % 2 == 0) {
					$this.css("border-bottom", "none");
				} else {
					$this.css("border-top", "none");
				}
				$this.css("height", cell_height);
			}
		});
		$scrollpanel.find(".tcal-week-allday-cell").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0)
				$this.css("width", first_n_last_cell_w);
			else
				$this.css("width", cell_width);
			$this.css("height", cell_height * 4);
			if (mod == 6)
				$this.css("border-right", "1px solid #dedede");
		});
		$scrollpanel.find(".tcal-week-halfhour-cell").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0) {
				$this.css("width", first_n_last_cell_w);
				$_this._weekCellWidth[mod] = first_n_last_cell_w;
			} else {
				$this.css("width", cell_width);
				$_this._weekCellWidth[mod] = cell_width;
			}
			$this.css("height", cell_height);
			if (mod == 6)
				$this.css("border-right", "1px solid #dedede");
		});
		$scrollpanel.find(".tcal-week-agenda-actual").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			var $startCell = $this.parent();
			var attr = $this.data("width");
			var marginTop = $startCell.height() / 30 * attr.marginTopOffset;
			if (mod == 6 || mod == 0) {
				var width_pixel = (first_n_last_cell_w - 5 - attr.intersectCount * 4) / attr.intersectCount;
				$this.css("width", width_pixel)
					.css("margin-top", marginTop) //set the margin based on time offset
					.css("height", $startCell.height() * attr.numberCellHeight + (attr.numberCellHeight - 1) * 2) //set the height of the agenda
					.css("margin-left", attr.startedWidthUnit * (width_pixel + 4));
			} else {
				var width_pixel = (cell_width - 5 - attr.intersectCount * 4) / attr.intersectCount;
				$this.css("width", width_pixel)
					.css("margin-top", marginTop) //set the margin based on time offset
					.css("height", $startCell.height() * attr.numberCellHeight + (attr.numberCellHeight - 1) * 2) //set the height of the agenda
					.css("margin-left", attr.startedWidthUnit * (width_pixel + 4));
			}
		});
	},
	_weekDate: function() {
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		var $headerExt = $_this.element.find(".tcal-header-ext");
		var dateMonth = $_this.options.date.getMonth(); //get today's month
		var dateDay = $_this.options.date.getDate(); //get today's day
		var dateYear = $_this.options.date.getFullYear(); //get today's year
		var dateWeekday = $_this.options.date.getDay(); //get today's weekday
		var dayCount = new Date(dateYear, dateMonth, dateDay - dateWeekday, 0, 0, 0, 0);
		$headerExt.find(".tcal-week-header-cell-date").each(function(index, cell) {
			var $this = $(this);
			$(cell).html((dayCount.getMonth() + 1) + "/" + (dayCount.getDate()));
			if ($_this._isToday(dayCount)) {
				$this.addClass("tcal-week-today");
			} else {
				$this.removeClass("tcal-week-today");
			}
			dayCount.setTime(dayCount.getTime() + $_this._millisec_day);
		});
		$grid.find(".tcal-week-halfhour-cell, .tcal-week-allday-cell").each(function() {
			var $this = $(this);
			$this.removeClass("tcal-week-halfhour-allday");
			$this.children().remove();
		});
	},
	_weekPrev: function() {
		this.options.date.setTime(this.options.date.getTime() - this._millisec_day * 7);
	},
	_weekNext: function() {
		this.options.date.setTime(this.options.date.getTime() + this._millisec_day * 7);
	},
	_weekAgendaWidthOfIndex: function(dayOfWeek, days) {
		return this._monthAgendaWidthOfIndex(dayOfWeek, days);
	},
	_weekRefresh: function() {
		var $this = this;
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var dateWeekday = $this.options.date.getDay();
		var dateDay = $this.options.date.getDate();
		var firstDayOfWeek = new Date(dateYear, dateMonth, dateDay, 0, 0, 0, 0);
		firstDayOfWeek.setTime(firstDayOfWeek.getTime() - $this._millisec_day * dateWeekday);
		var dayAfterLastDayOfWeek = new Date(firstDayOfWeek.getTime() + $this._millisec_day * 7);
		var $grid = $this.element.find(".tcal-grid");
		$grid.find(".tcal-week-agenda").remove();
		var $scrollpanel = $this.element.find(".tcal-grid-week-scrollpanel");
		var $allDayCells = $scrollpanel.find(".tcal-week-allday-cell");
		var sameDayAgenda = [];
		var halfdayCells = $(".tcal-grid-week-content .tcal-week-halfhour-cell");
		var filteredAgenda = $.grep($this.options.agenda, function(agenda, index) {
			var startInRange = (agenda.startDate.getTime() < dayAfterLastDayOfWeek.getTime() && agenda.startDate.getTime() >= firstDayOfWeek.getTime());
			var endInRange = (agenda.endDate.getTime() < dayAfterLastDayOfWeek.getTime() && agenda.endDate.getTime() > firstDayOfWeek.getTime());
			var crossedInRange = (agenda.startDate.getTime() < firstDayOfWeek.getTime() && agenda.endDate.getTime() > dayAfterLastDayOfWeek.getTime());
			if ($this._isSameDay(agenda.startDate, agenda.endDate) && agenda.allDay == false) {
				if (startInRange || endInRange){
					sameDayAgenda.push(agenda);
				}
				return false;
			} else {
				return (startInRange || endInRange || crossedInRange);
			}
		});
		var markAllDay = function(date) {
			$scrollpanel.find(".tcal-week-halfhour-cell").each(function(index, cell) {
				if (index % 7 == date.getDay()) {
					$(cell).addClass("tcal-week-halfhour-allday");
				}
			});
		};
		//sort the filtered agenda by start date
		filteredAgenda.sort($this._sortAgendaByDate);
		sameDayAgenda.sort($this._sortAgendaByDate);
		$.each(filteredAgenda, function(index, agenda) {
			//if startdate and end date are both within the same day
			if ($this._isSameDay(agenda.startDate, agenda.endDate)) {
				//it can only be all day because we have filtered out the same day but not all day in this list
				//if it's all day
				var $div = $("<div/>", {
					"class": "tcal-week-allday-agenda tcal-week-allday-agenda-used tcal-week-allday-actual"
				}).css("background-color", agenda.color);
				var $label = $("<div/>", {
					html: agenda.title,
					"class": "tcal-week-agenda-title"
				});
				$div.append($label).css("width", $($allDayCells[agenda.startDate.getDay()]).width() - 5);
				$($allDayCells[agenda.startDate.getDay()]).append($div).addClass("tcal-week-halfhour-allday").data("id", agenda.id);
				markAllDay(agenda.startDate);
				$div.click(function(e) {
					$this._onAgendaClick(this);
				}).hover(function() {
					$this._onAgendaMouseEnter(this);
				}, function() {
					$this._onAgendaMouseExit(this);
				});
				//attach tooltip callback if exist
				if ($this.options.agendaTooltip) {
					$this.options.agendaTooltip($div, agenda);
				}
			} else {
				//they span out across multiple days
				//we put a cross multiple day all day block and highlight the background
				var attr = {
					startedHeight: 0,
					firstday: null
				};
				var $div;
				var $label = $("<div/>", {
					html: agenda.title,
					"class": "tcal-week-agenda-title"
				});
				attr.firstday = new Date(agenda.startDate.getFullYear(), agenda.startDate.getMonth(), agenda.startDate.getDate(), 0, 0, 0, 0);
				if (attr.firstday.getTime() < firstDayOfWeek.getTime()) {
					attr.firstday.setTime(firstDayOfWeek.getTime());
				}
				var cellChildren = $($allDayCells[attr.firstday.getDay()]).children();
				//figure out if we have spots available
				if (cellChildren.length > 0) {
					//there is something existing already
					$.each(cellChildren, function(height, child) {
						if ($(child).hasClass("tcal-week-allday-agenda-used"))
							attr.startedHeight = height + 1;
						else {
							return false;
						}
					});
					//at this point startedHeight would be the height that the cell should be in
					if (cellChildren.length > attr.startedHeight) {
						$div = $(cellChildren[attr.startedHeight]);
					} else {
						$div = $("<div/>");
						$($allDayCells[attr.firstday.getDay()]).append($div);
					}
				} else {
					$div = $("<div/>"); //the div for agenda
					$($allDayCells[attr.firstday.getDay()]).append($div);
				}
				$div.addClass("tcal-week-allday-agenda tcal-week-allday-agenda-used tcal-week-allday-actual").css("background-color", agenda.color).data("id", agenda.id);
				$div.click(function(e) {
					$this._onAgendaClick(this);
				}).hover(function() {
					$this._onAgendaMouseEnter(this);
				}, function() {
					$this._onAgendaMouseExit(this);
				});
				//attach tooltip callback if exist
				if ($this.options.agendaTooltip) {
					$this.options.agendaTooltip($div, agenda);
				}
				var dayLength = 0;
				if (agenda.endDate.getTime() < dayAfterLastDayOfWeek) {
					attr.upToDate = new Date(agenda.endDate.getFullYear(), agenda.endDate.getMonth(), agenda.endDate.getDate(), 0, 0, 0, 0);
					attr.upToDate.setTime(attr.upToDate.getTime() + $this._millisec_day);
				} else {
					attr.upToDate = new Date(dayAfterLastDayOfWeek.getTime());
				}
				dayLength = Math.trunc((attr.upToDate.getTime() - attr.firstday.getTime()) / $this._millisec_day);
				$div.css("width", $this._weekAgendaWidthOfIndex(attr.firstday.getDay(), dayLength));
				$($allDayCells[attr.firstday.getDay()]).append($div).addClass("tcal-week-halfhour-allday");
				markAllDay(attr.firstday);
				var dateCounter = new Date(attr.firstday.getTime());
				for (; dateCounter.getTime() < attr.upToDate.getTime(); dateCounter.setTime(dateCounter.getTime() + $this._millisec_day)) {
					var theDayCell = $($allDayCells[dateCounter.getDay()]);
					if (theDayCell.children().length <= attr.startedHeight) {
						for (var i = theDayCell.children().length; i <= attr.startedHeight; i++) {
							theDayCell.append($("<div/>", {
								"class": "tcal-week-allday-agenda tcal-week-allday-agenda-used"
							}).css("width", theDayCell.width() - 5));
						}
					} else {
						$(theDayCell.children()[attr.startedHeight]).addClass("tcal-week-allday-agenda-used");
					}
					theDayCell.addClass("tcal-week-halfhour-allday");
					markAllDay(dateCounter);
				}
				//put place holder
				var start = $("<div/>", {
					"class": "tcal-week-agenda-allday-start-time"
				});
				if (firstDayOfWeek.getTime() <= agenda.startDate.getTime()) {
					//add start time
					var hour = agenda.startDate.getHours();
					var minute = agenda.startDate.getMinutes();
					start.html(((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute));
				} else {
					start.addClass("tcal-week-not-start-here");
				}

				var end = $("<div/>", {
					"class": "tcal-week-agenda-allday-end-time"
				});
				if (dayAfterLastDayOfWeek.getTime() > agenda.endDate.getTime()) {
					//add end time
					var hour = agenda.endDate.getHours();
					var minute = agenda.endDate.getMinutes();
					end.html(((hour < 10) ? "0" + hour : hour) + ":" + ((minute < 10) ? "0" + minute : minute));
				} else {
					end.addClass("tcal-week-not-end-here");
				}
				$div.append(start).append($label).append(end);
			}
		});
		//now we do the same day but not all day agenda
		$.each(sameDayAgenda, function(index, agenda) {
			//for each agenda we get a list of agenda that is intersecting the agenda so we get the width
			var attr = {
				column: agenda.startDate.getDay(),
				start_loc: {
					y: agenda.startDate.getMinutes() > 29 ? 1 : 0
				},
				end_loc: {
					y: agenda.endDate.getMinutes() > 29 ? 1 : 0
				},
				started: false,
				startedWidthUnit: 0,
				intersectCount: 0,
				numberCellHeight: 0,
				marginTopOffset: agenda.startDate.getMinutes() % 30
			};
			attr.start_loc.y += (agenda.startDate.getHours() * 2);
			attr.end_loc.y += (agenda.endDate.getHours() * 2);
			var startIndex = attr.column + attr.start_loc.y * 7;
			var $startCell = $(halfdayCells[startIndex]);
			attr.numberCellHeight = (((agenda.endDate.getTime() - agenda.startDate.getTime()) / 1800000));
			var intersects = $.grep(sameDayAgenda, function(_agenda, _index) {
				var startAfter = false;
				var endBefore = false;
				if (_agenda.startDate.getTime() >= agenda.endDate.getTime()) {
					startAfter = true;
				}
				if (_agenda.endDate.getTime() <= agenda.startDate.getTime()) {
					endBefore = true;
				}
				if (endBefore == startAfter && _index < index) attr.startedWidthUnit++;
				return (endBefore == startAfter); //impossible for both to be true, the only case that we have them to be equal is when intersection occured
			});
			//length of the intersects is the width
			attr.intersectCount = intersects.length;
			var marginTop = $startCell.height() / 30 * attr.marginTopOffset;
			var width_pixel = ($startCell.width() - (attr.startedWidthUnit) * 4 - 5) / intersects.length;
			var $div = $("<div/>", {
					"class": "tcal-week-agenda tcal-week-agenda-used tcal-week-agenda-actual"
				})
				.css("background-color", agenda.color)
				.css("width", width_pixel)
				.data("width", attr) //now we mark the width on the cell
				.css("margin-top", marginTop) //set the margin based on time offset
				.css("height", $startCell.height() * attr.numberCellHeight + (attr.numberCellHeight - 1) * 2) //set the height of the agenda
				.css("margin-left", attr.startedWidthUnit * (width_pixel + 4));
			var $label = $("<div/>", {
				html: agenda.title,
				"class": "tcal-week-agenda-title"
			});
			$div.append($label).data("id", agenda.id);
			$startCell.append($div);
			$div.click(function(e) {
				$this._onAgendaClick(this);
			}).hover(function() {
				$this._onAgendaMouseEnter(this);
			}, function() {
				$this._onAgendaMouseExit(this);
			});
			//attach tooltip callback if exist
			if ($this.options.agendaTooltip) {
				$this.options.agendaTooltip($div, agenda);
			}
		});
	},
	//main utility private function for month view
	_monthGrid: function() {
		var $grid = this.element.find(".tcal-grid");
		$grid.children().remove(); //clear the grid
		var $innerGrid = $("<div/>", {
			"class": "tcal-month-inner-grid"
		});
		$grid.append($innerGrid);
		var $headerExt = this.element.find(".tcal-header-ext");
		//clear headerExt
		$headerExt.children().remove();
		//we need to generate a week header that marks out SUN to SAT
		for (var i = 0; i < 7; i++) {
			var $cell = $("<div/>", {
				"class": "tcal-month-week-cell",
				html: this._weekNameShort[i]
			});
			$headerExt.append($cell);
		}
		$headerExt.append($("<div/>", {
			"class": "tcal-clearer"
		})); //a empty div to clear the float
		//we need to generate total of 42 cells: 7 x 6 to encapsulate all days of any given month
		for (var i = 0; i < 42; i++) {
			var $cell = $("<div/>", {
				"class": "tcal-month-day-cell"
			});
			var $dayheader = $("<div/>", {
				"class": "tcal-month-day-cell-header",
				html: "<span class='tcal-month-day-cell-header-day'></span>"
			});
			var $daycontent = $("<div/>", {
				"class": "tcal-month-day-cell-content"
			});
			$cell.append($dayheader).append($daycontent);
			$innerGrid.append($cell);
		}
		$innerGrid.append($("<div/>", {
			"class": "tcal-clearer"
		}));
	},
	_monthDimension: function() {
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		var $innerGrid = $grid.find(".tcal-month-inner-grid");
		$grid.css("width", $_this.element.width() - 20);
		$innerGrid.css("width", $grid.width());
		var $headerExt = this.element.find(".tcal-header-ext");
		var actual_height = ($grid.height());
		var actual_width = ($innerGrid.width());
		var cell_width = Math.trunc(actual_width / 7);
		var cell_height = Math.trunc(actual_height / 6);
		var first_n_last_cell_w = (actual_width - cell_width * 7) / 2 + cell_width;
		var last_row_cell_height = (actual_height - cell_height * 6) + cell_height;
		$grid.find(".tcal-month-day-cell").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0) {
				$this.css("width", first_n_last_cell_w + "px");
				$_this._weekCellWidth[mod] = first_n_last_cell_w;
			} else {
				$this.css("width", cell_width + "px");
				$_this._weekCellWidth[mod] = cell_width;
			}
			if (mod == 6)
				$this.css("border-right", "1px solid #dedede");
			if (index > 34)
				$this.css("height", last_row_cell_height + "px");
			else
				$this.css("height", cell_height + "px");
		});
		$headerExt.find(".tcal-month-week-cell").each(function(index) {
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0)
				$this.css("width", first_n_last_cell_w - 1 + "px");
			else
				$this.css("width", cell_width - 1 + "px");
		});
		$grid.find(".tcal-month-agenda-actual").each(function(index) {
			var $this = $(this);
			var width = $_this._monthAgendaWidthOfIndex($this.data("weekday"), $this.data("days"));
			$this.css("width", (width) + "px");
		});
	},
	_monthDate: function() {
		var $this = this;
		var $grid = $this.element.find(".tcal-grid");
		var $header = $this.element.find(".tcal-header");
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var firstDayOfMonth = new Date(dateYear, dateMonth, 1, 0, 0, 0, 0);
		var firstDayOfMonth_week = firstDayOfMonth.getDay();
		var cellDate = new Date();
		cellDate.setTime(firstDayOfMonth.getTime() - ($this._millisec_day * ((firstDayOfMonth_week))));
		$header.find(".tcal-header-primary-title").html($this._monthNameFull[dateMonth]);
		$header.find(".tcal-header-secondary-title").html(dateYear);
		$grid.find(".tcal-month-day-cell").each(function(index) {
			var cellMonth = cellDate.getMonth();
			var cellDay = cellDate.getDate();
			var $c_this = $(this);
			var dayValObj = $c_this.find(".tcal-month-day-cell-header-day");
			dayValObj.html((cellDay == 1) ? $this._monthNameShort[cellMonth] + " 1" : cellDay);
			if (cellMonth != dateMonth) {
				$c_this.addClass("tcal-month-different-month");
			} else {
				$c_this.removeClass("tcal-month-different-month");
			}
			if ($this._isToday(cellDate)) {
				$c_this.addClass("tcal-month-today");
			} else {
				$c_this.removeClass("tcal-month-today");
			}
			cellDate.setTime(cellDate.getTime() + $this._millisec_day);
		});
	},
	_monthNext: function() {
		var $this = this;
		var curMonth = $this.options.date.getMonth();
		$this.options.date.setMonth((curMonth + 1) % 12);
		if (curMonth == 11) {
			$this.options.date.setFullYear($this.options.date.getFullYear() + 1);
		}
	},
	_monthPrev: function() {
		var $this = this;
		var curMonth = $this.options.date.getMonth();
		$this.options.date.setMonth((curMonth + 12 - 1) % 12);
		if (curMonth == 0) {
			$this.options.date.setFullYear($this.options.date.getFullYear() - 1);
		}
	},
	_monthAgendaWidthOfIndex: function(dayOfWeek, days) {
		var sum = 0;
		for (var i = dayOfWeek; i < this._weekCellWidth.length && i < (dayOfWeek + days); i++) {
			sum += this._weekCellWidth[i];
		}
		sum -= 4;
		return sum;
	},
	_monthRefresh: function() {
		var $this = this;
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var firstDayOfMonth = new Date(dateYear, dateMonth, 1, 0, 0, 0, 0);
		var firstDayOfCalendar = new Date(firstDayOfMonth.getTime() - $this._millisec_day * firstDayOfMonth.getDay());
		var lastDayOfCalendar = new Date(firstDayOfCalendar.getTime() + $this._millisec_day * 42);
		var $grid = $this.element.find(".tcal-grid");
		$grid.find(".tcal-month-agenda").remove();
		var filteredAgenda = $.grep($this.options.agenda, function(agenda, index) {
			var startInRange = (agenda.startDate.getTime() < lastDayOfCalendar.getTime() && agenda.startDate.getTime() >= firstDayOfCalendar.getTime());
			var endInRange = (agenda.endDate.getTime() < lastDayOfCalendar.getTime() && agenda.endDate.getTime() > firstDayOfCalendar.getTime());
			return (startInRange || endInRange);
		});
		//sort the filtered agenda by start date
		filteredAgenda.sort($this._sortAgendaByDate);
		$.each(filteredAgenda, function(index, agenda) {
			//div for the agenda
			var firstDay = agenda.startDate;
			var counterDate = new Date(firstDayOfCalendar.getTime());
			if (agenda.startDate.getTime() <= firstDayOfCalendar.getTime()) {
				//we use first day of the calendar as the starting point
				firstDay = firstDayOfCalendar;
			}
			//generate the agenda box
			var attr = {
				hasStarted: false,
				startedHeight: 0,
				upToDate: null
			};
			$this.element.find(".tcal-month-day-cell .tcal-month-day-cell-content").each(function(cellIndex, cell) {
				var $cell = $(cell);
				var cellChildren = $cell.children();
				if ($this._isSameDay(counterDate, firstDay)) {
					//we found a start date
					//figure out if we have a spot available prior to current height
					var $div;
					if (cellChildren.length > 0) {
						//there is something existing already
						$.each(cellChildren, function(height, child) {
							if ($(child).hasClass("tcal-month-agenda-used"))
								attr.startedHeight = height + 1;
							else {
								return false;
							}
						});
						//at this point startedHeight would be the height that the cell should be in
						if (cellChildren.length > attr.startedHeight) {
							$div = $(cellChildren[attr.startedHeight]);
						} else {
							$div = $("<div/>");
							$cell.append($div);
						}
					} else {
						$div = $("<div/>"); //the div for agenda
						$cell.append($div);
					}
					$div.addClass("tcal-month-agenda tcal-month-agenda-used tcal-month-agenda-actual").css("background-color", agenda.color).data("id", agenda.id);
					//add label
					var $label = $("<div/>", {
						html: agenda.title,
						"class": "tcal-month-agenda-title"
					});
					$div.append($label).click(function(e) {
						$this._onAgendaClick(this);
					}).hover(function() {
						$this._onAgendaMouseEnter(this);
					}, function() {
						$this._onAgendaMouseExit(this);
					});
					//attach tooltip callback if exist
					if ($this.options.agendaTooltip) {
						$this.options.agendaTooltip($div, agenda);
					}
					//difference
					attr.upToDate = new Date(counterDate.getTime() + (7 - counterDate.getDay()) * $this._millisec_day);
					if (attr.upToDate.getTime() > agenda.endDate) {
						attr.upToDate = new Date(agenda.endDate.getFullYear(), agenda.endDate.getMonth(), agenda.endDate.getDate() + 1, 0, 0, 0, 0);
					}
					var range = Math.ceil((attr.upToDate.getTime() - counterDate.getTime()) / $this._millisec_day);
					//console.log(range);
					$div.data("days", range);
					$div.data("weekday", counterDate.getDay());
					$div.data("id", agenda.id);
					var width = $this._monthAgendaWidthOfIndex(counterDate.getDay(), range);
					$div.css("width", width + "px");
					//insert div into the cell
					attr.hasStarted = true;
				} else if (attr.hasStarted) {
					//we have already started to insert
					//there is something existing already, we check to see if it has the proper amount of children
					if (counterDate.getTime() < attr.upToDate.getTime()) {
						for (var i = cellChildren.length; i < attr.startedHeight; i++) {
							var $div = $("<div/>", {
								"class": "tcal-month-agenda"
							}).css("width", "100%"); //the div for to extend the height
							$cell.append($div);
						}
						if (cellChildren.length <= attr.startedHeight) {
							//add an occupying cell
							var $div = $("<div/>", {
								"class": "tcal-month-agenda tcal-month-agenda-used"
							}).css("width", "100%"); //the div for agenda
							$cell.append($div);
						} else {
							//mark existing cell as occupied
							var $div = $($cell.children()[attr.startedHeight]);
							$div.addClass("tcal-month-agenda-used").css("width", "100%");
						}
					} else if (counterDate.getTime() == attr.upToDate.getTime()) {
						//find the new upToTime
						attr.upToDate = new Date(counterDate.getTime() + (7 - counterDate.getDay()) * $this._millisec_day);
						if (attr.upToDate.getTime() > agenda.endDate) {
							attr.upToDate = new Date(agenda.endDate.getFullYear(), agenda.endDate.getMonth(), agenda.endDate.getDate() + 1, 0, 0, 0, 0);
						}
						if (counterDate.getTime() < attr.upToDate.getTime()) {
							$div = $("<div/>", {
								"class": "tcal-month-agenda tcal-month-agenda-used tcal-month-agenda-actual"
							}).css("background-color", agenda.color).data("id", agenda.id); //the div for agenda
							//add label
							var $label = $("<div/>", {
								html: agenda.title,
								"class": "tcal-month-agenda-title"
							});
							$div.append($label).click(function(e) {
								$this._onAgendaClick(this);
							}).hover(function() {
								$this._onAgendaMouseEnter(this);
							}, function() {
								$this._onAgendaMouseExit(this);
							});
							//attach tooltip callback if exist
							if ($this.options.agendaTooltip) {
								$this.options.agendaTooltip($div, agenda);
							}
							//add continue label
							var $continueContainer = $("<div/>", {
								"class": "tcal-month-agenda-continue-container",
								html: "<"
							}).css("height", "100%");
							$div.append($continueContainer);
							var range = Math.ceil((attr.upToDate.getTime() - counterDate.getTime()) / $this._millisec_day);
							$div.data("days", range);
							$div.data("weekday", counterDate.getDay());
							$div.data("id", agenda.id);
							var width = $this._monthAgendaWidthOfIndex(counterDate.getDay(), range);
							$div.css("width", width + "px");
							//insert div into the cell
							attr.hasStarted = true;
							$cell.append($div);
						} else {
							return false;
						}
					}
				}
				counterDate.setTime(counterDate.getTime() + $this._millisec_day);
			});
		});
	}
});	