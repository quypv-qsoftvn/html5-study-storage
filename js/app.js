/* =======================================
	Constants
   ======================================= */ 
var IDB_DB_NAME = "qogwart";
var IDB_DB_VERSION = 1;
var IDB_TB_USER = "wizards";

/* =======================================
	Models
   ======================================= */ 
var Wizard = {
	create : function (arrayInputs) {
		return { 
			name : arrayInputs[0], 
			age  : parseInt(arrayInputs[1]), 
			type : arrayInputs[2]
		};
	}
}

/* =======================================
	Check availability of storages
   ======================================= */ 
//Local

//Indexed
var idbSupported = false;
document.addEventListener("DOMContentLoaded", function(){
    if("indexedDB" in window) {
        idbSupported = true;
		_idb.open();
    }
 
},false);


/* =======================================
	Form input processes
   ======================================= */ 
function getInputWizard () {
	var name = document.querySelector('input[name="wizard-name"]').value;
	var age  = document.querySelector('input[name="wizard-age"]').value;
	var type = document.querySelector('input[name="wizard-type"]').value;
	
	if (!name || !age || !type) {
		alert('Not enough info.');
		return false;
	}
	
	return [name, age, type];
};

/* =======================================
	Bind actions
   ======================================= */ 
var dbMode = 'idb';		//Use in DBmode toggle (localstorage <==> indexedDB)
function addNewWizard ()
{
	var arrayInputs = getInputWizard();
	if (!arrayInputs)
		return false;
			
	var newWizard = Wizard.create(arrayInputs);
		
	//Use localStorage or indexedDB api based on which mode is choosen
	if (dbMode == 'ls') {
		_ls.addNewWizard(newWizard);
	} else {
		_idb.addNewWizard(newWizard);
	}
}

/* =======================================
	Core storage functions
   ======================================= */ 
//LOCAL STORAGE api - [SonVQ, ..] should be here xD
var _ls = {
	//Api: Insert new wizard
	addNewWizard : function (newWizard) {
		
	},
	//Api: Delete a wizard
	//Api: Add a wizard to a class
	//Api: Get all students
	//Api: Search students and classes
}
//INDEXEDDB api - [QuyPV, ..] was here
var _idb = {
	db : {},
	//Initial function to open database
	open: function () {
		if(idbSupported) {
			console.log('opening a db');
			var openRequest = indexedDB.open(IDB_DB_NAME, IDB_DB_VERSION);
	 
			openRequest.onupgradeneeded = function(e) {
				//DB structure
				_idb.db = e.target.result;
				if(!_idb.db.objectStoreNames.contains(IDB_TB_USER)) {
					_idb.db.createObjectStore(IDB_TB_USER, { autoIncrement: true });
				}
			}
	 
			openRequest.onsuccess = function(e) {
				console.log("Success!");
				_idb.db = e.target.result;
			}
	 
			openRequest.onerror = function(e) {
				console.log("Error");
				console.dir(e);
			}
		}
	},
	//DB insert with transaction
	insert: function (tableName, data, callbackSuccess, callbackFail) {
		var transaction = _idb.db.transaction([tableName], "readwrite");
		var store = transaction.objectStore(tableName);
		
		//Perform the add
		var request = store.add(data);
		
		request.onsuccess = function(e) {
			if (typeof callbackSuccess == 'function') callbackSuccess();
		}
		
		request.onerror = function(e) {
			//console.log("Error",e.target.error.name);
			if (typeof callbackFail == 'function') callbackFail();
		}
	},
	//DB remove 
	remove: function (tableName, key, callbackSuccess, callbackFail) {
		var transaction = _idb.db.transaction([tableName], "readwrite").objectStore(tableName);
		
		//Perform the update
		var request = transaction.delete(key);
		
		request.onsuccess = function(e) {
			if (typeof callbackSuccess == 'function') callbackSuccess();
		}
		
		request.onerror = function(e) {
			if (typeof callbackFail == 'function') callbackFail();
		}
	},
	//DB get
	get: function (tableName, indexName, key, callbackSuccess, callbackFail) {
		var transaction = _idb.db.transaction([tableName]).objectStore(tableName);
		
		//Perform get
		if (indexName) {
			transaction = transaction.index(indexName);
		}
		
		var request = transaction.get(key);
		
		request.onsuccess = function(e) {
			if (typeof callbackSuccess == 'function') callbackSuccess(request.result);
		}
		
		request.onerror = function(e) {
			if (typeof callbackFail == 'function') callbackFail();
		}
	},
	//DB update 
	update: function (tableName, indexName, key, newData, callbackSuccess, callbackFail) {
		var transaction = _idb.db.transaction([tableName], "readwrite").objectStore(tableName);
		
		//Perform the update
		if (indexName) {
			transaction = transaction.index(indexName);
		}
		
		var request = transaction.get(key);
		
		request.onsuccess = function(e) {
			//Replace old data with new one
		    var requestUpdate = transaction.put(newData);
		    requestUpdate.onsuccess = function(event) {
				// Success - the data is updated!
				if (typeof callbackSuccess == 'function') callbackSuccess();
		    };
			
			requestUpdate.onerror = function(event) {
				if (typeof callbackFail == 'function') callbackFail();
		    };
		}
		
		request.onerror = function(e) {
			if (typeof callbackFail == 'function') callbackFail();
		}
	},
	//Api: Insert new wizard
	addNewWizard : function (newWizard) {
		var onSuccess = function () {
			alert('Warmly welcome!');
		};
		var onFail = function () {
			alert('DB Error! You are not chosen due to a mystic error : (');
		};
		
		_idb.insert(IDB_TB_USER, newWizard, onSuccess, onFail);
	},
	//Api: Delete a wizard
	//Api: Add a wizard to a class
	//Api: Get all students
	//Api: Search students and classes
}
