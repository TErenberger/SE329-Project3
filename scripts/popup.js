//https://github.com/dburles/chrome-tab-popup trying to get jquery to work
var ellipsize = function(string) {
  var length = 20;
  if (string.length > length)
    return string.substr(0, length) + '&hellip;';
  return string;
};

function filterTabs(element){
    value = $(element).val();
    
}

var tabManagerModel = {
    allTabs: [],
    readingList: [],
    groups: []
};

function mTab(chromeTab) {
    this.title = chromeTab.title;
    this.url = chromeTab.url;
    this.id = chromeTab.id;
    this.favIconUrl = chromeTab.favIconUrl;
}

function readingListTab(mtab) {
    this.read = false;
    this.dateAdded = Date.now();
    this.tab = mtab;
}

function addToReadingList(mtab) {
    tabManagerModel.readingList.push(new readingListTab(mtab));
}

function createTabListElement(mtab) {
    var html = '<li class="list-group-item" id="item' + mtab.id + '">'
        +'<div class="row">'
        +'<div class="col-xs-10 tab-element">'
        +'<a class="tab-title">'
        + '<img class="tab-img"  height="16px" src="' + mtab.favIconUrl + '">'
        + mtab.title
        //'<span class="pull-right glyphicon glyphicon-plus"></span>' 
        + '</a>'
        + '</div>'
        + '<div class="col-xs-1" id="' + mtab.id + '">'
        + '<a class="close"><span class="close-button glyphicon glyphicon-remove"></span></a>'
        // + '<span class="close-button glyphicon glyphicon-remove"></span>'
        + '</div>'
        + '<div class="col-xs-1" id="read' + mtab.id + '">'
        + '<a class="readingListAddElement"><span class="glyphicon glyphicon-pushpin"></span></a>'
        + '</div>'
        + '</div>'
        +'</li>';
    return html;
}

$(function() {
  chrome.tabs.query({ currentWindow: true }, function(tab) {
    for (var i = tab.length - 1; i >= 0; i--) {
        //reduce chrome data structure to our data structure
        var currentTab = new mTab(tab[i]);
        //append html representation of our data structure
        $('#tablist').append(createTabListElement(currentTab));
        //add to the global data structure
        tabManagerModel.allTabs.push(currentTab);
    }

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
    $('.tab-count').text(tab.length);
  });
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

jQuery(document).ready(function () {
    jQuery('.tabs .tab-links a').on('click', function (e) {
        var currentAttrValue = jQuery(this).attr('href');

        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();

        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        jQuery(".tab" + currentAttrValue).addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });

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
    $('body').on('click', '.readingListAddElement', function () {
        
    });
});