<template>
  <div class="page">
    <b-row>
      <b-col cols="1">
        <b-button-group size="sm" class="text-right">
          <b-button
            size="sm"
            :class="visible ? null : 'collapsed'"
            :aria-expanded="visible ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="visible = !visible"
            variant="light"><b-icon icon="plus-circle"></b-icon></b-button>
        </b-button-group>
      </b-col>
      <b-col cols="10">
        <b-button-group size="sm">
          <b-dropdown right variant="light" :text="`${$t('settings.relevance')}: ${settings.relevance.value} ${$tc('count.hours', settings.relevance.value)}`" size="sm">
            <b-dropdown-item @click="set_relevance(1)">1 {{ $tc('count.hours', 1) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(6)">6 {{ $tc('count.hours', 6) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(12)">12 {{ $tc('count.hours', 12) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(24)">24 {{ $tc('count.hours', 24) }}</b-dropdown-item>
          </b-dropdown>
          <b-button @click="scan_selected_urls" size="sm" variant="light"><b-icon icon="play"></b-icon>{{$t('title.scan')}}</b-button>
        </b-button-group>
      </b-col>
      <b-col cols="1">
        <b-button-group size="sm" class="text-right">
          <b-button variant="light" @click="delete_selected"><b-icon icon="x-circle"></b-icon></b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div>
          <b-collapse id="collapse-1" class="mt-2" v-model="visible">
            <b-card>
              <b-container fluid>

                <b-row class="my-1">
                  <b-col sm="3">
                    <label for="input-small">Source URL:</label>
                  </b-col>
                  <b-col sm="9">
                    <b-form-input id="input-small" v-model="product_1_url" size="sm" placeholder=""></b-form-input>
                  </b-col>
                </b-row>

                <b-row class="my-1">
                  <b-col sm="3">
                    <label for="input-default">Amazon URL:</label>
                  </b-col>
                  <b-col sm="9">
                    <b-form-input id="input-default" v-model="product_2_url" size="sm" placeholder=""></b-form-input>
                  </b-col>
                </b-row>
                <br>
                <b-row class="my-1">
                  <b-col class="text-right">
                    <b-button @click="add_new_pair" size="sm" variant="success">{{ $t('buttons.add') }}</b-button>
                  </b-col>
                </b-row>

              </b-container>
            </b-card>
          </b-collapse>
        </div>
      </b-col>
    </b-row>
    <br>
    <b-row>
      <b-col>
        <Widget class="h-100 mb-0">
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th width="50px">
                      <div class="abc-checkbox">
                        <input type="checkbox"
                          id="checkbox" :checked="all_selected"
                          @change="checkAll()"
                        />
                        <label for="checkbox" />
                      </div>
                    </th>
                    <th>URLS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(url_pair, index) in all_custom_urls" :key="index">
                    <td>
                      <div class="abc-checkbox">
                        <input type="checkbox"
                          :id="'checkbox'+index" :checked="url_pair.selected"
                          @change="changeCheck(index)"
                        />
                        <label :for="'checkbox'+index" />
                      </div>
                    </td>
                    <td>
                      <div class="flex-column">
                        <span>{{ url_pair.url_1 }}</span>
                        <span>{{ url_pair.url_2 }}</span>
                      </div>
                    </td>
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
const {ipcRenderer} = electron
import { bus } from '../../main'

const utilites = require('../../../modules/utilites').default
// const utilites = require('../../../modules/utilites')
// import {utilites} from "../../../modules/utilites";
// import {utilites} from "../../../modules/utilites";

export default {
  name: 'CustomList',
  components: {
    Widget
  },
  data(){
    return {
      all_custom_urls:[],
      visible: false,
      product_1_url: '',
      product_2_url: '',
    }
  },
  methods:{
    changeCheck(index) {
      this.all_custom_urls[index].selected = !this.all_custom_urls[index].selected
    },
    checkAll(){
      if (this.all_selected) {
        for (let i = 0; i < this.all_custom_urls.length; i++) {
          this.all_custom_urls[i].selected = false
        }
      }else{
        for (let i = 0; i < this.all_custom_urls.length; i++) {
          this.all_custom_urls[i].selected = true
        }
      }
    },
    set_relevance(hours){
      const _setting = this.settings.relevance
      _setting.value = hours
      ipcRenderer.send(`save_setting`,_setting)
    },
    add_new_pair(){
      const parsed_1 = utilites.parse_url(this.product_1_url)
      const parsed_2 = utilites.parse_url(this.product_2_url)
      if (parsed_1.success && parsed_2.success) {
        const url_1 = parsed_1.product.short_url
        const url_2 = parsed_2.product.short_url
        if (utilites.is_source_dest_match(url_1, url_2)) {
          ipcRenderer.send(`add_custom_urls`, url_1, url_2)
          this.product_1_url = ''
          this.product_2_url = ''
        }
      }
    },
    scan_selected_urls(){
      let urls = []
      for (const url_pair of this.all_custom_urls) {
        if(url_pair.selected){
          urls.push({
            url_1: url_pair.url_1,
            url_2: url_pair.url_2
          })
        }
      }
      if (urls.length) {
        ipcRenderer.send(`scan_selected_custom_urls`, urls)
      }
    },
    delete_selected(){
      let ids = []
      for (const url_pair of this.all_custom_urls) {
        if(url_pair.selected){
          ids.push(url_pair._id)
        }
      }
      if (ids.length) {
        ipcRenderer.send(`delete_selected_custom_urls`, ids)
      }
    }
  },
  mounted(){
    ipcRenderer.send(`refresh_custom_urls`)
  },
  computed:{
    settings(){
      return this.$store.getters.settings
    },
    all_selected(){
      let selected = this.all_custom_urls.filter(pair => pair.selected)
      return selected.length == this.all_custom_urls.length && this.all_custom_urls.length
    }
  },
  created(){
    const self = this
    bus.$on('custom_urls_from_server_to_app', data => {
      self.all_custom_urls = data
    })
  },
  destroyed(){
    bus.$off('custom_urls_from_server_to_app')
  }
};
</script>

<style src="./CustomList.scss" lang="scss" scoped />
