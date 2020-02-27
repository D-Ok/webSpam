var xhr = new XMLHttpRequest();

function openForm(){
    document.getElementById("mainBlock").style.display = "none";
    document.getElementById("addNewEmail").style.display = "inline";
    console.log("opening form");
}

function back(){
    document.getElementById("addNewEmail").style.display = "none";
    document.getElementById("mainBlock").style.removeProperty("display");
}

function chooseTemplate() {
    let theme = document.getElementById("templateTheme").textContent;
    let text = document.getElementById("templateMess").value;

    document.getElementById("messageText").value = text;
    document.getElementById("messageTheme").value = theme;
}

function nextTemp(){

    xhr.open('GET', 'nextTemplate', false);
    xhr.send();

    if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText );
    } else {
        let templ =  JSON.parse(xhr.response) ;
        console.log(templ);
        changeTemplate(templ);
    }
}

function preTemp(){

    xhr.open('GET', 'preTemplate', false);
    xhr.send();

    if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText );
    } else {
        let templ =  JSON.parse(xhr.response) ;
        changeTemplate(templ);
    }
}

function changeTemplate(templ){
    document.getElementById("templateTheme").textContent = templ.theme;
    document.getElementById("templateMess").value = templ.text;
}

function addNewEmail(){

    let name = document.getElementById("name").value;
    let surname = document.getElementById("surname").value;
    let fname = document.getElementById("fname").value;
    let email = document.getElementById("uEmail").value;

    if(validateEmail(email)) {
        xhr.open('GET', 'addNewEmail?name=' + name + '&surname=' + surname + '&fname=' + fname + '&email=' + email, false);
       xhr.send();

        if (xhr.status != 200) {
            document.getElementById("rule").value= "This email is already exist.";
        } else {
            console.log(xhr.response);
            if(xhr.response==="Email exist") {
                document.getElementById("rule").value= "This email is already exist.";
            } else {
                let l = document.createElement("dt");
                l.classList.add("emailName");
                l.classList.add("text");
                l.innerHTML = email+ " <button class='minEmailButton'>X</button>";
                document.getElementById("allEmails").appendChild(l);
                back();
            }

        }
    }
}

function validateEmail(mail)
{
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return(mailformat.test(mail.toLowerCase()));
}

function removeEmail(el){
    let emailToRemove = el.parentElement;
    emailToRemove.parentElement.removeChild(emailToRemove);
}

function clickDeleteEmail(el) {
    let buttons = document.getElementsByClassName("minEmailButton");
    if(buttons[0].classList.contains("completeDelete")){
        deleteEmail(el);
    } else removeEmail(el);
}

function deleteEmail(el){
    let parent = el.parentElement;
    let emailToRemove = parent.textContent.split(' ')[0];

    xhr.open('POST', 'deleteEmail?email='+emailToRemove, false);
    console.log(emailToRemove);
    xhr.send();

    if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText );
    } else {
        removeEmail(el);
    }
}


function deleteTemplate(){
    let theme = document.getElementById("templateTheme").textContent;
    let text = document.getElementById("templateMess").value;

    console.log(theme+" "+text);
    xhr.open('POST', 'deleteTemplate' , false);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        let data ={
            theme: theme,
            text: text
        };
    xhr.send(JSON.stringify(data));

    if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText );
    } else {
        nextTemp();
    }
}

function deleteMode(){
    let buttons = document.getElementsByClassName("minEmailButton");
    if(buttons[0].classList.contains("completeDelete")){
        for (let b of buttons) {
            b.classList.remove("completeDelete");
        }
    } else {
        for (let b of buttons) {
            b.classList.add("completeDelete");
        }
    }
}

function addNewTemplate() {

    let theme = document.getElementById("messageTheme").value;
    let text = document.getElementById("messageText").value;


    if(theme.length>0 && text.length>0) {
        xhr.open('POST', 'addNewTemplate' , false);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        let data ={
            theme: theme,
            text: text
        };
        //.body();
        xhr.send(JSON.stringify(data));

        if (xhr.status != 200) {

        }
    }
}

function sendMessage() {
    let allEmails = [];
    let emails = document.getElementsByClassName('emailName');
    let theme = document.getElementById("messageTheme").value;
    let text = document.getElementById("messageText").value;

    if(theme.length>0 && text.length>0) {
        for (let i = 0; i < emails.length; i++) {
            allEmails.push(emails[i].textContent.split(' ')[0]);
        }

        let s = {
            allCl: allEmails,
            theme: theme,
            text: text
        };

        console.log(s);

        xhr.open('POST', 'sendMessage' , false);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(s));

        if (xhr.status != 200) {
        } else {
        }
    }
}