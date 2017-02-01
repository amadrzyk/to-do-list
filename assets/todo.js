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

var todo = todo || {},
    data = data || {};

var loadData = function(savedData, savedHeader1, savedHeader2, savedHeader3, newColor, newShadow, shadowChecked, jQuery) {

    // todo.data is where all the data is stored
    // todo is the all-encompassing object

    // Defaults declaration
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

    // Takes a single element, and displays it on the screen
    var generateElement = function(params){
        var parent = $(codes[params.code]),
            wrapper;

        if (!parent) {
            return;
        }
        var dueBy = "Due by: ";
        if (params.date === ""){
            dueBy = "";
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
            "text": dueBy + params.date
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
            scroll: false,
            revert: "invalid",
            revertDuration : 200
        });
    };

    // Initialize (and show) every element on the screen
    var init = function (options) {

        options = options || {};
        options = $.extend({}, defaults, options);

        // For each index, generate
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
                // Called when something is dropped
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

    // Remove task from list
    var removeElement = function (params) {
        $("#" + defaults.taskId + params.id).remove();
    };

    // This is the add function for a single add
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

    // Just a function to generate the "invalid title" dialog modal
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

    // Changes shadow
    var changeShadow = function(newClr){
        var newShadowParams = "";
        for (var i = 3; i < 20; i++){
            newShadowParams += i+"px "+i+"px "+"0 "+newClr+", ";
        }
        newShadowParams += "20px 20px 0 "+newClr;

        $(".long-shadow ").css("box-shadow", newShadowParams);
    };

    // Event listeners
    $("#addBtn").on("click", function(){
        todo.add();
    });
    $("#clearBtn").on("click", function(){
        if (confirm("Are you sure?")){
            todo.clear();
        }
    });
    $("#shortShadow").change(function(){
        var checked;
        if ($('input:checkbox').is(':checked')){
            $(".task-list").removeClass("long-shadow").addClass("short-shadow");
            checked=true;
        } else {
            $(".task-list").removeClass("short-shadow").addClass("long-shadow");
            checked=false;
        }
        chrome.storage.sync.set({"shortShadow": checked}, function(){
            console.log("Short shadow: " + checked);
        });
    });

    // Make editables inline (default mode is popup)
    $.fn.editable.defaults.mode = 'inline';

    // Make task headers and colors editable
    $('.taskHeader').editable({
        type: 'text',
        title: 'Enter name'
    });
    $('#bgColor').editable({
        type: 'text',
        title: 'Enter color'
    });
    $('#shadowColor').editable({
        type: 'text',
        title: 'Enter color'
    });

    // On headerName change, save value to memory
    $('.taskHeader').on('save', function(event, params) {
        console.log('Saved value: ' + params.newValue);
        var clickedId = event.target.id;
        console.log("clickedId was: " + clickedId);
        var newObj = {};
        newObj[clickedId] = params.newValue; // We have to do this, to pass clickedId as a KEY into the object
        chrome.storage.sync.set(newObj, function(){
            console.log("Set id: " + clickedId + " to " + params.newValue);
        });
    });

    // On bg color change, save value to memory & update css
    $('#bgColor').on('save', function(event, params) {
        console.log('Saved color value: ' + params.newValue);
        chrome.storage.sync.set({"bgColor1": params.newValue}, function(){
            console.log("Set color to " + params.newValue);
        });
        $('.well').css("background-color", params.newValue);
        $('.row').css("background-color", params.newValue);
    });

    // On shadowColor color change, save value to memory & update css
    $('#shadowColor').on('save', function(event, params) {
        console.log('Saved shadow value: ' + params.newValue);
        chrome.storage.sync.set({"shadowColor": params.newValue}, function(){
            console.log("Set shadow to " + params.newValue);
        });
        changeShadow(params.newValue);
    });

    // Load saved items into their respective places
    $('#taskHeader1').html(savedHeader1);
    $('#taskHeader2').html(savedHeader2);
    $('#taskHeader3').html(savedHeader3);
    $('.well').css("background-color", newColor);
    $('.row').css("background-color", newColor);
    $('#bgColor').html(newColor);
    $('#shadowColor').html(newShadow);
    changeShadow(newShadow);
    $('#shortShadow').prop('checked', shadowChecked);
    if (shadowChecked === true){
        $(".task-list").removeClass("long-shadow").addClass("short-shadow");
    }
};

// This will get the data if it exists, otherwise variables will be undefined
var getData = function(callback){
    chrome.storage.sync.get(["todoData", "taskHeader1", "taskHeader2", "taskHeader3", "bgColor1", "shadowColor", "shortShadow"], function(val){
        console.log("Loaded data! ");
        console.log("Loaded taskHeader1! " + val.taskHeader1);
        console.log("Loaded taskHeader2! " + val.taskHeader2);
        console.log("Loaded taskHeader3! " + val.taskHeader3);
        console.log("Loaded bgColor! " + val.bgColor1);
        console.log("Loaded shadowColor! " + val.shadowColor);
        console.log("Loaded shordShadow! " + val.shortShadow);
        callback(val.todoData, val.taskHeader1, val.taskHeader2, val.taskHeader3, val.bgColor1, val.shadowColor, val.shortShadow);
    });
};

// Call the previous two functions
getData(loadData);