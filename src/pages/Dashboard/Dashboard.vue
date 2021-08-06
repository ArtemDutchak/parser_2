<template>
  <div class="dashboard-page">
    <h1 class="page-title">{{ $t('title.dashboard') }}</h1>
    <b-row>
      <b-col lg="4" sm="6" xs="12">
        <div class="pb-xlg h-100">
          <Widget class="h-100 mb-0" :title="$t('txt.cpu')+':'">
            <div class="d-flex justify-content-center align-items-center">
              <h2>{{ cpu_usage }} %</h2>
            </div>
            <highcharts :options="cpu_donut"></highcharts>
            <div class="d-flex flex-wrap">
              <div class="mt mr">
                <h6 class="text-center">{{ cpu_cores }}</h6><p class="text-muted mb-0 text-center"><small>{{ $tc('txt.cores', cpu_cores) }}</small></p>
              </div>
            </div>
          </Widget>
        </div>
      </b-col>
      <b-col lg="4" sm="6" xs="12">
        <div class="pb-xlg h-100">
          <Widget class="h-100 mb-0" :title="$t('txt.ram')+':'">
            <div class="d-flex justify-content-center align-items-center">
              <h2>{{ ram_usage }} %</h2>
            </div>
            <highcharts :options="ram_donut"></highcharts>
            <div class="d-flex flex-wrap justify-content-between">
              <div class="mt">
                <h6 class="text-center">{{ ram_total }}</h6><p class="text-muted mb-0 text-center"><small>{{ $t('txt.gb') }}</small></p>
              </div>
            </div>
          </Widget>
        </div>
      </b-col>
      <!-- <b-col lg="4" sm="6" xs="12">
        <div class="pb-xlg h-100">
          <Widget class="h-100 mb-0" :title="$t('txt.licence')+':'">

          </Widget>
        </div>
      </b-col> -->
    </b-row>

    <b-row v-if="parsing_processes.length">
      <b-col>
        <Widget class="h-100 mb-0">
          <b-row>
            <b-col>
              <table class="v-center table table-striped">
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
                    <th colspan="3">

                      <b-button
                        class="mr-2"
                        size="sm"
                        @click="set_selected_process_status(3)"
                        :title="$t('title.pause_scan')"
                        variant="light">
                        <b-icon icon="pause-fill"></b-icon>
                      </b-button>

                      <b-button
                        class="mr-2"
                        size="sm"
                        @click="show_selected"
                        :title="$t('title.pause_scan')"
                        variant="light">
                        <b-icon icon="eye"></b-icon>
                      </b-button>

                      <b-button
                        class="mr-2"
                        size="sm"
                        @click="set_selected_process_status(2)"
                        :title="$t('title.continue_scan')"
                        variant="light">
                        <b-icon icon="play-fill"></b-icon>
                      </b-button>

                      <b-button
                        class="mr-5"
                        size="sm"
                        @click="refresh_selected_process"
                        :title="$t('title.refresh_scan')"
                        variant="light">
                        <b-icon icon="arrow-clockwise"></b-icon>
                      </b-button>

                    </th>
                    <th width="200px"></th>
                    <th width="150px"></th>
                    <th width="150px"></th>
                    <th width="20px">

                      <b-button
                        size="sm"
                        @click="promt_delete_selected"
                        :title="$t('title.remove_scan')"
                        variant="light">
                        <b-icon icon="trash"></b-icon>
                      </b-button>

                    </th>
                  </tr>
                </thead>
                <Draggable
                  class="table table-striped"
                  tag="tbody"
                  group="setting"
                  v-model="parsing_processes"
                  v-bind="dragOptions"
                  handle=".handle"
                  @end="update_sort_order">
                    <tr v-for="(parsing_process, index) in parsing_processes" :key="index" :id="`pp_${parsing_process.id}`">
                      <td>
                        <div class="abc-checkbox">
                          <input type="checkbox"
                            :id="'checkbox'+index" :checked="parsing_process.selected"
                            @change="changeCheck(index)"
                          />
                          <label :for="'checkbox'+index" />
                        </div>
                      </td>
                      <td width="50px">

                          <b-button
                            v-if="parsing_process.scan_status_id == 1 || parsing_process.scan_status_id == 2"
                            @click="set_process_status(parsing_process.id, 3)"
                            :title="$t('title.pause_scan')"
                            class="no-border no-background"
                            variant="light">
                            <b-icon icon="pause-fill"></b-icon>
                          </b-button>

                          <b-button
                            v-if="parsing_process.scan_status_id == 3 || parsing_process.scan_status_id == 4 || parsing_process.scan_status_id == 7 || parsing_process.scan_status_id == 8"
                            @click="set_process_status(parsing_process.id, 2)"
                            :title="$t('title.continue_scan')"
                            class="no-border no-background"
                            variant="light">
                            <b-icon icon="play-fill"></b-icon>
                          </b-button>

                          <b-button
                            size="sm"
                            v-if="parsing_process.scan_status_id == 5 || parsing_process.scan_status_id == 6"
                            @click="refresh_process(parsing_process.id)"
                            :title="$t('title.refresh_scan')"
                            class="no-border no-background"
                            variant="light">
                            <b-icon icon="arrow-clockwise"></b-icon>
                          </b-button>

                      </td>
                      <td>
                        <div class="" v-if="!parsing_process.edit" @click="edit_by_double(index)">
                          {{ parsing_process.name }}
                        </div>
                        <div class="" v-if="parsing_process.edit">
                          <b-form-input size="sm"
                            :id="'input_' + index"
                            placeholder=""
                            :value="parsing_process.name"
                            @change="end_edit(index, $event)"
                            @blur="end_edit(index, $event)"
                            ></b-form-input>
                        </div></td>
                      <td class="h-center">
                        <b-form-spinbutton class="no-border no-background" id="`sb_${parsing_process.id}`" @input="set_priority(index, $event)" :value="parsing_process.priority" inline></b-form-spinbutton>
                      </td>
                      <td class="h-center"><b-progress :value="parsing_process.parsed_count" :max="parsing_process.total_count" class="mt-2" variant="success" animated></b-progress></td>
                      <td class="h-center">{{ parsing_process.parsed_count }} / {{ parsing_process.total_count }} / {{ parsing_process.error_count }}</td>
                      <td class="h-center">{{ $t(`scan.${parsing_process.scan_status}`) }}</td>
                      <td>
                        <b-icon variant="secondary" class="handle pointer" icon="three-dots-vertical"></b-icon>
                      </td>
                    </tr>
                </Draggable>
              </table>
            </b-col>
          </b-row>
        </Widget>
      </b-col>
    </b-row>


    <!-- <br>
    <b-row>
      <b-col>
        <button @click="test_script">test_script</button>
      </b-col>
    </b-row> -->
    <!-- <b-row>
      <b-col>
        <input style="color: black;" type="text" v-model="filter">
      </b-col>
    </b-row>
    <br>
    <b-row>
      <b-col>
        <table class="table">
          <tr v-for="row in rows" :key="row">
            <td v-for="colum in colums" :key="colum">
              <div><i style="font-size: 32px;" :class="`fi ${icons_filtered[colum * row - 1]}`"></i></div>
              <div>{{icons_filtered[colum * row - 1]}}</div>
            </td>
          </tr>
        </table>
      </b-col>
    </b-row> -->
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Draggable from "vuedraggable";
import BigStat from './components/BigStat/BigStat';
import mock from './mock';

