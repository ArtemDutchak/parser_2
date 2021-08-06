import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    layout,
  },
  state:{
    colors:[
      '#66666610',
      '#969696',
      '#00b392',
      '#038a01',
      '#b38400',
      '#0058b3',
      '#9700b3',
      '#b34a00',
      '#b30000',
    ],
    showed_list_ids:[],
    parsing_processes:[],
    results_to_show:[],
    total_result_count:0,
    filtered_result_count:0,
    filtered_results:[],
    settings:{},
    scan_status:{
      all:[
        'idle',
        'searching',
        'scanning',
        'paused',
        'stopped',
        'aborted',
        'finished',
        'captcha',
        'dog'
      ],
      current:'idle'
    },
    scanning_was_aborted: false,
    scan_progress:{
      current: '-',
      total: '-'
    }
  },
  mutations:{
    set_scanning_was_aborted(state, status){
      state.scanning_was_aborted = status
    },
    set_scan_status(state, status){
      state.scan_status.current = status
    },
    set_scan_progress_current(state, data){
      state.scan_progress.current = data
    },
    set_scan_progress_total(state, data){
      state.scan_progress.total = data
    },
    set_results_to_show(state, data){
      state.results_to_show = JSON.parse(JSON.stringify(data))
    },
    set_total_result_count(state, data){
      state.total_result_count = parseInt(data)
    },
    set_filtered_result_count(state, data){
      state.filtered_result_count = parseInt(data)
    },
    set_filtered_results(state, data){
      state.filtered_results = JSON.parse(JSON.stringify(data))
    },
    set_showed_list_ids(state, data){
      state.showed_list_ids = JSON.parse(JSON.stringify(data))
    },
    set_settings(state, data){
      state.settings = JSON.parse(JSON.stringify(data))
    },
    add_to_showed_pairs(state, data){
      state.results_to_show.push(data)
    },
    set_result(state, data){
      state.results_to_show[data.index][data.prop] = data.value
    },
    set_result_full(state, data){
      Vue.set(state.results_to_show, data.index, data.data)
    },
    parsing_processes_from_server_to_app(state, data){
      state.parsing_processes = JSON.parse(JSON.stringify(data))
    },
    update_parsing_process_value(state, data){
      Vue.set(state.parsing_processes[data.index], data.key, data.value)
    },
    resort_parsing_processes(state, data){
      Vue.set(state, 'parsing_processes', data)
    },
    update_listed(state, data){
      const temp = state.results_to_show[data.index]
      temp.source_products = data.data.source_products
      temp.listing_info = data.data.listing_info
      temp.record_time = data.data.record_time
      Vue.set(state.results_to_show, data.index, temp)
    }
  },
  actions:{
    add_to_showed_pairs(ctx, data){
      let is_in_result = false
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data._id == result._id) {
          is_in_result = true
          ctx.commit('set_result', {
            index,
            prop: 'product_1',
            value: data.product_1
          })
          ctx.commit('set_result', {
            index,
            prop: 'product_2',
            value: data.product_2
          })
        }
      }
      if (!is_in_result) {
        ctx.commit('add_to_showed_pairs', data)
      }
    },
    update_parsing_process(ctx, data){
      for (const [index, result] of ctx.state.parsing_processes.entries()) {
        if (data.id == result.id) {
          for (const key in data) {
            if (key != "id" &&
                key != "time_started") {
              ctx.commit('update_parsing_process_value', {
                index,
                key,
                value: data[key]
              })
            }
          }
        }
      }
    },
    update_pair_state(ctx, data){
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data._id == result._id || (data.product_1_id == result.product_1._id && data.product_2_id == result.product_2._id)) {
          ctx.commit('set_result', {
            index,
            prop: 'match',
            value: data.match
          })
          ctx.commit('set_result', {
            index,
            prop: 'exeption',
            value: data.exeption
          })
          ctx.commit('set_result', {
            index,
            prop: 'favorite',
            value: data.favorite
          })
          ctx.commit('set_result', {
            index,
            prop: 'amazon_listing',
            value: data.amazon_listing
          })
          ctx.commit('set_result', {
            index,
            prop: 'inaddible',
            value: data.inaddible
          })
          ctx.commit('set_result', {
            index,
            prop: 'watch',
            value: data.watch
          })
        }else if (data.product_2_id == result.product_2._id) {
          ctx.commit('set_result', {
            index,
            prop: 'amazon_listing',
            value: data.amazon_listing
          })
          ctx.commit('set_result', {
            index,
            prop: 'inaddible',
            value: data.inaddible
          })
          ctx.commit('set_result', {
            index,
            prop: 'watch',
            value: data.watch
          })
        }
      }
      // ctx.dispatch('recalc_filtered_results')
    },
    update_pair_full(ctx, data){
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data._id == result._id) {
          ctx.commit('set_result_full', {
            index,
            data
          })
        }
        if (data.product_1._id == result.product_1._id) {
          ctx.commit('set_result', {
            index,
            prop: 'product_1',
            value: data.product_1
          })
        }
        if (data.product_2._id == result.product_2._id) {
          ctx.commit('set_result', {
            index,
            prop: 'product_2',
            value: data.product_2
          })
        }
      }
      // ctx.dispatch('recalc_filtered_results')
    },
    replace_pair_full(ctx, data){
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data._id == result._id) {
          ctx.commit('set_result_full', {
            index,
            data
          })
        }
      }
    },
    update_listed(ctx, data){
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data.watcher_id == result.product_2._id) {
          ctx.commit('update_listed', {
            index,
            data
          })
        }
      }
      // ctx.dispatch('recalc_filtered_results')
    },
    set_results_to_show(ctx, data){
      ctx.commit('set_results_to_show', data)
    },
    set_total_result_count(ctx, data){
      ctx.commit('set_total_result_count', data)
    },
    set_filtered_result_count(ctx, data){
      ctx.commit('set_filtered_result_count', data)
    },
    set_settings(ctx, data){
      const obj = {}
      for (const setting of data) {
        obj[setting.name] = setting
      }
      ctx.commit('set_settings', obj)

      if (ctx.state.showed_list_ids.length) {
        // ctx.dispatch('recalc_filtered_results')
      }

    },
    set_result(ctx, data){
      for (const [index, result] of ctx.state.results_to_show.entries()) {
        if (data._id == result._id) {
          for (const prop in data.result) {
            ctx.commit('set_result', {
              index,
              prop,
              value: data.result[prop]
            })
          }
        }
      }
    },
    async recalc_filtered_results(ctx){
      let out = JSON.parse(JSON.stringify(ctx.state.results_to_show))
      if (ctx.state.settings.amazon_rank_only.value) {
        out = out.filter(result => result.product_2.props.rank)
      }
      if (ctx.state.settings.hide_exeption.value) {
        out = out.filter(result => !result.exeption)
      }
      if (ctx.state.settings.match_profit.value) {
        let _out = []

        for (const result of out) {
          const is_match = await ctx.dispatch('is_match_profit', result)
          if (is_match) {
            _out.push(result)
          }
        }
        out = _out
      }
      if (ctx.state.settings.match_identity.value) {
        out = out.filter(result => {
          let match_1 = false

          if (ctx.state.settings.min_identity.value != 0) {
            if (result.identity >= parseInt(ctx.state.settings.min_identity.value)) {
              match_1 = true
            }
          }else{
            match_1 = true
          }
          return match_1

        })
      }

      for (const result of ctx.state.results_to_show) {
        if (!out.includes(result)) {
          ctx.dispatch('set_result', {
            _id: result._id,
            result:{
              selected: false
            }
          })
        }
      }

      setTimeout(()=>{
        ctx.commit('set_filtered_results', out)
      },500)


    },
    is_match_profit(ctx, pair){
      let match_1 = false
      let match_2 = false
      let match_3 = false
      let match_4 = false

      if (ctx.state.settings.min_dif_price.value != 0) {
        if (pair.profit >= parseFloat(ctx.state.settings.min_dif_price.value,2)) {
          match_1 = true
        }
      }else{
        match_1 = true
      }

      if (ctx.state.settings.min_dif_percentage.value != 0) {
        if (pair.profit > 0 && (pair.profit / pair.product_1.price) * 100 >= parseFloat(ctx.state.settings.min_dif_percentage.value,2)) {
          match_2 = true
        }
      }else{
        match_2 = true
      }

      if (ctx.state.settings.max_dif_price.value != 0) {
        if (pair.profit <= parseFloat(ctx.state.settings.max_dif_price.value,2)) {
          match_3 = true
        }
      }else{
        match_3 = true
      }

      if (ctx.state.settings.max_dif_percentage.value != 0) {
        if (pair.profit > 0 && (pair.profit / pair.product_1.price) * 100 <= parseFloat(ctx.state.settings.max_dif_percentage.value,2)) {
          match_4 = true
        }
      }else{
        match_4 = true
      }

      return match_1 && match_2 && match_3 && match_4
    }
  },
  getters:{
    scanning_was_aborted(state){
      return state.scanning_was_aborted
    },
    scan_status(state){
      return state.scan_status
    },
    scan_progress(state){
      return state.scan_progress
    },
    results(state){
      return state.results_to_show
    },
    filtered_result_count(state){
      return state.filtered_result_count
    },
    total_result_count(state){
      return state.total_result_count
    },
    filtered_results(state){
      return state.filtered_results
    },
    showed_list_ids(state){
      return state.showed_list_ids
    },
    settings(state){
      return state.settings
    },
    parsing_processes(state){
      return state.parsing_processes
    }
  }
});
