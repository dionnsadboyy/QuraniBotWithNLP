const db = require("../configs/db.js")
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on('error',(err)=> {
  console.error(err)
})

const Text = function(){}

Text.surahByText = (teks, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }

    connection.query(
      `SELECT
      (SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') AS jumlah,
      nomorsurah AS nomor,
      namasurah AS nama,
      jumlahayat AS jumlah_ayat,
      type AS tempat_turun,
      artinama AS arti,
      mukadimah AS deskripsi,
      nomorayat AS ayat,
      juz,
      page_num AS hal,
      indopak AS ar,
      indonesia AS tr,
      tafsir_text AS tf
      FROM alquran
      JOIN daftarsurah
      ON nomorsurah = idsurah
      JOIN tafsir_kemenag
      ON nomorsurah = surah_id AND nomorayat = ayat_id
      WHERE indonesia LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%'
      GROUP BY IF ((SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '%${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') <= 30, ayat, namasurah) LIMIT 30`
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printSurah(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['nomor'],
              nama: o['nama'],
              jumlah_ayat: o['jumlah_ayat'],
              tempat_turun: o['tempat_turun'],
              arti: o['arti'],
              deskripsi: o['deskripsi'],
              ayat: {
                nomor: o['ayat'],
                juz: o['juz'],
                hal: o['hal'],
                ar: o['ar'],
                tr: o['tr'],
                tf: o['tf']
              }
            })
          })
          return arr
        }

        result(null, {
            kata_kunci: teks,
            jumlah: res[0]['jumlah'],
            surah: printSurah(res)
          })
        return
      }

      // not found Text with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Text.surahByTextWithPage = (teks, page, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }
    
    limitPerPage = 30
    pageOffset = (page - 1) * limitPerPage

    connection.query(
      `SELECT
      (SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') AS jumlah,
      nomorsurah AS nomor,
      namasurah AS nama,
      jumlahayat AS jumlah_ayat,
      type AS tempat_turun,
      artinama AS arti,
      mukadimah AS deskripsi,
      nomorayat AS ayat,
      juz,
      page_num AS hal,
      indopak AS ar,
      indonesia AS tr,
      tafsir_text AS tf
      FROM alquran
      JOIN daftarsurah
      ON nomorsurah = idsurah
      JOIN tafsir_kemenag
      ON nomorsurah = surah_id AND nomorayat = ayat_id
      WHERE indonesia LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%'
      LIMIT ${limitPerPage} OFFSET ${pageOffset}`
      // GROUP BY IF ((SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '%${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') <= 30, ayat, namasurah) LIMIT 30 OFFSET ${pageOffset}`
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printSurah(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['nomor'],
              nama: o['nama'],
              jumlah_ayat: o['jumlah_ayat'],
              tempat_turun: o['tempat_turun'],
              arti: o['arti'],
              deskripsi: o['deskripsi'],
              ayat: {
                nomor: o['ayat'],
                juz: o['juz'],
                hal: o['hal'],
                ar: o['ar'],
                tr: o['tr'],
                tf: o['tf']
              }
            })
          })
          return arr
        }

        result(null, {
            kata_kunci: teks,
            jumlah: res[0]['jumlah'],
            surah: printSurah(res)
          })
        return
      }

      // not found Text with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Text.surahByTextOptions = (teks, options, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }

    connection.query(
      `SELECT
      (SELECT COUNT(nomorsurah) FROM alquran WHERE ${options['terjemahan']} LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') AS jumlah,
      nomorsurah AS nomor,
      namasurah AS nama,
      jumlahayat AS jumlah_ayat,
      type AS tempat_turun,
      artinama AS arti,
      mukadimah AS deskripsi,
      nomorayat AS ayat,
      juz,
      page_num AS hal,
      indopak AS ar,
      ${options['terjemahan']} AS tr,
      tafsir_text AS tf
      FROM alquran
      JOIN daftarsurah
      ON nomorsurah = idsurah
      JOIN tafsir_${options['tafsir']}
      ON nomorsurah = surah_id AND nomorayat = ayat_id
      WHERE ${options['terjemahan']} LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%'
      GROUP BY IF ((SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '%${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') <= 30, ayat, namasurah) LIMIT 30` 
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printSurah(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['nomor'],
              nama: o['nama'],
              jumlah_ayat: o['jumlah_ayat'],
              tempat_turun: o['tempat_turun'],
              arti: o['arti'],
              deskripsi: o['deskripsi'],
              ayat: {
                nomor: o['ayat'],
                juz: o['juz'],
                hal: o['hal'],
                ar: o['ar'],
                tr: o['tr'],
                tf: o['tf']
              }
            })
          })
          return arr
        }

        result(null, {
            kata_kunci: teks,
            jumlah: res[0]['jumlah'],
            surah: printSurah(res)
          })
        return
      }

      // not found Text with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Text.surahByTextOptionsWithPage = (teks, options, page, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }
    
    limitPerPage = 30
    pageOffset = (page - 1) * limitPerPage

    connection.query(
      `SELECT
      (SELECT COUNT(nomorsurah) FROM alquran WHERE ${options['terjemahan']} LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') AS jumlah,
      nomorsurah AS nomor,
      namasurah AS nama,
      jumlahayat AS jumlah_ayat,
      type AS tempat_turun,
      artinama AS arti,
      mukadimah AS deskripsi,
      nomorayat AS ayat,
      juz,
      page_num AS hal,
      indopak AS ar,
      ${options['terjemahan']} AS tr,
      tafsir_text AS tf
      FROM alquran
      JOIN daftarsurah
      ON nomorsurah = idsurah
      JOIN tafsir_${options['tafsir']}
      ON nomorsurah = surah_id AND nomorayat = ayat_id
      WHERE ${options['terjemahan']} LIKE '% ${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%'
      LIMIT ${limitPerPage} OFFSET ${pageOffset}` 
      // GROUP BY IF ((SELECT COUNT(nomorsurah) FROM alquran WHERE indonesia LIKE '%${teks}%' OR indopak LIKE '%${teks}%' OR teks LIKE '%${teks}%') <= 30, ayat, namasurah) LIMIT 30` 
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printSurah(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['nomor'],
              nama: o['nama'],
              jumlah_ayat: o['jumlah_ayat'],
              tempat_turun: o['tempat_turun'],
              arti: o['arti'],
              deskripsi: o['deskripsi'],
              ayat: {
                nomor: o['ayat'],
                juz: o['juz'],
                hal: o['hal'],
                ar: o['ar'],
                tr: o['tr'],
                tf: o['tf']
              }
            })
          })
          return arr
        }

        result(null, {
            kata_kunci: teks,
            jumlah: res[0]['jumlah'],
            surah: printSurah(res)
          })
        return
      }

      // not found Text with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

module.exports = Text
