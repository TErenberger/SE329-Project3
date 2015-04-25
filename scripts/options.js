// Local storage for the settings
var groupSettings = {
    groups: {}
}

function group(name) {
    this.name = name;
    this.id = name.replace('.', '');
    this.color = 'white';
    this.rules = "";
}

// Populate group drop down menu
function populateGroupSelector() {

    //********** Group drop down menu **********//
    var selector = document.getElementById("group-selector");

    // Clear selector options (best way I could find to do this)
    while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
    }

    // Place the default
    var element = document.createElement("option");
    element.textContent = "Choose a Group";
    element.value = "Choose a Group";
    selector.appendChild(element);

    var grp;
    // Repopulate the drop down menu
    for (grp in groupSettings.groups) {
        var tmpGroup = groupSettings.groups[grp].name;
        element = document.createElement("option");
        element.textContent = tmpGroup;
        element.value = tmpGroup;
        selector.appendChild(element);
    }
}

// Saves options to chrome.storage
function saveOptions() {

    // Sync options to storage
    chrome.storage.sync.set({
        groupSettings: groupSettings
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    });
}

// Restores settings stored in chrome.storage.
function restoreOptions() {

    // Restore options from storage
    chrome.storage.sync.get({
        groupSettings: {
            groups: {}
        }
    }, function(items) {

        // Update the local values
        groupSettings = items.groupSettings;

        // Repopulare the html
        populateGroupSelector();
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);


// Listeners
jQuery(document).ready(function() {

    // Save the settings
    $('body').on('click', '#save-button', function(event) {
        var selectedItem = $('#group-selector').val();

        if (selectedItem != 'Choose a Group') {
            groupSettings.groups[selectedItem].rules = $('#group-rules-input').val();
        }

        saveOptions();
    });

    // Create a new group
    $('body').on('click', '#create-button', function(event) {
        // Get the name input
        var name = $('#group-name-input').val();
        console.log(groupSettings);

        // Ensure the name is not empty and not a duplicate name
        if (name != undefined && groupSettings.groups[name] == undefined) {
            groupSettings.groups[name] = new group(name);
            groupSettings.groups[name].rules = $('#group-rules-input').val();

            // Update drop down
            populateGroupSelector();

            // Clear the inputs
            $('#group-name-input').val('');
            $('#group-rules-input').val('');
        }
    });

    // Delete selected group
    $('body').on('click', '#delete-button', function(event) {

        // Ensure the item being deleted is not the default value
        if ($('#group-selector').val() != 'Choose a Group') {

            // Find the item to delete
            for (var item in groupSettings.groups) {
                // FIXME:  (this is broken)
                // Delete the selected item
                if (groupSettings.groups[item].name == $('#group-selector').val()) {
                    delete groupSettings.groups[item];
                    break;
                }
            }

            // Update drop down
            populateGroupSelector();

            // Clear the inputs
            $('#group-name-input').val('');
            $('#group-rules-input').val('');
        }
    });

    // Update settings when a group is selected from the drop down list
    $("#group-selector").change(function() {
        var selectedItem = $(this).val();
        $('#group-rules-input').val('');

        // Only update them if a valid group was chosen (not the placeholder)
        if (selectedItem != 'Choose a Group') {
            $('#group-name-input').val(groupSettings.groups[selectedItem].name);
            $('#group-rules-input').val(groupSettings.groups[selectedItem].rules);
        }
    });
});