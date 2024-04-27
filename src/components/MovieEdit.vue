<template>
  <BaseLayout :mainStyle="mainStyle" :messages="data.messages" :loading="data.loading" :dialog="data.dialog">
    <template #main-title>映画編集</template>
    <template #main>
      <!-- ステップバー -->
      <div class="row mt-4">
        <div class="col-12">
            <StepBar :step="data.step" :steps="data.steps" />
        </div>
      </div>
      <!-- 映画更新項目 -->
      <div class="row mt-4">
        <div class="col-12">
          <table class="condition">
            <tbody>
              <tr>
                <th class="title">
                  タイトル
                  <Question :title="movieconstants.MovieTitleHint" :messages="movieconstants.MovieTitlePoint" />
                </th>
                <td class="description">
                  <FieldValidator field="title" :validator="validator" :edit="true">
                    <template v-slot:control="slotProps">
                      <input id="title" type="text" v-model="data.movie.title" :class="slotProps.executor.css" @input="validateField(slotProps)">
                    </template>
                  </FieldValidator>
                </td>
              </tr>
              <tr>
                <th class="title">
                  公開日
                  <Question :title="movieconstants.MovieReleaseDateHint" :messages="movieconstants.MovieReleaseDatePoint" />
                </th>
                <td class="description">
                  <FieldValidator field="releaseDate" :validator="validator" :edit="true">
                    <template v-slot:control="slotProps">
                      <input type="date" v-model="data.movie.releaseDate" :class="slotProps.executor.css" @input="validateField(slotProps)">
                    </template>
                  </FieldValidator>
                </td>
              </tr>
              <tr>
                <th class="title">
                  ジャンル
                  <Question :title="movieconstants.MovieGenreHint" :messages="movieconstants.MovieGenrePoint" />
                </th>
                <td class="description">
                  <FieldValidator field="genre" :validator="validator" :edit="true">
                    <template v-slot:control="slotProps">
                      <input id="genre" type="text" v-model="data.movie.genre" :class="slotProps.executor.css" @input="validateField(slotProps)">
                    </template>
                  </FieldValidator>
                </td>
              </tr>
              <tr>
                <th class="title">
                  価格
                  <Question :title="movieconstants.MoviePriceHint" :messages="movieconstants.MoviePricePoint" />
                </th>
                <td class="description">
                  <FieldValidator field="price" :validator="validator" :edit="true">
                    <template v-slot:control="slotProps">
                      <input id="price" type="text" v-model="data.movie.price" :class="slotProps.executor.css" @input="validateField(slotProps)">
                    </template>
                  </FieldValidator>
                </td>
              </tr>
              <tr>
                <th class="title">
                  評価
                  <Question :title="movieconstants.MovieRateHint" :messages="movieconstants.MovieRatePoint" />
                </th>
                <td class="description">
                  <FieldValidator field="rating" :validator="validator" :edit="true">
                    <template v-slot:control="slotProps">
                      <input id="rating" type="text" v-model="data.movie.rating" :class="slotProps.executor.css" @input="validateField(slotProps)">
                    </template>
                  </FieldValidator>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 更新、閉じるボタン -->
      <div class="row">
        <div class="col-6 mt-4">
          <input v-if="utils.hasNoMessages(data.messages)" class="btn btn-primary float-left" type="button" value="更新" @click.prevent="openModal" />
        </div>
        <div class="col-6 mt-4">
          <div>
            <input class="btn btn-primary float-right" type="button" value="閉じる" @click="closePage" />
          </div>
        </div>
      </div>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import MovieEditLogic from "@/js/movieEditLogic";
import Utils from "@/js/utils";
import Validator from "@/js/validator";
import Constants from "@/js/constants";
import MovieConstants from "@/js/movieConstants";
import { MovieEditData } from "@/js/commonType";

/*
 * 概要: データプロパティ
 * (リアクティブデータ。変更がUIに即時反映される)
 */
  const data:MovieEditData = reactive({
    movie: Utils.instance.createMovie(),         // 映画エンティティ
    messages: Utils.instance.createMessage(),    // メッセージ
    loading: false,                              // ローディング表示用フラグ
    dialog: Utils.instance.createDialogParam(),  // ダイアログパラメータ
    step: 1,                                     // 現在のステップ
    steps: []                                    // ステップ表示用オブジェクト
  });

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
 * ロジッククラスのインスタンス。
 */
const movieedit = new MovieEditLogic(data, props.id);

/*
 * 概要: ライフサイクルイベント
 */
  /*
   * 関数概要: インスタンス生成、および、データ初期化後処理
   */
  onMounted(async ():Promise<void> => {
    await movieedit.init();
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */

  /*
   * 関数概要: 初期化処理を行います。
   */
  const init = async ():Promise<void> => {
    await movieedit.init();
  };
  
  /*
   * 関数概要: 映画更新処理を行います。
   */
  const edit = async ():Promise<void> => {
    await movieedit.edit();
  };

  /*
   * 関数概要: 確認ダイアログを開きます。
   */    
  const openModal = ():void => {
    if (!validator.value.validate()) {
      return;
    }

    data.dialog = {
      title: constants.value.UpdateConfirmTitle,
      message: constants.value.UpdateConfirmMessage,
      ok: async () => { await movieedit.edit() },
      cancel: null,
      show: true,
      type: constants.value.DialogOkCancel
    };
  };
  
  /*
   * 関数概要: 画面を閉じます。
   */
  const closePage = ():void => {
    movieedit.closePage();
  };

  /*
   * 関数概要: フィールドを検証します。
   * 引数：slotProps スロットオブジェクト
   */
  const validateField = (slotProps:any):void => {
    movieedit.validateField(slotProps);
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
    return movieedit.getUtils;
  });
  
  /*
   * 関数概要: Constantsクラスのインスタンスを返却します。
   */
  const constants = computed(():Constants => {
    return movieedit.getConstants;
  });

  /*
   * 関数概要: MovieConstantsクラスのインスタンスを返却します。
   */
  const movieconstants = computed(():MovieConstants => {
    return movieedit.getMovieConstants;
  });

  /*
   * 関数概要: Validatorクラスのインスタンスを返却します。
   */
  const validator = computed(():Validator => {
    return movieedit.getValidator;
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

.condition td {
  background-color: ghostwhite;
}

#title {
  width: 400px;
}

#genre {
  width: 300px;
}

#price {
  width: 100px;
}

#rating {
  width: 100px;
}
</style>
