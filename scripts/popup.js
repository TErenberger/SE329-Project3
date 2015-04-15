//consider putting all this code in its own closure/object to expose less functions to global space
//not sure if this is used or if we want to use it, CSS can do this
var ellipsize = function(string) {
  var length = 20;
  if (string.length > length)
    return string.substr(0, length) + '&hellip;';
  return string;
};

//from old code base, kinda jank, should refactor
function filterTabs(element){
    value = $(element).val();
}

//primary model, would like to store this
var tabManagerModel = {
    allTabs: {},
    readingList: {},
    groups: {}
};

//'constructor' for the basic tab data type that is a subset of the chrome tab data type
function mTab(chromeTab) {
    this.title = chromeTab.title;
    this.url = chromeTab.url;
    this.id = chromeTab.id;
    this.favIconUrl = chromeTab.favIconUrl;
}

//'constructor' for the reading list tab element, wraps our tab data struct
function readingListTab(mtab) {
    this.read = false;
    this.dateAdded = Date.now();
    this.tab = mtab;
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
        + '<a class="close"><span class="close-button glyphicon glyphicon-remove"></span></a>'
        + '</div>'
        + '</div>'
        +'</li>';
    return html;
}
//from old code base, prob a better way to do this, preferable using our data model to just generate the view instead of requery all tabs
$(function() {
  chrome.tabs.query({ currentWindow: true }, function(tab) {
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
    $('#search').keyup(function(){
            var value = $(this).val().toLocaleLowerCase();
            if(value == ""){
                $('#tablist > li').show();
            }
            else{
                $('#tablist > li').each(function(){
                    var select = $(this).text().toLocaleLowerCase();
                    (select.indexOf(value) >= 0) ? $(this).show() : $(this).hide();
                });
            
            };
        });
    //NYI, maybe a badge by the LIST tab
    $('.tab-count').text(tab.length);
  });
    //from old code, expands tab into a new window. could bring this back or we could just handle window management better.
  /* 
  function expand() {
    var tabId = parseInt($(this).attr('id'), 10);
	chrome.windows.create({ tabId: tabId, focused: true });
  }
  
  $('body').on('dblclick', '#tablist li', expand);
  
  $('body').on('click', '.expand', expand);

  $('body').on('click', '#tablist li', function() {
    var tabId = parseInt($(this).attr('id'), 10);
    chrome.tabs.update(tabId, { active: true });
  });

  $('body').on('click', '.close', function() {
    var parent = $(this).parent();
    chrome.tabs.remove(parseInt(parent.attr('id'), 10));
    $('#item' + parent.attr('id')).slideUp(function() { this.remove();});
  });*/
});
//might not be as useful as last group thought
jQuery(document).ready(function () {


    //from old code, i think bootstrap does this automatically
    /*jQuery('.tabs .tab-links a').on('click', function (e) {
        var currentAttrValue = jQuery(this).attr('href');
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        jQuery(".tab" + currentAttrValue).addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });*/


/* from old code, condense feature, not fully implemented and view removed (could delete)
    jQuery('button').on('click', function () {
        chrome.tabs.query({ currentWindow: true, active: false }, function (tab) {

            var tabsToRemove = [];
            condensedList = localStorage.getItem("condensedList");

            if (typeof condensedList !== typeof []) {
                condensedList = [];
            }

            for (var i = 0; i < tab.length; i++) {
                var currentTab = tab[i];

                var entry = { title: currentTab.title, url: currentTab.url };

                tabsToRemove.push(currentTab.id);
                condensedList.push(entry);

                $('#condenselist').append(
                '<li title="' + currentTab.title + '">' +
                    '<a>' + ellipsize(currentTab.title) + '</a>' +
                    '<span class="delete">x</span>' +
                '</li>');
            }

            localStorage.setItem("condensedList", condensedList);

            chrome.tabs.remove(tabsToRemove);
        });
    });
*/
    //from old code, not used in bootstrap view, could delete
    $('body').on('click', '.delete', function () {
        var parent = $(this).parent();

        condensedList = localStorage.getItem("condensedList");

        for (var i = 0; i < condensedList.length; i++) {
            if (condensedList[i].title === parent.attr('title')) {
                condensedList.splice(i, 1);
                break;
            }
        }

        localStorage.setItem("condensedList", condensedList);

        parent.remove();
    });
    //from old code, not used in bootstrap view
    $('body').on('click', '#condenselist li', function () {
        var tabTitle = $(this).attr('title');
        var tabUrl = "";
        condensedList = localStorage.getItem("condensedList");

        for (var i = 0; i < condensedList.length; i++) {
            if (condensedList[i].title === tabTitle) {
                tabUrl = condensedList[i].url;
                $(this).remove();
                condensedList.splice(i, 1);
                localStorage.setItem("condensedList", condensedList);

                chrome.tabs.create({ url: tabUrl });
            }
        }
    });
    //listener on pushpin anchor, adds target tab to reading list
    $('body').on('click', '.readingListAddElement', function (event) {
        var id = $(this).data('tabnum');
        tabManagerModel.readingList[id] = new readingListTab(tabManagerModel.allTabs[id]);
    });

    //listener on reading list tab (referring to view e.g. List, Reading List, Group) triggers the html element generation when clicked
    $('body').on('click', '#reading-list', function() {
        //clear out the view to prevent duplicate HTML elements representing same object in model
        $('#readingListView').empty();
        for(var currentListItem in tabManagerModel.readingList)
        {
            if(tabManagerModel.readingList.hasOwnProperty(currentListItem))
            {
                var tab = tabManagerModel.readingList[currentListItem];
                $('#readingListView').append(createTabListElement(tab.tab));
            }
            
        }
    });
});