<template>
  <div>
    <template v-if="tooltip">
      <slot name="control" :executor="data.executor"></slot>
      <span v-if="data.message && data.loaded" :data-message="data.message" class="field-tooltip">
        <img class="ml-2" alt="警告" src="../../assets/small_v_error.png">
      </span>
    </template>
    <template v-else>
      <slot name="control" :executor="data.executor"></slot>
      <img v-if="data.message && data.loaded" class="ml-2" alt="警告" src="../../assets/small_v_error.png">
      <img v-if="!data.message && data.loaded" class="ml-2" alt="OK" src="../../assets/small_v_ok.png">
      <div v-if="data.message" class="error-msg">
        {{data.message}}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from "vue";
import Validator from "@/js/validator";

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // バリデータ
    validator: {
      required: true,
      type: Validator
    },

    // フィールド名
    field: {
      required: true,
      type: String
    },

    // Input項目用CSS
    css: {
      type: String,
      default: ""
    },

    // ツールチップのみを表示するかを示すフラグ
    tooltip: {
      type: Boolean,
      default: false
    },

    // 編集項目であるかを示すフラグ
    edit: {
      type: Boolean,
      default: false
    }
  });

  /*
   * 関数概要: フィールドバリデータを実行します。
   */
  const validate = ():void => {
    props.validator.validateField(props.field);
  };

/*
 * 概要: データプロパティ
 * (リアクティブデータ。変更がUIに即時反映される)
 */
  const data = reactive({
    loaded: false,             // ページロード完了フラグ
    message: "",               // エラーメッセージ
    executor: {                // バリデータ実行オブジェクト
      css: [props.css],         // バリデータ実行後CSS
      validate: validate  // バリデーション関数
    },
  });

/*
 * 概要: ライフサイクルイベント
 */
  /*
   * 関数概要: インスタンス生成、および、データ初期化後処理
   */
  onMounted(async ():Promise<void> => {
   if (props.edit) {
      callback({}, "");
    }
    props.validator.addCallbackStore(props.field, callback);
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */
  /*
   * 関数概要: バリデータ実行後のコールバック関数。
   * 引数：message メッセージ、error フィールドエラーメッセージ
   */
  const callback = (message:object, error:string):void => {
    console.log(Object.keys(message).length);
    data.loaded = true;
    if (error) {
      data.executor.css = [props.css, "field-error"];    
      data.message = error;
    } else {
      data.executor.css = [props.css, "field-valid"];
      data.message = "";
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.field-tooltip {
  position: absolute;
  top: 8px;
  z-index: 3;
}

.field-tooltip:hover:after {
  content: attr(data-message);
  position: absolute;
  color: #721c24;
  background-color: #f8d7da;
  padding: 3px 5px;
  bottom: 20px; right: -5px;
  transform: translate(100%, 100%);
  border-radius: 5px 5px 5px 5px;
  white-space: pre;
  opacity: 0.95;
}
</style>
