define([
	'underscore',
	'backbone',
	'app/wigevents'
	],
function(_, Backbone, wigEvents) {

	function deepCopy(obj) {
		var result = _.clone(obj);
		_.each(result, function(value, key) {
			if(_isObject(value)) {
				result[key] = deepCopy(value);
			};
		});
		return result;
	}

	var URModel = Backbone.Model.extend({
		defaults: {
			json: {},
			description: ''
		}
	});

	var UndoRedo = Backbone.Collection.extend({
		model: URModel,
		cursor: -1,
		maxLen: 150,
		initialize: function(appView) {
			var ur = this;
			this.appView = appView;
			this.listenTo(wigEvents, 'changepoint', function(description) {
				ur.smartAdd({
					json: ur.appView.stack.toJSON(),
					description: description
				});
			});

			this.listenTo(wigEvents, 'undo', function() {
				ur.undo();
			});
			this.listenTo(wigEvents, 'redo', function() {
				ur.redo();
			});
		},
		smartAdd: function(obj) {
			if(this.cursor + 1 < this.length) {
				this.remove(this.slice(this.cursor + 1, this.length));
			}
			this.add(obj);
			this.updateCursor(1);
			while(this.length > this.maxLen) {
				this.shift();
			}
			this.cursor = this.length - 1;
		},
		undo: function() {
			var appView = this.appView, yPos;
			if(this.cursor > 0) {
				yPos = window.scrollY;
				wigEvents.trigger('cancelall');
				appView.stack.set(this.at(this.cursor - 1).get('json'));
				appView.stack.trigger('childupdate');
				this.updateCursor(-1);
				window.scrollTo(0, yPos);
			}
		},
		redo: function() {
			var appView = this.appView, yPos;
			if(this.cursor < this.length - 1) {
				yPos = window.scrollY;
				wigEvents.trigger('cancelall');
				appView.stack.set(this.at(this.cursor + 1).get('json'));
				appView.stack.trigger('childupdate');
				this.updateCursor(1);
				window.scrollTo(0, yPos);
			}
		},
		updateCursor: function(i) {
			var enablestring = '',
			undoText = '',
			redoText = '';
			this.cursor += i;
			if(this.cursor <= 0) {
				// wigEvents.trigger('urenable', 'disableundo');
			} else {
				enablestring += 'U';
				undoText = this.at(this.cursor).get('description');
				// wigEvents.trigger('urenable', 'enableundo');
			}
			if(this.cursor >= this.length -1) {
				// wigEvents.trigger('urenable', 'disableredo');
			} else {
				// wigEvents.trigger('urenable', 'enableredo');	
				enablestring += 'R';	
				redoText = this.at(this.cursor + 1).get('description');		
			}
			wigEvents.trigger('urenable', enablestring, undoText, redoText);
		}

	});

	return UndoRedo;
}
);