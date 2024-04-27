import axios from "axios"
import Constants from '@/js/constants'
import Utils from '@/js/utils'
import { MovieDetailData } from "@/js/commonType"

/*
 * クラス概要: 映画詳細ロジックを担当するクラス
 */
export default class MovieDetailLogic {
  vue: MovieDetailData
  constants: Constants
  utils: Utils
  store: any
  router: any

  /*
   * 関数概要: コンストラクタ
   * 引数：vue Vueコンポーネント
   */
  constructor(vue:MovieDetailData, store:any) {
    this.vue = vue;
    this.store = store;
    this.utils = Utils.instance;
    this.constants = Constants.instance;
  }
  
  /*
   * 関数概要: Vueコンポーネントを返却します。
   * 戻り値：Vueコンポーネント
   */
  get getVue() {
    return this.vue;
  }
  
  /*
   * 関数概要: Vueコンポーネントを設定します。
   * 引数：vue Vueコンポーネント
   */
  set setVue(vue:MovieDetailData) {
      this.vue = vue;
  }
  
  /*
   * 関数概要: Utilsを返却します。
   * 戻り値：Utils
   */
  get getUtils() {
    return this.utils;
  }
  
  /*
   * 関数概要: Utilsを設定します。
   * 引数：utils Utils
   */
  set setUtils(utils:Utils) {
      this.utils = utils;
  }
  
  /*
   * 関数概要: Constantsを返却します。
   * 戻り値：Constants
   */
  get getConstants() {
    return this.constants;
  }
  
  /*
   * 関数概要: Constantsクラスを設定します。
   * 引数：constants Constantsクラス
   */
  set setConstants(constants:Constants) {
      this.constants = constants;
  }

  /*
   * 関数概要: Routerクラスを設定します。
   * 引数: router Routerクラス
   */
  setRouter(router:any) {
      this.router = router;
  }
  
  /*
   * 関数概要: 初期化を行います。
   */
  async init():Promise<void> {
    await this.router.isReady();
    if (!this.vue.movie.id) {
      this.vue.messages = this.utils.createErrorMessage(this.constants.IdMissing);
      return;
    }
    
    this.utils.startLoading(this.vue);
    
    await axios.get(this.constants.MovieDetailUrl,
    {
      params: {
        id: this.vue.movie.id
      }
    })
    .then((response) => {
      const data = response.data;
      if (!data.result) {
        this.vue.messages = this.utils.createErrorMessage(this.constants.DataNotExist);
        return;
      }
      this.vue.movie = data.result;
    })
    .catch((error) => {
      console.log(error);
      this.vue.messages = this.utils.createErrorMessage(this.constants.SystemError);
    })
    .finally(() => {
      this.utils.stopLoading(this.vue);
    });
  }
  
  /*
   * 関数概要: 映画一覧に遷移します。
   */
  movePrevPage():void {
    const mscond = this.store.state.mscond;
    this.router.push({name: "MovieList", params: {tick: Date.now() + "r"}, query: {pageNumber: mscond.pageNumber, pageSize: mscond.pageSize}});
  }
}
