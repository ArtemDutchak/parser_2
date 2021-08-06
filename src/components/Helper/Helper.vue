<template>
    <div :class="{
      'theme-helper': true,
      'theme-helper-opened': opened,
      'scanning': scan_status.current == 'scanning' || scan_status.current == 'searching',
      'hided': scan_status.current == 'idle'
    }">
        <div class="theme-helper-toggler" @click="toggle">
            <div class="theme-helper-spinner bg-primary text-white">
                <i class="la la-cog"></i>
                <i class="la la-cog fs-smaller"></i>
            </div>
        </div>
      <section class="widget theme-helper-content">
            <div class="widget-body mt-3">
              <h6 class="mb-3">{{ $t(`scan.${scan_status.current}`) }}</h6>
              <b-row class="mb-3">
                <b-col class="text-center">
                  <h2>{{ scan_progress.current }} / {{ scan_progress.total }}</h2>
                </b-col>
              </b-row>
              <b-progress :value="scan_progress.current" :max="scan_progress.total" class="mb-3" variant="success" animated></b-progress>
            </div>

            <div class="flex-row sb mt-4">
              <b-button-group>
                <b-button
                  @click="set_process('paused')"
                  :title="$t('title.pause_scan')"
                  :disabled="scan_status.current != 'scanning'"
                  variant="outline-secondary">
                  <b-icon icon="pause-fill"></b-icon>
                </b-button>

                <b-button
                  @click="set_process('scanning')"
                  :disabled="scan_status.current != 'paused' && scan_status.current != 'captcha' && scan_status.current != 'dog'"
                  :title="$t('title.continue_scan')"
                  variant="outline-secondary">
                  <b-icon icon="play-fill"></b-icon>
                </b-button>

                <b-button
                  @click="set_process('stopped')"
                  :title="$t('title.stop_scan')"
                  :disabled="scan_status.current != 'scanning' && scan_status.current != 'paused'"
                  variant="outline-secondary">
                  <b-icon icon="stop-fill"></b-icon>
                </b-button>

              </b-button-group>
              <b-button-group>
                <b-button
                  @click="set_process('aborted')"
                  :title="$t('title.abort_scan')"
                  :disabled="scan_status.current == 'idle' || scan_status.current == 'aborted' || scan_status.current == 'finished'"
                  variant="danger">
                  <b-icon  icon="x"></b-icon>
                </b-button>
              </b-button-group>
            </div>

            <div class="flex-row sb mt-4" v-if="(
              scan_status.current == 'searching' ||
              scan_status.current == 'scanning' ||
              scan_status.current == 'paused' ||
              scan_status.current == 'stopped' ||
              scan_status.current == 'captcha' ||
              scan_status.current == 'dog' ||
              scan_status.current == 'finished'
              ) && !scanning_was_aborted">
              <b-button
                :title="$t('title.go_to_scan')"
                @click="go_to_current_results()" variant="light">{{ $t('buttons.to_results') }}</b-button>
            </div>

        </section>
    </div>
</template>

<script>

const electron = window.require('electron')
const {ipcRenderer} = electron

export default {
    name: 'Helper',
    data() {
        return {
            opened: true,
        }
    },
    computed:{
      scan_status(){
        if (this.$store.getters.scan_status.current == 'finished') {
          this.set_open()
        }else if (this.$store.getters.scan_status.current == 'idle') {
          this.set_open()
        }
        return this.$store.getters.scan_status
      },
      scanning_was_aborted(){
        return this.$store.getters.scanning_was_aborted
      },
      scan_progress(){
        return this.$store.getters.scan_progress
      }
    },
    methods: {
      toggle(){
        if (this.scan_status.current == 'finished') {
          ipcRenderer.send(`set_process`, 'idle')
        }else{
          this.opened = !this.opened;
        }
      },
      set_open(){
        this.opened = true
      },
      set_close(){
        this.opened = false
      },
      set_process(status){
        if (status == 'aborted') {
          this.$store.commit('set_scanning_was_aborted', true)
          if (this.$router.history.current.name == 'ResultsToShowPage') {
            this.$router.push({name: 'ScanListPage'})
          }
        }
        ipcRenderer.send('set_process', status)
      },
      go_to_current_results(){
        ipcRenderer.send(`go_to_current_results`)
        if (this.scan_status.current == 'finished') {
          ipcRenderer.send('set_process', 'idle')
        }
      }
    },
    mounted(){
    }
};
</script>

<style src="./Helper.scss" lang="scss"></style>
