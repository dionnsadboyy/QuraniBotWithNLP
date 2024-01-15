const {
    default: makeWASocket,
	MessageType, 
    MessageOptions, 
    Mimetype,
	DisconnectReason,
    useSingleFileAuthState,
    decodeWAMessage
} =require("@adiwajshing/baileys");




const { Boom } =require("@hapi/boom");
const {state, saveState} = useSingleFileAuthState("./auth_info.json");
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require("express");
const bodyParser = require("body-parser");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const axios = require("axios");
const { Http2ServerRequest } = require("http2");
const { json, response, text } = require("express");
const { decode } = require("querystring");
const port = process.env.PORT || 8000;

//require mysql 
const mysql = require('mysql');
const { table } = require("console");

// koneksi 
// const conn = mysql.createConnection({
// 	host: 'localhost',
// 	user: 'root',
// 	password:'',
// 	database: 'bot_qurani'
// });
// conn.connect((err) =>{
// 	if(err) throw err;
// 	console.log('Database Connected...');
// });

// var surat = "";
// conn.query (
//     'SELECT * FROM daftarsurah WHERE alt = surat OR namasurah = surat',
//     [surat, surat],
//     function (err, results) {
//       if (err) {
//         console.log("error: ", err)
//         return;
//       }
//       console.log(results);
//     }
// );

// conn.end();

// // array kata kunci 
// let sql_kata_kunci = "select kata_kunci from kata_kunci";
// const kata_kunci = [];

// conn.query(sql_kata_kunci, async function (err, result) {
// 	if(err) throw err;
// 	let jumrow = result.length;
// 	if(jumrow > 0) {
// 		for(let i=0;i<jumrow;i++){
// 			kata_kunci.push(result[i].kata_kunci);
// 		}
// 	}          
// 	console.log(kata_kunci);
// });

//fungsi suara capital 
function capital(textSound){
    const arr = textSound.split(" ");
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    const str = arr.join(" ");
    return str;

}

