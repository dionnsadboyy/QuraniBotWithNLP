const db = require("../configs/db.js")
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on('error',(err)=> {
  console.error(err)
})

const Qnaquran = function(){}
// det daftar surah by surah
Qnaquran.getTentangSurah = (surah,result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
        result(error, null)
        return
      }
      
      var ayat = "";
      connection.query(
        `SELECT 
        idsurah as id,
        namasurah as nama,
        artinama as arti,
        jumlahayat as jumlah_ayat,
        type as tempat_turun,
        mukadimah,
        keimanan,
        hukum,
        kisah,
        lain,
        alt
        FROM daftarsurah 
        WHERE alt = ayat OR namasurah = ayat`
      , [surah, surah]
      ,function (err, res) {
        if (err) {
          console.log("error: ", err)
          result(err, null)
          return
        }
  
        if (res.length) {
          console.log("found surah: ", res)
  
          result(null, res)
          return
        }
  
        // not found Surah with the id
        result({ kind: "not_found" }, null)
      })
      connection.release()
    })
  }

  //get surah (tempat turunnya)
  Qnaquran.getSurahTurunKeduanya = result => {
    pool.getConnection(function(error, connection) {
      if (error) {
        console.log("error: ", error)
        result(error, null)
        return
      }
  
      connection.query(
        `SELECT 
        idsurah as id,
        namasurah as nama,
        artinama as arti,
        type as tempat_turun
        FROM daftarsurah 
        WHERE type = 'madinah & mekkah'`
      ,function (err, res) {
        if (err) {
          console.log("error: ", err)
          result(err, null)
          return
        }
  
        if (res.length) {
          console.log("found surah: ", res)
  
          result(null, res)
          return
        }

        result({ kind: "not_found" }, null)
      })
      connection.release()
    })
  }

  //get surah by type (tempat turunnya)
  Qnaquran.getSurahTurunnya = (type,result) => {
    pool.getConnection(function(error, connection) {
      if (error) {
        console.log("error: ", error)
        result(error, null)
        return
      }
  
      connection.query(
        `SELECT 
        idsurah as id,
        namasurah as nama,
        artinama as arti,
        type as tempat_turun
        FROM daftarsurah 
        WHERE type LIKE '%${type}%'`
      ,function (err, res) {
        if (err) {
          console.log("error: ", err)
          result(err, null)
          return
        }
  
        if (res.length) {
          console.log("found surah: ", res)
  
          result(null, res)
          return
        }

        result({ kind: "not_found" }, null)
      })
      connection.release()
    })
  }

  module.exports = Qnaquran;