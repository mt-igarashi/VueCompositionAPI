<template>
  <BaseLayout :mainStyle="mainStyle" :messages="messages" :loading="loading">
    <template #main-title>映画詳細</template>
    <template #main>      
      <!-- 映画項目表示 -->
      <div class="row mt-4">
        <div class="col-12">
          <table class="condition">
            <tbody>
              <tr>
                <th class="title">
                  タイトル
                </th>
                <td class="description">
                  {{data.movie.title}}
                </td>
              </tr>
              <tr>
                <th class="title">
                  公開日
                </th>
                <td class="description">
                  {{utils.convertDisplayDate(data.movie.releaseDate)}}
                </td>
              </tr>
              <tr>
                <th class="title">
                  ジャンル
                </th>
                <td class="description">
                  {{data.movie.genre}}
                </td>
              </tr>
              <tr>
                <th class="title">
                  価格
                </th>
                <td class="description">
                  {{utils.formatDollars(data.movie.price)}}
                </td>
              </tr>
              <tr>
                <th class="title">
                  評価
                </th>
                <td class="description">
                  {{data.movie.rating}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 戻るボタン -->
      <div class="row">
        <div class="col-12 mt-4">
          <div>
            <input class="btn btn-primary float-right" type="button" value="戻る" @click="movePrevPage" />
          </div>
        </div>
      </div>      
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex"
import Utils from "@/js/utils";
import Constants from "@/js/constants";
import MovieConstants from "@/js/movieConstants";
import MovieDetailLogic from "@/js/movieDetailLogic";
import { MovieDetailData } from "@/js/commonType";

/*
 * 概要: データプロパティ
 * (リアクティブデータ。変更がUIに即時反映される)
 */
  const data:MovieDetailData = reactive({
    movie: Utils.instance.createMovie(),       // 映画エンティティ
    messages: Utils.instance.createMessage(),  // メッセージ
    loading: false                             // ローディング表示用フラグ
  });

/*
 * VueRouterのインスタンス
 */
const router = useRouter();

/*
 * Vuexのインスタンス
 */
const store = useStore();

/*
 * ロジッククラスのインスタンス。
 */
const moviedetail = new MovieDetailLogic(data, store);

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // 映画ID
    id: {
      required: true,
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
    data.movie.id = props.id;
    moviedetail.setRouter(router);
    await moviedetail.init();
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */

  /*
   * 関数概要: 初期化処理を行います。
   */
  const init = async ():Promise<void> => {
    await moviedetail.init();
  };
  
  /*
   * 関数概要: 映画一覧に遷移します。
   */
  const movePrevPage = ():void => {
    moviedetail.movePrevPage();
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
    return moviedetail.getUtils;
  });
  
  /*
   * 関数概要: Constantsクラスのインスタンスを返却します。
   */
  const constants = computed(():Constants => {
    return moviedetail.getConstants;
  });
  
  /*
   * 関数概要: メイン要素のスタイルを返却します。
   */
  const mainStyle = computed(():string => {
    return constants.value.MainStyle;
  });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.condition .title {
  width: 275px;
}

.condition .description {
  width: 525px;
}
</style>
