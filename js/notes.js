	var width = 150,  height = 150;

	function dict_format(){//function for setting css
		var formatted_str = arguments[0] || '';
		var dict = arguments[1];
		for(var key in dict){
			var re = new RegExp("\\{"+key+"}", "gim");
			formatted_str = formatted_str.replace(re, dict[key]);
		}
		return formatted_str;
	}


	jQuery.fn.exists = function(){ 
		return this.length > 0; 
	};
	//set css format of note div. for example with, height, position, background color and so on.
	var CSS = dict_format(""
		+ 'div.note_{identifier} div, div.note_{identifier} span, div.note_{identifier} img{ margin:0; padding:0; border:0; outline:0; vertical-align:baseline; background:transparent; }'
		+ 'div.note_{identifier} a { margin:0; padding:0; font-size:100%; vertical-align:baseline; background:transparent; }'

		+ 'div.note_{identifier} {\n'
		+   'position: absolute !important;\n'
		+   'display: inline-block !important;\n'
		+   'height: auto !important;\n'
		+   'overflow: hidden !important;\n'
		+   'font-family: Arial !important;\n'
		+   'font-size: 10px !important;\n'
		+   'color: white !important;\n'
		+   'background-color: #c2df8f !important;'
		+   'box-shadow: 0 0 10px #565656 !important;\n'
		+   'border-radius: 4px !important;\n'
		+   'text-align: left !important;'
		+   'float: none !important;\n'
		+ '}\n'

		+ 'div.note_{identifier} span {\n'
		+   'cursor: pointer !important;\n'
		+   'position: absolute !important;\n'
		+   'right: 5px !important;\n'
		+   'font-size: 14px !important;\n'
		+   'float: none !important;\n'
		+ '}\n'

		+ 'div.note_{identifier} .note_header {\n'
		+   'position: relative !important;\n'
		+   'color: black !important;\n'
		+   'padding: 2px !important;\n'
		+   'float: none !important;\n'
		+ '}'

		+ 'div.note_{identifier} .note_header {\n'
		+   'cursor: move !important;\n'
		+ '}'

		+ 'div.note_editable {\n'
		+   'border-bottom-left-radius: 4px !important;\n'
		+   'border-bottom-right-radius: 4px !important;\n'
		+   'padding: 4px !important;\n'
		+   'overflow: hidden !important;\n'
		+   'width: {width}px !important;' 
		+   'min-height: {height}px !important;\n'
		+   'height: auto !important;\n'
		+   'color: black !important;\n'
		+   'font-size: 14px !important;\n'
		+   'background-color: #e7f2d5 !important;\n'
		+   'text-align: left !important;'
		+   'float: none !important;\n'
		+ '}',
		{width: width, height: height}
	);


	// add new note node.
	(function ($) {
		var xp = function (xpath, contextNode) {
			var iterator = document.evaluate(xpath, contextNode, null, XPathResult.ANY_TYPE, null),
				node     = iterator.iterateNext(),
				nodes    = [];

			while (node) {
				nodes.push(node);
				node = iterator.iterateNext();
			}

			return nodes;
		};

		$.xpath = function (xpath) {
			return $(xp(xpath, document));
		}

		$.fn.xpath = function (xpath) {
			var nodes = [];

			this.each(function () {
				nodes.push.apply(nodes, xp(xpath, this));
			});

			return this.pushStack(nodes, "xpath", xpath);
		}
	})(jQuery);

	Date.prototype.monthNames = [//array for months on notes
		"January", "February", "March",
		"April", "May", "June",
		"July", "August", "September",
		"October", "November", "December"
	];

	Date.prototype.getMonthName = function() {
		return this.monthNames[this.getMonth()];
	};
	Date.prototype.getShortMonthName = function () {
		return this.getMonthName().substr(0, 3);
	};

	function pad(n) {
		return (n < 10 ? '0' : '') + n;
	}

	//}}}

	var NoteMaster = new function() {
		var self = this;

		self.placeholdertext = "Click to edit";
		self.notes = [];
		self.identifier = (new Date()).valueOf();
		self.maxZ = Math.max.apply(null, 
			$.map($('body > *'), function(e,n) {
				//if ($(e).css('position') != 'static'){
					return parseInt($(e).css('zIndex')) || 1;
				 //   }
			})
		);

		self.toFront = function(target){
			$(dict_format("div.note_{identifier}",{identifier: self.identifier}))
				.each(function(idx, item){
					if(item != target){
						$(item).css("zIndex", self.maxZ);
					} else {
						$(item).css("zIndex", self.maxZ + 1);
					}
				});
		};
	//Add note div to document body element.
		self.putNote = function(note){
			var date = new Date(note.epoch);//get current date
			var wtop = $(window).scrollTop(),//get top size from note element to window top
				wleft = $(window).scrollLeft()//get top size from note element to window left
				w_height = $(window).height(),//get window height
				w_width = $(window).width();//get window width
				

			var node = $(dict_format("<div class='note_{identifier}'  id='note_{epoch}'>"
				+   "<div class='note_header'>"
				+       "{date}"
				+       "<span title='Delete note'>×</span>"
				+   "</div>"
				+   "<div contenteditable='true' class='note_editable' placeholder='" + self.placeholdertext + "'>{content}</div>"
				+ "</div>", 
					{identifier: self.identifier, 
					epoch: note.epoch, 
					date: dict_format("{month} {day}, {year} {hour}:{minute}:{second}", 
							{day: pad(date.getDay()), month: date.getShortMonthName(), year: date.getFullYear(), 
							hour: pad(date.getHours()), minute: pad(date.getMinutes()), second: pad(date.getSeconds())}),
					content: note.content 
					}
				))
				.css({
					top: (note.position? note.position.top: (Math.random() * 1000) % (w_height - height)  + wtop),
					left: (note.position? note.position.left:(Math.random() * 1000) % (w_width - width) + wleft),
					position: "absolute"
				})
				.draggable({
					handle: "div.note_header",
					cancel: "div.note_editable",
					start: function(event, ui){
						$(dict_format(dict_format(".note_{identifier}", {identifier: self.identifier})))
							.css("zIndex", self.maxZ);
						$(event.target).css("zIndex", self.maxZ + 1);
					},
					stop: function(event, ui) {
						var item = this;
						// elementfrompoint sadece en üstteki elemanı alıyor 
						// bu yüzden bir git, gel yapıyoruz

						chrome.extension.sendRequest(
							{
								command: "updateNotePosition",
								epoch: $(item).attr("id").replace(/note_/,""),
								position: ui.offset
							},
							function(response){
								if(response.status != "success"){
									alert(response.message);
								}
							}
						);
					}
				});
			node.find(".note_editable").keyup(
				function(event){
					var id = $(this).parents("div").attr("id").replace(/note_/,"");
					chrome.extension.sendRequest(
						{
							command: "updateNoteContent",
							epoch: id,
							content: $(this).text().replace(/\n/, "<br>")
						},
						function(response){
							if(response.status != "success"){
								alert(response.message);
							}
						}
					);
				}
			);
			return node;
		};

		self.newEmptyNote = function(){
			var epoch = (new Date()).valueOf();
			var node = self.putNote({identifier: self.identifier, 
						epoch: epoch, 
						isnew: true,
						content: "&nbsp;"}
					);

			$("body").append(node);//current note add to body
			
			chrome.extension.sendRequest(// send request to background.js
				{
					command: "createNote",
					position: {top: 0, left: 0},
					epoch: epoch
				},
				function(response){
					if(response.status != "success"){
						alert(response.message);
					}
				}
			);
		};
	//when click delete button(*), extension send request background js and then if response, delete note. 
	//file : js/background.js
		self.deleteNote = function(epoch){
			chrome.extension.sendRequest(//send request to background.js with "deleteNote"
				{
					command: "deleteNote",
					epoch: epoch
				},
				function(response){
					if(response.status != "success"){
						alert(response.message);
					} else {
						$(dict_format("#note_{epoch}", {epoch: epoch})).remove();
					}
				}
			);
		};

		self.displayNotes = function(notes){
			var l = [];
			
			$(".note_" + self.identifier).remove();
			self.notes = notes;

			$(self.notes).each(
				function(idx, note){
					// relitem.pos + relpos = pos
					l.push(self.putNote(note));
				}
			);
			$("body").append(l);
		};


		//{{{ from firebug 
		self.getElementTreeXPath = function(element)
		{
			var paths = [];

			// Use nodeName (instead of localName) so namespace prefix is included (if any).
			for (; element && element.nodeType == 1; element = element.parentNode)
			{
				var index = 0;
				for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
				{
					// Ignore document type declaration.
					if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
						continue;

					if (sibling.nodeName == element.nodeName)
						++index;
				}

				var tagName = element.nodeName.toLowerCase();
				var pathIndex = (index ? "[" + (index+1) + "]" : "");
				paths.splice(0, 0, tagName + pathIndex);
			}

			return paths.length ? "/" + paths.join("/") : null;
		};

		self.getElementXPath = function(element)
		{
			if (element && element.id)
				return '//*[@id="' + element.id + '"]';
			else
				return self.getElementTreeXPath(element);
		};
		// }}}

	}();

	//Chrome extension runtime event listener from background script.
	//file: from popup.js
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (request.command == 'newEmptyNote'){
			return NoteMaster.newEmptyNote("");
		}
	});
	//add style to document head element.
	$(dict_format("<style type='text/css' id='notesStyle_{identifier}'></style>", {identifier: NoteMaster.identifier}))
			.text(dict_format(CSS, {identifier: NoteMaster.identifier}))
			.appendTo("head");



	//delete note from current web page
	$(dict_format(".note_{identifier} span", {identifier: NoteMaster.identifier}))
		.live("click", function(event){
			var id = $(this).parents(dict_format(".note_{identifier}", {identifier: NoteMaster.identifier}))
						.attr("id").replace(/note_/, "");
			//if(confirm("Note will be deleted permanently, are you sure?")){
				NoteMaster.deleteNote(id);
			//}
		});

	$(dict_format(".note_{identifier} .note_editable", {identifier: NoteMaster.identifier}))
		.live("blur", 
			function(event){
				event.target.designMode = "off";
			})
		.live("focus", function(event){
			NoteMaster.toFront($(event.target)
				.parents(dict_format("div.note_{identifier}",{identifier: self.identifier}))
				.get(0));


			event.target.designMode = "on";
			$(event.target).keydown(function(ev){
				if (ev.keyCode == 13){
				}
			});
		});

	//send request to background js.
	//file:js/background.js
	chrome.extension.sendRequest(
		{command: "getNotes"},
		function(response){
			if(response.notes.length){
				NoteMaster.displayNotes(response.notes);
			}
		}
	);
