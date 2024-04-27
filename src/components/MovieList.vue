<template>
  <BaseLayout :mainStyle="mainStyle" :messages="data.messages" :loading="data.loading" :dialog="data.dialog">
    <template #main-title>映画一覧</template>
    <template #main>
      <!-- 検索条件 -->
      <div class="row mt-4">
        <div class="col-12">
          <table class="condition">
            <tbody>
              <tr>
                <th class="title">
                  ジャンル
                </th>
                <td class="description">
                  <select class="select" v-model="data.genre" aria-labelledby="genre">
                    <option value="">全て</option>
                    <option v-for="gen in data.genres" :value="gen" :key="gen">{{gen}}</option>
                  </select>              
                </td>
              </tr>
              <tr>
                <th class="title">
                  タイトル
                </th>
                <td class="description">
                  <input v-model="data.searchString">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-12 search-button">
          <input class="btn btn-primary float-left mt-3" type="button" value="一覧印刷" @click.prevent="print"/>
          <input class="btn btn-primary float-right mt-3" type="button" value="検索" @click.prevent="reload(true)"/>
          <input class="btn btn-primary float-right mt-3" id="reload" style="display:none" type="button" value="リロード" @click.prevent="reload()"/>
        </div>
      </div>

      <!-- リンク -->
      <div class="row">
        <div class="col-12">
          <router-link class="float-right" :to="{name: 'MovieCreate'}">新規作成</router-link>
        </div>
      </div>

      <!-- 一覧 -->
      <div class="row">
        <div class="col-12">
          <GridTable :columns="columns"
                     :items="data.movies"
                     :tableStyle="tableStyle"
                     @button-click="buttonclick"
                     @link-click="linkclick"
                     @check-click="checkclick"
                     :validator="validator" />
          <PagingLink name="MovieList" :total="data.total" :pageNumber="moviesearch.pageNumber()" :pageSize="moviesearch.pageSize()" :linkparams="linkparams" />
        </div>
      </div>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { RouteLocationNormalized, Router, useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import MovieSearchLogic from "@/js/movieSearchLogic";
import Utils from "@/js/utils";
import Validator from "@/js/validator";
import Constants from "@/js/constants";
import { Movie, MovieSearchData, LinkParam } from "@/js/commonType";

/*
 * 概要: データプロパティ
 * (リアクティブデータ。変更がUIに即時反映される)
 */
  const data:MovieSearchData = reactive({
    genre: "",                                     // 検索条件：ジャンル
    searchString: "",                              // 検索条件：タイトル
    genres: [],                                    // ジャンルドロップダウン
    movies: [],                                    // 映画一覧
    total: 0,                                      // 総件数(ページング用)
    messages: Utils.instance.createMessage(),      // メッセージリスト
    loading: false,                                // ローディング表示フラグ
    window: null,                                  // 映画編集画面用Windowオブジェクト
    dialog: Utils.instance.createDialogParam(),    // ダイアログパラメータ
    step: 0,                                       // 現在のステップ
    steps: [],                                     // ステップ表示用オブジェクト
    fadeIn: false,                                 // ステップフェードイン
    fadeOut: true                                  // ステップフェードアウト
  });

/*
 * VueRouterのインスタンス
 */
const route = useRoute();
const router = useRouter();

/*
 * Vuexのインスタンス
 */
const store = useStore();

/*
 * ロジッククラスのインスタンス
 */
const moviesearch = new MovieSearchLogic(data, store);

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // 状態(検索条件復元判定)
    state: {
      type: String
    },
    
    // VueRouterのbeforeRouteUpdateイベントトリガーとなる文字列
    // (再検索、子ウィンドウから画面を更新する際に利用)
    tick: {
      type: String
    }
  });

