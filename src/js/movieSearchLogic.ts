import axios from "axios"
import { nextTick } from "vue"
import { RouteLocationNormalized, Router } from 'vue-router'
import Utils from "@/js/utils"
import Constants from "@/js/constants"
import MovieConstants from "@/js/movieConstants"
import Validator from "@/js/validator"
import moviesearch from '@/assets/validation/moviesearch.json'
import { Movie, MovieSearchData } from "./commonType"

/*
 * クラス概要: 映画一覧ロジックを担当するクラス
 */
export default class MovieSearchLogic {
  vue: MovieSearchData
  utils: Utils
  constants: Constants
  movieconstants: MovieConstants
  validator: Validator
  step: number
  store: any
  route: RouteLocationNormalized
  router: Router

  /*
   * 関数概要: コンストラクタ
   * 引数：vue Vueコンポーネント
   */
  constructor(vue:MovieSearchData, store:any) {
    this.vue = vue;
    this.store = store;
    this.utils = Utils.instance;
    this.constants = Constants.instance;
    this.movieconstants = MovieConstants.instance;
    this.validator = new Validator(vue, moviesearch);
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
  set setVue(vue:MovieSearchData) {
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
   * 関数概要: Routerを設定します。
   * 引数：route Route
   *      router Router
   */
  setRouter(route:RouteLocationNormalized, router:Router) {
    this.route = route;
    this.router = router;
  }
  
  ///////////////////////////////////
  //
  // イベント
  //
  ///////////////////////////////////
  
  /*
   * 関数概要: 初期化を行います。
   * 引数：to 遷移先routeを格納したパラメータ
   */
  async init(to:RouteLocationNormalized = null):Promise<void> {
    await this.router.isReady();
    this.vue.steps = this.movieconstants.MoviePrintListSteps;
    this.setParams(to);
    const state = this.route.params.tick as string || "i";
    if (!state.endsWith("i")) {
      const mscond = this.store.state.mscond;
      this.vue.genre = mscond.movieGenre;
      this.vue.searchString = mscond.searchString;
    } else {
      this.vue.genre = "";
      this.vue.searchString = "";
    }
    await this.search();
  }
  
  /*
   * 関数概要: ページをリロードします。
   * 引数：iinit 初期化フラグ
   */
  reload(init:boolean = false):void {
    if (init) {
      const param = {
        movieGenre: this.vue.genre,
        searchString: this.vue.searchString,
        pageNumber: this.constants.DefaultPageNumber,
        pageSize: this.constants.DefaultPageSize
      };
      this.store.dispatch("movieSearch", param);
      this.router.push({name: "MovieList", params: {tick: Date.now() + "s"}});
    } else {
      this.router.push({name: "MovieList", params: {tick: Date.now() + "r"}, query: {pageNumber: this.pageNumber(), pageSize: this.pageSize()}});
    }
  }
  
  /*
   * 関数概要: 映画を検索します。
   */
  async search():Promise<void> {
    this.vue.messages = this.utils.createMessage();
    this.utils.startLoading(this.vue);
    const param = {
        movieGenre: this.vue.genre,
        searchString: this.vue.searchString,
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize()
    };
    await axios.get(this.constants.MovieSearchUrl,
    {
      params: param
    })
    .then((response) => {
      const data = response.data;
      if (data.result.genres.lenght == 0 || data.result.movies.length == 0) {
        this.vue.movies = [];
        this.vue.total = 0;
        this.vue.messages = this.utils.createErrorMessage(this.constants.SearchFailed);
        return;
      }
      this.vue.genres = data.result.genres;
      data.result.movies.forEach(x => {
        x.check = false;
        x.printable = (x.id != 1 && x.id != 5 && x.id != 10);
      });
      this.vue.movies = data.result.movies;
      this.vue.total = data.result.totalCount;
    })
    .catch((error) => {
      console.log(error);
      this.vue.movies = [];
      this.vue.total = 0;
      this.vue.messages = this.utils.createErrorMessage(this.constants.SystemError);
    })
    .finally(() => {
      this.store.dispatch("movieSearch", param);
      this.utils.stopLoading(this.vue);
    });
  }
  
  /*
   * 関数概要: 映画を削除します。
   */
  async delete(item:Movie):Promise<void> {
    this.vue.messages = this.utils.createMessage();
    this.utils.startLoading(this.vue);
    
    const param = {
        id: item.id,
    };
    
    await axios.get(this.constants.MovieDeleteUrl,
    {
      params: param
    })
    .then((response) => {
      const data = response.data;
      if (!data.result) {
        this.vue.messages = this.utils.createErrorMessage(this.constants.DbUpdateFailed);
        return;
      }
      
      this.vue.dialog = {
        title: this.constants.InfoTitle,
        message: this.constants.DbDeleted,
        ok: null,
        cancel: null,
        show: true,
        type: this.constants.DialogOk
      };
      this.router.push({name: "MovieList", params: {state: "search", tick: Date.now()}});
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
   * 関数概要: 映画詳細に遷移します。
   * 引数：item 映画
   */
  moveDetail(item:Movie):void {
    this.router.push({ name: "MovieDetail", params: {id: item.id}});
  }
  
  /*
   * 関数概要: 映画編集を開きます。
   * 引数：item 映画
   */
  openEdit(item:Movie):void {
    this.vue.messages = this.utils.createMessage();
    const route = this.router.resolve({
      name: "MovieEdit",
      params: {id: item.id}
    });
    if (this.vue.window) {
      this.vue.window.close();
    }
    this.vue.window = window.open(route.href, "_blank");
  }

  /*
   * 関数概要: ステップを更新します。
   */
  updateSteps():void {
    nextTick(() => {
      const cbList = document.querySelectorAll(":checked");
      if (cbList.length == 0) {
        if (this.step != 0) {
          this.vue.step = 0;
          this.vue.steps = Array.from(this.vue.steps);
        }
        return;
      }

      if (this.validator.hasError()) {
        this.vue.fadeIn = true;
        this.vue.fadeOut = false;
        if (this.step != 1) {
          this.vue.step = 1;
          this.vue.steps = Array.from(this.vue.steps);
        }
      } else if (this.vue.step != 2) {
        this.vue.fadeIn = true;
        this.vue.fadeOut = true;
        this.vue.step = 2;
        this.vue.steps = Array.from(this.vue.steps); 
      }
    });
  }
  
  ///////////////////////////////////
  //
  // ページング設定
  //
  ///////////////////////////////////
  
  /*
   * 関数概要: ページ数を返却します。
   */
  pageNumber():number {
    let page = Number(this.route?.query?.pageNumber);
    if (isNaN(page)) {
      return this.constants.DefaultPageNumber;
    }
    return page;
  }
  
  /*
   * 関数概要: ページサイズを返却します。
   */
  pageSize():number {
    let size = Number(this.route?.query?.pageSize);
    if (isNaN(size)) {
      return this.constants.DefaultPageSize;
    }
    return size;
  }
  
  /*
   * 関数概要: パラメータを設定します。
   * 引数：to 遷移先ルートを格納したパラメータ
   */
  setParams(to:RouteLocationNormalized) {
    if (!to) {
      this.route.params.query = "";
      this.route.params.state = "";
      return;
    }
    this.route.query.state = to.query.state;
    this.route.query.tick = to.query.tick;
    this.route.query.pageNumber = to.query.pageNumber;
    this.route.query.pageSize = to.query.pageSize;
  }

  ///////////////////////////////////
  //
  // グリッド設定
  //
  ///////////////////////////////////
  
  /*
   * 関数概要: グリッド列のスタイルを設定します。
   * 引数：width 列幅
   */
  rowStyle(width = 200) {
    return `min-width: ${width}px; max-width: ${width}px; height: 32px;`;
  }
  
  /*
   * 関数概要: グリッドのカラム情報を返却します。
   */
  columns() {
    return [
      this.utils.createGridColumn({
      id: "check",
      headertype: "checkbox",
      type: "checkbox",
      style: this.rowStyle(65),
      frozen: true,
      position: "0"
    }),
    this.utils.createGridColumn({
      id: "id",
      title: "ID",
      type: "link",
      style: this.rowStyle(50),
      frozen: true,
      position: "65px"
    }),
    this.utils.createGridColumn({
      id: "title",
      title: "タイトル",
      style: this.rowStyle(),
      frozen: true,
      position: "115px"
    }),
    this.utils.createGridColumn({
      id: "releaseDate",
      title: "公開日",
      style: this.rowStyle(),
      converter: this.utils.convertDisplayDate
    }),
    this.utils.createGridColumn({
      id: "genre",
      title: "ジャンル",
      style: this.rowStyle()
    }),
    this.utils.createGridColumn({
      id: "price",
      title: "価格",
      style: this.rowStyle(),
      converter: this.utils.formatDollars
    }),
    this.utils.createGridColumn({
      id: "rating",
      title: "評価",
      style: this.rowStyle()
    }),
    this.utils.createGridColumn({
      id: "button",
      type: "button",
      buttons: [{
        value: "詳細",
        class: "btn btn-primary",
        style: "width: 60px;"
      },
      {
        value: "削除",
        class: "btn btn-primary ml-2",
        style: "width: 60px;"
      }],
      style: this.rowStyle()
    })];
  }
}
