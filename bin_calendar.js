const ICal = require('node-ical');
const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const is_next_date = (from_date, to_date, the_event) => {
    const event_date = the_event.start;
    if (event_date.getTime() >= from_date.getTime() && event_date.getTime() <= to_date.getTime()) {
        return true;
    }
    return false;
};

const data_sort = (a, b) => {
    if (a.start.getTime() < b.start.getTime()) {
        return -1;
    }
    if (a.start.getTime() > b.start.getTime()) {
        return 1;
    }
    return 0;
};

const next = (callback) => {
    ICal.fromURL('https://www.scambs.gov.uk/binfeed.ical?uprn=10033035815', {}, (err, data) => {

        if (err) {
            callback("There was a problem requesting the calendar - " + err.message);
            return;
        }

        let bin_times = [];
        for (var k in data) {
            if (data.hasOwnProperty(k)) {
                bin_times.push(data[k]);
            }
        }
        bin_times.sort(data_sort);

        let Today = new Date();
        let week_from_today = new Date();
        week_from_today.setDate(Today.getDate() + 7);

        const collections = [];
        for (var j in bin_times) {
            var ev = bin_times[j];
            if (is_next_date(Today, week_from_today, ev)) {
                collections.push(ev);
            }
        }

        if (collections.length > 1) {

            const summaries = [];
            collections.forEach((collection) => {

                summaries.push(collection.summary);
            });
            callback("Next is " + summaries.join(' and ') + " on the " + collections[0].start.getDate() + ' of ' + Months[collections[0].start.getMonth()]);
        }
        else if (collections.length == 1) {
            let first_event = collections[0];
            callback("Next is " + first_event.summary + ' on the ' + first_event.start.getDate() + ' of ' + Months[first_event.start.getMonth()]);
        }
        else {
            callback("I'm not sure when the next collection is - there isn't one within a week of today.");
        }
    });
};

module.exports = {
    next
};