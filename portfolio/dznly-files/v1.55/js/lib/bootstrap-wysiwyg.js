/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
	'use strict';
	var readFileIntoDataUrl = function (fileInfo) {
		var loader = $.Deferred(),
			fReader = new FileReader();
		fReader.onload = function (e) {
			loader.resolve(e.target.result);
		};
		fReader.onerror = loader.reject;
		fReader.onprogress = loader.notify;
		fReader.readAsDataURL(fileInfo);
		return loader.promise();
	};
	$.fn.cleanHtml = function () {
		var html = $(this).html();
		return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
	};
	$.fn.stopWysiwyg = function () {
		var editor = this,
			selectedRange,
			options,
			toolbarBtnSelector,
			execCommand = function (commandWithArgs, valueArg) {
			},
			bindHotkeys = function (hotKeys) {
				editor.parent().unbind('keydown').unbind('keyup');
			},
			bindToolbar = function (toolbar, options) {
				toolbar.find(toolbarBtnSelector).unbind('click', fns.f1);
				toolbar.find('[data-toggle=dropdown]').unbind('click',fns.restoreSelection);

				toolbar.find('input[type=text][data-' + options.commandRole + ']').unbind('webkitspeechchange change', fns.f2)
				.unbind('focus', fns.f3)
				.unbind('blur', fns.f4);
				toolbar.find('input[type=file][data-' + options.commandRole + ']').unbind('change',fns.f5);
			},
			initFileDrops = function () {
				editor.unbind('dragenter dragover')
					.unbind('drop', fns.f6);
			};
		options = $.extend({}, $.fn.wysiwyg.defaults);
		var fns = $.fn.wysiwyg.defaults.fns;
		if($.data(editor[0], 'wysiwig-started')) {
			toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
			bindHotkeys(options.hotKeys);
			if (options.dragAndDropImages) {
				initFileDrops();
			}
			bindToolbar($(options.toolbarSelector), options);
			editor.removeAttr('contenteditable')
				.unbind('mouseup keyup mouseout')
				.off('keydown', fns.returnHandler);
			$.data(editor[0], 'wysiwig-started', false);
		}
		return this;
	};
	$.fn.wysiwyg = function (userOptions) {
		var editor = this,
			selectedRange,
			options,
			toolbarBtnSelector,
			updateToolbar = function () {
				if (options.activeToolbarClass) {
					$(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
						var command = $(this).data(options.commandRole);
						var qcs = false;
						try{
							var qcs = document.queryCommandState(command);
						} catch(e) {
							qcs = false;
						}
						if (qcs) {
							$(this).addClass(options.activeToolbarClass);
						} else {
							$(this).removeClass(options.activeToolbarClass);
						}
					});
				}
			},
			execCommand = function (commandWithArgs, valueArg) {
				var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || ''),
					align = '';
				if(command.match(/^justify/)) {
					if(command === 'justifyleft') { align = 'left'; }
					else if(command === 'justifyright') { align = 'right'; }
					else if(command === 'justifycenter') { align = 'center'; }
					else if(command === 'justifyfull') { align = 'justify'; }
					editor.parent().css({
						'text-align' : align
					});
				}else {
					document.execCommand(command, 0, args);
				}
				updateToolbar();
			},
			bindHotkeys = function (hotKeys) {
				$.each(hotKeys, function (hotkey, command) {
					editor.parent().keydown(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
							execCommand(command);
						}
					}).keyup(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
						}
					});
				});
			},
			getCurrentRange = function () {
				var sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					return sel.getRangeAt(0);
				}
			},
			saveSelection = function () {
				// console.log('saveSelection');
				selectedRange = getCurrentRange();
			},
			restoreSelection = function () {
				var selection = window.getSelection();
				if (selectedRange) {
					try {
						selection.removeAllRanges();
					} catch (ex) {
						document.body.createTextRange().select();
						document.selection.empty();
					}

					selection.addRange(selectedRange);
				}
			},
			insertFiles = function (files) {
				editor.focus();
				$.each(files, function (idx, fileInfo) {
					if (/^image\//.test(fileInfo.type)) {
						$.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
							execCommand('insertimage', dataUrl);
						}).fail(function (e) {
							options.fileUploadError("file-reader", e);
						});
					} else {
						options.fileUploadError("unsupported-file-type", fileInfo.type);
					}
				});
			},
			markSelection = function (input, color) {
				restoreSelection();
				if (document.queryCommandSupported('hiliteColor')) {
					document.execCommand('hiliteColor', 0, color || 'transparent');
				}
				saveSelection();
				input.data(options.selectionMarker, color);
			},
			f1 = function() {
				restoreSelection();
				editor.focus();
				execCommand($(this).data(options.commandRole));
				saveSelection();
			},
			f2 = function() {
				var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
				this.value = '';
				restoreSelection();
				if (newValue) {
					editor.focus();
					execCommand($(this).data(options.commandRole), newValue);
				}
				saveSelection();
			},
			f3 = function() {
				var input = $(this);
				if (!input.data(options.selectionMarker)) {
					markSelection(input, options.selectionColor);
					input.focus();
				}
			},
			f4 = function () {
				var input = $(this);
				if (input.data(options.selectionMarker)) {
					markSelection(input, false);
				}
			},
			f5 = function () {
				restoreSelection();
				if (this.type === 'file' && this.files && this.files.length > 0) {
					insertFiles(this.files);
				}
				saveSelection();
				this.value = '';
			},
			f6 = function (e) {
				var dataTransfer = e.originalEvent.dataTransfer;
				e.stopPropagation();
				e.preventDefault();
				if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
					insertFiles(dataTransfer.files);
				}
			},
			bindToolbar = function (toolbar, options) {
				toolbar.find(toolbarBtnSelector).click(f1);
				toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

				toolbar.find('input[type=text][data-' + options.commandRole + ']').on('webkitspeechchange change', f2)
				.on('focus', f3)
				.on('blur', f4);
				toolbar.find('input[type=file][data-' + options.commandRole + ']').change(f5);

				//wizzywig custom code
				toolbar.on('command', function(evt, commandWithArgs) {
					execCommand(commandWithArgs);
				});

				// $('.brick-bar').on('savesel', function() {
				// 	saveSelection();
				// });

				editor.on('command', function(evt, commandWithArgs) {
					restoreSelection();
					editor.focus();
					execCommand(commandWithArgs);
					saveSelection();
				});
			},
			initFileDrops = function () {
				editor.on('dragenter dragover', false)
					.on('drop', f6);
			};
		options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
		toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
		bindHotkeys(options.hotKeys);
		if (options.dragAndDropImages) {
			initFileDrops();
		}
		bindToolbar($(options.toolbarSelector), options);

		var returnHandler = function(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var selection = window.getSelection(),
			    range = selection.getRangeAt(0),
			    br = document.createElement('br');
			range.deleteContents();
			range.insertNode(br);
			range.setStartAfter(br);
			range.setEndAfter(br);
			if(editor.children().last().is(br)) {
				editor.append('<br>');
			}
			// document.execCommand('insertText', 0, ' ');
			// saveSelection();
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);

			// editor.trigger('command', 'insertHtml <br>')

			return false;
		};

		editor.attr('contenteditable', true)
			.on('mouseup keyup mouseout', function (evt) {
				//wizzywig custom code to address moving out of the element while dragging to select
				window.setTimeout(function() {
					saveSelection();
					updateToolbar();
				}, 50);
			})
			.on('savesel', function() {
				saveSelection();
			});
		// if(!document.execCommand('insertBrOnReturn', 0, 'true')) {	
		// editor.on('keydown', null, 'return', returnHandler);
		// }
		// document.execCommand('styleWithCSS', 0, 'true');


		$(window).bind('touchend', function (e) {
			var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
				currentRange = getCurrentRange(),
				clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
			if (!clear || isInside) {
				saveSelection();
				updateToolbar();
			}
		});
		var fns = {
			f1: f1,
			f2: f2,
			f3: f3,
			f4: f4,
			f5: f5,
			f6: f6,
			restoreSelection: restoreSelection
		};
		$.fn.wysiwyg.defaults['fns'] = fns;
		$.data(editor[0], 'wysiwig-started', true);
		return this;
	};
	$.fn.wysiwyg.defaults = {
		hotKeys: {
			'ctrl+b meta+b': 'bold',
			'ctrl+i meta+i': 'italic',
			'ctrl+u meta+u': 'underline',
			'ctrl+z meta+z': 'undo',
			'ctrl+y meta+y meta+shift+z': 'redo',
			'ctrl+l meta+l': 'justifyleft',
			'ctrl+r meta+r': 'justifyright',
			'ctrl+e meta+e': 'justifycenter',
			'ctrl+j meta+j': 'justifyfull',
			'shift+tab': 'outdent',
			'tab': 'indent'
		},
		toolbarSelector: '[data-role=editor-toolbar]',
		commandRole: 'edit',
		activeToolbarClass: 'btn-info',
		selectionMarker: 'edit-focus-marker',
		selectionColor: 'darkgrey',
		dragAndDropImages: true,
		fileUploadError: function (reason, detail) { console.log("File upload error", reason, detail); }
	};
}($));
