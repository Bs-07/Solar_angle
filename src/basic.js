'use strict';

const curr_date = document.getElementById('date');
// const curr_time = document.getElementById('time');
// const time_format = document.getElementById('time-format');

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const hours = date.getHours();
const minutes = date.getMinutes();
const seconds = date.getSeconds();

curr_date.value = `${year}-${month < 10 ? '0' + month : month}-${
  day < 10 ? '0' + day : day
}`;
