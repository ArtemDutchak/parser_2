<template>
  <div id="compare-page">
    <b-button id="compare_close" @click="close_compare">
      <b-icon icon="chevron-left" ></b-icon> {{ $t('buttons.back') }}
    </b-button>
    <div class="flex-row">
      <div id="side_1" class="flex-column">
          <div id="div_webview_1"><webview id="view_1"></webview></div>
      </div>

      <div id="side_2" class="flex-column">
          <div id="div_webview_2"><webview id="view_2"></webview></div>
      </div>

        <div id="controls" class="flex-column" :class="class_obj">

            <div class="flex-row sb" id="controls_header">
              <div class="c-btn" id="btn_first" v-if="!ready_webview_1 || !ready_webview_2 || (is_native_url_1 && is_native_url_2)"></div>
              <div class="c-btn" id="btn_first" v-if="(!is_native_url_1 || !is_native_url_2) && ready_webview_1 && ready_webview_2" @click="return_url()">
                <b-icon icon="backspace" variant="secondary"></b-icon>
              </div>
              <div></div>
              <div class="c-btn" @click="prev_item()"><b-icon icon="chevron-left" variant="light"></b-icon></div>
              <div id="count_container"><span id="count"> {{ index + 1 }} / {{ filtered_results.length }} </span></div>
              <div class="c-btn" @click="next_item()"><b-icon icon="chevron-right" variant="light"></b-icon></div>
              <div></div>

              <div class="c-btn" v-if="ready_for_exeption" id="btn_exeption">
                <b-button variant="light" size="sm" @click="toggle_state('exeption')">
                  <b-icon v-if="is_exeption" icon="x-circle-fill" variant="danger"></b-icon>
                  <b-icon v-else icon="x-circle" variant="secondary"></b-icon>
                </b-button>
              </div>
              <div class="c-btn" v-if="!ready_for_exeption" v-html="loading_svg"></div>

              <div class="c-btn" v-if="ready_for_match" id="btn_match">
                <b-button variant="light" size="sm" @click="toggle_state('match')">
                  <b-icon v-if="is_match" icon="check-circle-fill" variant="success"></b-icon>
                  <b-icon v-else icon="check-circle" variant="secondary"></b-icon>
                </b-button>
              </div>
              <div class="c-btn" v-if="!ready_for_match" v-html="loading_svg"></div>

              <div class="c-btn" v-if="ready_for_favorite" id="btn_favorite">
                <b-button variant="light" size="sm" @click="toggle_state('favorite', index)">
                  <b-icon v-if="is_favorite" icon="star-fill" variant="warning"></b-icon>
                  <b-icon v-else icon="star" variant="secondary"></b-icon>
                </b-button>
              </div>
              <div class="c-btn" v-if="!ready_for_favorite" v-html="loading_svg"></div>

              <div></div>
              <div class="btn btn-open" @click="toggle_controls()"><b-icon icon="chevron-up" variant="light"></b-icon></div>
            </div>

            <div class="flex-row" id="controls_body">
              <div class="card-product flex-column" v-if="ready_webview_1 && ready_webview_2">
                <div class="product-id" id="card_product_1_id"></div>
                <div class="product-title" id="card_product_1_title"> {{ curr_title_1 }} </div>
                <div class="product-url" id="card_product_1_url"> {{ curr_url_1 }} </div>
              </div>
              <div class="card-product flex-column" v-if="ready_webview_1 && ready_webview_2">
                <div class="product-id" id="card_product_2_id"></div>
                <div class="product-title" id="card_product_2_title"> {{ curr_title_2 }} </div>
                <div class="product-url" id="card_product_2_url"> {{ curr_url_2 }} </div>
              </div>
            </div>
            <div class="flex-row" id="controls_footer">

              <div class="flex-column card-product space-evenly">

                <!-- <b-form-checkbox :checked="settings.browser_download_1.value" @change="save_checkbox('browser_download_1')">{{ $t('settings.load_via_browser') }}
                </b-form-checkbox> -->

              </div>
              <div class="flex-column card-product space-evenly">

                <!-- <b-form-checkbox :checked="settings.browser_download_2.value" @change="save_checkbox('browser_download_2')">{{ $t('settings.load_via_browser') }}
                </b-form-checkbox> -->

              </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
