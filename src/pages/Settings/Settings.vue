<template>
  <div class="page">
    <b-row>
      <b-col cols="12">
        <Widget class="h-100 mb-0" :title="$t('titles.settings')">
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.system_settings') }}</th>
                    <th></th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('chrome_path')">
                    <td>{{ $t(`settings.chrome_path`) }}</td>
                    <td>{{ settings.chrome_path.value }}</td>
                    <td>
                      <label class="pointer" id="label_chrome_path" for="chrome_path">
                        <b-icon icon="folder" :variant="path_class"></b-icon>
                      </label>
                      <input hidden type="file" id="chrome_path" @change="save_path()"/>
                    </td>
                  </tr>
                  <!-- <tr v-if="settings.hasOwnProperty('darktheme')">
                    <td>{{ $t(`settings.darktheme`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.darktheme.value" @change="save_checkbox('darktheme')"></b-form-checkbox></td>
                  </tr> -->
                  <tr>
                    <td>{{ $t(`settings.reload_browser`) }}</td>
                    <td></td>
                    <td>
                      <b-button size="sm" variant="warning" @click="reload_browser()">
                      <b-icon icon="arrow-clockwise"></b-icon>
                    </b-button>
                  </td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.parsing') }}</th>
                    <th width="150px"></th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('headless')">
                    <td>{{ $t(`settings.headless`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.headless.value" @change="save_checkbox('headless')"></b-form-checkbox></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('images_styles')">
                    <td>{{ $t(`settings.load_images_and_styles`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.images_styles.value" @change="save_checkbox('images_styles')"></b-form-checkbox></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('tabs')">
                    <td>{{ $t(`settings.threads`) }}</td>
                    <td><b-form-input
                      id="input-tabs"
                      v-model="settings.tabs.value"
                      type="range"
                      min="1"
                      max="9"
                      step="1"
                      @change="format_input('tabs', 0)"
                    ></b-form-input></td>
                    <td>{{settings.tabs.value}}
                    </td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('captcha_continue_timeout')">
                    <td>{{ $t(`settings.captcha_continue_timeout`) }}</td>
                    <td style="text-align: right;">
                      <b-dropdown right variant="light" :text="captcha_continue_timeout" size="sm">
                        <b-dropdown-item @click="save_captcha_continue_timeout(5)">5 {{ $tc('count.minutes', 5) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_captcha_continue_timeout(10)">10 {{ $tc('count.minutes', 10) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_captcha_continue_timeout(15)">15 {{ $tc('count.minutes', 15) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_captcha_continue_timeout(20)">20 {{ $tc('count.minutes', 20) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_captcha_continue_timeout(0)">{{ $t('titles.disable') }}</b-dropdown-item>
                      </b-dropdown>
                    </td>
                    <td></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('extentions')">
                    <td>{{ $t(`settings.use_extentions`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.extentions.value" @change="save_checkbox('extentions')"></b-form-checkbox></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('finish_mail')">
                    <td>{{ $t(`settings.finish_mail`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.finish_mail.value" @change="save_checkbox('finish_mail')"></b-form-checkbox></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('captcha_mail')">
                    <td>{{ $t(`settings.captcha_mail`) }}</td>
                    <td></td>
                    <td><b-form-checkbox :checked="settings.captcha_mail.value" @change="save_checkbox('captcha_mail')"></b-form-checkbox></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('parsing_notification_email')">
                    <td>{{ $t(`settings.parsing_notification_email`) }}</td>
                    <td style="text-align: right;" colspan="2"><b-form-input
                      id="input-parsing_notification_email"
                      style="text-align: right;"
                      v-model="settings.parsing_notification_email.value"
                      size="sm"
                      @blur="save_parsing_notification_email"
                    ></b-form-input></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.listing') }}</th>
                    <th width="250px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('amazon_store_name')">
                    <td>{{ $t(`settings.amazon_store_name`) }}</td>
                    <td style="text-align: right;"><b-form-input
                      id="input-amazon_store_name"
                      style="text-align: right;"
                      v-model="settings.amazon_store_name.value"
                      size="sm"
                      @blur="save_amazon_store_name"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('watch_notification_email')">
                    <td>{{ $t(`settings.watch_notification_email`) }}</td>
                    <td style="text-align: right;"><b-form-input
                      id="input-watch_notification_email"
                      style="text-align: right;"
                      v-model="settings.watch_notification_email.value"
                      size="sm"
                      @blur="save_watch_notification_email"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('watch_period')">
                    <td>{{ $t(`settings.watch_period`) }}</td>
                    <td style="text-align: right;">
                      <b-dropdown right variant="light" :text="watch_text" size="sm">
                        <b-dropdown-item @click="save_watch_period(1)">1 {{ $tc('count.hours', 1) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watch_period(3)">3 {{ $tc('count.hours', 3) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watch_period(6)">6 {{ $tc('count.hours', 6) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watch_period(12)">12 {{ $tc('count.hours', 12) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watch_period(0)">{{ $t('titles.disable') }}</b-dropdown-item>
                      </b-dropdown>
                    </td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('watcher_delay')">
                    <td>{{ $t(`settings.watcher_delay`) }}</td>
                    <td style="text-align: right;">
                      <b-dropdown right variant="light" :text="watcher_delay_text" size="sm">
                        <b-dropdown-item @click="save_watcher_delay(30)">0,5 {{ $tc('count.minutes', 0.5) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watcher_delay(60)">1 {{ $tc('count.minutes', 1) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watcher_delay(120)">2 {{ $tc('count.minutes', 2) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watcher_delay(180)">3 {{ $tc('count.minutes', 3) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watcher_delay(300)">5 {{ $tc('count.minutes', 5) }}</b-dropdown-item>
                        <b-dropdown-item @click="save_watcher_delay(0)">{{ $t('titles.disable') }}</b-dropdown-item>
                      </b-dropdown>
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.walmart_ca_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('walmart_ca_delivery')">
                    <td>{{ $t(`settings.delivery_cost`) }}</td>
                    <td><b-form-input
                      id="input-walmart_ca_delivery"
                      v-model="settings.walmart_ca_delivery.value"
                       size="sm"
                       @blur="format_input('walmart_ca_delivery', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('walmart_ca_free_shipping_on')">
                    <td>{{ $t(`settings.free_shipping_on`) }}</td>
                    <td><b-form-input
                      id="input-walmart_ca_free_shipping_on"
                      v-model="settings.walmart_ca_free_shipping_on.value"
                       size="sm"
                       @blur="format_input('walmart_ca_free_shipping_on', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('walmart_ca_retailer_only')">
                    <td>{{ $t(`settings.walmart_retailer_only`) }}</td>
                    <td><b-form-checkbox :checked="settings.walmart_ca_retailer_only.value" @change="save_checkbox('walmart_ca_retailer_only')"></b-form-checkbox></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.walmart_com_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('walmart_com_delivery')">
                    <td>{{ $t(`settings.delivery_cost`) }}</td>
                    <td><b-form-input
                      id="input-walmart_com_delivery"
                      v-model="settings.walmart_com_delivery.value"
                       size="sm"
                       @blur="format_input('walmart_com_delivery', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('walmart_com_free_shipping_on')">
                    <td>{{ $t(`settings.free_shipping_on`) }}</td>
                    <td><b-form-input
                      id="input-walmart_com_free_shipping_on"
                      v-model="settings.walmart_com_free_shipping_on.value"
                       size="sm"
                       @blur="format_input('walmart_com_free_shipping_on', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('walmart_com_retailer_only')">
                    <td>{{ $t(`settings.walmart_retailer_only`) }}</td>
                    <td><b-form-checkbox :checked="settings.walmart_com_retailer_only.value" @change="save_checkbox('walmart_com_retailer_only')"></b-form-checkbox></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.bedbathandbeyond_ca_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('bedbathandbeyond_ca_delivery')">
                    <td>{{ $t(`settings.delivery_cost`) }}</td>
                    <td><b-form-input
                      id="input-bedbathandbeyond_ca_delivery"
                      v-model="settings.walmart_ca_delivery.value"
                       size="sm"
                       @blur="format_input('bedbathandbeyond_ca_delivery', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('bedbathandbeyond_ca_free_shipping_on')">
                    <td>{{ $t(`settings.free_shipping_on`) }}</td>
                    <td><b-form-input
                      id="input-bedbathandbeyond_ca_free_shipping_on"
                      v-model="settings.bedbathandbeyond_ca_free_shipping_on.value"
                       size="sm"
                       @blur="format_input('bedbathandbeyond_ca_free_shipping_on', 2)"
                    ></b-form-input></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.bedbathandbeyond_com_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('bedbathandbeyond_com_delivery')">
                    <td>{{ $t(`settings.delivery_cost`) }}</td>
                    <td><b-form-input
                      id="input-bedbathandbeyond_com_delivery"
                      v-model="settings.walmart_com_delivery.value"
                       size="sm"
                       @blur="format_input('bedbathandbeyond_com_delivery', 2)"
                    ></b-form-input></td>
                  </tr>
                  <tr v-if="settings.hasOwnProperty('bedbathandbeyond_com_free_shipping_on')">
                    <td>{{ $t(`settings.free_shipping_on`) }}</td>
                    <td><b-form-input
                      id="input-bedbathandbeyond_com_free_shipping_on"
                      v-model="settings.bedbathandbeyond_com_free_shipping_on.value"
                       size="sm"
                       @blur="format_input('bedbathandbeyond_com_free_shipping_on', 2)"
                    ></b-form-input></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.amazon_ca_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('amazon_ca_taxes')">
                    <td>{{ $t(`settings.amazon_taxes`) }}</td>
                    <td><b-form-input
                      id="input-amazon_ca_taxes"
                      v-model="settings.amazon_ca_taxes.value"
                       size="sm"
                       @blur="format_input('amazon_ca_taxes', 1)"
                    ></b-form-input></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>{{ $t('titles.amazon_com_settings') }}</th>
                    <th width="100px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="settings.hasOwnProperty('amazon_com_taxes')">
                    <td>{{ $t(`settings.amazon_taxes`) }}</td>
                    <td><b-form-input
                      id="input-amazon_com_taxes"
                      v-model="settings.amazon_com_taxes.value"
                       size="sm"
                       @blur="format_input('amazon_com_taxes', 1)"
                    ></b-form-input></td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
        </Widget>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
const electron = window.require('electron')
const fs = window.require("fs");
const {ipcRenderer} = electron
// import { bus } from '@/main'

const utilites = require('../../../modules/utilites').default

export default {
  name: 'Settings',
  components: {
    Widget
  },
  data(){
    return {
      path_class:'',
    }
  },
  methods:{
    reload_browser(){
      ipcRenderer.send(`reload_browser`)
    },
    format_input(val, dec){
      this.settings[val].value = parseFloat(this.settings[val].value, dec).toFixed(dec)
      if (this.settings[val].value == 'NaN') {
        this.settings[val] = 0
      }
      this.save_setting(this.settings[val])
    },
    save_setting(setting){
      ipcRenderer.send(`save_setting`,setting)
    },
    save_checkbox(val){
      const setting = this.settings[val]
      setting.value = event.target.checked
      switch (val) {
        case 'extentions':
          if (setting.value) {
            if (this.settings.headless.value) {
              const _setting = this.settings.headless
              _setting.value = false
              ipcRenderer.send(`save_setting`,_setting)
            }
          }
          break;
        case 'headless':
          if (setting.value) {
            if (this.settings.extentions.value) {
              const _setting = this.settings.extentions
              _setting.value = false
              ipcRenderer.send(`save_setting`,_setting)
            }
            if (this.settings.images_styles.value) {
              const _setting = this.settings.images_styles
              _setting.value = false
              ipcRenderer.send(`save_setting`,_setting)
            }
          }
          break;
        case 'images_styles':
          if (setting.value) {
            if (this.settings.headless.value) {
              const _setting = this.settings.headless
              _setting.value = false
              ipcRenderer.send(`save_setting`,_setting)
            }
          }
          break;
        default:

      }
      ipcRenderer.send(`save_setting`,setting)
    },
    save_watch_notification_email(){
      const _setting = this.settings.watch_notification_email
      const email = event.target.value.trim()
      if (email.length) {
        const is_email = utilites.isEmail(email)
        if (is_email) {
          _setting.value = email
        }else{
        _setting.value = ''
        this.$toasted.error(this.$t('toast.enter_valid_email')).goAway(3000)
        }
      }
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_parsing_notification_email(){
      const _setting = this.settings.parsing_notification_email
      const email = event.target.value.trim()
      if (email.length) {
        const is_email = utilites.isEmail(email)
        if (is_email) {
          _setting.value = email
        }else{
        _setting.value = ''
        this.$toasted.error(this.$t('toast.enter_valid_email')).goAway(3000)
        }
      }
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_amazon_store_name(){
      const _setting = this.settings.amazon_store_name
      _setting.value = event.target.value.trim()
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_watch_period(hours){
      const _setting = this.settings.watch_period
      _setting.value = hours
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_watcher_delay(seconds){
      const _setting = this.settings.watcher_delay
      _setting.value = seconds
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_captcha_continue_timeout(minutes){
      const _setting = this.settings.captcha_continue_timeout
      _setting.value = minutes
      ipcRenderer.send(`save_setting`,_setting)
    },
    save_path(){
      const _setting = this.settings.chrome_path
      _setting.value = event.target.files[0].path
      ipcRenderer.send(`save_setting`,_setting)
      this.check_path()
    },
    check_path(){
      if (fs.existsSync(this.settings.chrome_path.value)) {
        this.path_class = 'success'
      }else{
        this.path_class = 'danger'
      }
    },
  },
  computed:{
    settings(){
      return this.$store.getters.settings
    },
    watch_text(){
      return this.settings.watch_period.value ? this.settings.watch_period.value  + ' ' + this.$tc('count.hours', this.settings.watch_period.value) : this.$t('titles.disabled')
    },
    watcher_delay_text(){
      return this.settings.watcher_delay.value ? this.settings.watcher_delay.value / 60  + ' ' + this.$tc('count.minutes', this.settings.watcher_delay.value / 60) : this.$t('titles.disabled')
    },
    captcha_continue_timeout(){
      return this.settings.captcha_continue_timeout.value ? this.settings.captcha_continue_timeout.value  + ' ' + this.$tc('count.minutes', this.settings.captcha_continue_timeout.value) : this.$t('titles.disabled')
    }
  },
  mounted(){
    setTimeout(this.check_path, 2000)
    // this.$toasted.success('saved!').goAway(3000)
  },
  created(){

  },
  destroyed(){
    ipcRenderer.send(`compact_database`, 'settings')
  }
};
</script>

<style src="./Settings.scss" lang="scss" />
