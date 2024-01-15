const db = require("../configs/db.js")
const mysql = require('mysql')
const pool = mysql.createPool(db)

pool.on('error',(err)=> {
  console.error(err)
})

const Suggestion = function(suggestion) {
  this.nama = suggestion.nama
  this.noHp = suggestion.noHp
  this.catatan = suggestion.catatan
}

Suggestion.create = (newSuggestion, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }

    connection.query(
      `INSERT INTO masukan SET ?`
    , [newSuggestion],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      console.log("created suggestion: ", { id: res.insertId, ...newSuggestion })
      result(null, { id: res.insertId, ...newSuggestion })
    })
    connection.release()
  })
}

Suggestion.findById = (id, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(error, null)
      return
    }

    connection.query(
      `SELECT * FROM masukan WHERE id = ?`
    , [id],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(err, null)
        return
      }

      if (res.length) {
        console.log("found suggestion: ", res[0])
        result(null, res[0])
        return
      }

      // not found Suggestion with the id
      result({ kind: "not_found" }, null)
    })
    connection.release()
  })
}

Suggestion.getAll = (catatan, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(null, error)
      return
    }

    connection.query(
      `SELECT * FROM masukan` + (catatan ? ` WHERE catatan LIKE '%${catatan}%'` : ``)
    , function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(null, err)
        return
      }

      console.log("suggestions: ", res)
      result(null, res)
    })
    connection.release()
  })
}

Suggestion.updateById = (id, suggestion, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(null, error)
      return
    }

    connection.query(
      `UPDATE masukan SET ? WHERE id = ?`
    , [suggestion, id],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(null, err)
        return
      }

      if (res.affectedRows == 0) {
        // not found Suggestion with the id
        result({ kind: "not_found" }, null)
        return
      }

      console.log("updated suggestion: ", { id: id, ...suggestion })
      result(null, { id: id, ...suggestion })
    })
    connection.release()
  })
}

Suggestion.remove = (id, result) => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(null, error)
      return
    }

    connection.query(
      `DELETE FROM masukan WHERE id = ?`
    , [id],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(null, err)
        return
      }

      if (res.affectedRows == 0) {
        // not found Suggestion with the id
        result({ kind: "not_found" }, null)
        return
      }

      console.log("deleted suggestion with id: ", id)
      result(null, res)
    })
    connection.release()
  })
}

Suggestion.removeAll = result => {
  pool.getConnection(function(error, connection) {
    if (error) {
      console.log("error: ", error)
      result(null, error)
      return
    }

    connection.query(
      `DELETE FROM masukan`
    , [id],
    function (err, res) {
      if (err) {
        console.log("error: ", err)
        result(null, err)
        return
      }

      console.log(`deleted ${res.affectedRows} suggestions`)
      result(null, res)
    })
    connection.release()
  })
}

module.exports = Suggestion
