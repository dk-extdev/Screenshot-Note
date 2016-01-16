//Update Badge on current web page. If current page has note, it will update note count.
function updateBadge(notes, sender){
    return chrome.browserAction.setBadgeText({text: notes.length.toString(), tabId: sender.tab.id});
};
//This is chrome extension event listener. it get request from background script of extension and then execute.
//file: from js/note.js
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var url = sender.tab.url.replace(/^https?:\/\//,"").replace(/#.*$/,""),//current tab url replace for example "https://#test.com" to "test.com"
        notes = localStorage[url] ? JSON.parse(localStorage[url]) : [], //get value with url from localstorage
        response = {status: "success"};

    if (request.command == 'getNotes'){
        updateBadge(notes, sender);
        return sendResponse({'notes': notes});
    } else if (request.command == 'createNote'){
        var data = {
            content: "",
            position: request.position,
            epoch: request.epoch
        };
        notes.push(data);
    } else if (request.command == 'updateNoteContent'){//update notes contents
        for(var i=0; i<notes.length; i++){
            var note = notes[i];
            if (note.epoch == request.epoch){
                note.content = request.content;
                notes[i] = note;
            }
        }
    } else if (request.command == 'updateNotePosition'){//Update notes position
        for(var i=0; i<notes.length; i++){
            var note = notes[i];
            if (note.epoch == request.epoch){
                note.position = request.position;
                notes[i] = note;
            }
        }
    } else if (request.command == 'deleteNote'){//delete current notes
        for(var i=0; i<notes.length; i++){
            var note = notes[i];
            if (note.epoch == request.epoch){
                notes.splice(i, 1);
                break;
            }
        }
    }
    updateBadge(notes, sender);
    localStorage[url] = JSON.stringify(notes); //change notes object to json object 
    sendResponse(response);//Send response to content script
});

