/*
 * @author Shaumik "Dada" Daityari
 * @copyright December 2013
 */

/* Some info
Using newer versions of jQuery and jQuery UI in place of the links given in problem statement
All data is stored in local storage
User data is extracted from local storage and saved in variable todo.data
Otherwise, comments are provided at appropriate places
*/

// chrome = {
//     storage: {
//         sync: {
//             get: function(){},
//             set: function(){}
//         }
//     }
// };

// GET PREVIOUSLY SAVED DATA
var todo = todo || {},
    data = data || {};

var loadData = function(savedData, jQuery) {

    // todo.data is where all the data is stored
    // todo is the all-encompassing object

    // Simple declaration
    var defaults = {
            todoTask: "todo-task",
            todoHeader: "task-header",
            todoDate: "task-date",
            todoDescription: "task-description",
            taskId: "task-",
            formId: "todo-form",
            dataAttribute: "data",
            deleteDiv: "delete-div"
        }, codes = {
            "1" : "#pending",
            "2" : "#inProgress",
            "3" : "#completed"
        };

    if (savedData !== undefined){
        data = JSON.parse(savedData);
    } else {
        data = {};
    }

    console.log("the saved data is:" + JSON.stringify(data));

    // Takes an element, and displays it on the screen
    var generateElement = function(params){
        var parent = $(codes[params.code]),
            wrapper;

        if (!parent) {
            return;
        }

        wrapper = $("<div />", {
            "class" : defaults.todoTask,
            "id" : defaults.taskId + params.id,
            "data" : params.id
        }).appendTo(parent);

        $("<div />", {
            "class" : defaults.todoHeader,
            "text": params.title
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDate,
            "text": params.date
        }).appendTo(wrapper);

        $("<div />", {
            "class" : defaults.todoDescription,
            "text": params.description
        }).appendTo(wrapper);

        // Lets you drag an item around
        wrapper.draggable({
            start: function() {
                $("#" + defaults.deleteDiv).show();
            },
            stop: function() {
                $("#" + defaults.deleteDiv).hide();
            },
            revert: "invalid",
            revertDuration : 200
        });
    };

    // Todo is an object, so you can create a parameter for it
    // Only a declaration though, does NOT run until called
    var init = function (options) {

        options = options || {};
        options = $.extend({}, defaults, options);

        // For each item in data, generate an item with its params?
        $.each(data, function (index, params) {
            generateElement(params);
        });

        /*generateElement({
            id: "123",
            code: "1",
            title: "asd",
            date: "22/12/2013",
            description: "Blah Blah"
        });*/

        /*removeElement({
            id: "123",
            code: "1",
            title: "asd",
            date: "22/12/2013",
            description: "Blah Blah"
        });*/

        // Adding drop function to each category of task
        // For each item in codes (3 categories)
        $.each(codes, function (index, value) {
            $(value).droppable({
                // Called when something is picked up and moved
                drop: function (event, ui) {
                        var element = ui.helper,
                            css_id = element.attr("id"),
                            id = css_id.replace(options.taskId, ""),
                            object = data[id];

                            // Removing old element
                            removeElement(object);

                            // Changing object code
                            object.code = index;

                            // Generating new element
                            generateElement(object);

                            // Updating Local Storage
                            data[id] = object;
                            chrome.storage.sync.set({"todoData": JSON.stringify(data)}, function() {
                                console.log("Updating local storage in init droppable");
                            });

                            // Hiding Delete Area
                            $("#" + defaults.deleteDiv).hide();
                    }
            });
        });

        // Adding drop function to delete div
        $("#" + options.deleteDiv).droppable({
            // Called when something is dropped in delete section
            drop: function(event, ui) {
                var element = ui.helper,
                    css_id = element.attr("id"),
                    id = css_id.replace(options.taskId, ""),
                    object = data[id];

                // Removing old element
                removeElement(object);

                // Updating local storage
                delete data[id];
                chrome.storage.sync.set({"todoData": JSON.stringify(data)}, function(){
                    console.log("Updating local storage in init droppable deleted");
                });

                // Hiding Delete Area
                $("#" + defaults.deleteDiv).hide();
            }
        });
    };
    init();

    // Remove task
    var removeElement = function (params) {
        $("#" + defaults.taskId + params.id).remove();
    };

    // Also just declared here, doesn't run until you call it
    // This is the add function for a SINGLE ADD
    todo.add = function() {
        var inputs = $("#" + defaults.formId + " :input"),
            errorMessage = "Title can not be empty",
            id, title, description, date, tempData;

        if (inputs.length !== 4) {
            return;
        }

        title =         inputs[0].value;
        description =   inputs[1].value;
        date =          inputs[2].value;

        // If no title
        if (!title) {
            generateDialog(errorMessage);
            return;
        }

        // Smart way of creating a unique ID
        id = new Date().getTime();

        tempData = {
            id : id,
            code: "1",
            title: title,
            date: date,
            description: description
        };

        // Saving element in local storage
        data[id] = tempData;
        chrome.storage.sync.set({"todoData": JSON.stringify(data)}, function(){
            console.log("Added + Saved new element in storage");
            console.log(JSON.stringify(data));
        });

        // Generate Todo Element (Place it on screen)
        generateElement(tempData);

        // Reset Form
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";
    };

    // Just a function to generate the "invalid title" dialog
    var generateDialog = function (message) {
        var responseId = "response-dialog",
            title = "Messaage",
            responseDialog = $("#" + responseId),
            buttonOptions;

        if (!responseDialog.length) {
            responseDialog = $("<div />", {
                    title: title,
                    id: responseId
            }).appendTo($("body"));
        }

        responseDialog.html(message);

        buttonOptions = {
            "Ok" : function () {
                responseDialog.dialog("close");
            }
        };

        responseDialog.dialog({
            autoOpen: true,
            width: 400,
            modal: true,
            closeOnEscape: true,
            buttons: buttonOptions
        });
    };

    // Clears all the todo's by resetting the data variable to {}
    todo.clear = function () {
        data = {};
        chrome.storage.sync.set({"todoData": JSON.stringify(data)}, function(){
            console.log("Cleared all todo's");
        });
        $("." + defaults.todoTask).remove(); // Useful jQuery code remover command
    };

    // Event listeners
    $("#addBtn").on("click", function(){
        todo.add();
    });
    $("#clearBtn").on("click", function(){
        todo.clear();
    });
};

// This should load the data into 'data' variable, if it exists
var getData = function(callback){
    var tempData = {};
    chrome.storage.sync.get("todoData", function(val){
        console.log("Loaded data! " + val.todoData);
        tempData = val.todoData;
        callback(tempData);
    });
};

// Call the previous two functions
getData(loadData);
