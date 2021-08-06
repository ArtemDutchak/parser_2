import Vue from 'vue';
import Router from 'vue-router';
import {i18n} from '../i18n'

import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Login/Login';
import ErrorPage from '@/pages/Error/Error';
// Core
import TypographyPage from '@/pages/Typography/Typography';

// Tables
import TablesBasicPage from '@/pages/Tables/Basic';

// Maps
import GoogleMapPage from '@/pages/Maps/Google';

// Main
import AnalyticsPage from '@/pages/Dashboard/Dashboard';

// Charts
import ChartsPage from '@/pages/Charts/Charts';

// Ui
import IconsPage from '@/pages/Icons/Icons';
import NotificationsPage from '@/pages/Notifications/Notifications';


import Categories from '@/pages/Categories/Categories';
import CustomURLs from '@/pages/CustomList/CustomURLs';
import ScanList from '@/pages/Results/ScanList';
import ResultsToShow from '@/pages/Results/ResultsToShow';
import Compare from '@/pages/Results/Compare';
import Favorites from '@/pages/Results/Favorites';
import Listing from '@/pages/Results/Listing';
import Settings from '@/pages/Settings/Settings';


Vue.use(Router);

const router = new Router({
  mode: 'hash',
  base: '/',
  routes: [
    {
      path: '/:lang',
      component:{
        render(c){return c('router-view')}
      },
      children: [
        { path: '/', name: 'Home'},
        { path: 'login', name: 'Login', component: Login },
        { path: 'error', name: 'Error', component: ErrorPage },
        { path: 'app', name: 'Layout', component: Layout, children: [
          { path: 'dashboard', name: 'AnalyticsPage', component: AnalyticsPage },
          { path: 'categories', name: 'CategoriesPage', component: Categories },
          { path: 'custom', name: 'Custom'},
          { path: 'custom/urls', name: 'CustomURLs', component: CustomURLs },
          { path: 'results', name: 'Results'},
          { path: 'scan_list', name: 'ScanListPage', component: ScanList },
          { path: 'favorites', name: 'FavoritesPage', component: Favorites },
          { path: 'listing', name: 'ListingPage', component: Listing },
          { path: 'show', name: 'ResultsToShowPage', component: ResultsToShow },
          { path: 'compare/:index', name: 'Compare', component: Compare },
          { path: 'settings', name: 'SettingsPage', component: Settings },
          { path: 'typography', name: 'TypographyPage', component: TypographyPage },
          { path: 'components', name: 'Components'},
          { path: 'components/icons', name: 'IconsPage', component: IconsPage },
          { path: 'notifications', name: 'NotificationsPage', component: NotificationsPage },
          { path: 'components/charts', name: 'ChartsPage', component: ChartsPage },
          { path: 'tables', name: 'TablesBasicPage', component: TablesBasicPage },
          { path: 'components/maps', name: 'GoogleMapPage', component: GoogleMapPage },
        ]}
      ]
    }
  ],
})

const allowed_languages = ['en', 'ru']

router.beforeEach((to, from, next) => {

  let language = to.params.lang
  if (language) {
    if (allowed_languages.includes(language)) {
      i18n.locale = language
    }else{
      router.push({name: to.name, params: { lang: 'en' }})
    }
  }else{
    router.push({name: 'AnalyticsPage', params: { lang: 'en' }})
  }

  next()

})

export default router
