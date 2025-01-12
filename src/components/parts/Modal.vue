<template>
<div v-if="getShow()" class="modal_wrap">
  <div class="modal_overlay">
    <label for="trigger" class="modal_trigger"></label>
    <div class="modal_content">
      <label for="trigger" class="close_button" @click.prevent="execute('cancel')">✖️</label>
        <p class="modal_title">{{getTitle()}}</p>
        <p class="modal-message mx-auto">{{getMessage()}}</p>
      <template v-if="getType() == constants.DialogOk">
      <div class="modal-ok mx-auto">
        <a href="#" class="btn btn-primary btn-m active modal-ok" role="button" aria-pressed="true" @click.prevent="execute('ok')">OK</a>
      </div>
      </template>
      <template v-if="getType() == constants.DialogOkCancel">
      <div class="modal-okcancel mx-auto">
        <a href="#" class="btn btn-primary btn-m active modal-ok" role="button" aria-pressed="true" @click.prevent="execute('ok')">OK</a>
        <a href="#" class="btn btn-primary btn-m active ml-3 modal-cancel" role="button" aria-pressed="true" @click.prevent="execute('cancel')">Cancel</a>
      </div>
      </template>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Constants from '@/js/constants'
import Utils from '@/js/utils'

/*
 * 概要: プロパティ
 * (遷移元画面、親コンポーネント、QueryStringなどから受け取る)
 */
  const props = defineProps({
    // ダイアログ表示用パラメータ
    dialog: {
      type: Object
    }
  });

/*
 * 概要: メソッドプロパティ
 * (値が動的に変わる場合は、算出プロパティではなくメソッドを使う)
 */
  
  /*
   * 関数概要: ダイアログタイトルを返却します。
   */
  const getTitle = ():string => {
    let params = props.dialog ?? { title: "" };
    return params.title ?? "";
  };

  /*
   * 関数概要: ダイアログメッセージを返却します。
   */
  const getMessage = ():string => {
    let params = props.dialog ?? { message: "" };
    return params.message ?? "";
  };

  /*
   * 関数概要: ダイアログ表示フラグを返却します。
   */
  const getShow = ():boolean => {
    let params = props.dialog ?? { show: false };
    return params.show ?? false;
  };

  /*
   * 関数概要: ダイアログタイプを返却します。
   */
  const getType = ():string => {
    let params = props.dialog ?? { type: constants.value.DialogOkCancel };
    return params.type ?? constants.value.DialogOkCancel;
  };

  /*
   * 関数概要: ボタン押下時の処理を実行します。
   * 引数：type OK/Cancel種別
   */
  const execute = async (type:string):Promise<void> => {
    var params = props.dialog ?? { ok: () => {} };
    if (type == "ok") {
      let ok = params.ok ?? function() {};
      if (utils.value.isAsync(ok)) {
        await ok();
      } else {
        ok();
      }
      params.show = false;
    }
    
    if (type == "cancel") {
      let cancel = params.cancel ?? function() {};
      if (utils.value.isAsync(cancel)) {
        await cancel();
      } else {
        cancel();
      }
      params.show = false;
    }
  };

/*
 * 概要: 算出プロパティ(キャッシュされるので変更不可)
 *       リアクティブデータであるかVueが判断できない場合の更新を防ぐため
 *       値が変わらない場合はできるだけこちらを使う
 */

  /*
   * 関数概要: Constantsクラスのインスタンスを返却します。
   */
  const constants = computed(():Constants => {
    return Constants.instance;
  });

  /*
   * 関数概要: Utilsクラスのインスタンスを返却します。
   */
  const utils = computed(():Utils => {
    return Utils.instance;
  });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal_wrap input {
  display: none;
}

.modal_overlay {
  display: flex;
  justify-content: center;
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.5s, transform 0s 0.5s;
  transform: scale(0);
}

.modal_content {
  align-self: center;
  width: 60%;
  padding: 30px 30px 15px;
  box-sizing: border-box;
  background: #fff;
  line-height: 1.4em;
  transition: 0.5s;
}

.modal_content p {
  padding-top: 0;
}

.close_button {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 24px;
  cursor: pointer;
}

.modal_overlay {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.5s;
}

.modal_overlay .modal_content {
  transform: translateY(20px);
}

.modal_title {
  font-size: 1.5em;
  position: relative;
  overflow: hidden;
  padding-bottom: 10px;
  margin-top:0;
  margin-bottom: 0;
}

.modal-message {
  margin-top:15px;
  min-height: 50px;
  text-align: center;
}

.modal-okcancel {
  width:250px;
}

.modal-ok {
  width:125px;
}

.modal-ok {
  width:100px;
}

.modal-cancel {
  width:100px;
}

.modal_title::before,
.modal_title::after{
  content: "";
  position: absolute;
  bottom: 0;
}

.modal_title:before{
  border-bottom: 4px solid #6bb6ff;
  width: 100%;
}

.modal_title:after{
  border-bottom: 4px solid #c8e4ff;
  width: 100%;
}
</style>
