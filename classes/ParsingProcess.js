const database = require("../modules/database");

class ParsingProcess {

  constructor(data = {
      _id:'',
      name:''
    }) {

    this._id = '';
    this._name = '';
    this._time_started = false;
    this._total_count = 0;
    this._parsed_count = 0;
    this._error_count = 0;
    this._scan_status_id = 0;
    this._sort_order = 1;
    this._priority = 25;
    this._scan_statuses = [
      'unknown',
      'searching',
      'scanning',
      'paused',
      'stoped',
      'aborted',
      'finished',
      'captcha',
      'dog',
    ];

    if(data.hasOwnProperty('_id')){this._id=data._id;}
    if(data.hasOwnProperty('name')){this._name=data.name;}

  }

  set id(id){return false;}
  set name(name){return false;}
  set time_started(time_started){return false;}
  set total_count(total_count){return false;}
  set parsed_count(parsed_count){return false;}
  set error_count(error_count){return false;}
  set scan_status(scan_status){return false;}
  set sort_order(sort_order){return false;}
  set priority(priority){return false;}

  get id(){return this._id;}
  get name(){return this._name;}
  get time_started(){return this._time_started;}
  get total_count(){return this._total_count;}
  get parsed_count(){return this._parsed_count;}
  get error_count(){return this._error_count;}
  get scan_status_id(){return parseInt(this._scan_status_id);}
  get scan_status(){return this._scan_statuses[parseInt(this._scan_status_id)];}
  get sort_order(){return parseInt(this._sort_order);}
  get priority(){return parseInt(this._priority);}

  info(){
    return {
      id: this.id,
      name: this.name,
      scan_status: this.scan_status,
      scan_status_id: this.scan_status_id,
      total_count: this.total_count,
      parsed_count: this.parsed_count,
      error_count: this.error_count,
      time_started: this.time_started,
      sort_order: this.sort_order,
      priority: this.priority
    }
  }

  set_process_status(status){
    return new Promise(async(resolve) => {
      let new_scan_status_id = 0;
      let scan_status_id = parseInt(status);
      let index = this._scan_statuses.indexOf(status);
      if (scan_status_id && this._scan_statuses.length > scan_status_id) {
        new_scan_status_id = scan_status_id;
      }else if (index !== -1) {
        new_scan_status_id = index;
      }

      this._scan_status_id = new_scan_status_id;
      this._scan_status = this._scan_statuses[new_scan_status_id];

      await database.parsing_processes.update({
        _id: this._id
      },{$set:{
        scan_status_id: new_scan_status_id
      }},{})

      resolve(true);
    });
  }

  set_name(name){
    return new Promise(async(resolve) => {
      let res = await database.parsing_processes.update({
          _id: this._id,
        },{$set:{
          name: name,
        }},{})
      resolve(true);
    });
  }

  set_priority(priority){
    return new Promise(async(resolve) => {
      let res = await database.parsing_processes.update({
          _id: this._id,
        },{$set:{
          priority: this.priority,
        }},{})
      resolve(true);
    });
  }

  set_sort_order(sort_order){
    return new Promise(async(resolve) => {
      let res = await database.parsing_processes.update({
          _id: this._id,
        },{$set:{
          sort_order: sort_order,
        }},{})
      resolve(true);
    });
  }

  update(){
    return new Promise(async(resolve) => {
      let result = {success:false};
      if (this._id.length) {
        result = await database.parsing_processes.find({_id: this._id});
      }else{
        result = await database.parsing_processes.insert({
          name:this._name,
          scan_status_id: 1,
          sort_order: 1,
          priority: this.priority,
        });
      }

      if (!result.success){resolve(false);return;}
      if (!result.data.length){resolve(false);return;}

      this._id = result.data[0]._id;
      this._name = result.data[0].name;
      this._time_started = result.data[0].createdAt;
      this._scan_status_id = result.data[0].scan_status_id;
      this._scan_status = this._scan_statuses[result.data[0].scan_status_id];
      this._sort_order = result.data[0].sort_order;
      this._priority = result.data[0].priority;

      const total_count_res = await database.scans.count({process_id: this._id});
      this._total_count = total_count_res.data;

      const error_count_res = await database.scans.count({process_id: this._id, parsed: 'error'});
      this._error_count = error_count_res.data;

      const parsed_count_res = await database.scans.count({process_id: this._id, parsed: 'success'});
      this._parsed_count = parsed_count_res.data + this._error_count;


      resolve(true);
      await database.parsing_processes.compact(500)
    });
  }

  refresh(){
    return new Promise(async(resolve) => {

      let res = await database.scans.update({
          process_id: this._id,
        },{$set:{
          parsed: 'new',
        }},{multi:true})

      resolve(true);
      await database.scans.compact(500)
    });
  }

  remove_process(){
    return new Promise(async(resolve) => {

      await database.parsing_processes.remove({
          _id: this._id,
        },{multi:true})

      await database.scans.remove({
          process_id: this._id,
        },{multi:true})

      resolve(true);
      await database.parsing_processes.compact(500)
      await database.scans.compact(500)
    });
  }

}

module.exports = ParsingProcess
