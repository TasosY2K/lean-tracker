// One nighter coding challenge the grabify clone
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const shortid = require('shortid');
const moment = require('moment');

const config = require('./config.json');
const func = require('./functions/functions.js');

let connection = mysql.createConnection(config.database);
let app = express();

app.use(require('express-useragent').express());
app.set('view engine', 'pug');

connection.query('CREATE DATABASE IF NOT EXISTS lean_tracker', (err) => {
  connection.query('USE lean_tracker', (err) => {
    connection.query(func.readSql('./sql/create_table_tracker.sql'), (err) => {
      connection.query(func.readSql('./sql/create_table_ip.sql'), (err) => {
        if (err) {
          console.log('Database error: ', err);
          func.shutdown();
        } else {
          console.log('Database setup completed');
        }
      });
    });
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {

      let id = results[0].id;
      let ip_address = '141.237.9.209';
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
          ) VALUES (
            '${unique_id}',
            '${id}',
            '${ip_address}',
            '${timestamp}',
            '${data.country}',
            '${data.city}',
            '${data.timezone}',
            '${req.useragent.browser + " (" + req.useragent.version + ")"}',
            '${req.useragent.os}',
            '${req.useragent.platform}',
            '${data.lat + ", " + data.lon}',
            '${data.isp}',
            '${data.as}',
            '${user_agent}'
          )`;

          let original_url = results[0].original_url;

          connection.query(sql, (err) => {
            res.redirect(original_url);
          });
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });

    } else {
      res.redirect('/');
    }
  });
});

app.get('/ip/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM ip WHERE unique_id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.send(`IP with ID: ${id} not found`);
    }
  });
});

app.get('/tracker/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.send(`Tracker with ID: ${id} not found`);
    }
  });
});

app.get('/track/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      id = results[0].id;
      sql = `SELECT * FROM ip WHERE id = '${id}'`;

      let tracker_info = results[0];

      connection.query(sql, (err, results, fields) => {
        let ip_info = results;
        res.render('track', {ip_info: ip_info, tracker_info: tracker_info});
      });

    } else {
      res.render('alert', {alert: `Tracker with ID: ${id} not found ❌`});
    }
  });
});

app.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM tracker WHERE admin_id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      let ip_id = results[0].id;
      sql = `DELETE FROM ip WHERE id = '${ip_id}'`;

      connection.query(sql, (err, results, fields) => {
        sql = `DELETE FROM tracker WHERE admin_id = '${id}'`;
        connection.query(sql, (err, results, fields) => {
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
      let sql = `SELECT * FROM tracker WHERE admin_id = '${id}'`;

      connection.query(sql, (err, results, fields) => {
        tracking_url = results[0].tracking_url;
        if (results.length > 0) {
          sql = `UPDATE tracker SET original_url = '${original_url}' WHERE admin_id = '${id}'`;

          connection.query(sql, (err, results, fields) => {
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
      ) VALUES (
        '${id}',
        '${admin_id}',
        '${original_url}',
        '${config.url}/${id}',
        '${config.url}/track/${admin_id}'
      )`;

      connection.query(sql, (err) => {
        if (err) {
          console.log('Database error: ', err);
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
      res.render('alert', {alert: 'Input not validated'});
    }
  } else {
    res.redirect('/');
  }
});

app.listen(config.port, '0.0.0.0');
console.log('Server started at port', config.port);
