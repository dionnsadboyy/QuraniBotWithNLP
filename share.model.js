const { createCanvas, loadImage, Image } = require('canvas')
const CanvasTextWrapper = require('canvas-text-wrapper-new').CanvasTextWrapper
const db = require("../configs/db.js")
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on('error',(err)=> {
  console.error(err)
})

const Share = function(){}

textWrap = (text, maxChars) => {
  var ret = [];
  var words = text.split(/\b/);

  var currentLine = '';
  var lastWhite = '';
  words.forEach(function(d) {
    var prev = currentLine;
    currentLine += lastWhite + d;

    var l = currentLine.length;

    if (l > maxChars) {
      ret.push(prev.trim());
      currentLine = d;
      lastWhite = '';
    } else {
      var m = currentLine.match(/(.*)(\s+)$/);
      lastWhite = (m && m.length === 3 && m[2]) || '';
      currentLine = (m && m.length === 3 && m[1]) || currentLine;
    }
  });

  if (currentLine) {
    ret.push(currentLine.trim());
  }

  return ret.join("\n");
}

Share.detailAyat = (surah, ayat, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }

    connection.query(
      `SELECT
      nomorsurah AS nomor,
      namasurah AS nama,
      jumlahayat AS jumlah_ayat,
      type AS tempat_turun,
      artinama AS arti,
      mukadimah AS deskripsi,
      nomorayat AS ayat,
      indopak AS ar,
      indonesia AS tr,
      tafsir_text AS tf
      FROM alquran
      JOIN daftarsurah
      ON nomorsurah = idsurah
      JOIN tafsir_kemenag
      ON nomorsurah = surah_id AND nomorayat = ayat_id
      WHERE (nomorsurah = ? OR alt = ?) AND nomorayat = ?`
    , [surah, surah, ayat],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        const surat = {
          nomor: res[0]['nomor'],
          nama: res[0]['nama'],
          ayat: res[0]['ayat'],
          ar: res[0]['ar'],
          tr: res[0]['tr'],
        }

        // variables goes brrr
        const width = 1080, height = 1080
        const logoWidth = 150, logoHeight = 33
        const resolutions = [width, height]
        var tr = textWrap(surat.tr, 60),
            lineCount = tr.split('\n').length,
            detailPos = lineCount > 1 ? 280 + (lineCount - 1) * 70 : 280,
            detailPos = detailPos > 830 ? 830 : detailPos,
            trSize = 38,
            trHeight = 45,
            trLength = surat.tr.split('').length,
            arSize = 60,
            arHeight = 60,
            frPos = 200,
            arPos = 540,
            trPos = 590
        console.log("------------ huruf arti: ", trLength)

        //-------------- case ukuran font berdasarkan jumlah huruf arti (trLength)
        if(trLength<=40){
          trSize -= 0.2
          trHeight -= 0.2
          arSize += 7
          arHeight -= 0.25
          tr = textWrap(surat.tr, 40)
        detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
        frPos += 170
        }else if(trLength<=60){
          trSize += 2
          trHeight -= 0.5
          arSize += 5
          arHeight -= 0.4
          trPos -= 15
          tr = textWrap(surat.tr, 40)
          detailPos = height/4 + tr.split('\n').length * trHeight
          frPos += 175
          detailPos -= 25
        }else if(trLength<=100){
          trSize -= 5
          trHeight -= 5
          arSize -= 10
          arHeight += 35
          arPos -= 0
          tr = textWrap(surat.tr, 57)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 200
          arPos -= 20
        }else if(trLength<=120){
          trSize -= 5
          trHeight += 0
          arSize -= 16
          arHeight += 25
          tr = textWrap(surat.tr, 55)
          frPos += 140
          arPos -= 30
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
        }else if(trLength<=130){
          trSize += 3
          trHeight += 3
          trPos -= 10
          arSize -= 10
          arHeight += 25
          tr = textWrap(surat.tr, 45)
          frPos += 140
          arPos -= 20
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
        }else if(trLength<=140){
          trSize -= 2
          trHeight += 0
          trPos -= 10
          arSize -= 10
          arHeight += 25
          tr = textWrap(surat.tr, 55)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 140
          arPos -= 20
        }else if(trLength<=150){
          trSize += 2
          trPos -= 15
          arSize -= 10
          arHeight += 32
          tr = textWrap(surat.tr, 42)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 120
          arPos -= 20
        }else if(trLength<=160){
          trSize -= 5
          trHeight -= 5
          trPos -= 15
          arSize -= 15
          arHeight += 25
          tr = textWrap(surat.tr, 58)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 20
        }else if(trLength<=170){
          trSize -= 2
          trHeight -= 5
          arSize -= 10
          arHeight += 20 
          tr = textWrap(surat.tr, 48)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 20
        }else if(trLength<=180){
          trSize -= 2
          trHeight -= 5
          arSize -= 10
          arHeight += 20 
          tr = textWrap(surat.tr, 55)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 20
          detailPos -= 60
        }else if(trLength<=190){
          trSize += 2
          trPos -= 25
          arSize -= 15
          arHeight += 17
          tr = textWrap(surat.tr, 52)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 10
        }else if(trLength<=200){
          trSize += 2
          trPos -= 25
          arSize -= 15
          arHeight += 17
          tr = textWrap(surat.tr, 40)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 10
        }else if(trLength<=220){
          trSize += 2
          trHeight += 5
          trPos -= 75
          arSize -= 15
          arHeight += 17
          arPos += 50
          tr = textWrap(surat.tr, 47)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 100
          frPos += 80
        }else if(trLength<=240){
          trSize -= 2
          trHeight -= 5
          trPos -= 15
          arSize -= 12
          arHeight += 25
          tr = textWrap(surat.tr, 51)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 50
          arPos -= 10
        }else if(trLength<=280){
          trSize -= 10
          trHeight -= 15
          arSize -= 11
          arHeight += 15
          tr = textWrap(surat.tr, 69)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 150
          arPos -= 10
        }else if(trLength<=300){
          trSize -= 10
          trHeight -= 15
          arSize -= 18
          arHeight += 15
          tr = textWrap(surat.tr, 66)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 100
          arPos -= 20
        }else if(trLength<=320){
          trSize -= 10
          trHeight -= 15
          arSize -= 13
          arHeight += 5
          tr = textWrap(surat.tr, 70)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 100
          arPos -= 10
        }else if(trLength<=340){
          trSize -= 5
          trHeight -= 8
          arSize -= 15
          arHeight += 7
          arPos -= 7
          tr = textWrap(surat.tr, 55)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 150
          frPos += 100
          trPos -= 20
        }else if(trLength<=360){
          trSize -= 12
          trHeight -= 17
          arSize -= 15
          arHeight += 7
          arPos -= 7
          tr = textWrap(surat.tr, 70)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 100
          trPos -= 20
        }else if(trLength<=380){
          trSize -= 10
          trHeight -= 13
          arSize -= 20
          arHeight += 7
          tr = textWrap(surat.tr, 67)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos += 100
          trPos -= 20
        }else if(trLength<=660){
          trSize -= 13
          trHeight -= 15
          arSize -= 12
          arHeight += 5
          tr = textWrap(surat.tr, 70)
          detailPos = tr.split('\n').length * Math.floor(trHeight+trSize) + 160
          frPos -= 50
          trPos -= 20
        }else if(trLength<=1680){
          trSize -= 19
          trHeight -= 22
          trPos -= 75
          arSize -= 34
          arHeight -= 10
          frPos -= 90
          tr = textWrap(surat.tr, 105)
          arPos += 40
          detailPos = 800
        }
        console.log("-------------- detailPos: ",detailPos)
        console.log("-------------- trSize: ", trSize)
        
        
        const bgMin = 1, bgMax = 5
        const bgRandom = Math.floor(Math.random() * (bgMax - bgMin + 1) + bgMin)
        
        // canvas stuff
        const canvas = createCanvas(resolutions[0], resolutions[1], 'jpg')
        const ctx = canvas.getContext('2d')
        
        // get random background
        loadImage(`./src/qurani/assets/${bgRandom}.jpg`).then((bg) => {
          // background image
          ctx.drawImage(bg, 0 , 0, resolutions[0], resolutions[1])
          
          // draw white rectangle
          ctx.fillStyle = "#ffffffcc"
          ctx.fillRect(50, 50, width - 100, height - 100)

          // qurani logo
          const logoQurani = new Image()
          logoQurani.src = './src/qurani/assets/logo.png'
          ctx.drawImage(logoQurani, 60 , 985, logoWidth, logoHeight)
        
          // Allah berfirman
          ctx.fillStyle = '#000000'
          CanvasTextWrapper(canvas,
            "Allah Subhanahu Wa Ta'ala berfirman:",
            { font: `${trSize}px Merendina`, lineHeight: `${trHeight}px`, textAlign: 'center', verticalAlign: 'top', paddingY: frPos}
          )
        
          // arabic
          ctx.fillStyle = '#000000'
          CanvasTextWrapper(canvas,
            surat.ar,
            { font: `${arSize}px "Qalam Majeed 3 (AndiUnpam)"`, lineHeight: `${arHeight}px`, maxWidth: 900, textAlign: 'center', verticalAlign: 'bottom', paddingY: arPos}
          )
        
          // arti
          ctx.fillStyle = '#25805b'
          CanvasTextWrapper(canvas,
            tr,
            { font: `${trSize}px "Roboto"`, lineHeight: `${trHeight}px`, textAlign: 'center', verticalAlign: 'top', paddingY: trPos}
          )
        
          // detail ayat
          ctx.fillStyle = '#222222';
          CanvasTextWrapper(canvas,
            `(QS. ${surat.nama} ${surat.nomor}: Ayat ${surat.ayat})`,
            { font: `${trSize}px Merendina`, lineHeight: `${trHeight}px`, textAlign: 'center', verticalAlign: 'middle', offsetY: detailPos }
          )

          // nomor telpon
          ctx.fillStyle = '#25805b';
          CanvasTextWrapper(canvas,
            `081-225566-141`,
            { font: `28px Arial Rounded MT`, lineHeight: `30px`, textAlign: 'left', verticalAlign: 'middle', offsetY: 930, offsetX: 800  }
          )
        
          // image render options
          let stream = canvas.createJPEGStream({quality: 0.95, chromaSubsampling: false})
        
          result(null, stream)
        })
        return
      }

      // not found Share with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

module.exports = Share
