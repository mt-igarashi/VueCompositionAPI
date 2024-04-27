import { createStore } from 'vuex'
import { Movie, Message, Dialog, GridColumn } from '@/js/commonType'

export default class Utils {
  private static counter = 0;
  static instance = new Utils();
  
  /*
   * 関数概要: コンストラクタ
   */
  constructor() {
    if (Utils.counter > 0) {
      throw "creation of instance is not permitted";
    }
    Utils.counter++;
  }
  
  /*
   * 関数概要: 入力用日付に変換します。
   * 引数：date DB日付
   * 戻り値：入力用日付
   */
  convertInputDate(date:string = ""):string {
    if (!date) {
      return "";
    }
    
    return date.split("T")[0];
  }
  
  /*
   * 関数概要: 表示用日付に変換します。
   * 引数：date DB日付
   * 戻り値：表示用日付
   */
  convertDisplayDate(date:string = ""):string {
    if (!date) {
      return "";
    }
    
    let sp = date.split("T")[0];
    let result = sp.split("-");
    
    if (result.length != 3) {
      return sp;
    }
    
    return `${result[0]}年 ${result[1]}月 ${result[2]}日`;
  }
  
  /*
   * 関数概要: 数値をドル表記に変換します。
   * 引数：number 数値
   * 戻り値：数値(ドル表記)
   */
  formatDollars(number?:number):string {
    if (!number) {
      return "";
    }
    return `$ ${number}`;
  }

  /*
   * 関数概要: メッセージ、エラーメッセージがあるかを検証します。
   * 引数：message メッセージ
   * 戻り値：メッセージ有り無し
   */
  hasNoMessages(message:Message):boolean {
    return message.messages.length == 0 && message.errors.length == 0
  }

  /*
   * 関数概要: エラーメッセージがあるかを検証します。
   * 引数：message メッセージ
   * 戻り値：エラーメッセージ有り無し
   */
  hasErrorMessages(message:Message):boolean {
    return message.errors.length > 0
  }

  /*
   * 関数概要: メッセージがあるかを検証します。
   * 引数：message メッセージ
   * 戻り値：メッセージ有り無し
   */
  hasMessages(message:Message):boolean {
    return message.messages.length > 0
  }

  /*
   * 関数概要: 指定した文字列を格納したメッセージを生成します。
   * 引数：message メッセージ
   * 戻り値：メッセージ
   */
  createMessage(message:any = null):Message {
    if (!message) {
      return {errors: [], messages: []};
    }

    if (Array.isArray(message)) {
      return {errors: [], messages: message};
    }

    return {errors: [], messages: [message]};
  }
  
  /*
   * 関数概要: 指定した文字列を格納したメッセージを生成します。
   * 引数：error エラーメッセージ
   * 戻り値：メッセージ
   */
  createErrorMessage(error: any = null):Message {
    if (!error) {
      return {errors: [], messages: []};
    }

    if (Array.isArray(error)) {
      return {errors: error, messages: []};
    }

    return {errors: [error], messages: []};
  }
  
  /*
   * 関数概要: Loadingを開始します。
   * 引数：vue Vueコンポーネント
   */
  startLoading(vue: any):void {
    const elems = document.querySelectorAll("button, a") as NodeListOf<HTMLElement>;
    for (const elem of elems) {
      elem.style["pointer-events"] = "none";
    }
    vue.loading = true;
  }
  
  /*
   * 関数概要: Loadingを停止します。
   * 引数：vue Vueコンポーネント
   */
  stopLoading(vue: any):void {
    const elems = document.querySelectorAll("button, a") as NodeListOf<HTMLElement>;
    for (const elem of elems) {
      elem.style["pointer-events"] = "auto";
    }
    vue.loading = false;
  }

  /*
   * 関数概要: VuexStoreを生成します。
   */
  createVuexStore():any {
    return createStore({
      state: {
        mscond: {}
      },
      mutations: {
        movieSearch: function(proxy, param) {
           proxy.mscond = param;
        }
      },
      actions: {
        movieSearch: function({commit}, param) {
          commit("movieSearch", param);
        }
      }
    })
  }

  /*
   * 関数概要: コンポーネントを読み込みます。
   */
  loadComponents(app:any):any {
    const files = require.context("../components/parts", true, /\.vue$/);
    const components = {};
    files.keys().forEach(key => {
        components[key.replace(/(\.\/|\.vue)/g, "")] = files(key).default;
    });
    
    Object.keys(components).forEach(key => {
        app.component(key, components[key]);
    });
  }

  /*
   * 関数概要: Functionがayncであるかを判定します。
   * 引数：func Function
   */
  isAsync(func: Function):boolean {
    return Object.getPrototypeOf(func) === Object.getPrototypeOf(async function () {});
  }

  /*
   * 関数概要: 映画エンティティを生成します。
   */
  createMovie(movie:Partial<Movie>={}):Movie {
    return {
      ...movie
    };
  }

  /*
   * 関数概要: ダイアログパラメータを生成します。
   */
  createDialogParam(dialog:Partial<Dialog>={}):Dialog {
    return {
      ...dialog
    };
  }
  
  /*
   * 関数概要: ダイアログパラメータを生成します。
   */
  createGridColumn(column:Partial<GridColumn>={}):GridColumn {
    return {
      ...column
    };
  }

  ///////////////////////////////////
  //
  // イベントログ出力
  //
  ///////////////////////////////////
  
  /*
   * 関数概要: ログを出力します
   * 引数：args ログ出力する変数
   */
  console(...args: any[]) {
    for (const arg of args) {
      console.log(arg);
    }
  }
}