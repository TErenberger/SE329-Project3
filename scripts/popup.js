//consider putting all this code in its own closure/object to expose less functions to global space

//primary model, would like to store this
var tabManagerModel = {
    allTabs: {},
    readingList: {},
    groups: {},
    customGroups: {}
};

var groupSettings = {
    groups: {}
};

//counts # of items in the reading list dictionary and sets value of badge on the extension icon
function updateBadge() {
    var count = 0;
    for(var currentListItem in tabManagerModel.readingList)
    {
        if(tabManagerModel.readingList.hasOwnProperty(currentListItem) && tabManagerModel.readingList[currentListItem].read == false)
        {
            count++;
        }
    }
    chrome.browserAction.setBadgeText({'text': '' + count});
}

//'constructor' for the basic tab data type that is a subset of the chrome tab data type
function mTab(chromeTab) {
    this.title = chromeTab.title;
    this.url = chromeTab.url;
    this.id = chromeTab.id;
    this.favIconUrl = chromeTab.favIconUrl == undefined || chromeTab.favIconUrl == '' ? '../img/favicon.ico' : chromeTab.favIconUrl;
}

//'constructor' for the reading list tab element, wraps our tab data struct
function readingListTab(mtab) {
    this.read = false;
    this.dateAdded = Date.now();
    this.tab = new mTab(mtab);
}

//'constructor' for group object
function tabGroup(title) {
    this.title = title;
    this.id = title.replace('.', '');
    this.tabs = {};
    this.color = 'white';
    this.domains = {};
}

//helper to add basic tab to reading list
function addToReadingList(mtab) {
    tabManagerModel.readingList[mtab.id] = new readingListTab(mtab);
}

//helper to generate html elements for view from basic tab struct
function createTabListElement(mtab) {
    var html = '<li class="list-group-item" id="item' + mtab.id + '">'
        +'<div class="row">'
        +'<div class="col-xs-10 tab-element">'
        +'<a class="tab-title">'
        + '<img class="tab-img"  height="16px" src="' + mtab.favIconUrl + '">'
        + mtab.title
        + '</a>'
        + '</div>'
        + '<div class="col-xs-1">'
        + '<a class="readingListAddElement" data-tabnum="' + mtab.id + '"><span class="glyphicon glyphicon-pushpin"></span></a>'
        + '</div>'
        + '<div class="col-xs-1" id="' + mtab.id + '">'
        + '<a class="close-tab"><span class="close-button glyphicon glyphicon-remove"></span></a>'
        + '</div>'
        + '</div>'
        +'</li>';
    return html;
}

//helper to generate html elements for view from basic tab struct
function createReadingListElement(readingListTab) {
    var html = '<li class="list-group-item';
    if(readingListTab.read)
    {
        html += ' readinglist-read';
    }
    html += '" id="read' + readingListTab.tab.id + '">'
        +'<div class="row">'
        +'<div class="col-xs-11 tab-element">'
        +'<a class="tab-title readinglist-link" data-tabid="' + readingListTab.tab.id + '">'
        + '<img class="tab-img"  height="16px" src="' + readingListTab.tab.favIconUrl + '">'
        + readingListTab.tab.title
        + '</a>'
        + '</div>'
        + '<div class="col-xs-1" id="' + readingListTab.tab.id + '">'
        + '<a class="close-readinglist"><span class="close-button glyphicon glyphicon-remove"></span></a>'
        + '</div>'
        + '</div>'
        +'</li>';
    return html;
}

function createGroupElement(group) {
    var html = '<ul class="list-group" id="group' + group.id + '">'
    + '<li class="list-group-item" style="background-color: ' + group.color + ';">'
    + group.title
    + '</li>'
    + '</ul>';
    return html;
}

function createGroupInnerElement(tab) {

}

function clearGroups() {
    tabManagerModel.groups = {};
}

