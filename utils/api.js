const isDebug = false;
const productURI = 'https://cowrycare.net/cowrycare-iot';
const testURI = 'https://test.cowrycare.net';
const baseURI = isDebug ? testURI : productURI;
const APIURI = baseURI + "/api";
const OSSURI = baseURI + "/oss";


const API = {
  "baseURI": baseURI,
  login: baseURI + '/login',
  checksession: baseURI + "/checksession",
  userinfo: APIURI + '/userinfo',
  dict: APIURI + '/dict',
  device: APIURI + '/device',
  register: APIURI + "/register",
  index: APIURI + "/index",
  mox: APIURI + "/mox",
  disease: APIURI + "/disease",
  acupoint: APIURI + "/acupoint",
  therapy: APIURI + "/therapy",
  address: APIURI + "/address",
  phone: APIURI + "/phone",
  search: APIURI + "/search",
  sku: APIURI + "/sku",
  cowry: APIURI + "/cowry",
  inv: APIURI + "/inv",
  order: APIURI + "/order",
  logistics: APIURI + "/logistics",
  oss: OSSURI,
  about: OSSURI + "/static/about.html",
  contact: OSSURI + "/static/contact.html",
  access: APIURI + "/access",
  share: APIURI + "/share",
  comment: APIURI + "/comment",
  agree: APIURI + "/agree",
  article: APIURI + "/article",
  usercomment: APIURI + "/usercomment",
  dysmenorrhea: OSSURI + "/diagnostic/dysmenorrhea.json",
  common_problem: OSSURI + "/diagnostic/common_problem.json",
  diagnostic: APIURI + "/diagnostic",
  diagnotichistory: APIURI + "/diagnotichistory",
};
export default API;