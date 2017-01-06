$( "#datepicker" ).datepicker();
$( "#datepicker" ).datepicker("option", "dateFormat", "dd/mm/yy");

$(".task-container").droppable();
$(".todo-task").draggable({ revert: "valid", revertDuration:200 });
// todo.init();
// TODO: "how to call javascript function from another file"
// The issue here is that, none of the 'chrome' things are working
// The browser literally skips over every chrome thing

// UPDATE: Everything works! Once you figure out how to 
// retrieve a variable from chrome.storage.sync.get(), and 
// pass it back to a different scope, you'll be set!