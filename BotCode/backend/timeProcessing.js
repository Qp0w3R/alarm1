const { ParsedDate, TimeList } = require('@alordash/date-parser');
const { isTimeType } = require('@alordash/date-parser/lib/date-cases');

/**
 * @param {TimeList} timeList 
 * @returns {Boolean} 
 */
function TimeListIsEmpty(timeList) {
   return typeof (timeList.years) == 'undefined'
      && typeof (timeList.months) == 'undefined'
      && typeof (timeList.dates) == 'undefined'
      && typeof (timeList.hours) == 'undefined'
      && typeof (timeList.minutes) == 'undefined';
}

/**@param {TimeList} source 
 * @param {TimeList} destination 
 * @returns {TimeList} 
 */
function FillTimeList(source, destination) {
   for (const timeProperty in source) {
      if (isTimeType(timeProperty)
         && typeof (destination[timeProperty]) == 'undefined') {
         destination[timeProperty] = source[timeProperty];
      }
   }
   return destination;
}

/**
 * @param {TimeList} timeList 
 * @param {Number} timeListDate 
 * @returns {TimeList} 
 */
function UpdateTime(timeList, timeListDate) {
   const now = new Date();
   const tsNow = now.getTime().div(1000);
   if (timeListDate < tsNow) {
      if (timeList.hours <= 12 && !timeList.isFixed) {
         timeList.hours = (timeList.hours + 12) % 24;
         timeListDate += 12 * 60 * 1000;
      }
      let dif = tsNow - timeListDate;
      let difInDate = new Date(tsNow * 1000 + dif * 1000);
      let monthDif = now.getUTCMonth() - difInDate.getUTCMonth();
      let yearDif = now.getUTCFullYear() - difInDate.getUTCFullYear();
      dif = dif.div(60);
      if (dif < 60 && typeof (timeList.hours) == 'undefined') {
         timeList.hours = now.getUTCHours() + 1;
      } else if (dif < 1440 && typeof (timeList.dates) == 'undefined') {
         timeList.dates = now.getUTCDate() + 1;
      } else if (monthDif < 1 && yearDif == 0 && typeof (timeList.months) == 'undefined') {
         timeList.months = now.getUTCMonth() + 1;
      } else if (yearDif < 1 && typeof (timeList.years) == 'undefined') {
         timeList.years = now.getUTCFullYear() + 1;
      } else {
         return undefined;
      }
   }
   return timeList;
}

/**
 * @param {ParsedDate} parsedDate 
 * @param {Number} tz 
 * @returns {{target_date: Number, period_time: Number, max_date: Number}}
 */
function ProcessParsedDate(parsedDate, tz) {
   let dateValues = parsedDate.valueOf();
   let target_date = dateValues.target_date.getTime().div(1000);
   let period_time = dateValues.period_time.getTime().div(1000);
   let max_date;
   if (!parsedDate.target_date.isOffset) {
      target_date -= tz;
   }
   parsedDate.target_date = UpdateTime(parsedDate.target_date, target_date);
   if (!TimeListIsEmpty(parsedDate.max_date)) {
      parsedDate.max_date = FillTimeList(parsedDate.target_date, parsedDate.max_date);
      max_date = parsedDate.valueOf().max_date.getTime().div(1000);
      if (!parsedDate.max_date.isOffset) {
         max_date -= tz;
      }
      parsedDate.max_date = UpdateTime(parsedDate.max_date, max_date);
   } else {
      let zeroDate = new Date(0);
      parsedDate.max_date.years = zeroDate.getUTCFullYear();
      parsedDate.max_date.months = zeroDate.getUTCMonth();
      parsedDate.max_date.dates = zeroDate.getUTCDate();
      parsedDate.max_date.hours = zeroDate.getUTCHours();
      parsedDate.max_date.minutes = zeroDate.getUTCMinutes();
   }
   if (typeof (parsedDate.target_date) == 'undefined') {
      return undefined;
   }
   dateValues = parsedDate.valueOf();
   dateValues.target_date.setSeconds(0, 0);
   dateValues.period_time.setSeconds(0, 0);
   dateValues.max_date.setSeconds(0, 0);
   target_date = dateValues.target_date.getTime();
   period_time = dateValues.period_time.getTime();
   max_date = dateValues.max_date.getTime();
   return {
      target_date,
      period_time,
      max_date
   }
}

module.exports = {
   TimeListIsEmpty,
   UpdateTime,
   ProcessParsedDate
}