function populateGroups() {
    var domains = {};
    for(var currentTabIndex in tabManagerModel.allTabs)
    {
        var currentTab = tabManagerModel.allTabs[currentTabIndex];
        var results = currentTab.url.match(/[A-z]*(.com|.co.uk|.us|.org|.net|.mobi|.edu)/);
        if(results != undefined)
        {
            if(domains[results[0]] == undefined)
            {
                domains[results[0]] = new Array();
                domains[results[0]].push(new mTab(currentTab));
                var groupTab = new mTab(currentTab);
                tabManagerModel.groups[results[0]] = new tabGroup(results[0]);
                tabManagerModel.groups[results[0]].tabs[groupTab.id] = groupTab;
            }
            else
            {
                var groupTab = new mTab(currentTab);
                domains[results[0]].push(new mTab(groupTab));
                tabManagerModel.groups[results[0]].tabs[groupTab.id] = groupTab;
            }
            
        }
    }

    console.log(tabManagerModel.groups);
}

function populateCustomGroups() {

    // For each custom group, check each of its rules against all the open tabs
    for (var grp in groupSettings.groups) {
        var curGroup = groupSettings.groups[grp];

        // Get the rules for this group, and replace the commas and white space with a '|'
        var curRules = curGroup.rules.replace(/\s*,\s*/g, "|");

        tabManagerModel.customGroups[curGroup.name] = new tabGroup(curGroup.name)

        // For each open tab, check to see if it matches any rules of the current group
        for (var currentTabIndex in tabManagerModel.allTabs) {
            var currentTab = tabManagerModel.allTabs[currentTabIndex];

            var results = currentTab.url.match(new RegExp('[A-z0-9]*(' + curRules + ')'));

            // If the rule was matched, add it to the custom group
            if (results != undefined) {
                var groupTab = new mTab(currentTab);
                tabManagerModel.customGroups[curGroup.name].tabs[groupTab.id] = groupTab;
                var groupTab = new mTab(currentTab);
                tabManagerModel.customGroups[curGroup.name].tabs[groupTab.id] = groupTab;
            }
        }
    }
}
		
function renderReadingList() {
    //clear out the view to prevent duplicate HTML elements representing same object in model
    $('#readingListView').empty();
    for(var currentListItem in tabManagerModel.readingList)
    {
        if(tabManagerModel.readingList.hasOwnProperty(currentListItem))
        {
            var tab = tabManagerModel.readingList[currentListItem];
            $('#readingListView').append(createReadingListElement(tab));
        }
    }
}

function renderGroupList() {
    $('#groupView').empty();
    for(var currentGroupIndex in tabManagerModel.groups)
    {
        var currentGroup = tabManagerModel.groups[currentGroupIndex];
        $('#groupView').append(createGroupElement(currentGroup));
        for(currentTab in currentGroup.tabs)
        {
            console.log(currentGroup.id);
            $('#group' + currentGroup.id).append(createTabListElement(currentGroup.tabs[currentTab]));
        }
    }
}

function renderCustomGroupList() {
    $('#customGroupView').empty();
    for(var currentGroupIndex in tabManagerModel.customGroups)
    {
        var currentGroup = tabManagerModel.customGroups[currentGroupIndex];
        $('#customGroupView').append(createGroupElement(currentGroup));
        for(currentTab in currentGroup.tabs)
        {
            console.log(currentGroup.id);
            $('#group' + currentGroup.id).append(createTabListElement(currentGroup.tabs[currentTab]));
        }
    }
}

/*
 * Loads the custom group settings from chrome.storage
 */
function loadCustomGroupSettings() {

    // Restore options from storage
    chrome.storage.sync.get({
        groupSettings: {
            groups: {}
        }
    }, function(items) {
        groupSettings = items.groupSettings;
    });
}

/*
 * storage API functions
 */ 
var createGroup = function(groupName, url){
	var obj = new Object();
	obj[groupName] = url;
	chrome.storage.local.set(obj);
}

/*
 * returns the names of every group, delimited by a comma
 */
var getGroups = function(){
	chrome.storage.local.get(null, function(items){
		alert(Object.keys(items));
	});
}

/*
 * returns the urls associated with the specified group name
 * urls are retuned as one string for now, delimited by white space.
 */
var getTabsInGroup = function(groupName){
	chrome.storage.local.get(groupName, function(items){
		alert(items[groupName]);
	});
}

/*
 * adds a tab url to the given group, creates the group if it does not exist already
 */
