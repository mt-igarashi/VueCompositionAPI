import axios from "axios"
import { nextTick } from "vue"
import Constants from '@/js/constants'
import Utils from '@/js/utils'
import Validator from '@/js/validator'
import MovieConstants from '@/js/movieConstants'
import movieupdate from '@/assets/validation/movieupdate.json'
import { MovieEditData } from "@/js/commonType";

/*
 * クラス概要: 映画編集ロジックを担当するクラス
 */
export default class MovieEditLogic {
  vue: MovieEditData
  id:string
  utils: Utils
  constants: Constants
  movieconstants: MovieConstants
  validator: Validator
  step: number

  /*
   * 関数概要: コンストラクタ
   * 引数：vue Vueコンポーネント
   */
  constructor(vue:MovieEditData, id:string) {
    this.vue = vue;
    this.id = id;
    this.utils = Utils.instance;
    this.constants = Constants.instance;
    this.movieconstants = MovieConstants.instance;
    this.validator = new Validator(vue, movieupdate);
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
  set setVue(vue:MovieEditData) {
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
  get getMovieConstants() {
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
   * 関数概要: 初期化を行います。
   */
  async init():Promise<void> {
    this.vue.steps = this.movieconstants.MovieUpdateSteps;
    if (!this.id) {
      this.vue.messages = this.utils.createErrorMessage(this.constants.IdMissing);
      return;
    }
    
    this.utils.startLoading(this.vue);
    await axios.get(this.constants.MovieFindUrl,
    {
      params: {
        id: this.id
      }
    })
    .then((response) => {
      const data = response.data;
      if (!data.result) {
        this.vue.messages = this.utils.createErrorMessage(this.constants.DataNotExist);
        return;
      }
      data.result.releaseDate = this.utils.convertInputDate(data.result.releaseDate);
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
   * 関数概要: 映画を編集します。
   */
  async edit():Promise<void> {
    this.vue.messages = this.utils.createMessage();
    this.utils.startLoading(this.vue);
    
    await axios.post(this.constants.MovieEditUrl,
    {
      ID: this.vue.movie.id,
      Title: this.vue.movie.title,
      ReleaseDate: this.vue.movie.releaseDate,
      Genre: this.vue.movie.genre,
      Price: this.vue.movie.price,
      Rating: this.vue.movie.rating
    })
    .then((response) => {
      const data = response.data;
      if (!data.result) {
        this.vue.messages = this.utils.createErrorMessage(this.constants.DbUpdateFailed);
        return;
      }
      
      this.vue.step = 2;
      this.vue.messages = this.utils.createMessage(this.constants.DbUpdated);
      
      if (window.opener) {
        window.opener.document.querySelector("#reload").click();
      }
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
   * 関数概要: Windowをクローズします。
   */
  closePage():void {
    window.close();
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
