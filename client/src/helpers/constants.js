let isLocal = false;
try {
  isLocal = window.location.href.includes('localhost');
} catch (e) {}
// const TESTING = false;

const constants = {
  url: isLocal ? "http://localhost:8000" : "https://courser-professor.up.railway.app",
//   clientUrl: isLocal ? "http://localhost:3000" : "https://courser-beta.vercel.app",
//   authToken: "my-courser-auth-token",
//   firebaseConfig: {
//     apiKey: 'AIzaSyB2FKP0oaAeLPa96h_SI7fFi4KEEaWrvxI',
//     authDomain: "wordsmith-auth.firebaseapp.com",
//     projectId: "wordsmith-auth",
//     storageBucket: "wordsmith-auth.appspot.com",
//     messagingSenderId: "315192723360",
//     appId: "1:315192723360:web:733126e071a610640546c5",
//     measurementId: "G-WHP68FVH93"
//   }
};

export default constants;

