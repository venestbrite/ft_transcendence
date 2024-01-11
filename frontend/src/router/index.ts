import HelloWorld from '@/components/HelloWorld.vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HelloWorld
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/validation_code',
      name: 'validation_code',
      component: () => import('../views/ValidationCode.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/TestGame.vue')
    },
    {
      path: '/view-game',
      name: 'view-game',
      component: () => import('../views/ViewGame.vue')
    },
    {
      path: '/join-chat',
      name: 'join-chat',
      component: () => import('../views/JoinChat.vue')
    },
    {
      path: '/test-game',
      name: 'test-game',
      component: () => import('../views/BlockGame.vue')
    },
    {
      path: '/users/:username',
      name: 'users',
      component: () => import('../views/PublicProfile.vue')
    },
    {
      path: '/chats',
      name: 'chatlist',
      component: () => import('../views/ChatList.vue')
    },
    {
      path: '/singlechat',
      name: 'singlechat',
      component: () => import('../views/SingleChat.vue')
    },
    {
      path: '/channels',
      name: 'channels',
      component: () => import('../views/ChannelList.vue')
    },
    {
      path: '/join-channel',
      name: 'join-channel',
      component: () => import('../views/JoinChannel.vue')
    },
    {
      path: '/single-channel',
      name: 'single-channel',
      component: () => import('../views/SingleChannel.vue')
    },
    {
      path: '/ladder',
      name: 'ladder',
      component: () => import('../views/Ladder.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/Logout.vue')
    },
    {
      path: '/create-profile',
      name: 'create-profile',
      component: () => import('../views/CreateProfile.vue')
    },
    {
      path: '/live',
      name: 'live',
      component: () => import('../views/LiveGames.vue')
    }
  ]
})

async function createUserAccess() {
  const is_auth = await axios.get('http://localhost:5050/auth/whoami', { withCredentials: true}).then((res) => {
  return res.data;
  })
  .catch((err) => {
  return err.data;
  });

  return is_auth;
}

// router.beforeEach(async (to, from) => {
// let logged_in = false;
// const is_auth = await createUserAccess();

// if (is_auth == 'KO') {
//   logged_in = false;
// }
// else
//   logged_in = true;

//   if (!logged_in && to.name !== 'login') {
//     return {name : 'login'}
//   }

// // console.log(logged_in);
// //   // to and from are both route objects. must call `next`.
// //   return false;
// })

export default router
