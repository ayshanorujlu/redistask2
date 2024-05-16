"use strict";

const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

async function startConnection() {
    try {
        await connection.start();
        console.log("Connected");
    } catch (err) {
        console.error(err.toString());
    }
}

startConnection();

connection.on("newmessage", async function (obj) {
    const myobj = {
        channel: obj.channel,
        message: obj.message,
        time: obj.time
    };
    console.log("newmessage", myobj);
    const cname = document.getElementById("channelname").innerText;
    console.log(cname);
    if (myobj.channel === cname) {
        const content = `
            <div class="message">
                <h5>${myobj.message}</h5>
                <h6>${myobj.time}</h6>
            </div>
        `;
        document.getElementById('messages').insertAdjacentHTML('beforeend', content);
    }
});

connection.on("newchannel", function () {
    loadChannels();
});

const inp = document.getElementById("nameinput");
const messageinp = document.getElementById("messageinput");
const form = document.getElementById("channelform");
const messageform = document.getElementById("messageform");
const channels = document.getElementById("channels");

function addChannelClickEvents() {
    document.querySelectorAll(".channel").forEach(element => {
        element.addEventListener('click', function () {
            const channelName = element.innerText;
            document.getElementById("channelname").innerText = channelName;
            messageform.style.display = "block";
            subscribeToChannel();
            loadMessages(channelName);
        });
    });
}

async function submitChannelForm(event) {
    event.preventDefault();
    if (inp.value === "") return;
    try {
        await $.ajax({
            url: `Home/MakeChannel?channelName=${inp.value}`,
            method: 'GET'
        });
        form.reset();
        loadChannels();
    } catch (err) {
        console.error(err);
    }
}

async function loadMessages(channelname) {
    try {
        const data = await $.ajax({
            url: `Home/GetChannelMessages?channelName=${channelname}`
        });
        let content = "";
        if (data) {
            data.forEach(message => {
                content += `
                    <div class="message">
                        <h5>${message.message}</h5>
                        <h6>${message.timeStamp}</h6>
                    </div>
                `;
            });
        } else {
            content = "<p>Messages Empty</p>";
        }
        document.getElementById('messages').innerHTML = content;
    } catch (err) {
        console.log(err);
    }
}

async function subscribeToChannel() {
    const cname = document.getElementById("channelname").innerText;
    try {
        await $.ajax({
            url: `Home/Subscribe?channelName=${cname}`
        });
        console.log("Subscribed");
    } catch (err) {
        console.log(err);
    }
}

async function loadChannels() {
    try {
        const data = await $.ajax({
            url: `Home/GetChannels`
        });
        let content = "";
        if (data.length > 0) {
            data.forEach(channel => {
                content += `<h4 class="channel">${channel}</h4>`;
            });
        }
        channels.innerHTML = content;
        addChannelClickEvents();
    } catch (err) {
        console.log(err);
    }
}

async function submitMessageForm(event) {
    event.preventDefault();
    const channelName = document.getElementById("channelname").innerText;
    if (messageinp.value === "") return;
    try {
        await $.ajax({
            url: `Home/AddMessage`,
            method: 'GET',
            data: {
                channelName: channelName,
                message: messageinp.value
            }
        });
        console.log("Message sent");
        messageform.reset();
    } catch (err) {
        console.error(err);
    }
}

form.onsubmit = submitChannelForm;
messageform.onsubmit = submitMessageForm;

loadChannels();
addChannelClickEvents();
