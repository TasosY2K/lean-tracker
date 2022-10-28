/*
  _                    _____            _
 | |   ___ __ _ _ _   |_   _| _ __ _ __| |_____ _ _
 | |__/ -_) _` | ' \    | || '_/ _` / _| / / -_) '_|
 |____\___\__,_|_||_|   |_||_| \__,_\__|_\_\___|_|

  version: 1.0.9
  author: leandev
  github: https://github.com/TasosY2K/lean-tracker
*/

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const moment = require('moment');
const figlet = require('figlet');

const config = require('./config.json');
const func = require('./functions/functions.js');

let connection = mysql.createConnection({...config.database, multipleStatements: false});
let app = express();

app.use(require('express-useragent').express());
app.set('view engine', 'pug');

connection.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log('MySQL Error: Lost database connection');
		process.exit();
  } else {
    console.log('MySQL Error:', err.sqlMessage);
	  process.exit();
	}
});

connection.query('CREATE DATABASE IF NOT EXISTS lean_tracker', (err) => {
  if (err) console.log('MySQL Error: ', err.sqlMessage);
  connection.query('USE lean_tracker', (err) => {
    if (err) console.log('MySQL Error: ', err.sqlMessage);
    connection.query(func.readSql('./sql/create_table_tracker.sql'), (err) => {
      if (err) console.log('MySQL Error: ', err.sqlMessage);
      connection.query(func.readSql('./sql/create_table_ip.sql'), (err) => {
        if (err) console.log('MySQL Error: ', err.sqlMessage);
      });
    });
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE id = ?`;

  connection.query(sql, [id], (err, results, fields) => {
    if (err) {
      console.log('MySQL Error: ', err.sqlMessage);
      return res.sendStatus(503);
    }

    if (results.length > 0) {

      let ip_address = req.headers['x-forwarded-for'];

      if (ip_address) {
        let list = ip_address.split(',');
        ip_address = list[list.length-1];
      } else {
        ip_address = req.connection.remoteAddress;
      }

      let id = results[0].id;
      let unique_id = shortid.generate();
      let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      let user_agent = req.useragent.source;

      http.get(`http://ip-api.com/json/${ip_address}`, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          data = JSON.parse(data);

          sql = `INSERT INTO ip (
            unique_id,
            id,
            ip_address,
            time_captured,
            country,
            city,
            timezone,
            browser,
            os,
            platform,
            coordinates,
            isp,
            asp,
            user_agent
          ) VALUES ?`;

          let original_url = results[0].original_url;

          connection.query(sql, [unique_id, ip_address, timestamp, data.country, data.city, data.timezone, `${req.useragent.browser} (${req.useragent.version})`, req.useragent.os, req.useragent.platform, `${data.lat}, ${data.lon}`, data.isp, data.as, user_agent], (err) => {
            if (err) {
              console.log('MySQL Error: ', err.sqlMessage);
              res.sendStatus(503);
            }
            res.redirect(original_url);
          });
        });

      }).on('error', (err) => {
        console.log("HTTP Error: " + err);
        res.sendStatus(503);
      });

    } else {
      res.redirect('/');
    }
  });
});

app.get('/ip/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM ip WHERE unique_id = ?`;

  connection.query(sql, [id], (err, results, fields) => {
    if (err) {
      console.log('MySQL Error: ', err.sqlMessage);
      res.sendStatus(503);
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.send(`IP with ID: ${id} not found`);
    }
  });
});

app.get('/tracker/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = ?`;

  connection.query(sql, [id], (err, results, fields) => {
    if (err) {
      console.log('MySQL Error: ', err.sqlMessage);
      res.sendStatus(503);
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.send(`Tracker with ID: ${id} not found`);
    }
  });
});

app.get('/track/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = ?`;

  connection.query(sql, [id], (err, results, fields) => {
    if (err) {
      console.log('MySQL Error: ', err.sqlMessage);
      res.sendStatus(503);
    }

    if (results.length > 0) {
      id = results[0].id;
      sql = `SELECT * FROM ip WHERE id = '${id}'`;

      let tracker_info = results[0];

      connection.query(sql, (err, results, fields) => {
        if (err) {
          console.log('MySQL Error: ', err.sqlMessage);
          res.sendStatus(503);
        }

        let ip_info = results;

        res.render('track', {ip_info: ip_info, tracker_info: tracker_info, id: tracker_info.admin_id});
      });

    } else {
      res.render('alert', {alert: `Tracker with ID: ${id} not found ❌`});
    }
  });
});

app.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = ?`;

  connection.query(sql, [id], (err, results, fields) => {
    if (err) {
      console.log('MySQL Error: ', err.sqlMessage);
      res.sendStatus(503);
    }

    if (results.length > 0) {
      let ip_id = results[0].id;

      sql = `DELETE FROM ip WHERE id = '${ip_id}'`;

      connection.query(sql, (err, results, fields) => {
        sql = `DELETE FROM tracker WHERE admin_id = ?`;
        connection.query(sql, [id], (err, results, fields) => {
          res.render('alert', {alert: `Successfully deleted tracker with ID: ${id} ✔️`});
        });
      });

    } else {
      res.render('alert', {alert: `Tracker with ID: ${id} not found ❌`});
    }
  });
});

app.get('/change/:id', (req, res) => {
  let original_url = req.query.url;
  let id = req.params.id;

  if (original_url) {
    if (func.validateUrl(original_url)) {
      let sql = `SELECT * FROM tracker WHERE admin_id = ?`;

      connection.query(sql, [id], (err, results, fields) => {
        if (err) {
          console.log('MySQL Error: ', err.sqlMessage);
          res.sendStatus(503);
        }

        tracking_url = results[0].tracking_url;

        if (results.length > 0) {
          sql = `UPDATE tracker SET original_url = ? WHERE admin_id = ?`;

          connection.query(sql, [original_url, id], (err, results, fields) => {
            if (err) {
              console.log('MySQL Error: ', err.sqlMessage);
              res.sendStatus(503);
            }

            res.redirect(tracking_url);
          });

        } else {
          res.render('alert', {alert: `Tracker with ID: ${id} not found ❌`});
        }
      });
    } else {
      res.render('alert', {alert: 'Input not validated'});
    }
  } else {
    res.redirect('/');
  }
});


app.post('/create', (req, res) => {
  let original_url = req.query.url;
  if (original_url) {
    if (func.validateUrl(original_url)) {
      let id = shortid.generate();
      let admin_id = shortid.generate();

      let sql = `INSERT INTO tracker (
        id,
        admin_id,
        original_url,
        short_url,
        tracking_url
      ) VALUES ?`;
      connection.query(sql, [id, admin_id, original_url, `${config.url}/${id}`, `${config.url}/track/${admin_id}}`], (err) => {
        if (err) {
          console.log('MySQL Error: ', err.sqlMessage);
          res.sendStatus(503);
        } else {
          res.json({
            id: id,
            admin_id: admin_id,
            original_url: original_url,
            short_url: `${config.url}/${id}`,
            tracking_url: `${config.url}/track/${admin_id}`
          });
        }
      });
    } else {
      res.render('alert', {alert: 'Input not validated ❌'});
    }
  } else {
    res.redirect('/');
  }
});

app.listen(process.env.PORT || config.port, '0.0.0.0');

figlet('Lean Tracker', {font: 'Small'}, (err, data) => {
  console.log(data);
  console.log('Serving at port:', config.port);
});
