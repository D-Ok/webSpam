/*
Створити даних електронних адрес з як мінімум наступною
 інформацією: прізвище, ім'я та по батькові та
 електронна адреса. Написати на Node.js клієнт-серверний
  застосунок,  який забезпечує розсилку електронних
  листів за цими адресами; користувач повинен також
  мати можливість вибрати текст повідомлення з деякого
   заздаледь заданого набору повідомлень, а також
   ввести свій текст. Написати також веб-інтерфейс,
   який забезпечує керування списком розсилки:
   додавання нових адрес та редагування і вилучення
   існуючих.
Адреси мають зберігатися в базі даних (MongoDB або MySQL).

 */

let http = require('http');
let path = require('path');
let express = require('express');
var mongoClient = require("mongodb").MongoClient;
const nodemailer = require('nodemailer');
let ejs = require('ejs');
let server=express();

var bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.set('view engine', 'ejs');
let allClients = [];
let allMes = [];
let tempCounter = 0;
var url = "mongodb://localhost:27017";

server.listen(8888);
console.log('Server is running on port 8888');

server.use(express.static(__dirname));

server.get('/', async function(req, res){
    allClients = await getAllClients();
    allMes = await getAllMessages();
    res.render('main', {
        emails: allClients,
        theme: allMes[tempCounter].theme,
        text: allMes[tempCounter].text
    })
});

/*
<% for( var i = 1; i<temp.length; i++){%>
                <div class="hiddenT <%=i%>" ><%=temp[i].theme%></div>
                <textarea class="hiddenM <%=i%>" readonly disabled><%=temp[i].text%></textarea>
            <%}%>
 */
server.get('/nextTemplate', function(req, res){
    tempCounter++;
    if(tempCounter>=allMes.length) tempCounter=0;
    res.send({theme: allMes[tempCounter].theme, text: allMes[tempCounter].text});
});

server.get('/preTemplate', function(req, res){
    tempCounter--;
    if(tempCounter<0) tempCounter=allMes.length-1;
    res.send({theme: allMes[tempCounter].theme, text: allMes[tempCounter].text});
});

server.get('/addNewEmail', async function(req, res){
    let name = req.query.name;
    let surname = req.query.surname;
    let fname = req.query.fname;
    let email = req.query.email;
    if(checkIsUnicEmail(email)) {
        let d = await addNewClient(name, surname, fname, email);
        console.log('here');
        if(d) {
            allClients = await getAllClients();
            res.send('Done');
        }
    }else res.send("Email exist");
});

server.post('/addNewTemplate', async function(req, res) {
    var j = {
        text: req.body.text,
        theme: req.body.theme
    };
    if (checkIsUnicMes(j)) {
        let d = await addNewMessage(j);
        if (d) {
            allMes = await getAllMessages();
            res.send('Done');
        }
   } else res.send('Template exist');
});

server.post('/deleteEmail', async function (req, res) {
    let email = req.query.email;
    console.log(email);
    let r = await deleteUser(email);
    if(r) res.send('Done');
});

server.post('/deleteTemplate', async function (req, res) {
    var j　 = 　 {
        text: req.body.text,
        theme: req.body.theme
    };
    let r = await deleteTemplate(j);

    if(r){
        allMes = await getAllMessages();
        res.send('Done');
    }
});

server.post('/sendMessage', async function (req, res) {
    var j　 = 　 {
        allCl: req.body.allCl,
        theme: req.body.theme,
        text: req.body.text
    };
    let r = await sendMessage(j.allCl, j.theme, j.text);
    res.send(r);
});

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'oliinyk.daryna@gmail.com',
        pass: 'mongotest141'
    }
});

function sendEmail(to, subject, text) {

    let mailOptions ={
        from: 'oliinyk.daryna@gmail.com"',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err);
        else
            console.log(info);
        transporter.close();
    });
}

function addNewClient(name, surname, fathername, email){
    let newUser = {surneme: surname, name: name, fathername: fathername, email: email};
    return new Promise((resolve, reject) => {
    mongoClient.connect(url, function(err, client) {
        if (err) return console.log(err);

        const db = client.db("spam");
        db.collection("clients").insertOne(newUser, function (err, results) {
            client.close();
            resolve(true);
        });
    });
});
}

function getAllClients() {
    return new Promise((resolve, reject) => {
        mongoClient.connect("mongodb://localhost:27017", function (err, client) {

            if (err) return console.log(err);
            const db = client.db("spam");
            db.collection("clients").find().toArray(function (err, result) {
                resolve(result);
            });

        });
    });
}

function deleteUser(em){
    return new Promise((resolve, reject)=>{
        mongoClient.connect("mongodb://localhost:27017", function (err, client) {

            if (err) return console.log(err);
            const db = client.db("spam");
            let myq = {"email" : ""+em+""};
            console.log(myq);
            db.collection("clients").deleteOne(myq, function (err, result) {
                if (err) throw err;
                console.log("1 user deleted");
                resolve(true);
                client.close();
            });

        });
    });
}

function deleteTemplate(temp){
    return new Promise((resolve, reject)=>{
        mongoClient.connect("mongodb://localhost:27017", function (err, client) {

            if (err) return console.log(err);
            const db = client.db("spam");
            console.log(temp);
            db.collection("messages").deleteOne(temp, function (err, result) {
                if (err) throw err;
                console.log("1 template deleted");
                resolve(true);
                client.close();
            });

        });
    });
}


function addNewMessage(newMes){
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, function (err, client) {
            if (err) return console.log(err);

            const db = client.db("spam");
            db.collection("messages").insertOne(newMes, function (err, results) {
                client.close();
                resolve(true);
            });
        });
    });
}

function getAllMessages() {
    return new Promise((resolve, reject) => {
        mongoClient.connect("mongodb://localhost:27017", function (err, client) {

            if (err) return console.log(err);
            const db = client.db("spam");
            db.collection("messages").find().toArray(function (err, result) {
                console.log(result);
                resolve(result);
            });

        });

    });
}

function sendMessage(allCl, theme, text){
    return new Promise((resolve, reject) => {
        for (let i = 0; i < allCl.length; i++) {
            sendEmail(allCl[i], theme, text);
        }
        console.log("Ready");
        resolve("Ready");
    });
}

function checkIsUnicEmail(email){
    for(let i=0; i<allClients.length; i++){
        if(allClients[i].email===email) return false;
    }
    return true;
}

function checkIsUnicMes(t){
    for(let i=0; i<allMes.length; i++){
        if(allMes[i].theme===t.theme && allMes[i].text===t.text) return false;
    }
    return true;
}