var addTabToGroup = function(groupName, url){
	var currentTabsInGroup;
	chrome.storage.local.get(groupName, function(items){
		currentTabsInGroup = items[groupName];
		if(currentTabsInGroup == null){
			createGroup(groupName, url)
		}
		else{
			if(currentTabsInGroup.indexOf(url) == -1){
				var temp = currentTabsInGroup.concat(" ");
				var newVal = temp.concat(url);
				var obj = new Object;
				obj[groupName] = newVal;
				chrome.storage.local.set(obj);
			}	
		}
	});
	
}

function storeDataModel() {
    chrome.storage.local.set(tabManagerModel);
    updateBadge();
}

function retrieveDataModel() {
    chrome.storage.local.get(function(items) {
        if(items.hasOwnProperty('readingList'))
        {
            tabManagerModel.readingList = items.readingList;
        }
        updateBadge();
    });
}

function purgeStorage() {
    chrome.storage.local.clear(function() {
        console.log('cleared chrome local storage');
    });

}


//from old code base, prob a better way to do this, preferable using our data model to just generate the view instead of requery all tabs
$(function() {
  chrome.tabs.query({ }, function(tab) {
    //loops through the broad query to add the tabs to our data model. When we get storage going, this may need to clear out the tabs or do a set union
    //to prevent duplicates.
    for (var i = tab.length - 1; i >= 0; i--) {
        //reduce chrome data structure to our data structure
        var currentTab = new mTab(tab[i]);
        //append html representation of our data structure
        $('#tablist').append(createTabListElement(currentTab));
        //add to the global data structure
        tabManagerModel.allTabs[currentTab.id] = currentTab;
    }

    //actually works
    $('#search').keyup(function() {
            var value = $(this).val().toLocaleLowerCase();
            if(value == "") {
                $('#tablist > li').show();
            }
            else {
                $('#tablist > li').each(function() {
                    var select = $(this).text().toLocaleLowerCase();
                    (select.indexOf(value) >= 0) ? $(this).show() : $(this).hide();
                });
            
            };
    });
		//search for reading list
  });

    //from old code, expands tab into a new window. could bring this back or we could just handle window management better.
    function expand() {
        var tabId = parseInt($(this).attr('id'), 10);
    	chrome.windows.create({ tabId: tabId, focused: true });
    }

    // button for closing a tab
    $('body').on('click', '.close-tab', function() {
        var parent = $(this).parent();
        chrome.tabs.remove(parseInt(parent.attr('id'), 10));
        $('#item' + parent.attr('id')).slideUp(function() { this.remove();});
    });

    // button for removing an item from the reading list
    $('body').on('click', '.close-readinglist', function() {
        var parent = $(this).parent();
        delete tabManagerModel.readingList[parent.attr('id')];
        $('#read' + parent.attr('id')).slideUp(function() { this.remove();});
        storeDataModel();
    });

    // button to open an item in the reading list
    $('body').on('click', '.readinglist-link', function() {
        var id = $(this).data('tabid');
        var url = tabManagerModel.readingList[id].tab.url;
        tabManagerModel.readingList[id].read = true;
        chrome.tabs.create({url: url, active: true});
        //renderReadingList();
        storeDataModel();
    });
});


//might not be as useful as last group thought
jQuery(document).ready(function () {
    //updates tabManagerModel from local storage
    retrieveDataModel();
    //listener on pushpin anchor, adds target tab to reading list
    $('body').on('click', '.readingListAddElement', function (event) {
        var id = $(this).data('tabnum');
        addToReadingList(tabManagerModel.allTabs[id]);
        storeDataModel();
    });

    //listener on reading list tab (referring to view e.g. List, Reading List, Group) triggers the html element generation when clicked
    $('body').on('click', '#reading-list', function() {
        renderReadingList();
    });

    $('body').on('click', '#group-list', function() {
        populateGroups();
        renderGroupList();
    });

    $('body').on('click', '#custom-group-list', function() {
        loadCustomGroupSettings();
        populateCustomGroups();
        renderCustomGroupList();
    });
	
	$('#readinglistsearch').keyup(function(){
		var value = $(this).val().toLocaleLowerCase();
		if(value == ""){
			$('#readingListView > li').show();
		}
		else{
			$('#readingListView > li').each(function(){
				var select = $(this).text().toLocaleLowerCase();
				(select.indexOf(value) >= 0) ? $(this).show() : $(this).hide();
			});
		
		};
	});
		
});
