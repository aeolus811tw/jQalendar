$.widget("aekt.tcalendar", {
	options: {
		date: new Date(),
		mode: "m",
		debug: true,
		agenda: []
	},
	_weekCellWidth : [0, 0, 0, 0, 0, 0, 0],
	_weekNameFull : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	_weekNameShort : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	_monthNameFull : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	_monthNameShort : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ],
	_mode : {y : {name:"Year", func: { grid: "_yearGrid", dimension: "_yearDimension", date: "_yearDate", refresh: "_yearRefresh"}},
			 m : {name:"Month", func: { grid: "_monthGrid", dimension: "_monthDimension", date: "_monthDate", refresh: "_monthRefresh"}},
			 w : {name:"Week", func: { grid : "_weekGrid", dimension: "_weekDimension", date: "_weekDate", refresh: "_weekRefresh"}},
			 d : {name:"Day", func: { grid : "_dayGrid", dimension: "_dayDimension", date: "_dayDate", refresh: "_dayRefresh"}},
			 a : {name:"Agenda", func: { grid : "_agendaGrid", refresh: "_agendaRefresh"}}},
	_create: function(){
		var $this = this;
		$this.element.children().remove(); //remove everything within the target
		$this.element.addClass("tcal-caledar"); //setup plugin class
		$this.element.data("index", $(".tcal-calendar").length + 1);
		//add the header grid
		//setup base structure
		var index = $this.element.data("index");
		var $header = $("<div/>", {"class": "tcal-header", "id" : "tcal-header-"+index}); //the header space
		//header title
		var $titleWrapper = $("<div/>", {'class' : 'tcal-header-title-container'});
		var $primaryTitle = $("<span/>", {'class': 'tcal-header-primary-title', html : 'Month'});
		var $secondaryTitle = $("<span/>", {'class': 'tcal-header-secondary-title', html : 'Year'});
		$titleWrapper.append($primaryTitle).append($secondaryTitle);
		//next month button
		var $nextMnth = $("<button/>", {'class' : 'tcal-next-month-btn', html : '>'}).button().click(function(e){
			var curMonth = $this.options.date.getMonth();
			$this.options.date.setMonth((curMonth + 1)% 12);
			if (curMonth == 11){
				$this.options.date.setFullYear($this.options.date.getFullYear() + 1);
			}
			$this.datefix();
			$this.refresh();
			$this._trigger( "nextMonth");
		});
		//previous month button
		var $prevMnth = $("<button/>", {'class' : 'tcal-prev-month-btn', html : '<'}).button().click(function(e){
			var curMonth = $this.options.date.getMonth();
			$this.options.date.setMonth((curMonth + 12 - 1)% 12);
			if (curMonth == 0){
				$this.options.date.setFullYear($this.options.date.getFullYear() - 1);
			}
			$this.datefix();
			$this.refresh();
			$this._trigger( "prevMonth");
		});
		//today button
		var $todayBtn = $("<button/>", {'class' : 'tcal-today-btn', html: 'Today'}).button().click(function(e){
			$this.options.date = new Date();
			$this.datefix();
			$this.refresh();
			$this._trigger( "today");
		});
		var $todayField = $("<input/>" , {'class' : 'tcal-today-field', placeholder : 'MM/DD/YYYY'});
		$todayField.datepicker({
			constrainInput: true,
			dateFormat: "mm/dd/yy",
			numberOfMonths: 1,
			onSelect: function(dateText, pickerInst) {
				$this.options.date = $todayField.datepicker( "getDate" );
				$this.datefix();
				$this.refresh();
				$this._trigger( "today");
		    }
		}).datepicker("setDate", $this.options.date);
		
		
		
		var $grid = $("<div/>", {"class": "tcal-grid", "id" : "tcal-grid-"+index}); //the grid space
		var headerExt = $("<div/>", {"class":"tcal-header-ext"}); //this is used for adding extra info between header and the grid
		$this.element.append($header).append(headerExt).append($grid); //compose the structure
		
		//setup mode changer
		var $modechanger = $("<span/>", {"class" : "tcal-header-modechanger", id: "tcal-header-modechanger-"+index, html : ""});
		for (var i in $this._mode){
			var $input = $("<input/>", {type : "radio", id : "tcal-header-"+index+"-"+i, name : "tcal-header-"+index+"-modechanger"}).data("mode", i);
			var $label = $("<label/>", {"for" : "tcal-header-"+index+"-"+i, html : $this._mode[i].name});
			$modechanger.append($input).append($label);
			if (i === $this.options.mode){
				$input.prop("checked", true);
			}else{
				$input.prop("checked", false);
			}
		}
		$modechanger.buttonset();
		$modechanger.find(":input").change(function(e){
			$this.options.mode = $(this).data("mode");
			$this.gridfix();
			$this.dimensionfix();
			$this.datefix();
			$this.refresh();
		});
		
		//more function button
		//setup the more function menu
		var $moreMenu = $("<ul/>");
		var $printOption = $("<li/>", {html : "Print"});
		var $refreshOption = $("<li/>", {html : "Refresh"});
		$moreMenu.append($printOption).append($refreshOption);
		$moreMenu.hide().menu();
		var $moreBtn = $("<button/>", {'class' : 'tcal-more-func-btn', html: 'More'}).button({ icons: { secondary: "ui-icon-triangle-1-s" }})
		 																			 .click(function() {
		 																				 var menu = $moreMenu.show().position({
		 																					 my: "right top",
		 																					 at: "right bottom",
		 																					 of: this
		 																				 });
		 																				 $( document ).one( "click", function() {
		 																					$moreMenu.hide();
		 																				 });
		 																				 return false;
		 																			 });
		$header.append($todayBtn).append($todayField).append($prevMnth).append($nextMnth).append($moreBtn)
			   .append($moreMenu).append($modechanger).append($titleWrapper);
		$header.append($("<div/>"));
		
		$this.gridfix();
		$this.datefix();
		$this.refresh();
		
		$(window).resize(function(e){ //setup grid size
			var viewport_h = $(window).height();
			var header_h = $header.height();
			$grid.css("height", (viewport_h - header_h - 30) + "px");
			$this.dimensionfix();
		}).resize();
	},
	_setOption: function( key, value ){
		this.options[ key ] = value;
	},
	//the destroy function
	destroy : function(){
		this.element.children().remove();
		this.element.removeClass("tcal-caledar");
		this.element.data("index", "");
		$.Widget.prototype.destroy.call(this);
	},
	//main public functions
	addAgenda : function(data){
		//verify basic information exists
		try{
			if (this._verifyAgenda(data[0])){
				if (this.options.debug){
					console.log("addAgenda:" + data[0].startDate.toString() + " to "+ data[0].endDate.toString());
				}
				//we have verified basic information now we add the agenda into the list and refresh the view
				this.options.agenda.push(data[0]);
			}
			this.refresh(); //reresh the view
		}catch(err){
			if (this.options.debug)
				console.log(err);
		}
	},
	refresh : function(){
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.refresh){
			this[this._mode[this.options.mode].func.refresh]();
		}
	},
	gridfix : function(){
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.grid){
			this[this._mode[this.options.mode].func.grid]();
		}
	},
	dimensionfix : function(){
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.dimension){
			this[this._mode[this.options.mode].func.dimension]();
		}
	},
	datefix : function(){
		if (this._mode[this.options.mode] && this._mode[this.options.mode].func && this._mode[this.options.mode].func.date){
			this[this._mode[this.options.mode].func.date]();
		}
	},
	//basic utility function
	_isToday : function(date){
		var today = new Date();
		var result = ((date.getMonth() == today.getMonth()) && (date.getFullYear() == today.getFullYear()) && (date.getDate() == today.getDate()));
		return result;
	},
	_isSameDay : function(dateA, dateB){
		var result = ((dateA.getMonth() == dateB.getMonth()) && (dateA.getFullYear() == dateB.getFullYear()) && (dateA.getDate() == dateB.getDate()));
		return result;
	},
	_sortAgendaByDate : function(a, b){
		var aStartTime = a.startDate.getTime();
		var bStartTime = b.startDate.getTime();
		var aEndTime = a.endDate.getTime();
		var bEndTime = b.endDate.getTime();
		return ((aStartTime < bStartTime) ? -1 : ((aStartTime > bStartTime) ? 1 : ((aEndTime < bEndTime) ?  -1 : ((aEndTime > bEndTime)? 1 : 0))));
	},
	_verifyAgenda: function(data){
		if (typeof data.id === "undefined"){
			throw "missing id field";
		}
		if (data.startDate){
			if (typeof data.startDate == "string")
				data.startDate = new Date(data.startDate);
			else if (typeof data.startDate == "object")
				1 == 1; //do nothing because we are all good
			else
				throw "invalid startDate detected";
				
		}else{
			throw "missing startDate field";
		}
		if (typeof data.title === "undefined"){
			throw "missing title field";
		}
		if (data.endDate){
			if (typeof data.endDate == "string")
				data.endDate = $.datepicker.parseDate( "yy-mm-dd", data.endDate);
			else if (typeof data.endDate == "object")
				1 == 1; //do nothing because we are all good
			else
				throw "invalid endDate field detected";			
		}else{
			throw "missing endDate field";
		}
		if (data.endDate.getTime() <= data.startDate.getTime())
			throw "endDate must be greater than startDate";
		if (typeof data.allDay !== "boolean"){
			throw "invalid allDay field field, must be a boolean value";
		}
		if (typeof data.repeat != "object"){
			throw "invalid repeat field detected";
		}
		if (typeof data.color !== "string"){
			throw "invalid color field detected, must be a valid CSS color string";
		}
		if (typeof data.calendar != "string"){
			throw "invalid calendar field detected, must be a string value";
		}
		return true;
	},
	//main utility private function for month view
	_monthGrid : function(){
		var $grid = this.element.find(".tcal-grid");
		var $headerExt = this.element.find(".tcal-header-ext");
		//we need to generate a week header that marks out SUN to SAT
		for (var i = 0; i < 7; i++){
			var $cell = $("<div/>", {"class" : "tcal-month-week-cell", html: this._weekNameShort[i]});
			$headerExt.append($cell);
		}
		$headerExt.append($("<div/>", {"style" : "clear:both;"})); //a empty div to clear the float
		//we need to generate total of 42 cells: 7 x 6 to encapsulate all days of any given month
		for (var i = 0; i < 42; i++){
			var $cell = $("<div/>", {"class": "tcal-month-day-cell"});
			var $dayheader = $("<div/>", {"class" : "tcal-month-day-cell-header", html : "<span class='tcal-month-day-cell-header-day'></span>"});
			var $daycontent = $("<div/>", {"class" : "tcal-month-day-cell-content"});
			$cell.append($dayheader).append($daycontent);
			$grid.append($cell);
		}
	},
	_monthDimension: function(){
		var $_this = this;
		var $grid = $_this.element.find(".tcal-grid");
		var $headerExt = this.element.find(".tcal-header-ext");
		var actual_height = ($grid.height());
		var actual_width = ($grid.width() + 14);
		var cell_width = Math.trunc(actual_width / 7);
		var cell_height = Math.trunc(actual_height / 6);
		var first_n_last_cell_w = (actual_width - cell_width * 7)/2 + cell_width;
		var last_row_cell_height = (actual_height - cell_height * 6) + cell_height;
		$grid.find(".tcal-month-day-cell").each(function(index){
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0 ){
				$this.css("width", first_n_last_cell_w + "px");
				$_this._weekCellWidth[mod] = first_n_last_cell_w;
			}else{
				$this.css("width", cell_width + "px");
				$_this._weekCellWidth[mod] = cell_width;
			}
			if (index > 34)
				$this.css("height", last_row_cell_height + "px");
			else
				$this.css("height", cell_height + "px");
		});
		$headerExt.find(".tcal-month-week-cell").each(function(index){
			var mod = index % 7;
			var $this = $(this);
			if (mod == 6 || mod == 0 )
				$this.css("width", first_n_last_cell_w + "px");
			else
				$this.css("width", cell_width + "px");
		});
		$grid.find(".tcal-month-agenda-actual").each(function(index){
			var $this = $(this);
			var width = $_this._monthAgendaWidthOfIndex($this.data("weekday"), $this.data("days"));
			$this.css("width",  width + "px");
		});
	},
	_monthDate : function(){
		var $this = this;
		var $grid = $this.element.find(".tcal-grid");
		var $header = $this.element.find(".tcal-header");
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var firstDayOfMonth = new Date(dateYear, dateMonth, 1, 0, 0, 0, 0);
		var firstDayOfMonth_week = firstDayOfMonth.getDay();
		var cellDate = new Date();
		cellDate.setTime(firstDayOfMonth.getTime() - (86400000 * ((firstDayOfMonth_week))));
		$header.find(".tcal-header-primary-title").html($this._monthNameFull[dateMonth]);
		$header.find(".tcal-header-secondary-title").html(dateYear);
		$grid.find(".tcal-month-day-cell").each(function(index){
			var cellMonth = cellDate.getMonth();
			var cellDay = cellDate.getDate();
			var $c_this = $(this);
			var dayValObj = $c_this.find(".tcal-month-day-cell-header-day");
			dayValObj.html((cellDay == 1)?$this._monthNameShort[cellMonth] + " 1":cellDay);
			if (cellMonth != dateMonth){
				$c_this.addClass("tcal-month-different-month");
			}else{
				$c_this.removeClass("tcal-month-different-month");
			}
			if ($this._isToday(cellDate)){
				$c_this.addClass("tcal-month-today");
			}else{
				$c_this.removeClass("tcal-month-today");
			}
			cellDate.setTime(cellDate.getTime() + 86400000);
		});
	},
	_monthAgendaWidthOfIndex : function(dayOfWeek, days){
		var sum = 0;
		for (var i = dayOfWeek; i < this._weekCellWidth.length && i < (dayOfWeek + days); i++){
			sum += this._weekCellWidth[i];
			if (i < 6) sum -= 2;
		}
		return sum;
	},
	_monthRefresh : function(){
		var $this = this;
		var dateMonth = $this.options.date.getMonth(); //get today's month
		var dateYear = $this.options.date.getFullYear(); //get today's year
		var firstDayOfMonth = new Date(dateYear, dateMonth, 1, 0, 0, 0, 0);
		var firstDayOfCalendar = new Date(firstDayOfMonth.getTime() - 86400000 * firstDayOfMonth.getDay());
		var lastDayOfCalendar = new Date(firstDayOfCalendar.getTime() + 86400000 * 42);
		var $grid = $this.element.find(".tcal-grid");
		$grid.find(".tcal-month-agenda").remove();
		var filteredAgenda = $.grep($this.options.agenda, function(agenda, index){
			var startInRange = (agenda.startDate.getTime() < lastDayOfCalendar.getTime() && agenda.startDate.getTime() >= firstDayOfCalendar.getTime());
			var endInRange = (agenda.endDate.getTime() < lastDayOfCalendar.getTime() && agenda.endDate.getTime() >= firstDayOfCalendar.getTime()); 
			return (startInRange || endInRange);
		});
		//sort the filtered agenda by start date
		filteredAgenda.sort($this._sortAgendaByDate);
		$.each(filteredAgenda, function(index, agenda){
			//div for the agenda
			var firstDay = agenda.startDate;
			var counterDate = new Date(firstDayOfCalendar.getTime());
			if (agenda.startDate.getTime() <= firstDayOfCalendar.getTime()){
				//we use first day of the calendar as the starting point
				firstDay = firstDayOfCalendar;
			}
			//generate the agenda box
			var attr = {hasStarted: false, startedHeight: 0, upToDate : null};
			$this.element.find(".tcal-month-day-cell .tcal-month-day-cell-content").each(function(cellIndex, cell){
				var $cell = $(cell);
				var cellChildren = $cell.children();
				if ($this._isSameDay(counterDate, firstDay)){
					//we found a start date
					//figure out if we have a spot available prior to current height
					var $div;
					if (cellChildren.length > 0){
						//there is something existing already
						$.each(cellChildren, function(height, child){
							if ($(child).hasClass("tcal-month-agenda-used"))
								attr.startedHeight = height + 1;
							else{
								return false;
							}
						});
						//at this point startedHeight would be the height that the cell should be in
						if (cellChildren.length > attr.startedHeight){
							$div = $(cellChildren[attr.startedHeight]);
						}else{
							$div = $("<div/>");
							$cell.append($div);
						}
					}else{
						$div = $("<div/>"); //the div for agenda
						$cell.append($div);
					}
					$div.addClass("tcal-month-agenda tcal-month-agenda-used tcal-month-agenda-actual").css("background-color", agenda.color);
					//add label
					var $label = $("<div/>", {html : agenda.title, "class" : "tcal-month-agenda-title"});
					$div.append($label);
					//difference
					attr.upToDate = new Date(counterDate.getTime() + ( 7 - counterDate.getDay()) * 86400000);
					if (attr.upToDate.getTime() > agenda.endDate){
						attr.upToDate.setTime(agenda.endDate.getTime() - agenda.endDate.getTime() % 86400000 - agenda.endDate.getTimezoneOffset() * -60000);
					}
					var range = Math.ceil((attr.upToDate.getTime() - counterDate.getTime()) / 86400000);
					//console.log(range);
					$div.data("days", range);
					$div.data("weekday", counterDate.getDay());
					var width = $this._monthAgendaWidthOfIndex(counterDate.getDay(), range);
					$div.css("width",  width + "px");
					//insert div into the cell
					attr.hasStarted = true;
				}else if (attr.hasStarted){
					//we have already started to insert
					//there is something existing already, we check to see if it has the proper amount of children
					if (counterDate.getTime() < attr.upToDate.getTime()){
						for (var i = cellChildren.length; i < attr.startedHeight; i++){
							var $div = $("<div/>", {"class" : "tcal-month-agenda"}).css("width", "100%"); //the div for to extend the height
							$cell.append($div);
						}
						if (cellChildren.length <= attr.startedHeight){
							//add an occupying cell
							var $div = $("<div/>", {"class" : "tcal-month-agenda tcal-month-agenda-used"}).css("width", "100%"); //the div for agenda
							$cell.append($div);
						}else{
							//mark existing cell as occupied
							var $div = $($cell.children()[attr.startedHeight]);
							$div.addClass("tcal-month-agenda-used").css("width", "100%");
						}
					}else if (counterDate.getTime() == attr.upToDate.getTime()){
						//find the new upToTime
						attr.upToDate = new Date(counterDate.getTime() + ( 7 - counterDate.getDay()) * 86400000);
						if (attr.upToDate.getTime() > agenda.endDate){
							attr.upToDate.setTime(agenda.endDate.getTime() - agenda.endDate.getTime() % 86400000 - agenda.endDate.getTimezoneOffset() * -60000);
						}
						if (counterDate.getTime() < attr.upToDate.getTime()){
							$div = $("<div/>", {"class" : "tcal-month-agenda tcal-month-agenda-used tcal-month-agenda-actual"}).css("background-color", agenda.color); //the div for agenda
							//add label
							var $label = $("<div/>", {html : agenda.title, "class" : "tcal-month-agenda-title"});
							$div.append($label);
							//add continue label
							var $continueContainer = $("<div/>", {"class" : "tcal-month-agenda-continue-container", html: "<"}).css("height", "100%");
							$div.append($continueContainer);
							var range = Math.ceil((attr.upToDate.getTime() - counterDate.getTime()) / 86400000);
							$div.data("days", range);
							$div.data("weekday", counterDate.getDay());
							var width = $this._monthAgendaWidthOfIndex(counterDate.getDay(), range);
							$div.css("width",  width + "px");
							//insert div into the cell
							attr.hasStarted = true;
							$cell.append($div);
						}else{
							return false;
						}
					}
				}
				counterDate.setTime(counterDate.getTime() + 86400000);
			})
		});
	}
});