/*
 * 概要: ライフサイクルイベント
 */
  /*
   * 関数概要: インスタンス生成、および、データ初期化後処理
   */
  onMounted(async ():Promise<void> => {
    moviesearch.setRouter(route, router);
    await moviesearch.init();
  });
  
  /*
   * 関数概要: VueRouterによる画面遷移前処理
   *           VueRouterを使う場合、URLが同一の場合(QueryStringが違っても)
   *           コンポーネントが再生成されないのでここで処理を行う。
   *           URLが同じ場合、QueryString、Propsが更新されないとこのメソッド自体が呼び出されない。
   */
  onBeforeRouteUpdate(async (to:RouteLocationNormalized, from:RouteLocationNormalized):Promise<void> => {
    moviesearch.init(to);
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */

  /*
   * 関数概要: 初期化処理を行います。
   * 引数：to 遷移先オブジェクト
   */
  const init = async (to:RouteLocationNormalized):Promise<void> => {
    await moviesearch.init(to);
  };
  
  /*
   * 関数概要: 画面をリロードします。
   * 引数：init 初期化フラグ
   */
  const reload = (init:boolean = false):void => {
    moviesearch.reload(init);
  };
  
  /*
   * 関数概要: 検索処理を行います。
   */
  const search = async ():Promise<void> => {
    await moviesearch.search();
  };

  /*
   * 関数概要: 検索処理を行います。
   */
  const print = async ():Promise<void> => {
    if (!validator.value.validate()) {
      return;
    }

    data.dialog = {
      title: constants.value.InfoTitle,
      message: "帳票出力に成功しました",
      ok: null,
      cancel: null,
      show: true,
      type: constants.value.DialogOk
    };
  };
  
  /*
   * 関数概要: 一覧行のボタン押下時の処理
   */
  const buttonclick = (event:Event, item:Movie, value:string, rowindex:number, colindex:number):void => {
    utils.value.console("buttonclick", event, item, value, rowindex, colindex);
    if (value == "詳細") {
      moviesearch.moveDetail(item);
    }
    
    if (value == "削除") {
      data.dialog = {
        title: constants.value.DeleteConfirmTitle,
        message: constants.value.DeleteConfirmMessage,
        ok: async () => { await moviesearch.delete(item); },
        cancel: null,
        show: true,
        type: constants.value.DialogOkCancel
      };
    }
  };
  
  /*
   * 関数概要: 一覧行のリンク押下時の処理
   */
  const linkclick = (event:Event, item:Movie, rowindex:number, colindex:number):void => {
    utils.value.console("linkclick", event, item, rowindex, colindex);
    moviesearch.openEdit(item);
  };

  /*
   * 関数概要: 一覧行のチェックボックス押下時の処理
   */
  const checkclick = (event:Event, checked:boolean, item:Movie, rowindex:number, colindex:number):void => {
    utils.value.console("checkclick", event, checked, item, rowindex, colindex);
    moviesearch.updateSteps();
  };

/*
 * 概要: 算出プロパティ(キャッシュされるので変更不可)
 *       リアクティブデータであるかVueが判断できない場合の更新を防ぐため
 *       値が変わらない場合はできるだけこちらを使う
 */
    
  /*
   * 関数概要: Utilsクラスのインスタンスを返却します。
   */
  const utils = computed(():Utils => {
    return moviesearch.getUtils;
  });
    
  /*
   * 関数概要: Constantsクラスのインスタンスを返却します。
   */
  const constants = computed(():Constants => {
    return moviesearch.getConstants;
  });

  /*
   * 関数概要: Validatorクラスのインスタンスを返却します。
   */
  const validator = computed(():Validator => {
    return moviesearch.getValidator;
  });
    
  /*
   * 関数概要: メイン要素のスタイルを返却します。
   */
  const mainStyle = computed(():string => {
    return constants.value.LargeMainStyle;
  });
    
  /*
   * 関数概要: GridTableのスタイルを返却します。
   */
  const tableStyle = computed(():string => {
    return "max-height:312px;";
  });
    
  /*
   * 関数概要: グリッドのカラム定義を返却します。
   */
  const columns = computed(():any[] => {
    return moviesearch.columns();
  });

  /*
   * 関数概要: ページングのリンクパラメータを返却します。
   */
  const linkparams = computed(():LinkParam => {
    let result:LinkParam = {state: "recovery"};
    return result;
  });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.condition .title {
  min-width: 200px;
  max-width: 200px;
}

.condition .description {
  min-width: 450px;
  max-width: 450px;
}

.search-button {
  min-width: 680px;
  max-width: 680px;  
}

.icon-description {
  font-weight:lighter;
  color: crimson;
  font-size: small;
}
</style>