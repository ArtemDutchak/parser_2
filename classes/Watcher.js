const database = require('../modules/database');
const env = require('../modules/env');

class Watcher{

  constructor() {

  }

  add_watcher(_id){
    return new Promise(async(resolve) => {
      const res = await database.watchers.insert({_id});
      resolve(res.data[0]);
    });
  }

  remove_watcher(_id){
    return new Promise(async(resolve) => {
      const res = await database.watchers.remove({_id});
      resolve(res.success);
    });
  }

  get_watcher_ids(filter_data = {}){
    return new Promise(async(resolve) => {
      const out = [];
      const res = await database.watchers.find(filter_data);
      for (const rec of res.data) {
        out.push(rec._id);
      }
      resolve(out);
    });
  }

  add_record(new_record){
    return new Promise(async(resolve) => {
      const res = await database.watchers.insert(new_record);
      resolve(res.data[0]);
    });
  }

  remove_records(id){
    return new Promise(async(resolve) => {
      const res = await database.watch_records.remove({id},{multi: true});
      resolve(res.success);
    });
  }

  get_last_record(watcher_id){
    return new Promise(async(resolve) => {
      const res = await database.watch_records.sort({id:watcher_id},{ updatedAt: 1 },1);
      if (res.success && res.data.length) {
        resolve(res.data[0]);
        return;
      }
      resolve(false);
    });
  }

  need_watch(watcher_id){
    return new Promise(async(resolve) => {
      const last_record = await this.get_last_record(watcher_id);
      if (last_record) {
        const now_time = Date.now();
        const last_watch = Date.parse(last_record.updatedAt);
        const watch_period = await this.main_settings('watch_period');
        const watch_time = last_watch + parseInt(watch_period) * 3600000;
        if (now_time > watch_time) {resolve(true);return;}
      }else{
        resolve(true);return;
      }
      resolve(false);return;
    });
  }

  compact(){
    database.watchers.compact();
    database.watch_records.compact();
  }

  main_settings(name){
    return new Promise(async (resolve) => {
      const res = await database.settings.find({name});
      resolve(res.data[0].value);
    })
  }

  require_parsing_process(){
    return new Promise(async (resolve) => {

      const watcher_ids = await this.get_watcher_ids();

      if (!watcher_ids.length) {
        const _ids_to_remove = [];

        const res_scans = await database.scans.find({});
        for (const scan of res_scans.data) {
          if (scan.hasOwnProperty('watcher_id')) {
            _ids_to_remove.push(scan._id);
          }
        }

        await database.scans.remove({_id:{$in:_ids_to_remove}},{multi:true});

        resolve(false);return;
      }

      let res = await database.scans.find({});
      const scans_ids_to_remove = [];
      for (const scan of res.data) {
        if (scan.hasOwnProperty('watcher_id') && !watcher_ids.includes(scan.watcher_id)) {
          scans_ids_to_remove.push(scan._id);
        }
      }
      await database.scans.remove({_id:{$in:scans_ids_to_remove}},{multi:true});

      res = await database.scans.find({});
      let process_id = '';
      for (const scan of res.data) {
        if (scan.hasOwnProperty('watcher_id')) {
          process_id = scan.process_id;
          break;
        }
      }

      for (const watcher_id of watcher_ids) {
        const res_scan = await database.scans.find({watcher_id});
        if (!res_scan.data.length) {
          let record = {
            watcher_id,
            parsed:"new"
          }
          if (process_id.length) {
            record.process_id = process_id;
            await database.scans.insert(record);
          }else{
            const process_id_res = await database.scans.insert(record);
            process_id = process_id_res.data[0]._id;
          }
        }
      }

      if (!process_id.length) {
        resolve(false);return;
      }

      const res_pp = await database.parsing_processes.find({_id:process_id});
      if (!res_pp.data.length) {
        await database.parsing_processes.insert({
          _id: process_id,
          name:'watcher',
          scan_status_id: 2,
          sort_order: 0,
          priority: 101,
        })
      }

      resolve(process_id);
    })
  }

}

module.exports = Watcher
