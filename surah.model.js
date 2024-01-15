const db = require("../configs/db.js")
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on('error',(err)=> {
  console.error(err)
})

const Surah = function(){}

Surah.randomAyat = result => {
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
      ORDER BY RAND() LIMIT 1`
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found surah: ", res[0])

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: {
              nomor: res[0]['ayat'],
              juz: res[0]['juz'],
              hal: res[0]['hal'],
              ar: res[0]['ar'],
              tr: res[0]['tr'],
              tf: res[0]['tf']
            }
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.allAyat = (surah, result) => {
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
      WHERE nomorsurah = ? OR alt = ?`
    , [surah, surah],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printAyat(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['ayat'],
              juz: o['juz'],
              hal: o['hal'],
              ar: o['ar'],
              tr: o['tr'],
              tf: o['tf']
            })
          })
          return arr
        }

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: printAyat(res)
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.detailAyat = (surah, ayat, result) => {
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
      WHERE (nomorsurah = ? OR alt = ?) AND nomorayat = ?`
    , [surah, surah, ayat],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found surah: ", res[0])

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: {
              nomor: res[0]['ayat'],
              juz: res[0]['juz'],
              hal: res[0]['hal'],
              ar: res[0]['ar'],
              tr: res[0]['tr'],
              tf: res[0]['tf'],
            }
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.rangeAyat = (surah, from, to, result) => {
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
      WHERE (nomorsurah = ? OR alt = ?) AND nomorayat BETWEEN ? AND ?`
    , [surah, surah, from, to],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found surah: ", res[0])

        function printAyat(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['ayat'],
              juz: o['juz'],
              hal: o['hal'],
              ar: o['ar'],
              tr: o['tr'],
              tf: o['tf']
            })
          })
          return arr
        }

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: printAyat(res)
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.allAyatOptions = (surah, options, result) => {
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
      WHERE nomorsurah = ? OR alt = ?`
    , [surah, surah],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found ayat: ", res[0])

        function printAyat(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['ayat'],
              juz: o['juz'],
              hal: o['hal'],
              ar: o['ar'],
              tr: o['tr'],
              tf: o['tf']
            })
          })
          return arr
        }

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: printAyat(res)
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.detailAyatOptions = (surah, ayat, options, result) => {
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
      WHERE (nomorsurah = ? OR alt = ?) AND nomorayat = ?`
    , [surah, surah, ayat],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found surah: ", res[0])

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: {
              nomor: res[0]['ayat'],
              juz: res[0]['juz'],
              hal: res[0]['hal'],
              ar: res[0]['ar'],
              tr: res[0]['tr'],
              tf: res[0]['tf']
            }
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Surah.rangeAyatOptions = (surah, from, to, options, result) => {
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
      WHERE (nomorsurah = ? OR alt = ?) AND nomorayat BETWEEN ? AND ?`
    , [surah, surah, from, to],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found surah: ", res[0])

        function printAyat(raw) {
          var arr = []
          raw.forEach((o, i) => {
            arr.push({
              nomor: o['ayat'],
              juz: res[0]['juz'],
              hal: res[0]['hal'],
              ar: o['ar'],
              tr: o['tr'],
              tf: o['tf'],
            })
          })
          return arr
        }

        result(null, {
            nomor: res[0]['nomor'],
            nama: res[0]['nama'],
            jumlah_ayat: res[0]['jumlah_ayat'],
            tempat_turun: res[0]['tempat_turun'],
            arti: res[0]['arti'],
            deskripsi: res[0]['deskripsi'],
            ayat: printAyat(res)
          })
        return
      }

      // not found Surah with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

module.exports = Surah
