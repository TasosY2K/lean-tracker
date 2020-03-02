// One nighter coding challenge the grabify clone
const express = require('express');
const mysql = require('mysql');
const shortid = require('shortid');
const moment = require('moment');

const config = require('./config.json');
const func = require('./functions/functions.js');

let connection = mysql.createConnection(config.database);
let app = express();

app.set('view engine', 'pug');

connection.query('CREATE DATABASE IF NOT EXISTS grabify_clone', (err) => {
  if (err) {
    console.log('Database error: ', err);
    func.shutdown();
  } else {
    console.log('Database grabify_clone created successfully!');
  }
  connection.query('USE grabify_clone', (err) => {
    if (err) {
      console.log('Database error: ', err);
      func.shutdown();
    }
    connection.query(func.readSql('./sql/create_table_links.sql'), (err) => {
      if (err) {
        console.log('Database error: ', err);
        func.shutdown();
      } else {
        console.log('Table links created successfully!');
      }
      connection.query(func.readSql('./sql/create_table_ip.sql'), (err) => {
        if (err) {
          console.log('Database error: ', err);
          func.shutdown();
        } else {
          console.log('Table ip created successfully!');
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
  let sql = `SELECT * FROM links WHERE id = '${id}'`;

  connection.query(sql, (err, results, fields) => {
    if (results.length > 0) {
      let timestamp = moment().format('YYYY-MM-DD HH:mm:ss Z');
      let original_url = results[0].original_url;
      let id = results[0].id;
      sql = `INSERT INTO ip (
        id,
        ip_address,
        time_captured,
        user_agent
      ) VALUES (
        '${id}',
        '${req.ip}',
        '${timestamp}',
        '${req.headers['user-agent']}'
      )`;
      connection.query(sql, (err) => {
        res.redirect(original_url);
      });
    } else {
      res.redirect('/');
    }
  });
});

app.get('/monitor/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM links WHERE admin_id = '${id}'`;
  let sql2 = `SELECT * FROM ip WHERE id = '${id}'`;


  connection.query(sql, (err, results, fields) => {
    console.log(results);
  });

  connection.query(sql2, (err, results, fields) => {
    console.log(results);
  });
  
  res.render('monitor');
});

app.post('/create', (req, res) => {
  original_url = req.query.url;
  id = shortid.generate();
  admin_id = shortid.generate();

  sql = `INSERT INTO links (
    id,
    admin_id,
    original_url,
    short_url,
    monitoring_url
  ) VALUES (
    '${id}',
    '${admin_id}',
    '${original_url}',
    '${config.url}/${id}',
    '${config.url}/monitor/${admin_id}'
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
        monitoring_url: `${config.url}/monitor/${admin_id}`
      });
    }
  });
});

app.listen(config.port, '0.0.0.0');
console.log('Server started at port:', config.port);
