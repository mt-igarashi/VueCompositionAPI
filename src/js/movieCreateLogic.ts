import axios from "axios"
import { nextTick } from "vue"
import Constants from '@/js/constants'
import Utils from '@/js/utils'
import Validator from '@/js/validator'
import MovieConstants from '@/js/movieConstants'
import movieupdate from '@/assets/validation/movieupdate.json'
import { MovieCreateData } from "@/js/commonType"

/*
 * クラス概要: 映画作成ロジックを担当するクラス
 */
export default class MovieCreateLogic {
  vue: MovieCreateData
  utils: Utils
  constants: Constants
  movieconstants: MovieConstants
  validator: Validator
  step: number
  router: any

  /*
   * 関数概要: コンストラクタ
   * 引数：vue Vueコンポーネント
   */
  constructor(vue:MovieCreateData) {
    this.vue = vue;
    this.utils = Utils.instance;
    this.constants = Constants.instance;
    this.movieconstants = MovieConstants.instance;
    this.validator = new Validator(vue, movieupdate);
  }
  
  /*
   * 関数概要: Vueコンポーネントを返却します。
   * 戻り値：Vueコンポーネント
   */
  get getVue():MovieCreateData {
    return this.vue;
  }
  
  /*
   * 関数概要: Vueコンポーネントを設定します。
   * 引数：vue Vueコンポーネント
   */
  set setVue(vue:MovieCreateData) {
      this.vue = vue;
  }
  
  /*
   * 関数概要: Utilsを返却します。
   * 戻り値：Utils
   */
  get getUtils():Utils {
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
  get getConstants():Constants {
    return this.constants;
  }
  
  /*
   * 関数概要: Constantsを設定します。
   * 引数：constants Constants
   */
  set setConstants(constants:Constants) {
      this.constants = constants;
  }

  /*
   * 関数概要: MovieConstantsを返却します。
   * 戻り値：MovieConstants
   */
  get getMovieConstants():MovieConstants {
    return this.movieconstants;
  }
  
  /*
   * 関数概要: MoiveConstantsを設定します。
   * 引数：movieconstants MovieConstants
   */
  set setMovieConstants(movieconstants:MovieConstants) {
      this.movieconstants = movieconstants;
  }

  /*
   * 関数概要: Validatorを返却します。
   * 戻り値：Validator
   */
  get getValidator() {
    return this.validator;
  }
  
  /*
   * 関数概要: Validatorを設定します。
   * 引数：constants Validator
   */
  set setValidator(validator:Validator) {
      this.validator = validator;
  }

  /*
   * 関数概要: Routerクラスを設定します。
   * 引数: router Routerクラス
   */
  setRouter(router:any) {
    this.router = router;
  }

  /*
   * 関数概要: 映画を登録します。
   */
  async create():Promise<void> {
    this.utils.startLoading(this.vue);
    
    await axios.post(this.constants.MovieCreateUrl,
    {
      Title: this.vue.movie.title,
      ReleaseDate: this.vue.movie.releaseDate,
      Genre: this.vue.movie.genre,
      Price: this.vue.movie.price,
      Rating: this.vue.movie.rating
    })
    .then((response) => {
      const data = response.data;
      if (!data.result) {
        console.log("登録失敗");
        this.vue.messages = this.utils.createErrorMessage(this.constants.DbUpdateFailed);
        return;
      }
      this.vue.step = 2;
      this.vue.disable = true;
      this.vue.messages = this.utils.createMessage(this.constants.DbUpdated);
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
  moveMovieList():void {
    this.router.push({name: "MovieList", params: {tick: Date.now() + "i"}});
  }
  
  /*
   * 関数概要: 映画一覧に遷移します。
   */
  movePrevPage():void {
    this.router.push({name: "MovieList", params: {tick: Date.now() + "s"}});
  }

  /*
    * 関数概要: フィールドを検証します。
    * 引数：slotProps スロットオブジェクト
    */
  validateField(slotProps:any):void {
    slotProps.executor.validate();
    nextTick(() => {
      const errors = document.querySelectorAll(".field-valid");
      if (errors.length == 5) {
        if (this.vue.step != 1) {
          this.vue.step = 1;
          this.vue.steps = Array.from(this.vue.steps); 
        }
      } else if (this.step != 0) {
        this.vue.step = 0;
        this.vue.steps = Array.from(this.vue.steps);
      }
    });
  }
}