import { Chart } from 'highcharts-vue';
const electron = window.require('electron')
const {ipcRenderer} = electron

export default {
  name: 'Dashboard',
  components: {
    Widget, BigStat, highcharts: Chart, Draggable
  },
  data() {
    return {
      mock,
      cpu_usage: 0,
      ram_usage: 0,
      ram_total: '--.--',
      cpu_cores: '--',
      usage_stat_interval: null,

      colums: 10,
      filter: '',
      icons: [
        'flaticon-add',
        'flaticon-add-1',
        'flaticon-add-2',
        'flaticon-add-3',
        'flaticon-agenda',
        'flaticon-alarm',
        'flaticon-alarm-1',
        'flaticon-alarm-clock',
        'flaticon-alarm-clock-1',
        'flaticon-albums',
        'flaticon-app',
        'flaticon-archive',
        'flaticon-archive-1',
        'flaticon-archive-2',
        'flaticon-archive-3',
        'flaticon-attachment',
        'flaticon-back',
        'flaticon-battery',
        'flaticon-battery-1',
        'flaticon-battery-2',
        'flaticon-battery-3',
        'flaticon-battery-4',
        'flaticon-battery-5',
        'flaticon-battery-6',
        'flaticon-battery-7',
        'flaticon-battery-8',
        'flaticon-battery-9',
        'flaticon-binoculars',
        'flaticon-blueprint',
        'flaticon-bluetooth',
        'flaticon-bluetooth-1',
        'flaticon-bookmark',
        'flaticon-bookmark-1',
        'flaticon-briefcase',
        'flaticon-broken-link',
        'flaticon-calculator',
        'flaticon-calculator-1',
        'flaticon-calendar',
        'flaticon-calendar-1',
        'flaticon-calendar-2',
        'flaticon-calendar-3',
        'flaticon-calendar-4',
        'flaticon-calendar-5',
        'flaticon-calendar-6',
        'flaticon-calendar-7',
        'flaticon-checked',
        'flaticon-checked-1',
        'flaticon-clock',
        'flaticon-clock-1',
        'flaticon-close',
        'flaticon-cloud',
        'flaticon-cloud-computing',
        'flaticon-cloud-computing-1',
        'flaticon-cloud-computing-2',
        'flaticon-cloud-computing-3',
        'flaticon-cloud-computing-4',
        'flaticon-cloud-computing-5',
        'flaticon-command',
        'flaticon-compact-disc',
        'flaticon-compact-disc-1',
        'flaticon-compact-disc-2',
        'flaticon-compass',
        'flaticon-compose',
        'flaticon-controls',
        'flaticon-controls-1',
        'flaticon-controls-2',
        'flaticon-controls-3',
        'flaticon-controls-4',
        'flaticon-controls-5',
        'flaticon-controls-6',
        'flaticon-controls-7',
        'flaticon-controls-8',
        'flaticon-controls-9',
        'flaticon-database',
        'flaticon-database-1',
        'flaticon-database-2',
        'flaticon-database-3',
        'flaticon-diamond',
        'flaticon-diploma',
        'flaticon-dislike',
        'flaticon-dislike-1',
        'flaticon-divide',
        'flaticon-divide-1',
        'flaticon-division',
        'flaticon-document',
        'flaticon-download',
        'flaticon-edit',
        'flaticon-edit-1',
        'flaticon-eject',
        'flaticon-eject-1',
        'flaticon-equal',
        'flaticon-equal-1',
        'flaticon-equal-2',
        'flaticon-error',
        'flaticon-exit',
        'flaticon-exit-1',
        'flaticon-exit-2',
        'flaticon-eyeglasses',
        'flaticon-fast-forward',
        'flaticon-fast-forward-1',
        'flaticon-fax',
        'flaticon-file',
        'flaticon-file-1',
        'flaticon-file-2',
        'flaticon-film',
        'flaticon-fingerprint',
        'flaticon-flag',
        'flaticon-flag-1',
        'flaticon-flag-2',
        'flaticon-flag-3',
        'flaticon-flag-4',
        'flaticon-focus',
        'flaticon-folder',
        'flaticon-folder-1',
        'flaticon-folder-10',
        'flaticon-folder-11',
        'flaticon-folder-12',
        'flaticon-folder-13',
        'flaticon-folder-14',
        'flaticon-folder-15',
        'flaticon-folder-16',
        'flaticon-folder-17',
        'flaticon-folder-18',
        'flaticon-folder-19',
        'flaticon-folder-2',
        'flaticon-folder-3',
        'flaticon-folder-4',
        'flaticon-folder-5',
        'flaticon-folder-6',
        'flaticon-folder-7',
        'flaticon-folder-8',
        'flaticon-folder-9',
        'flaticon-forbidden',
        'flaticon-funnel',
        'flaticon-garbage',
        'flaticon-garbage-1',
        'flaticon-garbage-2',
        'flaticon-gift',
        'flaticon-help',
        'flaticon-hide',
        'flaticon-hold',
        'flaticon-home',
        'flaticon-home-1',
        'flaticon-home-2',
        'flaticon-hourglass',
        'flaticon-hourglass-1',
        'flaticon-hourglass-2',
        'flaticon-hourglass-3',
        'flaticon-house',
        'flaticon-id-card',
        'flaticon-id-card-1',
        'flaticon-id-card-2',
        'flaticon-id-card-3',
        'flaticon-id-card-4',
        'flaticon-id-card-5',
        'flaticon-idea',
        'flaticon-incoming',
        'flaticon-infinity',
        'flaticon-info',
        'flaticon-internet',
        'flaticon-key',
        'flaticon-lamp',
        'flaticon-layers',
        'flaticon-layers-1',
        'flaticon-like',
        'flaticon-like-1',
        'flaticon-like-2',
        'flaticon-link',
        'flaticon-list',
        'flaticon-list-1',
        'flaticon-lock',
        'flaticon-lock-1',
        'flaticon-locked',
        'flaticon-locked-1',
        'flaticon-locked-2',
        'flaticon-locked-3',
        'flaticon-locked-4',
        'flaticon-locked-5',
        'flaticon-locked-6',
        'flaticon-login',
        'flaticon-magic-wand',
        'flaticon-magnet',
        'flaticon-magnet-1',
        'flaticon-magnet-2',
        'flaticon-map',
        'flaticon-map-1',
        'flaticon-map-2',
        'flaticon-map-location',
        'flaticon-megaphone',
        'flaticon-megaphone-1',
        'flaticon-menu',
        'flaticon-menu-1',
        'flaticon-menu-2',
        'flaticon-menu-3',
        'flaticon-menu-4',
        'flaticon-microphone',
        'flaticon-microphone-1',
        'flaticon-minus',
        'flaticon-minus-1',
        'flaticon-more',
        'flaticon-more-1',
        'flaticon-more-2',
        'flaticon-multiply',
        'flaticon-multiply-1',
        'flaticon-music-player',
        'flaticon-music-player-1',
        'flaticon-music-player-2',
        'flaticon-music-player-3',
        'flaticon-mute',
        'flaticon-muted',
        'flaticon-navigation',
        'flaticon-navigation-1',
        'flaticon-network',
        'flaticon-newspaper',
        'flaticon-next',
        'flaticon-note',
        'flaticon-notebook',
        'flaticon-notebook-1',
        'flaticon-notebook-2',
        'flaticon-notebook-3',
        'flaticon-notebook-4',
        'flaticon-notebook-5',
        'flaticon-notepad',
        'flaticon-notepad-1',
        'flaticon-notepad-2',
        'flaticon-notification',
        'flaticon-paper-plane',
        'flaticon-paper-plane-1',
        'flaticon-pause',
        'flaticon-pause-1',
        'flaticon-percent',
        'flaticon-percent-1',
        'flaticon-perspective',
        'flaticon-photo-camera',
        'flaticon-photo-camera-1',
        'flaticon-photos',
        'flaticon-picture',
        'flaticon-picture-1',
        'flaticon-picture-2',
        'flaticon-pin',
        'flaticon-placeholder',
        'flaticon-placeholder-1',
        'flaticon-placeholder-2',
        'flaticon-placeholder-3',
        'flaticon-placeholders',
        'flaticon-play-button',
        'flaticon-play-button-1',
        'flaticon-plus',
        'flaticon-power',
        'flaticon-previous',
        'flaticon-price-tag',
        'flaticon-print',
        'flaticon-push-pin',
        'flaticon-radar',
        'flaticon-reading',
        'flaticon-record',
        'flaticon-repeat',
        'flaticon-repeat-1',
        'flaticon-restart',
        'flaticon-resume',
        'flaticon-rewind',
        'flaticon-rewind-1',
        'flaticon-route',
        'flaticon-save',
        'flaticon-search',
        'flaticon-search-1',
        'flaticon-send',
        'flaticon-server',
        'flaticon-server-1',
        'flaticon-server-2',
        'flaticon-server-3',
        'flaticon-settings',
        'flaticon-settings-1',
        'flaticon-settings-2',
        'flaticon-settings-3',
        'flaticon-settings-4',
        'flaticon-settings-5',
        'flaticon-settings-6',
        'flaticon-settings-7',
        'flaticon-settings-8',
        'flaticon-settings-9',
        'flaticon-share',
        'flaticon-share-1',
        'flaticon-share-2',
        'flaticon-shuffle',
        'flaticon-shuffle-1',
        'flaticon-shutdown',
        'flaticon-sign',
        'flaticon-sign-1',
        'flaticon-skip',
        'flaticon-smartphone',
        'flaticon-smartphone-1',
        'flaticon-smartphone-10',
        'flaticon-smartphone-11',
        'flaticon-smartphone-2',
        'flaticon-smartphone-3',
        'flaticon-smartphone-4',
        'flaticon-smartphone-5',
        'flaticon-smartphone-6',
        'flaticon-smartphone-7',
        'flaticon-smartphone-8',
        'flaticon-smartphone-9',
        'flaticon-speaker',
        'flaticon-speaker-1',
        'flaticon-speaker-2',
        'flaticon-speaker-3',
        'flaticon-speaker-4',
        'flaticon-speaker-5',
        'flaticon-speaker-6',
        'flaticon-speaker-7',
        'flaticon-speaker-8',
        'flaticon-spotlight',
        'flaticon-star',
        'flaticon-star-1',
        'flaticon-stop',
        'flaticon-stop-1',
        'flaticon-stopwatch',
        'flaticon-stopwatch-1',
        'flaticon-stopwatch-2',
        'flaticon-stopwatch-3',
        'flaticon-stopwatch-4',
        'flaticon-street',
        'flaticon-street-1',
        'flaticon-substract',
        'flaticon-substract-1',
        'flaticon-success',
        'flaticon-switch',
        'flaticon-switch-1',
        'flaticon-switch-2',
        'flaticon-switch-3',
        'flaticon-switch-4',
        'flaticon-switch-5',
        'flaticon-switch-6',
        'flaticon-switch-7',
        'flaticon-tabs',
        'flaticon-tabs-1',
        'flaticon-target',
        'flaticon-television',
        'flaticon-television-1',
        'flaticon-time',
        'flaticon-trash',
        'flaticon-umbrella',
        'flaticon-unlink',
        'flaticon-unlocked',
        'flaticon-unlocked-1',
        'flaticon-unlocked-2',
        'flaticon-upload',
        'flaticon-user',
        'flaticon-user-1',
        'flaticon-user-2',
        'flaticon-user-3',
        'flaticon-user-4',
        'flaticon-user-5',
        'flaticon-user-6',
        'flaticon-user-7',
        'flaticon-users',
        'flaticon-users-1',
        'flaticon-video-camera',
        'flaticon-video-camera-1',
        'flaticon-video-player',
        'flaticon-video-player-1',
        'flaticon-video-player-2',
        'flaticon-view',
        'flaticon-view-1',
        'flaticon-view-2',
        'flaticon-volume-control',
        'flaticon-volume-control-1',
        'flaticon-warning',
        'flaticon-wifi',
        'flaticon-wifi-1',
        'flaticon-windows',
        'flaticon-windows-1',
        'flaticon-windows-2',
        'flaticon-windows-3',
        'flaticon-windows-4',
        'flaticon-wireless-internet',
        'flaticon-worldwide',
        'flaticon-worldwide-1',
        'flaticon-zoom-in',
        'flaticon-zoom-out',
      ]
    }
  },
  methods: {
    edit_by_double(index){
      if(!this.timeoutId){
          this.timeoutId = setTimeout(() => {
            this.timeoutId = null
          }, 300);
        }else{
          clearTimeout(this.timeoutId);
          this.parsing_processes[index].edit = true
          setTimeout(() => {
            document.getElementById('input_' + index).focus()
          }, 500)
          this.timeoutId = null
        }
    },
    end_edit(index, name){
      this.parsing_processes[index].edit = false
      if (event.target.value.length) {
        ipcRenderer.send(`edit_parsing_process_prorerty`, {
          _id: this.parsing_processes[index].id,
          name
        })
      }
    },
    set_priority(index, priority){
      ipcRenderer.send(`edit_parsing_process_prorerty`, {
        _id: this.parsing_processes[index].id,
        priority
      })
    },
    update_sort_order(){
      let ids = []
      for (const parsing_process of this.parsing_processes) {
        ids.push(parsing_process.id)
      }
      ipcRenderer.send(`resort_parsing_processes`, ids)
    },
    changeCheck(index) {
      this.parsing_processes[index].selected = !this.parsing_processes[index].selected
    },
    remove(index) {
      this.parsing_processes.splice(index, 1)
    },
    getRandomData() {
      const arr = [];

      for (let i = 0; i < 25; i += 1) {
        arr.push(Math.random().toFixed(1) * 10);
      }

      return arr;
    },
    get_usage_data(param) {
      const data = [];

      data.push({
        label: this.$t('txt.used'),
        data: parseInt(param),
      });
      data.push({
        label: this.$t('txt.free'),
        data: 100 - parseInt(param),
      });

      return data;
    },
    test_script(){
      ipcRenderer.send('test_script')
    },
    get_stat(){
      ipcRenderer.send('usage-stat-call')
    },
    set_process_status(process_id, scan_status_id){
      ipcRenderer.send('set_process_status', {
        process_id,
        scan_status_id
      })
    },
    refresh_process(process_id){
      ipcRenderer.send('refresh_process', {
        process_id
      })
    },
    remove_process(process_id){
      ipcRenderer.send('remove_process', {
        process_id
      })
    },
    set_selected_process_status(scan_status_id){
      let ids = []
      for (const parsing of this.parsing_processes) {
        if(parsing.selected){
          ids.push(parsing.id)
        }
      }
      for (const process_id of ids) {
        this.set_process_status(process_id, scan_status_id);
      }
    },
    show_selected(){
      let ids = [];
      for (const parsing_process of this.parsing_processes) {
        if(parsing_process.selected){
          ids.push(parsing_process.id);
        }
      }
      if (ids.length) {
        this.$store.commit('set_showed_list_ids', ids);
        ipcRenderer.send(`show_selected_results`, ids);
      }
    },
    refresh_selected_process(){
      let ids = []
      for (const parsing of this.parsing_processes) {
        if(parsing.selected){
          ids.push(parsing.id)
        }
      }
      for (const process_id of ids) {
        this.refresh_process(process_id);
      }
    },
    promt_delete_selected(){
      this.$toasted.options.action = [
        {
          text : this.$t('buttons.yes'),
          class: 'text-white',
          onClick : (e, toastObject) => {
            this.delete_selected();
            toastObject.goAway(0);
          }
        },
        {
          text : this.$t('buttons.no'),
          class: 'text-white',
          onClick : (e, toastObject) => {
            toastObject.goAway(0);
          }
        }
    ];
      this.$toasted.info(this.$t('toast.promt_delete_selected'));
    },
    delete_selected(){
      let ids = []
      for (const parsing of this.parsing_processes) {
        if(parsing.selected){
          ids.push(parsing.id)
        }
      }
      for (const process_id of ids) {
        this.remove_process(process_id);
      }
    },
    checkAll(){
      if (this.all_selected) {
        for (let i = 0; i < this.parsing_processes.length; i++) {
          this.parsing_processes[i].selected = false
        }
      }else{
        for (let i = 0; i < this.parsing_processes.length; i++) {
          this.parsing_processes[i].selected = true
        }
      }
    }
  },
  computed: {
    cpu_usage_data(){
      return parseInt(this.cpu_usage)
    },
    ram_usage_data(){
      return parseInt(this.ram_usage)
    },
    cpu_donut() {
      let revenueData = this.get_usage_data(this.cpu_usage_data);
      let {gray, warning} = this.appConfig.colors;
      let series = [
        {
          name: this.$t('txt.cpu'),
          data: revenueData.map(s => {
            return {
              name: s.label,
              y: s.data
            }
          })
        }
      ];
      return {
        chart: {
          type: 'pie',
          height: 120
        },
        credits: {
          enabled: false
        },
        title: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false
            },
            borderColor: null,
            showInLegend: false,
            innerSize: 80,
            size: 100,
            states: {
              hover: {
                halo: {
                  size: 1
                }
              }
            }
          }
        },
        colors: [warning, gray],
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: '#495057',
            fontWeight: 100,
            fontFamily: 'Montserrat'
          },
          itemMarginBottom: 5,
          symbolRadius: 0
        },
        exporting: {
          enabled: false
        },
        series
      };
    },
    ram_donut() {
      let revenueData = this.get_usage_data(this.ram_usage_data);
      let {warning, gray} = this.appConfig.colors;
      let series = [
        {
          name: '',
          data: revenueData.map(s => {
            return {
              name: s.label,
              y: s.data
            }
          })
        }
      ];
      return {
        chart: {
          type: 'pie',
          height: 120
        },
        credits: {
          enabled: false
        },
        title: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false
            },
            borderColor: null,
            showInLegend: false,
            innerSize: 80,
            size: 100,
            states: {
              hover: {
                halo: {
                  size: 1
                }
              }
            }
          }
        },
        colors: [warning, gray],
        legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: {
            color: '#495057',
            fontWeight: 100,
            fontFamily: 'Montserrat'
          },
          itemMarginBottom: 5,
          symbolRadius: 0
        },
        exporting: {
          enabled: false
        },
        series
      };
    },
    all_selected(){
      let selected = this.parsing_processes.filter(parsing_process => parsing_process.selected)
      return selected.length == this.parsing_processes.length && this.parsing_processes.length
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    icons_filtered(){
      if (!this.filter.length) {
        return this.icons
      }else{
        return this.icons.filter((item)=>{
          return item.includes(this.filter)
        })
      }
    },
    rows(){
      return Math.ceil(this.icons_filtered.length / this.colums)
    },
    parsing_processes: {
        get() {
            return this.$store.getters.parsing_processes
        },
        set(value) {
            this.$store.commit('resort_parsing_processes', value)
        }
    }
  },
  mounted(){
    this.get_stat()
    ipcRenderer.send('total-stat-call')
    ipcRenderer.send('refresh_parsing_processes')
  },
  destroyed() {
    // ipcRenderer.removeAllListeners();
    clearInterval(this.usage_stat_interval)
  },
  created(){
    this.usage_stat_interval = setInterval(()=>{
      this.get_stat()
    }, 3000)
    ipcRenderer.on('usage-stat-back', (e, data)=>{
      this.cpu_usage = data.cpu
      this.ram_usage = data.ram
    })
    ipcRenderer.on('total-stat-back', (e, data)=>{
      this.ram_total = data.ram
      this.cpu_cores = data.cores
    })
  }
};
</script>

<style src="./Dashboard.scss" lang="scss" />