async function connectToWhatsApp() {
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
    	//console.log(update);
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp();
            }
        } else if(connection === 'open') {
            console.log('opened connection');
        }
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        
        console.log(messages);
		
        if(type === "notify"){

            if(!messages[0].key.fromMe && !messages[0].key.participant) {

                //tentukan jenis pesan berbentuk text                
                //const pesan = messages[0].message.conversation;
                                
                //tentukan jenis pesan apakah bentuk list
                const responseList = messages[0].message.listResponseMessage;
                
                //tentukan jenis pesan apakah bentuk button
                const responseButton = messages[0].message.buttonsResponseMessage;

                //tentukan jenis pesan apakah bentuk templateButtonReplyMessage
                //const responseReplyButton = messages[0].message.templateButtonReplyMessage;
                
				//tentukan jenis pesan apakah bentuk document
                const documentMessage = messages[0].message.documentMessage;
				
                //nowa dari pengirim pesan sebagai id
                const noWa = messages[0].key.remoteJid; 

                //fungsi decode html
                function decodeHtmlCharCodes(str) { 
                return str.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
                    return String.fromCharCode(charCode);
                });
                }
                

                await sock.readMessages([messages[0].key]);
                
                if(messages[0].message.extendedTextMessage != null) {
                    const pesanMasuk = messages[0].message.extendedTextMessage.text;
                    // const pesanID = messages[0].key.id;    
                    // let tgl_pesan =  new Date(messages[0].messageTimestamp * 1000);
                    // let tglPesanStr = tgl_pesan.getFullYear() + "-" + (tgl_pesan.getMonth() + 1) + "-" + tgl_pesan.getDate() + " " + tgl_pesan.getHours() + ":" + tgl_pesan.getMinutes() + ":" + tgl_pesan.getSeconds();
                    // //console.log(dateStr);
                                    
                    //     let sql_insert = "insert into inbox(id_pesan,no_wa,isi_pesan,tgl_pesan,status) values('" + pesanID +"','"+noWa+"','"+pesanMasuk+"','"+ tglPesanStr +"','false')";
                    //     await conn.query(sql_insert, async function (err, result) {
                    //         if(err) throw err;
                    //         console.log('Pesan baru terlah tersimpan ');
                    //         });
                                    
                    //             if(kata_kunci.includes(pesanMasuk)){
                    //                 //jika kata kunci ada di database 
                    //                 await conn.query("select jawaban from kata_kunci where kata_kunci = '"+pesanMasuk+"'", async function (err, result) {
                    //                     if(err) throw err;
                    //                     let jumrow = result.length;
                    //                     if(jumrow > 0) {
                    //                         for(let i=0;i<jumrow;i++){
                    //                             let jawaban = result[i].jawaban;
                    //                               const response = await sock.sendMessage(noWa, {text: jawaban.replace(/\|/g, '\n')},{quoted: messages[0] });
                                                    
                    //                                 //console.log(response.messageTimestamp.low);
                    //                                 let tgl_balas = new Date(response.messageTimestamp.low * 1000);
                    //                                 let tglbalasStr = tgl_balas.getFullYear() + "-" + (tgl_balas.getMonth() + 1) + "-" + tgl_balas.getDate() + " " + tgl_balas.getHours() + ":" + tgl_balas.getMinutes() + ":" + tgl_balas.getSeconds();
                    //                                 console.log(tglbalasStr);
                    //                                 //jika pesan sukses terkirim 
                    //                                 if(response.status == 1){
                                                        
                    //                                 await conn.query("update inbox set status='true', tgl_balas = '"+tglbalasStr+"' where id_pesan ='"+pesanID+"' " , async function (err, result){
                    //                                 if(err) throw "update status pesan terkirim gagal";
                    //                                 console.log("pesan telah terkirim dengan selamat");
                    //                                 });
                    //                                 }else {
                    //                                     console.log("cek Log dibawah ini kenapa error");
                    //                                     console.log(response);
                    //                                 }
                    //                             }
                    //                         }    
                    //                     });
                    //                 }
                    
                    // /// trus yang ping  tambahi else  jadi begini 
                    // else if(pesanMasuk === "ping"){
                    //  //bla bla bla
                    // }


                    // if(messages[0].message.buttonsResponseMessage != null) {
                    //     pesanMasuk = responseButton;
                    // }                                     
                    console.log("==========================================================")
                    console.log("pesanMasuk =", pesanMasuk, "|", "noWA =", noWa, "|", "ButtonRespon", messages[0].message.buttonsResponseMessage, "|")
                    console.log("==========================================================")                    
                                         
                    var request = require('request');
                    var options = {
                    'method': 'POST',
                    'url': `https://chatbot.mynobox.com/api/v1/bots/22017-quranibot/converse/${noWa}`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                    },
                    body: `{"type": "text","text": "${pesanMasuk}"}`
                    };

                    request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    // console.log(JSON.parse(response.body)['responses']);
                    let psn = "";
                    psn = JSON.parse(response.body)['responses'];                                                               
                    // console.log("psn =", psn, "|")                  
                    if(psn != undefined) {                    
                        psn.forEach(async dt => {                        
                            switch (dt.type) {
                                case "text":
                                    let Text = "";
                                    Text = dt.text;                                
                                    Text = Text.replace(/<br>/gi, '\n').replace(/`/gi, '```').replace(/##/gi, '').replace(/\*\*/gi, '*').replace(/<[^>]+>/g, '').replace(/&quot;/g, '\"');                                                                                                                                                              
                                    await sock.sendMessage(noWa, {text: decodeHtmlCharCodes(Text)},{quoted: messages[0] });
                                    break;
                            
                                case "dropdown":                                                             
                                    var dropdowns = [];
                                    var Rowss = [];
                                    // var PsnDrp = "";                              
                                    // console.log("option =", dt.options, "|")

                                    dt.options.forEach(async dts => {
                                        dropdowns.push(dts)
                                        // console.log("dts", dts, "|");                                                        
                                    })
                            
                                    // list
                                    dropdowns.forEach((items, index) => {
                                        Rowss.push({
                                            title: items.value,
                                            rowId: index
                                        })
                                    })
                                        
                                    const list = [{
                                        title : "", 
                                        rows: Rowss                                                              
                                    }]

                                    const listPesan = {
                                        text: dt.message,
                                        title: "",
                                        buttonText: "Tampilkan Menu",
                                        viewOnce: true,
                                        sections : list
                                    }                                                                                                                   
                                    await sock.sendMessage(noWa, listPesan, {quoted: messages[0]});
                                        
                                    // await sock.sendMessage(noWa, {text: PsnDrp},{quoted: messages[0] });                              
                                    break;

                                case "image":
                                    await sock.sendMessage(noWa, { 
                                        image: {
                                            url: dt.image
                                        },
                                        caption: ""
                                        });
                                    break;

                                default:
                                    await sock.sendMessage(noWa, {text: `Item : Type '${dt.type}' is not found.`},{quoted: messages[0] });                                
                                break;
                            }                    
                        });
                    }else{
                        await sock.sendMessage(noWa, {text: "Request gagal!"},{quoted: messages[0] });
                    }
                        
                    });
                                                               
                }else if(messages[0].message.conversation != "") {                
                    const pesanMasuk = messages[0].message.conversation;
                    // if(responseButton != null ) {
                    //     pesanMasuk = responseButton;
                    // }                                                      
                    console.log("==========================================================")
                    console.log("pesanMasukConversation =", pesanMasuk, "|", "noWA =", noWa, "|", "ButtonRespon", messages[0].message.buttonsResponseMessage, "|")
                    console.log("==========================================================")                    
                                         
                    var request = require('request');
                    var options = {
                    'method': 'POST',
                    'url': `https://chatbot.mynobox.com/api/v1/bots/22017-quranibot/converse/${noWa}`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                    },
                    body: `{"type": "text","text": "${pesanMasuk}"}`
                    };

                    request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    // console.log(JSON.parse(response.body)['responses']);
                    let psn = "";
                    // console.log("response.body =", response.body, "|")
                    psn = JSON.parse(response.body)['responses'];                                                                  
                    // console.log("psn =", psn, "|")                  
                    if(psn != undefined ) {                                            
                        await psn.forEach(async dt => {                        
                            switch (dt.type) {
                                case "text":
                                    let Text = "";
                                    Text = dt.text;                                
                                    Text = Text.replace(/<br>/gi, '\n').replace(/`/gi, '```').replace(/##/gi, '').replace(/\*\*/gi, '*').replace(/<[^>]+>/g, '').replace(/&quot;/g, '\"');                                                                                                                                                              
                                    await sock.sendMessage(noWa, {text: decodeHtmlCharCodes(Text)},{quoted: messages[0] });
                                    break;
                            
                                case "dropdown":
                                    var dropdowns = [];
                                    var Rowss = [];
                                
                                    // console.log("option =", dt.options, "|")
                                    dt.options.forEach(async dts => {
                                        dropdowns.push(dts)                                                                                                 
                                    })

                                    // list
                                    dropdowns.forEach((items, index) => {
                                        Rowss.push({
                                            title: items.value,
                                            rowId: index
                                        })
                                    })
                                        
                                    const list = [{
                                        title : "", 
                                        rows: Rowss                                                              
                                    }]

                                    const listPesan = {
                                        text: dt.message,
                                        title: "",
                                        buttonText: "Tampilkan Menu",
                                        viewOnce: true,
                                        sections : list
                                    }                                                                                                                   
                                    await sock.sendMessage(noWa, listPesan, {quoted: messages[0]});

                                    // await sock.sendMessage(noWa, {text: PsnDrp},{quoted: messages[0] });                              
                                    break;

                                case "image":
                                    await sock.sendMessage(noWa, { 
                                        image: {
                                            url: dt.image
                                        },
                                        caption: ""
                                        });
                                    break;

                                default:
                                    await sock.sendMessage(noWa, {text: `Item : Type '${dt.type}' is not found.`},{quoted: messages[0] });                                
                                break;
                            }                    
                        });

                    }else{
                        await sock.sendMessage(noWa, {text: "Request gagal!"},{quoted: messages[0] });
                    }
                        
                    });

                }
                else if(responseButton != null) {
                    console.log("btnrespon =", messages[0].message.buttonsResponseMessage.selectedDisplayText)
                    pesanMasuk = messages[0].message.buttonsResponseMessage.selectedDisplayText;
                    // continue Lanjut;
                    await sock.sendMessage(noWa, {text: "button!"},{quoted: messages[0] });
                }
                else if(responseList != null) {
                    const pesanMasuk = messages[0].message.listResponseMessage.title;
                    // if(responseButton != null ) {
                    //     pesanMasuk = responseButton;
                    // }                                                      
                    console.log("==========================================================")
                    console.log("pesanMasukList =", pesanMasuk, "|", "noWA =", noWa, "|")
                    console.log("==========================================================")                    
                                         
                    var request = require('request');
                    var options = {
                    'method': 'POST',
                    'url': `https://chatbot.mynobox.com/api/v1/bots/22017-quranibot/converse/${noWa}`,
                    'headers': {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
                    },
                    body: `{"type": "text","text": "${pesanMasuk}"}`
                    };

                    request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    // console.log(JSON.parse(response.body)['responses']);
                    let psn = "";
                    // console.log("response.body =", response.body, "|")
                    psn = JSON.parse(response.body)['responses'];                                                                  
                    // console.log("psn =", psn, "|")                  
                    if(psn != undefined ) {                                            
                        await psn.forEach(async dt => {                        
                            switch (dt.type) {
                                case "text":
                                    let Text = "";
                                    Text = dt.text;                                
                                    Text = Text.replace(/<br>/gi, '\n').replace(/`/gi, '```').replace(/##/gi, '').replace(/\*\*/gi, '*').replace(/<[^>]+>/g, '').replace(/&quot;/g, '\"');                                                                                                                                                              
                                    await sock.sendMessage(noWa, {text: decodeHtmlCharCodes(Text)},{quoted: messages[0] });
                                    break;
                            
                                case "dropdown":
                                    var dropdowns = [];
                                    var Rowss = [];
                                
                                    // console.log("option =", dt.options, "|")
                                    dt.options.forEach(async dts => {
                                        dropdowns.push(dts)                                                                                                 
                                    })
                    
                                    // list
                                    dropdowns.forEach((items, index) => {
                                        Rowss.push({
                                            title: items.value,
                                            rowId: index
                                        })
                                    })
                                        
                                    const list = [{
                                        title : "", 
                                        rows: Rowss                                                              
                                    }]

                                    const listPesan = {
                                        text: dt.message,
                                        title: "",
                                        buttonText: "Tampilkan Menu",
                                        viewOnce: true,
                                        sections : list
                                    }                                                                                                                   
                                    await sock.sendMessage(noWa, listPesan, {quoted: messages[0]});

                                    // await sock.sendMessage(noWa, {text: PsnDrp},{quoted: messages[0] });                              
                                    break;

                                case "image":
                                    await sock.sendMessage(noWa, { 
                                        image: {
                                            url: dt.image
                                        },
                                        caption: ""
                                        });
                                    break;

                                default:
                                    await sock.sendMessage(noWa, {text: `Item : Type '${dt.type}' is not found.`},{quoted: messages[0] });                                
                                break;
                            }                    
                        });

                    }else{
                        await sock.sendMessage(noWa, {text: "Request gagal!"},{quoted: messages[0] });
                    }
                        
                    });
                }
                else{
                    await sock.sendMessage(noWa, {text: "Maaf kami tidak memahami. Silahkan chat ulang!"},{quoted: messages[0] });
                }                  
            }

        }

    });
}
// run in main file
connectToWhatsApp()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

server.listen(port, () => {
  console.log("Server Berjalan pada Port : " + port);
});


