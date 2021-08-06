<template>
  <router-view />
</template>

<script>
const electron = window.require('electron')
const {ipcRenderer} = electron
import { bus } from './main'

export default {
  name: 'App',
  methods:{
    get_profit(pair){
      if (isNaN(pair.product_1.price) || isNaN(pair.product_2.price)) {
        return NaN
      }
      if (pair.product_1.price == 0 || pair.product_2.price == 0) {
        return 0
      }
      let resource_free_shipping_on = 0
      let resource_delivery = 0
      let resource_taxes = 0
      switch (pair.product_1.resource_id) {
        case 3:
          resource_free_shipping_on = this.settings.walmart_com_free_shipping_on.value
          resource_delivery = this.settings.walmart_com_delivery.value
          break;
        case 4:
          resource_free_shipping_on = this.settings.walmart_ca_free_shipping_on.value
          resource_delivery = this.settings.walmart_ca_delivery.value
          break;
        case 5:
          resource_free_shipping_on = this.settings.bedbathandbeyond_com_free_shipping_on.value
          resource_delivery = this.settings.bedbathandbeyond_com_delivery.value
          break;
        case 6:
          resource_free_shipping_on = this.settings.bedbathandbeyond_ca_free_shipping_on.value
          resource_delivery = this.settings.bedbathandbeyond_ca_delivery.value
          break;
        default:
      }
      switch (pair.product_2.resource_id) {
        case 1:
          resource_taxes = this.settings.amazon_com_taxes.value
          break;
        case 2:
          resource_taxes = this.settings.amazon_ca_taxes.value
          break;
      }
      resource_free_shipping_on = parseFloat(resource_free_shipping_on, 2)
      resource_delivery = parseFloat(resource_delivery, 2)
      resource_taxes = parseFloat(resource_taxes, 2)

      let shipping = 0
      if (pair.product_1.price < resource_free_shipping_on) {
        shipping = resource_delivery
      }

      const taxes = pair.product_2.price * resource_taxes / 100
      const profit = pair.product_2.price - (pair.product_1.price + shipping) - taxes

      return profit
    },
    get_name_identity(item){
      const arr_name_1 = this.split_name(item.product_1.name)
      const arr_name_2 = this.split_name(item.product_2.name)

      global['min_arr'] = arr_name_1
      global['max_arr'] = arr_name_2
      if (arr_name_2.length < arr_name_1.length) {
        global['min_arr'] = arr_name_2
        global['max_arr'] = arr_name_1
      }

      const intersection = global['min_arr'].filter(value => {
        const word = value.toLowerCase()
        for (const _word of global['max_arr']) {
          if (_word.toLowerCase() == word) {
            return true
          }
        }
        return false
      })

      return parseInt((intersection.length / global['min_arr'].length) * 100)
    },
    split_name(name){
      const arr_1 = name.split(' ')
      const arr_2 = []
      let out = []
      for (const word of arr_1) {
        const _arr = word.split('-')
        for (const _word of _arr) {
          if (_word.length > 1) {
            arr_2.push(_word)
          }
        }
      }
      const arr_3 = []
      for (const word of arr_2) {
        const _arr = word.split('/')
        for (const _word of _arr) {
          if (_word.length > 1) {
            arr_3.push(_word)
          }
        }
      }
      const arr_4 = arr_3.filter( (value, index, self) => {
        return self.indexOf(value) === index
      } )
      for (const word of arr_4) {
        let _word = word.replace(/[^A-Za-z0-9]/g,'')
        if (_word.length > 1) {
          out.push(_word)
        }
      }

      return out
    }
  },
  computed:{
    settings(){
      return this.$store.getters.settings
    }
  },
  created() {
    const self = this
    const currentPath = this.$router.history.current.path;

    // if (window.localStorage.getItem('authenticated') === 'false') {
    //   this.$router.push('/login');
    // }

    ipcRenderer.send(`refresh_localization`)
    ipcRenderer.send(`refresh_settings`)

    if (currentPath === '/' || currentPath === '/app') {
      this.$router.push('/app/dashboard');
    }

    ipcRenderer.on('settings_from_server_to_app',function(e, data){
      self.$store.dispatch('set_settings', data)
    })

    ipcRenderer.on('set_localization',function(e, lang){
      if (self.$i18n.locale != lang) {
        self.$i18n.locale = lang
        self.$router.push({
          params: {lang}
        })
      }
    })

    ipcRenderer.on('results_to_show', function (e, data) {
      self.$store.commit('set_results_to_show', data.items)
      self.$store.commit('set_total_result_count', data.total)
      self.$store.commit('set_filtered_result_count', data.filtered)
      // self.$store.dispatch('recalc_filtered_results')
      if (self.$router.history.current.name != 'ResultsToShowPage') {
        self.$router.push({name: 'ResultsToShowPage'})
      }
    })

    ipcRenderer.on('favorites_to_show', function (e, data) {
      self.$store.commit('set_results_to_show', data.items)
      self.$store.commit('set_total_result_count', data.total)
      self.$store.commit('set_filtered_result_count', data.filtered)
      // self.$store.dispatch('recalc_filtered_results')
      if (self.$router.history.current.name != 'FavoritesPage') {
        self.$router.push({name: 'FavoritesPage'})
      }
    })

    ipcRenderer.on('amazon_listing_to_show', function (e, data) {
      self.$store.commit('set_results_to_show', data.items)
      self.$store.commit('set_total_result_count', data.total)
      self.$store.commit('set_filtered_result_count', data.filtered)
      // self.$store.dispatch('recalc_filtered_results')
      if (self.$router.history.current.name != 'ListingPage') {
        self.$router.push({name: 'ListingPage'})
      }
    })

    ipcRenderer.on('custom_results_to_show', function (e, data) {
      self.$store.commit('set_results_to_show', data.items)
      self.$store.commit('set_total_result_count', data.total)
      self.$store.commit('set_filtered_result_count', data.filtered)
      // self.$store.dispatch('recalc_filtered_results')
      if (self.$router.history.current.name != 'ResultsToShowPage') {
        self.$router.push({name: 'ResultsToShowPage'})
      }
    })

    ipcRenderer.on('add_to_showed_pairs', function (e, data) {
      if (self.$store.getters.showed_list_ids.includes(data.list_id)) {
        self.$store.dispatch('add_to_showed_pairs', data.data)
        // ipcRenderer.send(`show_selected_results`, self.$store.getters.showed_list_ids)
      }
    })

    ipcRenderer.on('go_to_current_results', function (e, list_id) {
      self.$store.commit('set_showed_list_ids', [list_id])
      ipcRenderer.send(`show_selected_results`, [list_id])
    })

    ipcRenderer.on('set_scan_status', function (e, status) {
      if (status == 'searching') {
        self.$store.commit('set_scanning_was_aborted', false)
      }
      self.$store.commit('set_scan_status', status)
    })
    ipcRenderer.on('parsing_processes_from_server_to_app', (e, data)=>{
      self.$store.commit('parsing_processes_from_server_to_app', data)
    })
    ipcRenderer.on('update_parsing_process', function (e, data) {
      self.$store.dispatch('update_parsing_process', data)
    })
    ipcRenderer.on('set_scan_progress_total', function (e, data) {
      self.$store.commit('set_scan_progress_total', data)
    })
    ipcRenderer.on('categories_from_server_to_app', function (e, data) {
      bus.$emit('categories_from_server_to_app', data)
    })
    ipcRenderer.on('custom_list_from_server_to_app', function (e, data) {
      bus.$emit('custom_list_from_server_to_app', data)
    })
    ipcRenderer.on('custom_urls_from_server_to_app', function (e, data) {
      bus.$emit('custom_urls_from_server_to_app', data)
    })
    ipcRenderer.on('lists_from_server_to_app', function (e, data) {
      bus.$emit('lists_from_server_to_app', data)
      bus.$emit('lists_from_server_to_app_2', data)
    })
    ipcRenderer.on('update_pair_state', function (e, data) {
      self.$store.dispatch('update_pair_state', data)
    })
    ipcRenderer.on('update_pair_full', function (e, data) {
      self.$store.dispatch('update_pair_full', data)
    })
    ipcRenderer.on('replace_pair_full', function (e, data) {
      self.$store.dispatch('replace_pair_full', data)
    })
    ipcRenderer.on('update_listed', function (e, data) {
      self.$store.dispatch('update_listed', data)
    })
    ipcRenderer.on('is_favorite_match_exeption_pair', function (e, data) {
      bus.$emit('is_favorite_match_exeption_pair', data)
    })
    ipcRenderer.on('last_prod_2_id', function (e, data) {
      bus.$emit('last_prod_2_id', data)
    })
    ipcRenderer.on('msg_from_server', function (e, data) {
      self.$toasted[data.type](data.text).goAway(3000)
    })


  },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