const electron = window.require('electron')
const {ipcRenderer} = electron
import { bus } from '../../main'

const utilites = require('../../../modules/utilites').default

export default {
  name: 'Compare',
  components: {
    Widget
  },
  data(){
    return {
      title:'Compare',
      index:0,
      class_obj: {
        open: false,
        active: false,
        disabled: false
      },

      is_match: false,
      is_exeption: false,
      is_favorite: false,

      ready_webview_1: false,
      ready_webview_2: false,
      is_native_url_1: true,
      is_native_url_2: true,
      ready_for_exeption: false,
      ready_for_match: false,
      ready_for_favorite: false,

      last_prod_1_id: false,
      last_prod_2_id: false,

      curr_url_1: '',
      curr_url_2: '',
      curr_title_1: '',
      curr_title_2: '',

      webview_1: document.getElementById('view_1'),
      webview_2: document.getElementById('view_2'),

      loading_svg: `<div class="loader"><svg class="circular-loader"viewBox="25 25 50 50" >
  <circle class="loader-path" cx="50" cy="50" r="20" fill="none" />
</svg></div>`,
      gethtml_function: `function gethtml () {return new Promise((resolve, reject) => { resolve(document.body.innerHTML)})}
        gethtml();`,
    }
  },
  methods:{
    toggle_state(type){
      const state = !this['is_' + type]
      switch (type) {
        case 'exeption':
          this.is_exeption = state
          if (this.is_exeption) {
            this.is_match = false
          }
          break;
        case 'match':
          this.is_match = state
          if (this.is_match) {
            this.is_exeption = false
          }
          break;
        case 'favorite':
          this.is_favorite = state
          break;
      }

      let _id_1 = this.filtered_results[this.index].product_1._id
      let _id_2 = this.filtered_results[this.index].product_2._id

      if (this.is_native_url_1 && this.is_native_url_2) {
        ipcRenderer.send(`toggle_state`,{type,state,_id_1,_id_2})
      }else{
        if (!this.is_native_url_1) {
          _id_1 = this.last_prod_1_id
        }
        if (!this.is_native_url_2) {
          _id_2 = this.last_prod_2_id
        }
        ipcRenderer.send(`toggle_state`,{type,state,_id_1,_id_2}, false)
      }

    },
    save_checkbox(val){
      const setting = this.settings[val]
      setting.value = event.target.checked
      ipcRenderer.send(`save_setting`,setting)
    },
    close_compare(){
      this.$router.go(-1)
    },
    toggle_controls(){
      this.class_obj.open = !this.class_obj.open
    },
    is_match_profit(pair){
      let match_1 = false
      let match_2 = false
      let match_3 = false
      let match_4 = false

      if (this.settings.min_dif_price.value != 0) {
        if (pair.profit >= parseFloat(this.settings.min_dif_price.value,2)) {
          match_1 = true
        }
      }else{
        match_1 = true
      }

      if (this.settings.min_dif_percentage.value != 0) {
        if (pair.profit > 0 && (pair.profit / pair.product_1.price) * 100 >= parseFloat(this.settings.min_dif_percentage.value,2)) {
          match_2 = true
        }
      }else{
        match_2 = true
      }

      if (this.settings.max_dif_price.value != 0) {
        if (pair.profit <= parseFloat(this.settings.max_dif_price.value,2)) {
          match_3 = true
        }
      }else{
        match_3 = true
      }

      if (this.settings.max_dif_percentage.value != 0) {
        if (pair.profit > 0 && (pair.profit / pair.product_1.price) * 100 <= parseFloat(this.settings.max_dif_percentage.value,2)) {
          match_4 = true
        }
      }else{
        match_4 = true
      }

      return match_1 && match_2 && match_3 && match_4
    },
    return_url(){
      if (this.ready_webview_1 && this.ready_webview_2) {
        if (!this.is_native_url_1) {
          this.webview_1.src = this.native_url_1
        }
        if (!this.is_native_url_2) {
          this.webview_2.src = this.native_url_2
        }
      }
    },
    is_match_identity(item){
      let match_1 = false

      if (this.settings.min_identity.value != 0) {
        if (item.identity >= parseInt(this.settings.min_identity.value)) {
          match_1 = true
        }
      }else{
        match_1 = true
      }
      return match_1
    },
    prev_item(){
      this.index--
      if (this.settings.browser_download_1.value) {
        this.ready_webview_1 = false
      }
      if (this.settings.browser_download_2.value) {
        this.ready_webview_2 = false
      }

      this.ready_for_exeption = false
      this.ready_for_match = false
      this.ready_for_favorite = false

      this.refresh_pair()
    },
    next_item(){
      this.index++
      if (this.settings.browser_download_1.value) {
        this.ready_webview_1 = false
      }
      if (this.settings.browser_download_2.value) {
        this.ready_webview_2 = false
      }

      // this.webview_1 = document.getElementById('view_1')
      // let url = 'https://www.walmart.ca/en/ip/5V3DMEK5HHEW'
      // this.webview_1.src = url
      // console.log(this.webview_1)

      this.ready_for_exeption = false
      this.ready_for_match = false
      this.ready_for_favorite = false

      this.refresh_pair()
    },
    refresh_pair(){
      if (this.index == this.filtered_results.length) {
        this.index = 0
      }else if (this.index < 0) {
        this.index = this.filtered_results.length - 1
      }
      this.native_url_1 = this.filtered_results[this.index].product_1.url
      this.native_url_2 = this.filtered_results[this.index].product_2.url

      this.ready_for_exeption = true

      this.refresh_1()
      this.refresh_2()
      // setTimeout(this.refresh_controls(),1000)
    },
    refresh_controls(){
      if (this.is_native_url_1 && this.is_native_url_2) {
        this.is_match = this.filtered_results[this.index].match
        this.is_exeption = this.filtered_results[this.index].exeption
        this.is_favorite = this.filtered_results[this.index].favorite
      }else{
        // const url_1 = this.webview_1.getURL()
        // const url_2 = this.webview_2.getURL()
        // const product_1_id = utilites.parse_url(url_1).product.id
        // const product_2_id = utilites.parse_url(url_2).product.id
      }
    },
    refresh_1(){
      if (this.settings.browser_download_1.value) {
        // ipcRenderer.send(`get_html_1`, this.native_url_1)
      }else{
        this.webview_1.src = this.native_url_1
      }
      this.curr_url_1 = this.native_url_1
    },
    refresh_2(){
      if (this.settings.browser_download_2.value) {
        // ipcRenderer.send(`get_html_2`, this.native_url_2)
      }else{
        this.webview_2.src = this.native_url_2
      }
      this.curr_url_2 = this.native_url_2
    },
    compute_is_native(){
      this.native_url_1 == this.curr_url_1 ? this.is_native_url_1 = true : this.is_native_url_1 = false
      this.native_url_2 == this.curr_url_2 ? this.is_native_url_2 = true : this.is_native_url_2 = false
    },
    fill_product_cards(){
      this.curr_title_1 = this.webview_1.getTitle()
      this.curr_title_2 = this.webview_2.getTitle()
      const url_1 = this.webview_1.getURL()
      const url_2 = this.webview_2.getURL()
      if (url_1.includes('file://')) {
        this.curr_url_1 = this.native_url_1
        this.curr_title_1 = this.file_curr_title_1
      }else{
        this.curr_url_1 = utilites.parse_url(url_1).product.short_url
      }
      if (url_2.includes('file://')) {
        this.curr_url_2 = this.native_url_2
        this.curr_title_2 = this.file_curr_title_2
      }else{
        this.curr_url_2 = utilites.parse_url(url_2).product.short_url
      }
    },
  },
  computed:{
    filtered_results(){
      // return this.$store.getters.filtered_results

      let out = this.$store.getters.results
      if (this.settings.amazon_rank_only.value) {
        out = out.filter(result => result.product_2.props.rank)
      }
      if (this.settings.hide_exeption.value) {
        out = out.filter(result => !result.exeption)
      }
      if (this.settings.match_profit.value) {
        out = out.filter(result => this.is_match_profit(result))
      }
      if (this.settings.match_identity.value) {
        out = out.filter(result => this.is_match_identity(result))
      }

      for (const result of this.results) {
        if (!out.includes(result)) {
          this.$store.dispatch('set_result', {
            _id: result._id,
            result:{
              selected: false
            }
          })
        }
      }

      return out
    },
    results(){
      return this.$store.getters.results
    },
    settings(){
      return this.$store.getters.settings
    }
  },
  mounted(){
    const self = this
    this.index = this.$route.params.index
    setTimeout(()=>{
      if (!self.webview_1) {
        self.webview_1 = document.getElementById('view_1')
      }
      if (!self.webview_2) {
        self.webview_2 = document.getElementById('view_2')
      }
      self.webview_1.addEventListener('did-start-loading', () => self.ready_webview_1 = false)
      self.webview_1.addEventListener('did-stop-loading',  () => self.ready_webview_1 = true)
      self.webview_2.addEventListener('did-start-loading', () => self.ready_webview_2 = false)
      self.webview_2.addEventListener('did-stop-loading',  () => self.ready_webview_2 = true)
      self.refresh_pair()


    }, 1000)
  },
  watch:{
    ready_webview_1(){
      if (this.ready_webview_1 && this.ready_webview_2) {
        this.fill_product_cards()
        this.compute_is_native()
        this.refresh_controls()
        this.ready_for_exeption = true
        this.ready_for_match = true
        this.ready_for_favorite = true
        if (!this.is_native_url_1) {
          this.webview_1.executeJavaScript(this.gethtml_function).then((html) => {
            const data_1 = utilites.parse_url(this.curr_url_1)
            const data_2 = utilites.parse_amazon_ca_product_html(html)
            const product = {
              id: data_1.product.id,
              resource_id: data_1.resource.id,
              name: data_2.name,
              price: data_2.price,
              url: data_1.product.short_url,
              image: data_2.image,
              props:{
                model: data_2.model,
                rank: data_2.rank,
                images: data_2.images
              }
            }
            ipcRenderer.send(`add_prod_to_db`, product, 1)
          })
        }
      }else{
        this.ready_for_exeption = false
        this.ready_for_match = false
        this.ready_for_favorite = false
        this.last_prod_1_id = false
      }
    },
    ready_webview_2(){
      if (this.ready_webview_1 && this.ready_webview_2) {
        this.fill_product_cards()
        this.compute_is_native()
        this.refresh_controls()
        this.ready_for_exeption = true
        this.ready_for_match = true
        this.ready_for_favorite = true
        if (!this.is_native_url_2) {
          this.webview_2.executeJavaScript(this.gethtml_function).then((html) => {
            const data_1 = utilites.parse_url(this.curr_url_2)
            const data_2 = utilites.parse_amazon_ca_product_html(html)
            const product = {
              id: data_1.product.id,
              resource_id: data_1.resource.id,
              name: data_2.name,
              price: data_2.price,
              url: data_1.product.short_url,
              image: data_2.image,
              props:{
                model: data_2.model,
                rank: data_2.rank,
                images: data_2.images
              }
            }
            ipcRenderer.send(`add_prod_to_db`, product, 2)

            setTimeout(()=>{
              if (this.last_prod_2_id) {
                ipcRenderer.send(`is_favorite_match_exeption_pair`, this.filtered_results[this.index].product_1._id, this.last_prod_2_id)
              }
            },1000)

          })
        }
      }else{
        this.ready_for_exeption = false
        this.ready_for_match = false
        this.ready_for_favorite = false
        this.last_prod_2_id = false
      }
    }
  },
  created(){
    bus.$on('is_favorite_match_exeption_pair', data => {
      this.is_match = data.match
      this.is_exeption = data.exeption
      this.is_favorite = data.favorite
    })
    bus.$on('last_prod_1_id', data => {
      this.last_prod_1_id = data
    })
    bus.$on('last_prod_2_id', data => {
      this.last_prod_2_id = data
    })
  },
  destroyed(){
    bus.$off('is_favorite_match_exeption_pair')
    bus.$off('last_prod_1_id')
    bus.$off('last_prod_2_id')
  }
};
</script>

<style src="./CompareStyle.scss" lang="scss" />
