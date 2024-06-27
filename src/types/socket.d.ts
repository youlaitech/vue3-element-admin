// https://github.com/sockjs/sockjs-client/issues/565

declare module "sockjs-client/dist/sockjs.min.js" {
  import Client from "sockjs-client";
  export default Client;
}
