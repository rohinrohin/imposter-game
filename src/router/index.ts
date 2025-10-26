import { createRouter, createWebHistory } from 'vue-router'
import GamesIndex from '../views/GamesIndex.vue'
import ImposterGame from '../views/ImposterGame.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'games',
      component: GamesIndex
    },
    {
      path: '/imposter-game',
      name: 'imposter-game',
      component: ImposterGame
    }
  ]
})

export default router
