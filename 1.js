const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { LocalAuth } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
const client = new Client({authStrategy: new LocalAuth()});
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const server = http.createServer(app);
const axios = require('axios');
const PORT = process.env.PORT || 3632;
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
const contacts = new Set();

app.get('/qrcode', async (req, res) => {
    try {
        const qrCodeData = await client.getQRCode();
        res.send(qrCodeData);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});

client.on('authenticated', (session) => {
    console.log('Authenticated!');
});

const fs = require('fs');

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size; // Size of the file in bytes
    } catch (err) {
        console.error("Error reading file:", err);
        return -1; // Return -1 if there's an error
    }
}



client.on('ready', async () => {
    console.log('System online!')
    const chats = await client.getChats();

    // Filter out group chats
    const groupChats = chats.filter(chat => chat.isGroup);

    // Display group names
    chats.forEach(chat=>{
        console.log(chat.name)
    })

    groupChats.forEach(group => {
        console.log(`Group Code: ${group.id._serialized}`);
    });

    io.on("connection", (socket) => {

        socket.on('message-req', (data)=>{
            if(data.message !== null){
                if(1){
                    send_Message(data.contact , data.message);
                }else{
                    console.log('Request rejected');
                }
            }else{
                console.log('Request rejected');
            }
        });
    });

    server.listen(PORT, () => {
        console.log(`Server is up and running on port : ${PORT}.`);
    });
});

client.on('message', msg => {
    if (msg.body == 'Deactivate system auth: Amelie260908') {
        msg.reply('Auth: success , deactivating system');
        server.close(() => {
            console.log('Server is gracefully closed');
        });
    }
});

const send_Message = async (recipient, message) => {
    try {
        await client.sendMessage(recipient + '@c.us', message);
        console.log('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

client.initialize();
