Database = new Class({
	observedTopics: [],
    hotkeys: [],

	initialize: function(db) {
		this.load(db);
	},

	load: function(db) {
		tmp = localStorage[db];
		if (tmp)
			this[db] = JSON.decode(tmp);
	},

	storeDatabase: function(db) {
		localStorage[db] = JSON.encode(this[db]);
	},

	getData: function(db, key) {
		for (i = 0; i < this[db].length; i++)
			if (this[db][i].id == key)
				return this[db][i];
		return null;
	},

	delData: function(db, key) {
		for (i = 0; i < this[db].length; i++)
			if (this[db][i].id == key) {
				this[db][i] = null;
				break;
			}
		this[db] = this[db].clean();
		this.storeDatabase(db);
	},

	getAllData: function(db) {
		if (this[db] != undefined)
			return this[db];
		return null;
	},

	setData: function(db, key, value) {
		for (i = 0; i < this[db].length; i++)
			if (this[db][i].id == key) {
				this[db][i] = value;
				break;
			}
		if (i >= this[db].length)
			this[db].push(value);
		this[db] = this[db].clean();
		this.storeDatabase(db);
	},

	/**
	 * Egyszerűsítem és ésszerűsítem a figyelt témák adatbázisban való tárolását.
	 * Ezt akkor kell hívni, ha 3.1.23 verzióról vagy régebbiről
	 * frissítjük a kiegészítőt (a háttérscript hívja meg).
	 */
	convertDatabase: function() {
		tmp = [];
		for (i = 0; i < this.observedTopics.topics.length; i++) {
			tmp.push({
				id: this.observedTopics.topics[i][0],
				posts: this.observedTopics.topics[i][1],
				title: this.observedTopics.topics[i][2],
				domain: this.observedTopics.topics[i][3],
				lastPost: this.observedTopics.topics[i][4]
			});
		}
		this.observedTopics = tmp;
		this.storeDatabase("observedTopics");
		this.load("observedTopics");
	}
});

var ObservedTopicsDatabase = new Class({
	Extends: Database,
	initialize: function() {
		this.parent("observedTopics");
		this.type = "observedTopics";
	},

	set: function(key, value) {
		this.setData(this.type, key, value);
	},

	get: function(key) {
		return this.getData(this.type, key);
	},

	del: function(key) {
		this.delData(this.type, key);
	},

	getAll: function() {
		if ( Options.loginNeed && MSG.loginNeed )
			return [];
		return this.getAllData(this.type);
	},

	store: function() {
		this.storeDatabase(this.type);
	}
});

var HotkeysDatabase = new Class({
	Extends: Database,
	initialize: function() {
		this.parent("hotkeys");
		this.type = "hotkeys";
	},

	set: function(key, value) {
		this.setData(this.type, key, value);
	},

	get: function(key) {
		return this.getData(this.type, key);
	},

	del: function(key) {
		this.delData(this.type, key);
	},

	getAll: function() {
		return this.getAllData(this.type);
	},

	store: function() {
		this.storeDatabase(this.type);
	}
});