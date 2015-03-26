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
	addNewWizard : function (newWizard) {
		
	}
}
//INDEXEDDB api - [QuyPV, ..] was here
var _idb = {
	db : {},
	//Initial function to open database
	open: function () {
		if(idbSupported) {
			console.log('opening a db');
			var openRequest = indexedDB.open("qogwart", 1);
	 
			openRequest.onupgradeneeded = function(e) {
				//DB structure
				_idb.db = e.target.result;
				if(!_idb.db.objectStoreNames.contains("wizards")) {
					_idb.db.createObjectStore("wizards", { autoIncrement: true });
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
	insert: function (data, callbackSuccess, callbackFail) {
		var transaction = _idb.db.transaction(["wizards"], "readwrite");
		var store = transaction.objectStore("wizards");
		
		//Perform the add
		var request = store.add(newWizard);
		
		request.onerror = function(e) {
			//console.log("Error",e.target.error.name);
			if (typeof callbackSuccess == 'function') callbackSuccess();
		}
		 
		request.onsuccess = function(e) {
			if (typeof callbackFail == 'function') callbackFail();
		}
	},
	//DB update 
	update: function (data, callbackSuccess, callbackFail) {
		
	}
	//Api: Insert new wizard
	addNewWizard : function (newWizard) {
		var onSuccess = function () {
			alert('Warmly welcome!');
		}
		var onFail = function () {
			alert('DB Error! You are not chosen due to a mystic error : (');
		}
		
		_idb.insert(newWizard, onSuccess, onFail);
	}
}
