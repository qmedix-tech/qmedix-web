// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyChiRMP6BhJNjdEttp0myAfUb5uZCIV6HE",
  authDomain: "qmedix-fbe6f.firebaseapp.com",
  databaseURL: "https://qmedix-fbe6f-default-rtdb.firebaseio.com",
  projectId: "qmedix-fbe6f",
  storageBucket: "qmedix-fbe6f.firebasestorage.app",
  messagingSenderId: "123014912595",
  appId: "1:123014912595:web:014f746fdca9d63029c4a6",
  measurementId: "G-8J1B03501G"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
